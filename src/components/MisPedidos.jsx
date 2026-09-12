import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PedidoService from '../services/PedidoService';
import '../style/mis-pedidos.css';
import Swal from 'sweetalert2';
import { SWAL_COLOR } from '../config/swal';

const STATUS_STYLES = {
  Pendiente: { bg: '#ffdbc8', color: '#5d4030', dot: '#775846', icon: 'receipt_long' },
  Confirmado: { bg: '#ffe08f', color: '#584400', dot: '#755b00', icon: 'receipt_long' },
  'En Preparación': { bg: '#ffe08f', color: '#584400', dot: '#755b00', pulse: true, icon: 'delivery_dining' },
  EnPreparacion: { bg: '#ffe08f', color: '#584400', dot: '#755b00', pulse: true, icon: 'delivery_dining' },
  Listo: { bg: '#dcfce7', color: '#166534', dot: '#22c55e', icon: 'check_circle' },
  Entregado: { bg: '#dcfce7', color: '#166534', dot: '#22c55e', icon: 'check_circle' },
  Cancelado: { bg: '#f5f5f5', color: '#6b7280', dot: '#9ca3af', icon: 'cancel' },
};

function MisPedidos() {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarPedidos = async () => {
    setLoading(true);
    const result = await PedidoService.getMisPedidos();
    setLoading(false);
    if (result.success) {
      setPedidos(result.data);
    } else if (result.message === 'no-cliente') {
      setPedidos([]);
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: result.message, confirmButtonColor: SWAL_COLOR });
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      Swal.fire({ icon: 'warning', title: 'Debes iniciar sesión', text: 'Para ver tus pedidos', confirmButtonColor: SWAL_COLOR }).then(() => navigate('/auth'));
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarPedidos();
  }, [isAuthenticated, navigate]);

  const cancelarPedido = async (pedido) => {
    const confirm = await Swal.fire({
      title: '¿Cancelar pedido?',
      html: `¿Cancelar el <strong>Pedido #${pedido.id}</strong>?<br><small>Esta acción no se deshace.</small>`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: SWAL_COLOR, cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cancelar', cancelButtonText: 'No'
    });
    if (!confirm.isConfirmed) return;
    const result = await PedidoService.cancelarPedido(pedido.id);
    if (result.success) {
      setPedidos(pedidos.map(p => p.id === pedido.id ? { ...p, estado: 'Cancelado' } : p));
      Swal.fire({ icon: 'success', title: 'Pedido cancelado', timer: 2000, timerProgressBar: true, confirmButtonColor: SWAL_COLOR });
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: result.message, confirmButtonColor: SWAL_COLOR });
    }
  };

  const formatearFecha = (fecha) => new Date(fecha).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) {
    return <div className="at-pedidos"><div className="loading-container"><div className="spinner"></div><p style={{ marginTop: 16 }}>Cargando pedidos...</p></div></div>;
  }

  return (
    <div className="at-pedidos">
      <div className="at-pedidos-header">
        <h1 className="at-pedidos-title">Mis Pedidos</h1>
        <p className="at-pedidos-subtitle">Gestiona tus compras y revisa el estado de tus entregas.</p>
      </div>
      {pedidos.length === 0 ? (
        <div className="at-pedidos-empty">
          <div className="at-pedidos-empty-icon">
            <span className="material-symbols-outlined">inventory_2</span>
          </div>
          <h2 className="at-pedidos-empty-title">Todavía no hiciste ningún pedido</h2>
          <p className="at-pedidos-empty-desc">
            Explorá nuestra selección premium y comienza tu experiencia culinaria hoy mismo.
          </p>
          <button className="at-pedidos-empty-cta" onClick={() => navigate('/products')}>
            <span className="material-symbols-outlined">shopping_bag</span>
            Explorar productos
          </button>
        </div>
      ) : (
        <div className="at-pedidos-list">
          {pedidos.map(pedido => {
            const style = STATUS_STYLES[pedido.estado] || STATUS_STYLES.Pendiente;
            return (
              <div key={pedido.id} className="at-pedido-card">
                <div className="at-pedido-card-left">
                  <div className="at-pedido-icon-box">
                    <span className="material-symbols-outlined">{style.icon}</span>
                  </div>
                  <div className="at-pedido-info">
                    <div className="at-pedido-num">#{pedido.id}</div>
                    <p className="at-pedido-date">{formatearFecha(pedido.fechaPedido)}</p>
                    <div className="at-pedido-total">${(pedido.montoConDescuento || pedido.total)?.toFixed(2)}</div>
                  </div>
                </div>
                <div className="at-pedido-card-right">
                  <div className="at-pedido-badge" style={{ background: style.bg, color: style.color }}>
                    <span className={`at-pedido-dot ${style.pulse ? 'is-pulse' : ''}`} style={{ background: style.dot }}></span>
                    {pedido.estado}
                  </div>
                  <button className="at-pedido-btn-outline" onClick={() => navigate(`/pago/${pedido.id}`)}>
                    Ver detalle
                  </button>
                  {pedido.estado === 'Pendiente' && (
                    <button className="at-pedido-btn-cancel" onClick={() => cancelarPedido(pedido)}>
                      <span className="material-symbols-outlined">cancel</span>
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MisPedidos;
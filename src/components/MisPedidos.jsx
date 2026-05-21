import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PedidoService from '../services/PedidoService';
import '../style/mis-pedidos.css';
import Swal from 'sweetalert2';

const ESTADO_MAP = {
    'Pendiente': 'pendiente',
    'Confirmado': 'confirmado',
    'En Preparación': 'preparacion',
    'EnPreparacion': 'preparacion',
    'Listo': 'listo',
    'Entregado': 'entregado',
    'Cancelado': 'cancelado'
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
            Swal.fire({ icon: 'error', title: 'Error', text: result.message, confirmButtonColor: '#c9a84c' });
        }
    };

    useEffect(() => {
        if (!isAuthenticated()) {
            Swal.fire({ icon: 'warning', title: 'Debes iniciar sesión', text: 'Para ver tus pedidos', confirmButtonColor: '#c9a84c' }).then(() => navigate('/auth'));
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
            confirmButtonColor: '#c9a84c', cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, cancelar', cancelButtonText: 'No'
        });
        if (!confirm.isConfirmed) return;
        const result = await PedidoService.cancelarPedido(pedido.id);
        if (result.success) {
            setPedidos(pedidos.map(p => p.id === pedido.id ? { ...p, estado: 'Cancelado' } : p));
            Swal.fire({ icon: 'success', title: 'Pedido cancelado', timer: 2000, timerProgressBar: true, confirmButtonColor: '#c9a84c' });
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: result.message, confirmButtonColor: '#c9a84c' });
        }
    };

    const formatearFecha = (fecha) => new Date(fecha).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });

    if (loading) {
        return <div className="at-pedidos"><div className="loading-container"><div className="spinner"></div><p style={{ marginTop: 16 }}>Cargando pedidos...</p></div></div>;
    }

    return (
        <div className="at-pedidos">
            <h1 className="at-pedidos-title">Mis Pedidos</h1>
            {pedidos.length === 0 ? (
                <div className="empty-state" style={{ padding: '60px 20px' }}>
                    <div className="empty-icon"><i className="bi bi-box-seam"></i></div>
                    <h3>No tenés pedidos aún</h3>
                    <p>Realizá tu primer pedido y aparecerá aquí</p>
                    <button className="btn-gold" onClick={() => navigate('/products')}><i className="bi bi-bag"></i> Ver Productos</button>
                </div>
            ) : (
                <div className="at-pedidos-grid">
                    {pedidos.map(pedido => (
                        <div key={pedido.id} className="at-pedido-card">
                            <div className="at-pedido-header">
                                <span className="at-pedido-num">Pedido #{pedido.id}</span>
                                <span className={`at-pedido-badge ${ESTADO_MAP[pedido.estado] || 'pendiente'}`}>{pedido.estado}</span>
                            </div>
                            <div className="at-pedido-info">
                                <p><i className="bi bi-calendar-event"></i> Pedido: {formatearFecha(pedido.fechaPedido)}</p>
                                <p><i className="bi bi-truck"></i> Entrega: {formatearFecha(pedido.fechaEntrega)}</p>
                                <p><i className="bi bi-cash"></i> Total: ${(pedido.montoConDescuento || pedido.total)?.toFixed(2)}</p>
                                <p><i className="bi bi-box-seam"></i> Productos: {pedido.detalles?.length || 0}</p>
                            </div>
                            <div className="at-pedido-actions">
                                <button className="at-pedido-btn primary" onClick={() => navigate(`/pago/${pedido.id}`)}>
                                    <i className="bi bi-credit-card"></i> Ver pago
                                </button>
                                {pedido.estado === 'Pendiente' && (
                                    <button className="at-pedido-btn danger" onClick={() => cancelarPedido(pedido)}>
                                        <i className="bi bi-x-circle"></i> Cancelar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MisPedidos;

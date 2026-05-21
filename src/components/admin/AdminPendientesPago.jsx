import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaEye, FaShoppingBag } from 'react-icons/fa';
import Swal from 'sweetalert2';
import AdminPedidoService from '../../services/AdminPedidoService';
import { SkeletonTable } from '../Skeleton';
import '../../style/admin/pedidos.css';
import '../../style/admin/pendientes-pago.css';

function AdminPendientesPago() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmando, setConfirmando] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);

    const cargar = async () => {
        setLoading(true);
        const r = await AdminPedidoService.getPendientesPago();
        if (r.success) setPedidos(r.data);
        else toast.error(r.message);
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargar();
    }, []);

    const handleConfirmar = async (pedidoId) => {
        const confirm = await Swal.fire({
            title: '¿Confirmar pago?',
            text: 'Se confirmará el pago y se descontará el stock. Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#c9a84c',
            confirmButtonText: 'Sí, confirmar pago',
            cancelButtonText: 'Cancelar',
        });
        if (!confirm.isConfirmed) return;

        setConfirmando(pedidoId);
        const r = await AdminPedidoService.confirmarPago(pedidoId);
        setConfirmando(null);

        if (r.success) {
            toast.success(`Pago del pedido #${pedidoId} confirmado. Stock descontado.`);
            cargar();
        } else {
            toast.error(r.message);
        }
    };

    const formatearMonto = (monto) => {
        if (monto == null) return '-';
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleDateString('es-AR', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const filtrados = pedidos.filter(p => {
        const q = busqueda.toLowerCase();
        return String(p.id).includes(q) || (p.clienteNombre || '').toLowerCase().includes(q);
    });

    const abrirDetalle = (pedido) => {
        setPedidoSeleccionado(pedido);
        setMostrarModal(true);
    };

    return (
        <div className="admin-pendientes-pago">
            <div className="admin-pedidos-header">
                <h2><FaShoppingBag /> Pedidos Pendientes de Confirmar</h2>
                <button className="btn-refresh" onClick={cargar}>Actualizar</button>
            </div>

            <div className="busqueda-pedidos" style={{ marginBottom: 16 }}>
                <input
                    type="text"
                    placeholder="Buscar por ID o cliente..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                />
                <span className="contador-info">{filtrados.length} pedido{filtrados.length !== 1 ? 's' : ''}</span>
            </div>

            {loading ? (
                <SkeletonTable rows={5} />
            ) : filtrados.length === 0 ? (
                <div className="empty-state">
                    <FaShoppingBag className="empty-icon" />
                    <h3>No hay pedidos pendientes</h3>
                    <p>Cuando un cliente marque su pago como realizado, aparecerá aquí.</p>
                </div>
            ) : (
                <div className="tabla-pedidos">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Fecha Pedido</th>
                                <th>Fecha Pago</th>
                                <th>Total</th>
                                <th>Tipo Pago</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map(p => (
                                <tr key={p.id}>
                                    <td className="pedido-id">#{p.id}</td>
                                    <td className="cliente-info">
                                        <strong>{p.clienteNombre}</strong>
                                    </td>
                                    <td>{formatearFecha(p.fechaPedido)}</td>
                                    <td>{formatearFecha(p.fechaPago)}</td>
                                    <td className="total">{formatearMonto(p.total)}</td>
                                    <td>{p.tipoPago || '-'}</td>
                                    <td className="acciones">
                                        <button className="btn-ver" onClick={() => abrirDetalle(p)} title="Ver detalle">
                                            <FaEye />
                                        </button>
                                        <button
                                            className="btn-confirmar-pago"
                                            onClick={() => handleConfirmar(p.id)}
                                            disabled={confirmando === p.id}
                                            title="Confirmar pago y descontar stock"
                                        >
                                            {confirmando === p.id ? '...' : <FaCheck />}
                                            <span>Confirmar</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {mostrarModal && pedidoSeleccionado && (
                <div className="modal-overlay" onClick={() => { setMostrarModal(false); setPedidoSeleccionado(null); }}>
                    <div className="modal-pedido" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Pedido #{pedidoSeleccionado.id}</h3>
                            <button className="btn-cerrar" onClick={() => { setMostrarModal(false); setPedidoSeleccionado(null); }}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="info-cliente">
                                <h4>Información del Cliente</h4>
                                <p><strong>Nombre:</strong> {pedidoSeleccionado.clienteNombre}</p>
                                {pedidoSeleccionado.referenciaTransaccion && (
                                    <p><strong>Referencia:</strong> {pedidoSeleccionado.referenciaTransaccion}</p>
                                )}
                            </div>

                            <div className="info-pago-detalle">
                                <h4>Información de Pago</h4>
                                <div className="info-row">
                                    <span>Tipo de pago:</span>
                                    <strong>{pedidoSeleccionado.tipoPago || '-'}</strong>
                                </div>
                                <div className="info-row">
                                    <span>Estado del pago:</span>
                                    <span className="badge-pago pago-pagado">Pagado</span>
                                </div>
                                <div className="info-row">
                                    <span>Fecha de pago:</span>
                                    <strong>{formatearFecha(pedidoSeleccionado.fechaPago)}</strong>
                                </div>
                                <div className="info-row">
                                    <span>Total:</span>
                                    <strong>{formatearMonto(pedidoSeleccionado.total)}</strong>
                                </div>
                                {pedidoSeleccionado.montoConDescuento && (
                                    <div className="info-row">
                                        <span>Total con descuento:</span>
                                        <strong className="text-success">{formatearMonto(pedidoSeleccionado.montoConDescuento)}</strong>
                                    </div>
                                )}
                                {pedidoSeleccionado.referenciaTransaccion && (
                                    <div className="info-row">
                                        <span>Referencia:</span>
                                        <strong>{pedidoSeleccionado.referenciaTransaccion}</strong>
                                    </div>
                                )}
                            </div>

                            <div className="cambiar-estado">
                                <h4>Confirmar Pago</h4>
                                <p className="text-muted">Al confirmar se descontará el stock automáticamente y el pedido pasará a "Confirmado".</p>
                                <button
                                    className="btn-confirmar-pago-full"
                                    onClick={() => { setMostrarModal(false); handleConfirmar(pedidoSeleccionado.id); }}
                                    disabled={confirmando === pedidoSeleccionado.id}
                                >
                                    {confirmando === pedidoSeleccionado.id ? (
                                        'Confirmando...'
                                    ) : (
                                        <><FaCheck /> Confirmar pago y descontar stock</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPendientesPago;

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaEye, FaCheck, FaTimes, FaSearch, FaShoppingBag } from 'react-icons/fa';
import Swal from 'sweetalert2';
import AdminPedidoService from '../../services/AdminPedidoService';
import { SkeletonTable } from '../Skeleton';
import '../../style/admin/pedidos.css';

const ESTADOS = [
    { id: 0, nombre: 'Todos', clase: 'todos' },
    { id: 1, nombre: 'Pendiente', clase: 'pendiente' },
    { id: 2, nombre: 'Confirmado', clase: 'confirmado' },
    { id: 3, nombre: 'En Preparación', clase: 'preparacion' },
    { id: 4, nombre: 'Listo', clase: 'listo' },
    { id: 5, nombre: 'Entregado', clase: 'entregado' },
    { id: 6, nombre: 'Cancelado', clase: 'cancelado' }
];

const ESTADO_MAP = {
    Pendiente: 1,
    Confirmado: 2,
    EnPreparacion: 3,
    Listo: 4,
    Entregado: 5,
    Cancelado: 6,
    Carrito: 7,
};

const TIPO_PAGO_MAP = {
    Efectivo: 'Efectivo',
    Transferencia: 'Transferencia',
    MercadoPago: 'Mercado Pago',
};

const NUEVO_ESTADO = [
    { id: 3, nombre: 'En Preparación' },
    { id: 4, nombre: 'Marcar Listo' },
    { id: 5, nombre: 'Entregado' },
    { id: 6, nombre: 'Cancelar' }
];

function AdminPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState(0);
    const [busqueda, setBusqueda] = useState('');
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    const [actualizando, setActualizando] = useState(null);

    const cargarPedidos = async () => {
        setLoading(true);
        const result = await AdminPedidoService.getTodosLosPedidos();
        if (result.success) {
            const mapped = (result.data || []).map(p => ({
                ...p,
                estadoId: ESTADO_MAP[p.estado] || 0,
                estadoNombre: p.estado || 'Desconocido'
            }));
            setPedidos(mapped);
        } else {
            toast.error(result.message || 'Error al cargar pedidos');
        }
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarPedidos();
    }, []);

    const pedidosFiltrados = pedidos.filter(pedido => {
        if (filtroEstado !== 0 && pedido.estadoId !== filtroEstado) return false;
        const textoBusqueda = busqueda.toLowerCase();
        return (
            pedido.id.toString().includes(textoBusqueda) ||
            (pedido.clienteNombre || '').toLowerCase().includes(textoBusqueda) ||
            (pedido.clienteEmail || '').toLowerCase().includes(textoBusqueda) ||
            (pedido.clienteTelefono || '').toLowerCase().includes(textoBusqueda)
        );
    });

    const obtenerClaseEstado = (estadoId) => {
        const estado = ESTADOS.find(e => e.id === estadoId);
        return estado ? estado.clase : 'todos';
    };

    const abrirDetalle = async (pedido) => {
        setMostrarModal(true);
        setLoadingDetalle(true);
        setPedidoSeleccionado({ ...pedido });
        const result = await AdminPedidoService.getDetalle(pedido.id);
        if (result.success) {
            setPedidoSeleccionado(prev => ({
                ...prev,
                ...result.data,
                estadoId: ESTADO_MAP[result.data.estado] || prev.estadoId,
                estadoNombre: result.data.estado || prev.estadoNombre,
            }));
        }
        setLoadingDetalle(false);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setPedidoSeleccionado(null);
    };

    const cambiarEstado = async (pedidoId, nuevoEstadoId) => {
        const estadoActual = pedidos.find(p => p.id === pedidoId)?.estadoId;

        if (nuevoEstadoId === 6 && estadoActual !== 1) {
            toast.error('Solo se pueden cancelar pedidos pendientes');
            return;
        }

        const nombreEstado = nuevoEstadoId === 6 ? 'Cancelado' : ESTADOS.find(e => e.id === nuevoEstadoId)?.nombre;
        const result = await Swal.fire({
            title: '¿Confirmar cambio de estado?',
            text: `El pedido #${pedidoId} cambiará a "${nombreEstado}"`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, cambiar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#c9a84c',
            cancelButtonColor: '#6c757d'
        });

        if (result.isConfirmed) {
            setActualizando(pedidoId);
            const response = await AdminPedidoService.cambiarEstado(pedidoId, nuevoEstadoId);

            if (response.success) {
                toast.success(`Pedido #${pedidoId} actualizado correctamente`);
                cargarPedidos();
                if (mostrarModal && pedidoSeleccionado?.id === pedidoId) {
                    setPedidoSeleccionado(response.data);
                }
            } else {
                toast.error(response.message || 'Error al cambiar estado');
            }
            setActualizando(null);
        }
    };

    const confirmarPagoAdmin = async (pedidoId) => {
        const confirm = await Swal.fire({
            title: '¿Confirmar pago?',
            text: 'Se confirmará el pago y se descontará el stock automáticamente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#c9a84c',
            confirmButtonText: 'Sí, confirmar pago',
            cancelButtonText: 'Cancelar',
        });

        if (confirm.isConfirmed) {
            setActualizando(pedidoId);
            const response = await AdminPedidoService.confirmarPago(pedidoId);
            setActualizando(null);

            if (response.success) {
                toast.success(`Pago del pedido #${pedidoId} confirmado. Stock descontado.`);
                cargarPedidos();
            } else {
                toast.error(response.message || 'Error al confirmar pago');
            }
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleDateString('es-AR', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const formatearPrecio = (precio) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(precio);
    };

    const obtenerSiguienteEstados = (estadoActualId, tipoPago) => {
        if (estadoActualId === 1) {
            if (tipoPago === 'Efectivo' || tipoPago === 'Transferencia' || tipoPago === 'MercadoPago') {
                return [{ id: 0, nombre: 'Confirmar pago', accion: 'confirmarPago' }];
            }
            return [{ id: 2, nombre: 'Confirmar', accion: 'cambiarEstado' }, { id: 6, nombre: 'Cancelar', accion: 'cambiarEstado' }];
        }
        if (estadoActualId === 6) return [];
        if (estadoActualId >= 2 && estadoActualId <= 4) {
            return [
                ...NUEVO_ESTADO.filter(e => e.id > estadoActualId && e.id <= 5).map(e => ({ ...e, accion: 'cambiarEstado' })),
                ...(estadoActualId !== 2 ? [] : []),
                ...(estadoActualId === 2 ? [{ id: 6, nombre: 'Cancelar', accion: 'cambiarEstado' }] : [])
            ];
        }
        return [];
    };

    const mostrarTipoPago = (tipoPago) => {
        return TIPO_PAGO_MAP[tipoPago] || tipoPago || '-';
    };

    return (
        <div className="admin-pedidos-container">
            <div className="admin-pedidos-header">
                <h2><FaShoppingBag /> Gestión de Pedidos</h2>
                <button className="btn-refresh" onClick={cargarPedidos}>
                    Actualizar
                </button>
            </div>

            <div className="filtros-pedidos">
                <div className="busqueda-pedidos">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por ID, nombre, email o teléfono..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                <div className="filtros-estado">
                    {ESTADOS.map(estado => (
                        <button
                            key={estado.id}
                            className={`filtro-btn ${filtroEstado === estado.id ? 'active' : ''} ${estado.clase}`}
                            onClick={() => setFiltroEstado(estado.id)}
                        >
                            {estado.nombre}
                            <span className="contador">
                                {estado.id === 0
                                    ? pedidos.length
                                    : pedidos.filter(p => p.estadoId === estado.id).length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="pedidos-loading">
                    <SkeletonTable rows={5} />
                </div>
            ) : pedidosFiltrados.length === 0 ? (
                <div className="empty-state">
                    <FaShoppingBag className="empty-icon" />
                    <h3>No hay pedidos</h3>
                    <p>No se encontraron pedidos con los filtros aplicados</p>
                </div>
            ) : (
                <div className="tabla-pedidos">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Fecha Pedido</th>
                                <th>Fecha Entrega</th>
                                <th>Total</th>
                                <th>Tipo Pago</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidosFiltrados.map(pedido => (
                                <tr key={pedido.id}>
                                    <td className="pedido-id" data-label="ID">#{pedido.id}</td>
                                    <td className="cliente-info" data-label="Cliente">
                                        <strong>{pedido.clienteNombre}</strong>
                                        <span>{pedido.clienteEmail}</span>
                                        <span>{pedido.clienteTelefono}</span>
                                    </td>
                                    <td data-label="Fecha Pedido">{formatearFecha(pedido.fechaPedido)}</td>
                                    <td data-label="Fecha Entrega">{formatearFecha(pedido.fechaEntrega)}</td>
                                    <td className="total" data-label="Total">{formatearPrecio(pedido.total)}</td>
                                    <td data-label="Tipo Pago">{mostrarTipoPago(pedido.tipoPago)}</td>
                                    <td data-label="Estado">
                                        <span className={`badge-estado ${obtenerClaseEstado(pedido.estadoId)}`}>
                                            {pedido.estadoNombre}
                                        </span>
                                    </td>
                                    <td className="acciones" data-label="Acciones">
                                        <button
                                            className="btn-ver"
                                            onClick={() => abrirDetalle(pedido)}
                                            title="Ver detalle"
                                        >
                                            <FaEye />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {mostrarModal && pedidoSeleccionado && (
                <div className="modal-overlay" onClick={cerrarModal}>
                    <div className="modal-pedido" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Pedido #{pedidoSeleccionado.id}</h3>
                            <button className="btn-cerrar" onClick={cerrarModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-body">
                            {loadingDetalle ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Cargando...</span>
                                    </div>
                                    <p style={{ marginTop: 16, color: '#6c757d' }}>Cargando detalle del pedido...</p>
                                </div>
                            ) : (
                            <>
                            <div className="info-cliente">
                                <h4>Información del Cliente</h4>
                                <p><strong>Nombre:</strong> {pedidoSeleccionado.clienteNombre}</p>
                                <p><strong>Email:</strong> {pedidoSeleccionado.clienteEmail}</p>
                                <p><strong>Teléfono:</strong> {pedidoSeleccionado.clienteTelefono}</p>
                            </div>

                            <div className="info-pedido">
                                <div className="info-row">
                                    <span>Fecha del pedido:</span>
                                    <strong>{formatearFecha(pedidoSeleccionado.fechaPedido)}</strong>
                                </div>
                                <div className="info-row">
                                    <span>Fecha de entrega:</span>
                                    <strong>{formatearFecha(pedidoSeleccionado.fechaEntrega)}</strong>
                                </div>
                                <div className="info-row">
                                    <span>Estado actual:</span>
                                    <span className={`badge-estado ${obtenerClaseEstado(pedidoSeleccionado.estadoId)}`}>
                                        {pedidoSeleccionado.estadoNombre}
                                    </span>
                                </div>
                                {pedidoSeleccionado.observaciones && (
                                    <div className="observaciones">
                                        <strong>Observaciones:</strong>
                                        <p>{pedidoSeleccionado.observaciones}</p>
                                    </div>
                                )}
                            </div>

                            <div className="info-pago-detalle">
                                <h4>Información de Pago</h4>
                                <div className="info-row">
                                    <span>Tipo de pago:</span>
                                    <strong>{mostrarTipoPago(pedidoSeleccionado.tipoPago)}</strong>
                                </div>
                                <div className="info-row">
                                    <span>Estado del pago:</span>
                                    <strong>{pedidoSeleccionado.estadoPago || 'Pendiente'}</strong>
                                </div>
                                <div className="info-row">
                                    <span>Total:</span>
                                    <strong>{formatearPrecio(pedidoSeleccionado.total)}</strong>
                                </div>
                                {pedidoSeleccionado.montoConDescuento && (
                                    <div className="info-row">
                                        <span>Total con descuento:</span>
                                        <strong className="text-success">{formatearPrecio(pedidoSeleccionado.montoConDescuento)}</strong>
                                    </div>
                                )}
                                {pedidoSeleccionado.referenciaTransaccion && (
                                    <div className="info-row">
                                        <span>Referencia:</span>
                                        <strong>{pedidoSeleccionado.referenciaTransaccion}</strong>
                                    </div>
                                )}
                                {pedidoSeleccionado.fechaPago && (
                                    <div className="info-row">
                                        <span>Fecha de pago:</span>
                                        <strong>{formatearFecha(pedidoSeleccionado.fechaPago)}</strong>
                                    </div>
                                )}
                            </div>

                            <div className="detalles-pedido">
                                <h4>Productos</h4>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Cantidad</th>
                                            <th>Precio</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pedidoSeleccionado.detalles?.map(detalle => (
                                            <tr key={detalle.id}>
                                                <td>
                                                    <div className="producto-item">
                                                        {detalle.productoImagen && (
                                                            <img src={detalle.productoImagen} alt={detalle.productoNombre} />
                                                        )}
                                                        <span>{detalle.productoNombre}</span>
                                                    </div>
                                                </td>
                                                <td>{detalle.cantidad}</td>
                                                <td>{formatearPrecio(detalle.precioUnitario)}</td>
                                                <td>{formatearPrecio(detalle.subtotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="3"><strong>Total</strong></td>
                                            <td><strong>{formatearPrecio(pedidoSeleccionado.montoConDescuento || pedidoSeleccionado.total)}</strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {obtenerSiguienteEstados(pedidoSeleccionado.estadoId, pedidoSeleccionado.tipoPago).length > 0 && (
                                <div className="cambiar-estado">
                                    <h4>Cambiar Estado</h4>
                                    <div className="estado-botones">
                                        {obtenerSiguienteEstados(pedidoSeleccionado.estadoId, pedidoSeleccionado.tipoPago).map(estado => (
                                            <button
                                                key={estado.id + estado.accion}
                                                className={`btn-estado ${estado.id === 6 ? 'btn-cancelar' : 'btn-confirmar'} ${estado.accion === 'confirmarPago' ? 'btn-confirmar-pago' : ''}`}
                                                onClick={() => estado.accion === 'confirmarPago'
                                                    ? confirmarPagoAdmin(pedidoSeleccionado.id)
                                                    : cambiarEstado(pedidoSeleccionado.id, estado.id)
                                                }
                                                disabled={actualizando === pedidoSeleccionado.id}
                                            >
                                                {actualizando === pedidoSeleccionado.id ? 'Actualizando...' : estado.nombre}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPedidos;

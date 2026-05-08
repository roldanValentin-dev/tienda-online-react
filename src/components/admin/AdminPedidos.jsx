import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaEye, FaCheck, FaTimes, FaSearch, FaShoppingBag } from 'react-icons/fa';
import Swal from 'sweetalert2';
import AdminPedidoService from '../../services/AdminPedidoService';
import { SkeletonTable } from '../Skeleton';
import '../../admin.css';

const ESTADOS = [
    { id: 0, nombre: 'Todos', clase: 'todos' },
    { id: 1, nombre: 'Pendiente', clase: 'pendiente' },
    { id: 2, nombre: 'Confirmado', clase: 'confirmado' },
    { id: 3, nombre: 'En Preparación', clase: 'preparacion' },
    { id: 4, nombre: 'Listo', clase: 'listo' },
    { id: 5, nombre: 'Entregado', clase: 'entregado' },
    { id: 6, nombre: 'Cancelado', clase: 'cancelado' }
];

const NUEVO_ESTADO = [
    { id: 2, nombre: 'Confirmar' },
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
    const [actualizando, setActualizando] = useState(null);

    const cargarPedidos = async () => {
        setLoading(true);
        let result;
        
        if (filtroEstado === 0) {
            result = await AdminPedidoService.getTodosLosPedidos();
        } else {
            result = await AdminPedidoService.getPedidosPorEstado(filtroEstado);
        }
        
        if (result.success) {
            setPedidos(result.data);
        } else {
            toast.error(result.message || 'Error al cargar pedidos');
        }
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        cargarPedidos();
    }, [filtroEstado]);

    const pedidosFiltrados = pedidos.filter(pedido => {
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

    const obtenerNombreEstado = (estadoId) => {
        const estado = ESTADOS.find(e => e.id === estadoId);
        return estado ? estado.nombre : 'Desconocido';
    };

    const abrirDetalle = (pedido) => {
        setPedidoSeleccionado(pedido);
        setMostrarModal(true);
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

        const result = await Swal.fire({
            title: '¿Confirmar cambio de estado?',
            text: `El pedido #${pedidoId} cambiará a "${NUEVO_ESTADO.find(e => e.id === nuevoEstadoId)?.nombre}"`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, cambiar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#28a745',
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

    const formatearFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatearPrecio = (precio) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(precio);
    };

    const obtenerSiguienteEstados = (estadoActualId) => {
        if (estadoActualId === 1) {
            return [{ id: 2, nombre: 'Confirmar' }, { id: 6, nombre: 'Cancelar' }];
        }
        if (estadoActualId >= 2 && estadoActualId <= 4) {
            return NUEVO_ESTADO.filter(e => e.id > estadoActualId && e.id <= 5);
        }
        return [];
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
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidosFiltrados.map(pedido => (
                                <tr key={pedido.id}>
                                    <td className="pedido-id">#{pedido.id}</td>
                                    <td className="cliente-info">
                                        <strong>{pedido.clienteNombre}</strong>
                                        <span>{pedido.clienteEmail}</span>
                                        <span>{pedido.clienteTelefono}</span>
                                    </td>
                                    <td>{formatearFecha(pedido.fechaPedido)}</td>
                                    <td>{formatearFecha(pedido.fechaEntrega)}</td>
                                    <td className="total">{formatearPrecio(pedido.total)}</td>
                                    <td>
                                        <span className={`badge-estado ${obtenerClaseEstado(pedido.estadoId)}`}>
                                            {obtenerNombreEstado(pedido.estadoId)}
                                        </span>
                                    </td>
                                    <td className="acciones">
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
                                        {obtenerNombreEstado(pedidoSeleccionado.estadoId)}
                                    </span>
                                </div>
                                {pedidoSeleccionado.observaciones && (
                                    <div className="observaciones">
                                        <strong>Observaciones:</strong>
                                        <p>{pedidoSeleccionado.observaciones}</p>
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
                                            <td><strong>{formatearPrecio(pedidoSeleccionado.total)}</strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {obtenerSiguienteEstados(pedidoSeleccionado.estadoId).length > 0 && (
                                <div className="cambiar-estado">
                                    <h4>Cambiar Estado</h4>
                                    <div className="estado-botones">
                                        {obtenerSiguienteEstados(pedidoSeleccionado.estadoId).map(estado => (
                                            <button
                                                key={estado.id}
                                                className={`btn-estado ${estado.id === 6 ? 'btn-cancelar' : 'btn-confirmar'}`}
                                                onClick={() => cambiarEstado(pedidoSeleccionado.id, estado.id)}
                                                disabled={actualizando === pedidoSeleccionado.id}
                                            >
                                                {actualizando === pedidoSeleccionado.id ? 'Actualizando...' : estado.nombre}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPedidos;
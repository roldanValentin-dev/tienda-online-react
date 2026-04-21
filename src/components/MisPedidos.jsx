/**
 * COMPONENTE MIS PEDIDOS
 * Muestra el historial de pedidos del usuario autenticado
 * Incluye: listado de pedidos, modal de detalle, estados visuales
 */

import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PedidoService from '../services/PedidoService';
import Swal from 'sweetalert2';

function MisPedidos() {
    const navigate = useNavigate();
    const { isAuthenticated } = useContext(AuthContext);
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPedido, setSelectedPedido] = useState(null);
    const [loadingDetalle, setLoadingDetalle] = useState(false);

    // Cargar pedidos al montar el componente
    useEffect(() => {
        // Validar autenticación
        if (!isAuthenticated()) {
            Swal.fire({
                icon: 'warning',
                title: 'Debes iniciar sesión',
                text: 'Para ver tus pedidos necesitas estar autenticado',
                confirmButtonColor: '#ff6b35'
            }).then(() => {
                navigate('/auth');
            });
            return;
        }

        cargarPedidos();
    }, [isAuthenticated, navigate]);

    /**
     * Cargar lista de pedidos del usuario
     */
    const cargarPedidos = async () => {
        setLoading(true);
        const result = await PedidoService.getMisPedidos();
        setLoading(false);

        if (result.success) {
            setPedidos(result.data);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.message,
                confirmButtonColor: '#ff6b35'
            });
        }
    };

    /**
     * Ver detalle completo de un pedido
     * @param {number} pedidoId - ID del pedido
     */
    const verDetalle = async (pedidoId) => {
        setLoadingDetalle(true);
        const result = await PedidoService.getPedidoById(pedidoId);
        setLoadingDetalle(false);

        if (result.success) {
            setSelectedPedido(result.data);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.message,
                confirmButtonColor: '#ff6b35'
            });
        }
    };

    /**
     * Cerrar modal de detalle
     */
    const cerrarDetalle = () => {
        setSelectedPedido(null);
    };

    /**
     * Obtener clase CSS según el estado del pedido
     * @param {string} estado - Estado del pedido
     * @returns {string} - Clase CSS
     */
    const getEstadoClass = (estado) => {
        const estados = {
            'Pendiente': 'estado-pendiente',
            'Confirmado': 'estado-confirmado',
            'En Preparación': 'estado-preparacion',
            'EnPreparacion': 'estado-preparacion',
            'Listo': 'estado-listo',
            'Entregado': 'estado-entregado',
            'Cancelado': 'estado-cancelado'
        };
        return estados[estado] || 'estado-default';
    };

    /**
     * Formatear fecha a formato legible
     * @param {string} fecha - Fecha en formato ISO
     * @returns {string} - Fecha formateada
     */
    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    /**
     * Formatear fecha y hora
     * @param {string} fecha - Fecha en formato ISO
     * @returns {string} - Fecha y hora formateada
     */
    const formatearFechaHora = (fecha) => {
        return new Date(fecha).toLocaleString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Mostrar loading mientras carga
    if (loading) {
        return (
            <div className="container-custom">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando pedidos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mis-pedidos-page">
            <div className="container-custom">
                <h1 className="page-title">Mis Pedidos</h1>

                {/* Estado vacío */}
                {pedidos.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📦</div>
                        <h3>No tienes pedidos aún</h3>
                        <p>Realiza tu primer pedido y aparecerá aquí</p>
                        <button
                            className="btn-primary"
                            onClick={() => navigate('/products')}
                        >
                            <i className="bi bi-bag-fill me-2"></i>
                            Ver Productos
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Grid de pedidos */}
                        <div className="pedidos-grid">
                            {pedidos.map(pedido => (
                                <div key={pedido.id} className="pedido-card">
                                    {/* Header con número y estado */}
                                    <div className="pedido-header">
                                        <h3>Pedido #{pedido.id}</h3>
                                        <span className={`estado-badge ${getEstadoClass(pedido.estado)}`}>
                                            {pedido.estado}
                                        </span>
                                    </div>

                                    {/* Información del pedido */}
                                    <div className="pedido-info">
                                        <p>
                                            <i className="bi bi-calendar-event me-2"></i>
                                            <strong>Fecha:</strong> {formatearFecha(pedido.fechaPedido)}
                                        </p>
                                        <p>
                                            <i className="bi bi-truck me-2"></i>
                                            <strong>Entrega:</strong> {formatearFecha(pedido.fechaEntrega)}
                                        </p>
                                        <p>
                                            <i className="bi bi-cash me-2"></i>
                                            <strong>Total:</strong> ${pedido.total.toFixed(2)}
                                        </p>
                                        <p>
                                            <i className="bi bi-box-seam me-2"></i>
                                            <strong>Productos:</strong> {pedido.detalles?.length || 0}
                                        </p>
                                    </div>

                                    {/* Botón ver detalle */}
                                    <button
                                        className="btn-detalle"
                                        onClick={() => verDetalle(pedido.id)}
                                        disabled={loadingDetalle}
                                    >
                                        {loadingDetalle ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Cargando...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-eye me-2"></i>
                                                Ver Detalle
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Modal de detalle del pedido */}
                {selectedPedido && (
                    <div className="modal-overlay" onClick={cerrarDetalle}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            {/* Header del modal */}
                            <div className="modal-header">
                                <h2>Detalle del Pedido #{selectedPedido.id}</h2>
                                <button
                                    className="modal-close"
                                    onClick={cerrarDetalle}
                                    aria-label="Cerrar"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Body del modal */}
                            <div className="modal-body">
                                {/* Información general */}
                                <div className="detalle-info">
                                    <p>
                                        <strong>Estado:</strong>{' '}
                                        <span className={`estado-badge ${getEstadoClass(selectedPedido.estado)}`}>
                                            {selectedPedido.estado}
                                        </span>
                                    </p>
                                    <p>
                                        <strong>Fecha de Pedido:</strong> {formatearFechaHora(selectedPedido.fechaPedido)}
                                    </p>
                                    <p>
                                        <strong>Fecha de Entrega:</strong> {formatearFecha(selectedPedido.fechaEntrega)}
                                    </p>
                                    {selectedPedido.observaciones && (
                                        <p>
                                            <strong>Observaciones:</strong> {selectedPedido.observaciones}
                                        </p>
                                    )}
                                </div>

                                {/* Lista de productos */}
                                <h3>Productos</h3>
                                <div className="detalle-productos">
                                    {selectedPedido.detalles?.map(detalle => (
                                        <div key={detalle.id} className="detalle-producto">
                                            {detalle.productoImagen && (
                                                <img 
                                                    src={detalle.productoImagen} 
                                                    alt={detalle.productoNombre}
                                                    onError={(e) => e.target.src = 'https://via.placeholder.com/80'}
                                                />
                                            )}
                                            <div className="detalle-producto-info">
                                                <h4>{detalle.productoNombre}</h4>
                                                {detalle.productoCategoria && (
                                                    <span className="categoria-badge">{detalle.productoCategoria}</span>
                                                )}
                                                <p>Cantidad: {detalle.cantidad}</p>
                                                <p>Precio unitario: ${detalle.precioUnitario.toFixed(2)}</p>
                                                <p className="subtotal">Subtotal: ${detalle.subtotal.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Total */}
                                <div className="detalle-total">
                                    <h3>Total: ${selectedPedido.total.toFixed(2)}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MisPedidos;

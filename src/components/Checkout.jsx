/**
 * COMPONENTE CHECKOUT
 * Página para finalizar la compra y crear el pedido
 * Validaciones: usuario autenticado, carrito no vacío, fecha válida
 */

import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CarritoContext } from '../context/CarritoContext';
import { AuthContext } from '../context/AuthContext';
import PedidoService from '../services/PedidoService';
import Swal from 'sweetalert2';

function Checkout() {
    const navigate = useNavigate();
    const { cart, calcularTotal, vaciarCarrito } = useContext(CarritoContext);
    const { user, isAuthenticated } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [pedidoConfirmado, setPedidoConfirmado] = useState(false);

    const [formData, setFormData] = useState({
        fechaEntrega: '',
        observaciones: ''
    });

    // Validar autenticación y carrito al montar el componente
    useEffect(() => {
        // No validar si ya se confirmó el pedido
        if (pedidoConfirmado) return;

        if (!isAuthenticated()) {
            Swal.fire({
                icon: 'warning',
                title: 'Debes iniciar sesión',
                text: 'Para realizar un pedido necesitas estar autenticado',
                confirmButtonColor: '#ff6b35'
            }).then(() => {
                navigate('/auth');
            });
            return;
        }

        if (cart.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Carrito vacío',
                text: 'Agrega productos antes de hacer un pedido',
                confirmButtonColor: '#ff6b35'
            }).then(() => {
                navigate('/products');
            });
            return;
        }
    }, [isAuthenticated, navigate, pedidoConfirmado]);

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Validar y enviar el pedido
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar fecha de entrega (debe ser hoy o posterior)
        const fechaEntregaInput = new Date(formData.fechaEntrega);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (fechaEntregaInput < hoy) {
            Swal.fire({
                icon: 'error',
                title: 'Fecha inválida',
                text: 'La fecha de entrega debe ser hoy o posterior',
                confirmButtonColor: '#ff6b35'
            });
            return;
        }

        // Preparar datos del pedido según el DTO del backend
        // IMPORTANTE: El backend espera DateTime en formato ISO 8601
        const fechaEntrega = new Date(formData.fechaEntrega);
        fechaEntrega.setHours(12, 0, 0, 0); // Establecer mediodía para evitar problemas de zona horaria

        const pedidoData = {
            fechaEntrega: fechaEntrega.toISOString(), // Formato: "2024-01-15T12:00:00.000Z"
            observaciones: formData.observaciones.trim() || null,
            detalles: cart.map(item => ({
                productoId: item.id,
                cantidad: item.cantidad
            }))
        };

        setLoading(true);
        const result = await PedidoService.createPedido(pedidoData);
        setLoading(false);

        if (result.success) {
            // Marcar pedido como confirmado ANTES de vaciar el carrito
            setPedidoConfirmado(true);

            Swal.fire({
                icon: 'success',
                title: '¡Pedido realizado!',
                html: `
                    <p>Tu pedido <strong>#${result.data.id}</strong> ha sido creado exitosamente</p>
                    <p>Total: <strong>$${result.data.total?.toFixed(2) || calcularTotal().toFixed(2)}</strong></p>
                `,
                confirmButtonText: 'Ver mis pedidos',
                confirmButtonColor: '#ff6b35'
            }).then(() => {
                // Vaciar carrito después de que el usuario cierre el alert
                vaciarCarrito();
                // Navegar y hacer scroll al inicio
                navigate('/mis-pedidos');
                // Forzar scroll al inicio después de navegar
                setTimeout(() => window.scrollTo(0, 0), 100);
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error al crear pedido',
                text: result.message,
                confirmButtonColor: '#ff6b35'
            });
        }
    };

    // Calcular fecha mínima (mañana)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    // No renderizar si no está autenticado o carrito vacío
    if (!isAuthenticated() || cart.length === 0) {
        return null;
    }

    return (
        <div className="checkout-page">
            <div className="container-custom">
                <h1 className="checkout-title">Finalizar Pedido</h1>

                <div className="checkout-grid">
                    {/* Resumen del pedido */}
                    <div className="checkout-summary">
                        <h2>Resumen del Pedido</h2>
                        <div className="summary-items">
                            {cart.map(item => (
                                <div key={item.id} className="summary-item">
                                    <img
                                        src={item.imagenUrl || 'https://via.placeholder.com/150'}
                                        alt={item.nombre}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/img/panaderia-placeholder.png';
                                        }}
                                    />
                                    <div className="summary-item-info">
                                        <h4>{item.nombre}</h4>
                                        <p>Cantidad: {item.cantidad}</p>
                                        <p className="summary-item-price">
                                            ${(item.precioBase * item.cantidad).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="summary-total">
                            <h3>Total: ${calcularTotal().toFixed(2)}</h3>
                        </div>
                    </div>

                    {/* Formulario de entrega */}
                    <div className="checkout-form-container">
                        <h2>Datos de Entrega</h2>
                        <form onSubmit={handleSubmit} className="checkout-form">
                            {/* Nombre del usuario (solo lectura) */}
                            <div className="form-group">
                                <label>Nombre</label>
                                <input
                                    type="text"
                                    value={user?.firstName || user?.nombre || ''}
                                    disabled
                                    className="form-input"
                                />
                            </div>

                            {/* Email del usuario (solo lectura) */}
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="form-input"
                                />
                            </div>

                            {/* Fecha de entrega (requerido) */}
                            <div className="form-group">
                                <label>Fecha de Entrega *</label>
                                <input
                                    type="date"
                                    name="fechaEntrega"
                                    value={formData.fechaEntrega}
                                    onChange={handleChange}
                                    min={minDate}
                                    required
                                    className="form-input"
                                />
                                <small>Selecciona cuándo deseas recibir tu pedido (mínimo mañana)</small>
                            </div>

                            {/* Observaciones (opcional) */}
                            <div className="form-group">
                                <label>Observaciones</label>
                                <textarea
                                    name="observaciones"
                                    value={formData.observaciones}
                                    onChange={handleChange}
                                    placeholder="Instrucciones especiales, alergias, preferencias, etc."
                                    rows="4"
                                    className="form-input"
                                    maxLength="500"
                                />
                                <small>{formData.observaciones.length}/500 caracteres</small>
                            </div>

                            {/* Botón confirmar pedido */}
                            <button
                                type="submit"
                                className="btn-checkout"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-circle me-2"></i>
                                        Confirmar Pedido
                                    </>
                                )}
                            </button>

                            {/* Botón volver al carrito */}
                            <button
                                type="button"
                                className="btn-back"
                                onClick={() => navigate('/cart')}
                                disabled={loading}
                            >
                                <i className="bi bi-arrow-left me-2"></i>
                                Volver al Carrito
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;

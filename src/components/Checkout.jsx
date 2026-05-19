import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CarritoContext } from '../context/CarritoContext';
import { AuthContext } from '../context/AuthContext';
import CarritoService from '../services/CarritoService';
import { PLACEHOLDER_CART } from '../config/placeholders';
import '../style/checkout.css';
import Swal from 'sweetalert2';

const DEBUG = true;

function debugLog(type, data) {
    if (!DEBUG) return;
    console.log(`%c[Checkout] ${type}`, 'color: orange');
    console.log('  ', data);
}

function Checkout() {
    const navigate = useNavigate();
    const { cart, calcularTotal, vaciarCarrito } = useContext(CarritoContext);
    const { user, isAuthenticated } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [pedidoConfirmado, setPedidoConfirmado] = useState(false);

    const [formData, setFormData] = useState({
        fechaEntrega: '',
        observaciones: '',
        tipoPago: 'Efectivo'
    });

    useEffect(() => {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, navigate, pedidoConfirmado]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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

        const fechaEntrega = new Date(formData.fechaEntrega);
        fechaEntrega.setHours(12, 0, 0, 0);

        const tipoPagoMap = {
            Efectivo: 1,
            Transferencia: 2,
            MercadoPago: 3,
        };

        const checkoutData = {
            fechaEntrega: fechaEntrega.toISOString(),
            observaciones: formData.observaciones.trim() || null,
            tipoPago: tipoPagoMap[formData.tipoPago] || null,
        };

        debugLog('CHECKOUT_DATA', checkoutData);

        setLoading(true);
        const result = await CarritoService.checkout(checkoutData);
        setLoading(false);

        debugLog('CHECKOUT_RESULT', result);

        if (result.success) {
            setPedidoConfirmado(true);

            Swal.fire({
                icon: 'success',
                title: '¡Pedido realizado!',
                html: `
                    <p>Tu pedido <strong>#${result.data.id}</strong> ha sido creado exitosamente</p>
                    <p>Total: <strong>$${result.data.total?.toFixed(2) || calcularTotal().toFixed(2)}</strong></p>
                    ${result.data.montoConDescuento ? `<p>Monto con descuento: <strong>$${result.data.montoConDescuento.toFixed(2)}</strong></p>` : ''}
                `,
                confirmButtonText: 'Ir a pagar',
                confirmButtonColor: '#ff6b35'
            }).then(() => {
                vaciarCarrito();
                navigate(`/pago/${result.data.id}`);
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

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

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
                                        src={item.imagenUrl || PLACEHOLDER_CART}
                                        alt={item.nombre}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = PLACEHOLDER_CART;
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
                            <div className="form-group">
                                <label>Nombre</label>
                                <input
                                    type="text"
                                    value={user?.firstName || user?.nombre || ''}
                                    disabled
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="form-input"
                                />
                            </div>

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

                            <div className="form-group">
                                <label>Método de Pago *</label>
                                <div className="payment-options">
                                    <label className={`payment-option ${formData.tipoPago === 'Efectivo' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="tipoPago"
                                            value="Efectivo"
                                            checked={formData.tipoPago === 'Efectivo'}
                                            onChange={handleChange}
                                        />
                                        <i className="bi bi-cash"></i>
                                        <span> Efectivo</span>
                                        <small>10% de descuento*</small>
                                        <small>Paga al retirar</small>
                                    </label>
                                    <label className={`payment-option ${formData.tipoPago === 'Transferencia' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="tipoPago"
                                            value="Transferencia"
                                            checked={formData.tipoPago === 'Transferencia'}
                                            onChange={handleChange}
                                        />
                                        <i className="bi bi-bank"></i>
                                        <span> Transferencia</span>
                                        <small>10% de descuento*</small>
                                    </label>
                                    <label className={`payment-option ${formData.tipoPago === 'MercadoPago' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="tipoPago"
                                            value="MercadoPago"
                                            checked={formData.tipoPago === 'MercadoPago'}
                                            onChange={handleChange}
                                        />
                                        <i className="bi bi-credit-card-2-front"></i>
                                        <span> Mercado Pago</span>
                                        <small>Débito/Crédito</small>
                                    </label>
                                </div>
                                <small>Los descuentos se aplican al finalizar el pedido según configuración del local</small>
                            </div>

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

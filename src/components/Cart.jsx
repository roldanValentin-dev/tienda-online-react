import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { CarritoContext } from "../context/CarritoContext";

function Cart() {
    const { cart, eliminarDelCarrito, calcularTotal } = useContext(CarritoContext);
    const navigate = useNavigate();

    const handleRemoveItem = (product) => {
        Swal.fire({
            title: '¿Eliminar producto?',
            html: `¿Estás seguro de eliminar <strong>${product.nombre}</strong> del carrito?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff6b35',
            cancelButtonColor: '#666',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                eliminarDelCarrito(product.id);
                Swal.fire({
                    title: '¡Eliminado!',
                    text: 'El producto ha sido eliminado del carrito',
                    icon: 'success',
                    confirmButtonColor: '#ff6b35',
                    timer: 2000,
                    timerProgressBar: true,
                });
            }
        });
    };

    const handleCheckout = () => {
        Swal.fire({
            title: '¡Gracias por tu compra!',
            html: `
                <p>Total a pagar: <strong>$${calcularTotal().toLocaleString()}</strong></p>
                <p>Esta es una demo. La funcionalidad de pago se implementará próximamente.</p>
            `,
            icon: 'success',
            confirmButtonColor: '#ff6b35',
            confirmButtonText: 'Entendido'
        });
    };

    return (
        <div className="cart-page">
            <div className="container-custom">
                <div className="page-header animate-fade-in">
                    <h1 className="page-title">
                        <i className="bi bi-cart3 me-2"></i>
                        Mi Carrito
                    </h1>
                    <p className="page-subtitle">
                        {cart.length === 0 
                            ? 'Tu carrito está vacío' 
                            : `Tienes ${cart.length} producto${cart.length > 1 ? 's' : ''} en tu carrito`
                        }
                    </p>
                </div>

                {cart.length === 0 ? (
                    <div className="empty-state animate-fade-in-up">
                        <div className="empty-icon">🛒</div>
                        <h3>Tu carrito está vacío</h3>
                        <p className="text-muted">¡Agrega productos para comenzar tu compra!</p>
                        <button 
                            className="btn-primary btn-large"
                            onClick={() => navigate('/')}
                        >
                            <i className="bi bi-bag-fill me-2"></i>
                            Ver Productos
                        </button>
                    </div>
                ) : (
                    <div className="cart-layout">
                        {/* Lista de productos */}
                        <div className="cart-items">
                            {cart.map((product, index) => (
                                <div 
                                    key={product.id} 
                                    className="cart-item animate-slide-in"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="cart-item-image">
                                        <img 
                                            src={product.imagenUrl || 'https://via.placeholder.com/150'} 
                                            alt={product.nombre}
                                        />
                                    </div>
                                    <div className="cart-item-info">
                                        <span className="product-category-badge">{product.categoria}</span>
                                        <h3 className="cart-item-name">{product.nombre}</h3>
                                        <p className="cart-item-quantity">Cantidad: {product.cantidad}</p>
                                        <p className="cart-item-unit-price">
                                            ${product.precioBase.toLocaleString()} c/u
                                        </p>
                                    </div>
                                    <div className="cart-item-actions">
                                        <p className="cart-item-total">
                                            ${(product.precioBase * product.cantidad).toLocaleString()}
                                        </p>
                                        <button 
                                            className="btn-remove"
                                            onClick={() => handleRemoveItem(product)}
                                        >
                                            <i className="bi bi-trash"></i>
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Resumen */}
                        <div className="cart-summary animate-fade-in-up">
                            <h2 className="summary-title">Resumen de compra</h2>
                            
                            <div className="summary-row">
                                <span>Productos ({cart.length})</span>
                                <span>${calcularTotal().toLocaleString()}</span>
                            </div>
                            
                            <div className="summary-row">
                                <span>Envío</span>
                                <span className="text-success">Gratis</span>
                            </div>
                            
                            <div className="summary-divider"></div>
                            
                            <div className="summary-total">
                                <span>Total</span>
                                <span className="total-amount">${calcularTotal().toLocaleString()}</span>
                            </div>

                            <button 
                                className="btn-primary btn-large btn-block"
                                onClick={handleCheckout}
                            >
                                <i className="bi bi-credit-card me-2"></i>
                                Finalizar Compra
                            </button>

                            <button 
                                className="btn-secondary btn-block"
                                onClick={() => navigate('/')}
                            >
                                <i className="bi bi-arrow-left me-2"></i>
                                Seguir Comprando
                            </button>

                            <div className="summary-features">
                                <div className="feature-item">
                                    <i className="bi bi-shield-check"></i>
                                    <span>Compra protegida</span>
                                </div>
                                <div className="feature-item">
                                    <i className="bi bi-truck"></i>
                                    <span>Envío gratis</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Cart;

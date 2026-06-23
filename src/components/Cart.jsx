import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { CarritoContext } from "../context/CarritoContext";
import API_BASE_URL from '../config/api';
import { PLACEHOLDER_CART } from '../config/placeholders';
import axios from 'axios';
import '../style/cart.css';

function Cart() {
  const { cart, eliminarDelCarrito, actualizarCantidad, calcularTotal, syncing } = useContext(CarritoContext);
  const [productMap, setProductMap] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (cart.length === 0) return;
    axios.get(`${API_BASE_URL}/api/catalogo/productos`).then(res => {
      const map = {};
      res.data.forEach(p => { map[p.id] = p; });
      setProductMap(map);
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemoveItem = (product) => {
    Swal.fire({
      title: '¿Eliminar producto?',
      html: `¿Estás seguro de eliminar <strong>${product.nombre}</strong> del carrito?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c9a84c',
      cancelButtonColor: '#666',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarDelCarrito(product.id);
        Swal.fire({
          title: '¡Eliminado!',
          icon: 'success',
          confirmButtonColor: '#c9a84c',
          timer: 1500,
          timerProgressBar: true,
        });
      }
    });
  };

  if (syncing) {
    return (
      <div className="at-cart">
        <div className="container-custom">
          <div className="loading-container">
            <div className="spinner"></div>
            <p style={{ marginTop: 16 }}>Sincronizando carrito...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="at-cart">
      <div className="at-cart-layout">
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.8rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 8
          }}>
            Tu Pedido
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
            {cart.length === 0
              ? 'Tu carrito está vacío'
              : `${cart.length} producto${cart.length > 1 ? 's' : ''} en tu pedido`
            }
          </p>

          {cart.length === 0 ? (
            <div className="at-cart-empty">
              <div className="at-cart-empty-icon">
                <i className="bi bi-bag"></i>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 8, color: 'var(--text-primary)' }}>
                Tu carrito está vacío
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                Agregá productos para comenzar tu pedido
              </p>
              <button className="btn-gold" onClick={() => navigate('/products')}>
                <i className="bi bi-bag"></i>
                Ver Productos
              </button>
            </div>
          ) : (
            <div className="at-cart-items">
              {cart.map((product, index) => {
                const p = productMap?.[product.id] || product;
                const precioUnitario = p.enOferta && p.precioOferta ? p.precioOferta : p.precioBase;
                return (
                  <div
                    key={product.id}
                    className="at-cart-item"
                    style={{
                      animation: `revealUp 0.5s var(--transition-base) both`,
                      animationDelay: `${index * 0.06}s`,
                    }}
                  >
                    <div className="at-cart-item-img">
                      <img
                        src={(() => {
                          const img = p.imagenUrl || (p.imagenes && p.imagenes.length > 0 ? (p.imagenes.find(i => i.esPrincipal) || p.imagenes[0]).url : null);
                          return img ? (img.startsWith('http') ? img : `${API_BASE_URL}${img}`) : PLACEHOLDER_CART;
                        })()}
                        alt={product.nombre}
                        onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_CART; }}
                      />
                    </div>
                    <div className="at-cart-item-body">
                      <p className="at-cart-item-meta">
                        <span className="at-cart-item-category">{product.categoria}</span>
                      </p>
                      <h3 className="at-cart-item-name">{product.nombre}</h3>
                      {p.enOferta && p.precioOferta ? (
                        <p className="at-cart-item-price">
                          <span className="at-cart-price-old">${p.precioBase.toLocaleString()}</span>
                          <span className="at-cart-price-oferta">${p.precioOferta.toLocaleString()}</span>
                          c/u
                        </p>
                      ) : (
                        <p className="at-cart-item-price">${p.precioBase.toLocaleString()} c/u</p>
                      )}
                      <div className="at-cart-item-qty">
                        <button
                          className="at-cart-qty-btn"
                          onClick={() => actualizarCantidad(product.id, product.cantidad - 1)}
                          disabled={product.cantidad <= 1}
                        >
                          <i className="bi bi-dash"></i>
                        </button>
                        <span className="at-cart-qty-value">{product.cantidad}</span>
                        <button
                          className="at-cart-qty-btn"
                          onClick={() => actualizarCantidad(product.id, product.cantidad + 1)}
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                      </div>
                    </div>
                    <div className="at-cart-item-aside">
                      <p className="at-cart-item-total">
                        ${(precioUnitario * product.cantidad).toLocaleString()}
                      </p>
                      <button
                        className="at-cart-remove-btn"
                        onClick={() => handleRemoveItem(product)}
                      >
                        <i className="bi bi-trash3"></i>
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="at-cart-summary">
            <h2 className="at-cart-summary-title">Resumen</h2>
            <div className="at-cart-summary-row">
              <span>Productos ({cart.length})</span>
              <span>${calcularTotal().toLocaleString()}</span>
            </div>
            <div className="at-cart-summary-divider" />
            <div className="at-cart-summary-total">
              <span>Total</span>
              <span className="at-cart-summary-amount">${calcularTotal().toLocaleString()}</span>
            </div>

            <button
              className="at-cart-checkout-btn"
              onClick={() => navigate('/checkout')}
            >
              <i className="bi bi-check-circle"></i>
              Confirmar Pedido
            </button>

            <button
              className="at-cart-back-btn"
              onClick={() => navigate('/products')}
            >
              <i className="bi bi-arrow-left"></i>
              Seguir Comprando
            </button>

            <div className="at-cart-features">
              <div className="at-cart-feature">
                <i className="bi bi-shield-check"></i>
                <span>Compra protegida</span>
              </div>
              <div className="at-cart-feature">
                <i className="bi bi-truck"></i>
                <span>Envío gratis +$50k</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;

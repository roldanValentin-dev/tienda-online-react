import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CarritoContext } from '../context/CarritoContext';
import { AuthContext } from '../context/AuthContext';
import CarritoService from '../services/CarritoService';
import AdminPagoService from '../services/AdminPagoService';
import API_BASE_URL from '../config/api';
import { PLACEHOLDER_CART } from '../config/placeholders';
import '../style/checkout.css';
import Swal from 'sweetalert2';
import { SWAL_COLOR } from '../config/swal';
import axios from 'axios';

const TIPO_PAGO_MAP = { Efectivo: 1, Transferencia: 2, MercadoPago: 3 };

const WHATSAPP_NUMBER = '5491123456789';

function Checkout() {
  const navigate = useNavigate();
  const { cart, calcularTotal, vaciarCarrito } = useContext(CarritoContext);
  const { isAuthenticated } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);
  const [productMap, setProductMap] = useState(null);

  useEffect(() => {
    const needsRefresh = cart.some(item => !item.imagenUrl && (!item.imagenes || item.imagenes.length === 0));
    if (!needsRefresh) return;
    axios.get(`${API_BASE_URL}/api/catalogo/productos`).then(res => {
      const map = {};
      res.data.forEach(p => { map[p.id] = p; });
      setProductMap(map);
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [step, setStep] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState('retiro');
  const [tipoPago, setTipoPago] = useState('Efectivo');
  const [observaciones, setObservaciones] = useState('');
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(10);

  useEffect(() => {
    AdminPagoService.getDescuento().then(r => {
      if (r.success) setDescuentoPorcentaje(Number(r.data.valor ?? r.data) || 10);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (pedidoConfirmado) return;
    if (!isAuthenticated()) {
      Swal.fire({
        icon: 'warning',
        title: 'Debes iniciar sesión',
        text: 'Para realizar un pedido necesitas estar autenticado',
        confirmButtonColor: SWAL_COLOR
      }).then(() => navigate('/auth'));
      return;
    }
    if (cart.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Carrito vacío',
        text: 'Agrega productos antes de hacer un pedido',
        confirmButtonColor: SWAL_COLOR
      }).then(() => navigate('/products'));
      return;
    }
  }, [isAuthenticated, navigate, pedidoConfirmado, cart]);

  const handleSubmit = async () => {
    const checkoutData = {
      fechaEntrega: new Date().toISOString(),
      observaciones: observaciones || null,
      tipoPago: TIPO_PAGO_MAP[tipoPago],
      esRetiroLocal: deliveryMethod === 'retiro',
      direccionEntrega: null,
    };

    setLoading(true);
    const result = await CarritoService.checkout(checkoutData);
    setLoading(false);

    if (result.success) {
      setPedidoConfirmado(true);
      Swal.fire({
        icon: 'success',
        title: '¡Pedido realizado!',
        html: `<p>Pedido <strong>#${result.data.id}</strong> creado exitosamente</p><p>Total: <strong>$${(result.data.total || calcularTotal()).toFixed(2)}</strong></p>`,
        confirmButtonText: 'Ir a pagar',
        confirmButtonColor: SWAL_COLOR
      }).then(() => {
        vaciarCarrito();
        navigate(`/pago/${result.data.id}`);
        setTimeout(() => window.scrollTo(0, 0), 100);
      });
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: result.message, confirmButtonColor: SWAL_COLOR });
    }
  };

  if (!isAuthenticated() || cart.length === 0) return null;

  const canGoNext = (s) => {
    if (s === 1) return cart.length > 0;
    return !!tipoPago;
  };

  return (
    <div className="at-config">
      <div className="at-config-header">
        <h1>Tu Pedido</h1>
        <p>Completá los datos para finalizar tu pedido</p>
      </div>

      <div className="at-stepper">
        {[1, 2].map(s => (
          <div key={s} className="at-step-indicator">
            <div className={`at-step-dot ${step === s ? 'is-active' : ''} ${step > s ? 'is-done' : ''}`}>
              {step > s ? <i className="bi bi-check"></i> : s}
            </div>
            {s < 2 && <div className={`at-step-line ${step > s ? 'is-done' : ''}`} />}
          </div>
        ))}
      </div>

      <div className="at-step-content">
        {step === 1 && (
          <>
            <h2 className="at-step-title">Revisá tu pedido</h2>
            <div className="at-review-items">
              {cart.map(item => (
                <div key={item.id} className="at-review-item">
                  <div className="at-review-item-img">
                    <img src={(() => {
                      const p = productMap?.[item.id] || item;
                      const img = p.imagenUrl || (p.imagenes && p.imagenes.length > 0 ? (p.imagenes.find(i => i.esPrincipal) || p.imagenes[0]).url : null);
                      return img ? (img.startsWith('http') ? img : `${API_BASE_URL}${img}`) : PLACEHOLDER_CART;
                    })()} alt={item.nombre} />
                  </div>
                  <div className="at-review-item-info">
                    <div className="at-review-item-name">{item.nombre}</div>
                    <div className="at-review-item-meta">Cantidad: {item.cantidad} × ${(() => {
                      const p = productMap?.[item.id] || item;
                      const precio = p.enOferta && p.precioOferta ? p.precioOferta : p.precioBase;
                      return precio.toLocaleString();
                    })()}</div>
                  </div>
                  <div className="at-review-item-subtotal">${(() => {
                    const p = productMap?.[item.id] || item;
                    const precio = p.enOferta && p.precioOferta ? p.precioOferta : p.precioBase;
                    return (precio * item.cantidad).toLocaleString();
                  })()}</div>
                </div>
              ))}
            </div>
            <div className="at-review-total">
              <span className="at-review-total-label">Total</span>
              <span className="at-review-total-amount">${calcularTotal().toLocaleString()}</span>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="at-step-title">Opciones de entrega</h2>

            <div className="at-customizer-section">
              <span className="at-customizer-label">Método de entrega</span>
              <div className="at-delivery-options">
                <div
                  className={`at-delivery-card ${deliveryMethod === 'retiro' ? 'is-selected' : ''}`}
                  onClick={() => setDeliveryMethod('retiro')}
                >
                  <div className="at-delivery-icon local">
                    <span className="material-symbols-outlined">storefront</span>
                  </div>
                  <div className="at-payment-info">
                    <div className="at-payment-name">Retiro en local</div>
                    <div className="at-payment-desc">Pasás a buscar tu pedido por nuestro local</div>
                  </div>
                  <div className="at-delivery-radio" />
                </div>

                <div
                  className={`at-delivery-card ${deliveryMethod === 'envio' ? 'is-selected' : ''}`}
                  onClick={() => setDeliveryMethod('envio')}
                >
                  <div className="at-delivery-icon delivery">
                    <span className="material-symbols-outlined">local_shipping</span>
                  </div>
                  <div className="at-payment-info">
                    <div className="at-payment-name">Envío a domicilio</div>
                    <div className="at-payment-desc">Recibí tu pedido en la puerta de tu casa</div>
                  </div>
                  <div className="at-delivery-radio" />
                </div>
              </div>
            </div>

            {deliveryMethod === 'retiro' && (
              <div className="at-delivery-info">
                <span className="material-symbols-outlined">storefront</span>
                <div>
                  <strong>Retirás por nuestro local</strong>
                  <p>Te esperamos. Te notificaremos cuando tu pedido esté listo.</p>
                </div>
              </div>
            )}

            {deliveryMethod === 'envio' && (
              <div className="at-delivery-info at-delivery-info-whatsapp">
                <span className="material-symbols-outlined">info</span>
                <div>
                  <strong>Consultá por las zonas de envío</strong>
                  <p>Comunicate con nosotros por WhatsApp para confirmar si realizamos envíos a tu zona.</p>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola%21%20Quisiera%20consultar%20por%20las%20zonas%20de%20env%C3%ADo%20disponibles`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="at-whatsapp-btn"
                  >
                    <span className="material-symbols-outlined">chat</span>
                    Consultar por WhatsApp
                  </a>
                </div>
              </div>
            )}

            <div className="at-customizer-section">
              <span className="at-customizer-label">Método de pago</span>
              <div className="at-payment-options">
                {[
                  { id: 'Efectivo', icon: 'bi-cash', iconBg: 'cash', label: 'Efectivo', desc: 'Pagás al retirar o recibir', badge: '10% OFF' },
                  { id: 'Transferencia', icon: 'bi-bank', iconBg: 'transfer', label: 'Transferencia Bancaria', desc: 'Transferís y confirmás', badge: '10% OFF' },
                  { id: 'MercadoPago', icon: 'bi-credit-card-2-front', iconBg: 'mp', label: 'Mercado Pago', desc: 'Débito, crédito o efectivo', badge: null },
                ].map(p => (
                  <div
                    key={p.id}
                    className={`at-payment-card ${tipoPago === p.id ? 'is-selected' : ''}`}
                    onClick={() => setTipoPago(p.id)}
                  >
                    <div className={`at-payment-icon ${p.iconBg}`}>
                      <i className={`bi ${p.icon}`}></i>
                    </div>
                    <div className="at-payment-info">
                      <div className="at-payment-name">{p.label}</div>
                      <div className="at-payment-desc">{p.desc}</div>
                    </div>
                    {p.badge && <span className="at-payment-badge">{p.badge}</span>}
                    <div className="at-payment-radio" />
                  </div>
                ))}
              </div>
            </div>

            <div className="at-review-total" style={{ marginTop: 24 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="at-review-total-label">Subtotal</span>
                  <span style={{ fontWeight: 600 }}>${calcularTotal().toLocaleString()}</span>
                </div>
                {(tipoPago === 'Efectivo' || tipoPago === 'Transferencia') && descuentoPorcentaje > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'var(--success)' }}>
                    <span className="at-review-total-label">Descuento {descuentoPorcentaje}%</span>
                    <span style={{ fontWeight: 600 }}>-${(calcularTotal() * descuentoPorcentaje / 100).toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border-light)' }}>
                  <span className="at-review-total-label">Total a pagar</span>
                  <span className="at-review-total-amount" style={{ fontSize: '1.3rem' }}>
                    ${(tipoPago === 'Efectivo' || tipoPago === 'Transferencia')
                      ? (calcularTotal() * (1 - descuentoPorcentaje / 100)).toLocaleString()
                      : calcularTotal().toLocaleString()
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="at-observations-field">
              <label>Observaciones adicionales</label>
              <textarea
                className="at-customizer-textarea"
                placeholder="Alergias, preferencias especiales, etc."
                value={observaciones}
                onChange={e => setObservaciones(e.target.value.slice(0, 500))}
                maxLength={500}
              />
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {observaciones.length}/500
              </div>
            </div>
          </>
        )}

        <div className="at-step-nav">
          <div className="at-step-nav-left">
            {step > 1 && (
              <button className="btn-ghost" onClick={() => setStep(step - 1)}>
                <i className="bi bi-arrow-left"></i> Anterior
              </button>
            )}
          </div>
          {step < 2 ? (
            <button
              className="btn-gold"
              onClick={() => setStep(step + 1)}
              disabled={!canGoNext(step)}
            >
              Siguiente <i className="bi bi-arrow-right"></i>
            </button>
          ) : (
            <button
              className="btn-gold"
              onClick={handleSubmit}
              disabled={loading || !canGoNext(2)}
            >
              {loading ? (
                <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, margin: 0 }}></span> Procesando...</>
              ) : (
                <><i className="bi bi-check-circle"></i> Confirmar Pedido</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Checkout;

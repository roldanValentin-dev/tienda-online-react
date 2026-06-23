import { useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CarritoContext } from '../context/CarritoContext';
import { AuthContext } from '../context/AuthContext';
import CarritoService from '../services/CarritoService';
import API_BASE_URL from '../config/api';
import { PLACEHOLDER_CART } from '../config/placeholders';
import PastelPreview from './PastelPreview';
import '../style/checkout.css';
import Swal from 'sweetalert2';
import axios from 'axios';

const FROSTING_OPTIONS = [
  { id: 'chocolate', label: 'Chocolate', color: '#5a3a1a' },
  { id: 'vainilla', label: 'Vainilla', color: '#f5e6c8' },
  { id: 'frutos', label: 'Frutos Rojos', color: '#d44a6a' },
  { id: 'caramelo', label: 'Caramelo', color: '#c17f4e' },
];

const SIZE_OPTIONS = [
  { id: 'small', label: 'Pequeño', portions: '6 porciones' },
  { id: 'medium', label: 'Mediano', portions: '8 porciones' },
  { id: 'large', label: 'Grande', portions: '10 porciones' },
];

const TIME_SLOTS = [
  '09:00—10:00', '10:00—11:00', '11:00—12:00',
  '14:00—15:00', '15:00—16:00', '16:00—17:00', '17:00—18:00',
];

const TIPO_PAGO_MAP = { Efectivo: 1, Transferencia: 2, MercadoPago: 3 };

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
  const [frosting, setFrosting] = useState('chocolate');
  const [cakeSize, setCakeSize] = useState('medium');
  const [message, setMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [tipoPago, setTipoPago] = useState('Efectivo');
  const [observaciones, setObservaciones] = useState('');

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return { month: d.getMonth(), year: d.getFullYear() };
  });

  useEffect(() => {
    if (pedidoConfirmado) return;
    if (!isAuthenticated()) {
      Swal.fire({
        icon: 'warning',
        title: 'Debes iniciar sesión',
        text: 'Para realizar un pedido necesitas estar autenticado',
        confirmButtonColor: '#c9a84c'
      }).then(() => navigate('/auth'));
      return;
    }
    if (cart.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Carrito vacío',
        text: 'Agrega productos antes de hacer un pedido',
        confirmButtonColor: '#c9a84c'
      }).then(() => navigate('/products'));
      return;
    }
  }, [isAuthenticated, navigate, pedidoConfirmado, cart]);

  const frostingColor = FROSTING_OPTIONS.find(f => f.id === frosting)?.color || '#c9a84c';

  const calendarDays = useMemo(() => {
    const { year, month } = calendarMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      days.push({
        day: d,
        date,
        isPast: date < today,
        isToday: date.getTime() === today.getTime(),
      });
    }
    return days;
  }, [calendarMonth]);

  const goToPrevMonth = () => {
    setCalendarMonth(prev => {
      const m = prev.month - 1;
      return m < 0 ? { month: 11, year: prev.year - 1 } : { ...prev, month: m };
    });
  };

  const goToNextMonth = () => {
    setCalendarMonth(prev => {
      const m = prev.month + 1;
      return m > 11 ? { month: 0, year: prev.year + 1 } : { ...prev, month: m };
    });
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      Swal.fire({ icon: 'error', title: 'Falta la fecha', text: 'Seleccioná fecha y horario de retiro', confirmButtonColor: '#c9a84c' });
      return;
    }

    const [start] = selectedTime.split('—');
    const [h, m] = start.split(':');
    const fechaEntrega = new Date(selectedDate);
    fechaEntrega.setHours(parseInt(h), parseInt(m), 0, 0);

    const checkoutData = {
      fechaEntrega: fechaEntrega.toISOString(),
      observaciones: `[Personalización: cobertura=${frosting}, tamaño=${cakeSize}${message ? `, frase="${message}"` : ''}] ${observaciones}`.trim() || null,
      tipoPago: TIPO_PAGO_MAP[tipoPago],
      esRetiroLocal: true,
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
        confirmButtonColor: '#c9a84c'
      }).then(() => {
        vaciarCarrito();
        navigate(`/pago/${result.data.id}`);
        setTimeout(() => window.scrollTo(0, 0), 100);
      });
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: result.message, confirmButtonColor: '#c9a84c' });
    }
  };

  if (!isAuthenticated() || cart.length === 0) return null;

  const monthName = new Date(calendarMonth.year, calendarMonth.month).toLocaleString('es-AR', { month: 'long' });

  const canGoNext = (s) => {
    if (s === 1) return cart.length > 0;
    if (s === 2) return true;
    return selectedDate && selectedTime && tipoPago;
  };

  return (
    <div className="at-config">
      <div className="at-config-header">
        <h1>Tu Pedido</h1>
        <p>Personalizá cada detalle de tu experiencia</p>
      </div>

      <div className="at-stepper">
        {[1, 2, 3].map(s => (
          <div key={s} className="at-step-indicator">
            <div className={`at-step-dot ${step === s ? 'is-active' : ''} ${step > s ? 'is-done' : ''}`}>
              {step > s ? <i className="bi bi-check"></i> : s}
            </div>
            {s < 3 && <div className={`at-step-line ${step > s ? 'is-done' : ''}`} />}
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
            <h2 className="at-step-title">Personalizá tu pedido</h2>
            <div className="at-customizer-grid">
              <div>
                <div className="at-customizer-section">
                  <span className="at-customizer-label">Cobertura</span>
                  <div className="at-customizer-options">
                    {FROSTING_OPTIONS.map(f => (
                      <button
                        key={f.id}
                        className={`at-customizer-option ${frosting === f.id ? 'is-selected' : ''}`}
                        onClick={() => setFrosting(f.id)}
                      >
                        <span className="at-customizer-swatch" style={{ background: f.color }} />
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="at-customizer-section">
                  <span className="at-customizer-label">Tamaño</span>
                  <div className="at-customizer-options">
                    {SIZE_OPTIONS.map(s => (
                      <button
                        key={s.id}
                        className={`at-customizer-option ${cakeSize === s.id ? 'is-selected' : ''}`}
                        onClick={() => setCakeSize(s.id)}
                      >
                        {s.label} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({s.portions})</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="at-customizer-section">
                  <span className="at-customizer-label">Frase (opcional)</span>
                  <input
                    className="at-customizer-textarea"
                    style={{ minHeight: 44, resize: 'none' }}
                    placeholder="Ej: Feliz Cumpleaños, Te Amo, Gracias..."
                    value={message}
                    onChange={e => setMessage(e.target.value.slice(0, 30))}
                    maxLength={30}
                  />
                </div>
              </div>

              <div className="at-customizer-preview">
                <span className="at-customizer-preview-label">Preview</span>
                <PastelPreview frosting={frostingColor} size={cakeSize} layers={cakeSize === 'small' ? 2 : cakeSize === 'large' ? 4 : 3} message={message} />
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="at-step-title">Agendá tu retiro</h2>
            <div className="at-schedule-grid">
              <div className="at-calendar">
                <div className="at-calendar-header">
                  <button className="at-calendar-nav-btn" onClick={goToPrevMonth}><i className="bi bi-chevron-left"></i></button>
                  <span className="at-calendar-month">{monthName.charAt(0).toUpperCase() + monthName.slice(1)} {calendarMonth.year}</span>
                  <button className="at-calendar-nav-btn" onClick={goToNextMonth}><i className="bi bi-chevron-right"></i></button>
                </div>
                <div className="at-calendar-weekdays">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                    <div key={d} className="at-calendar-weekday">{d}</div>
                  ))}
                </div>
                <div className="at-calendar-days">
                  {calendarDays.map((d, i) => {
                    if (!d) return <div key={`e-${i}`} className="at-calendar-day is-empty" />;
                    const selected = selectedDate && d.date.getTime() === selectedDate.getTime();
                    return (
                      <button
                        key={d.day}
                        className={`at-calendar-day ${d.isPast ? 'is-disabled' : ''} ${d.isToday ? 'is-today' : ''} ${selected ? 'is-selected' : ''}`}
                        disabled={d.isPast}
                        onClick={() => !d.isPast && setSelectedDate(d.date)}
                      >
                        {d.day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="at-time-slots">
                <h3 className="at-time-slots-title">Horario</h3>
                {selectedDate ? (
                  <div className="at-time-grid">
                    {TIME_SLOTS.map(t => (
                      <button
                        key={t}
                        className={`at-time-chip ${selectedTime === t ? 'is-selected' : ''}`}
                        onClick={() => setSelectedTime(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Seleccioná un día primero</p>
                )}
              </div>
            </div>

            <div className="at-customizer-section">
              <span className="at-customizer-label">Método de pago</span>
              <div className="at-payment-options">
                {[
                  { id: 'Efectivo', icon: 'bi-cash', iconBg: 'cash', label: 'Efectivo', desc: 'Pagás al retirar', badge: '10% OFF' },
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
          {step < 3 ? (
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
              disabled={loading || !canGoNext(3)}
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

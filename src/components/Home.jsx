import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { CarritoContext } from '../context/CarritoContext';
import { GiBread, GiCakeSlice, GiCupcake, GiCookie } from 'react-icons/gi';
import { SkeletonHome } from './Skeleton';
import useScrollReveal from '../hooks/useScrollReveal';
import { useProducts } from '../hooks/useProducts';
import API_BASE_URL from '../config/api';
import { PLACEHOLDER_PRODUCT } from '../config/placeholders';
import '../style/home.css';

const categorySvgs = {
  panaderia: { icon: <GiBread />, gradient: ['#c17f4e', '#8b6914'] },
  pasteleria: { icon: <GiCakeSlice />, gradient: ['#d4a5a5', '#c17f4e'] },
  reposteria: { icon: <GiCupcake />, gradient: ['#c9a84c', '#8b7355'] },
  galletas: { icon: <GiCookie />, gradient: ['#a0928b', '#5a4a3a'] },
};

const features = [
  { icon: 'bi-truck', title: 'Envío Rápido', desc: 'Entrega el mismo día en pedidos antes de las 12pm' },
  { icon: 'bi-check-circle', title: '100% Frescura', desc: 'Horneamos todos los días, producto siempre fresco' },
  { icon: 'bi-star', title: 'Calidad Premium', desc: 'Ingredientes seleccionados y recetas tradicionales' },
  { icon: 'bi-shield-check', title: 'Compra Segura', desc: 'Pago protegido con MercadoPago' },
];

const stats = [
  { number: '15+', label: 'Años de experiencia' },
  { number: '50K+', label: 'Clientes felices' },
  { number: '200+', label: 'Productos artesanales' },
  { number: '100%', label: 'Frescura garantizada' },
];

const processSteps = [
  { title: 'Elegís y pedís online', desc: 'Explorá nuestra carta de temporada y seleccioná tus favoritos. Cada pieza se prepara exclusivamente para vos, garantizando la frescura que nos distingue.' },
  { title: 'Preparamos justo para vos', desc: 'No tenemos stock acumulado. Una vez confirmado tu pedido, nuestros maestros pasteleros comienzan la elaboración utilizando las mejores materias primas locales.' },
  { title: 'Horneamos con dedicación', desc: 'Técnicas tradicionales y atención artesanal en cada pieza. El aroma del horneo fresco es nuestra garantía de calidad.' },
  { title: 'Recibís en casa', desc: 'Llevamos la experiencia de la verdadera pastelería a la puerta de tu hogar. Cuidado extremo en el transporte para que todo llegue en perfecto estado.' },
];

function Home() {
  const navigate = useNavigate();
  const { category, setSelectCategory } = useContext(CarritoContext);
  const { products: allProducts, loading: productsLoading } = useProducts();
  const [heroRef] = useScrollReveal({ threshold: 0.1 });
  const [categoriesRef, catVisible] = useScrollReveal();
  const [offersRef, offersVisible] = useScrollReveal();
  const [featuresRef, featVisible] = useScrollReveal();
  const [processRef, procVisible] = useScrollReveal();
  const [statsRef, statsVisible] = useScrollReveal();
  const [ctaRef, ctaVisible] = useScrollReveal();

  const offerProducts = allProducts.filter(p => p.enOferta);

  const handleCategoryClick = (cat) => {
    setSelectCategory(cat);
    navigate('/products');
  };

  if (category.length === 0) {
    return <SkeletonHome />;
  }

  return (
    <div className="hm-home">

      {/* ===== HERO ===== */}
      <section ref={heroRef} className="hm-hero">
        <div className="hm-hero-noise" />
        <div className="hm-hero-body">
          <span className="hm-hero-badge">Pastelería Artesanal</span>
          <h1 className="hm-hero-title">
            Pastelería artesanal
          </h1>
          <p className="hm-hero-subtitle">
            hecha con <em>dedicación</em>
          </p>
          <p className="hm-hero-desc">
            Todo se produce contra pedido. Envíos a domicilio en Tucumán.
          </p>
          <div className="hm-hero-actions">
            <button className="btn-gold" onClick={() => navigate('/products')}>
              Hacer mi pedido
            </button>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section ref={categoriesRef} className={`hm-categories ${catVisible ? 'is-revealed' : ''}`}>
        <div className="section-header" style={{ textAlign: 'center' }}>
          <span className="section-tag">Categorías</span>
          <h2 className="section-title">Nuestras especialidades</h2>
        </div>
        <div className="hm-categories-track">
          {category.filter(c => c !== 'todas').map((cat, index) => {
            const cfg = categorySvgs[cat] || { icon: <GiBread />, gradient: ['#8b7355', '#5a4a3a'] };
            return (
              <button
                key={index}
                className="hm-category-btn"
                style={{ animationDelay: `${index * 0.08}s` }}
                onClick={() => handleCategoryClick(cat)}
              >
                <div className="hm-category-circle">
                  {cfg.icon}
                </div>
                <span className="hm-category-label">
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ===== OFFERS ===== */}
      {!productsLoading && offerProducts.length > 0 && (
        <section ref={offersRef} className={`hm-offers ${offersVisible ? 'is-revealed' : ''}`}>
          <div className="section-header" style={{ textAlign: 'center' }}>
            <span className="section-tag">Ofertas</span>
            <h2 className="section-title">Productos en oferta</h2>
          </div>
          <div className="hm-offers-grid">
            {offerProducts.slice(0, 5).map((p, i) => {
              const discount = p.precioOferta && p.precioBase
                ? Math.round((1 - Number(p.precioOferta) / Number(p.precioBase)) * 100)
                : 0;
              const mainImg = p.imagenes?.find(i => i.esPrincipal) || p.imagenes?.[0];
              const rawUrl = mainImg?.url || p.imagenUrl || null;
              const imgUrl = rawUrl
                ? (rawUrl.startsWith('http') ? rawUrl : `${API_BASE_URL}${rawUrl}`)
                : PLACEHOLDER_PRODUCT;
              const isLarge = i === 0;
              return (
                <div
                  key={p.id}
                  className={`hm-offer-card ${isLarge ? 'hm-offer-card-lg' : ''}`}
                  onClick={() => navigate(`/products/${p.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/products/${p.id}`)}
                >
                  <div className="hm-offer-image">
                    <img
                      src={imgUrl}
                      alt={p.nombre}
                      loading="lazy"
                    />
                    {discount > 0 && <div className="hm-offer-badge">-{discount}%</div>}
                  </div>
                  <div className="hm-offer-info">
                    <h3 className="hm-offer-name">{p.nombre}</h3>
                    {p.precioOferta && (
                      <div className="hm-offer-prices">
                        <span className="hm-offer-old">${Number(p.precioBase).toLocaleString('es-AR')}</span>
                        <span className="hm-offer-new">${Number(p.precioOferta).toLocaleString('es-AR')}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
      {!productsLoading && offerProducts.length === 0 && (
        <section className="hm-offers hm-offers-empty">
          <div className="section-header" style={{ textAlign: 'center' }}>
            <span className="section-tag">Ofertas</span>
            <h2 className="section-title">Productos en oferta</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Pronto tendremos ofertas especiales para vos. ¡Volvé pronto!
            </p>
          </div>
        </section>
      )}

      {/* ===== FEATURES EDITORIAL GRID ===== */}
      <section ref={featuresRef} className={`hm-features ${featVisible ? 'is-revealed' : ''}`}>
        <div className="hm-features-grid">
          <div className="hm-feature-hero">
            <div className="hm-feature-hero-content">
              <span className="section-tag">Por qué elegirnos</span>
              <h2 className="section-title" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)' }}>
                Compromiso con la calidad
              </h2>
              <p className="section-subtitle" style={{ maxWidth: 420 }}>
                Cada detalle importa para ofrecerte la mejor experiencia de pastelería artesanal.
              </p>
            </div>
          </div>
          {features.map((f, i) => (
            <div key={i} className="hm-feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="hm-feature-card-icon"><i className={f.icon}></i></div>
              <h3 className="hm-feature-card-title">{f.title}</h3>
              <p className="hm-feature-card-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PROCESS ===== */}
      <section ref={processRef} className={`hm-process ${procVisible ? 'is-revealed' : ''}`}>
        <div className="hm-process-steps">
          {processSteps.map((step, i) => (
            <div key={i} className={`hm-process-step ${i % 2 === 1 ? 'hm-process-step-reverse' : ''}`}>
              <div className="hm-process-visual">
                {i === 0 && (
                  <svg viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="400" height="500" rx="16" fill="url(#pgG)" opacity="0.04" />
                    <rect x="120" y="70" width="160" height="280" rx="24" fill="url(#pgG)" opacity="0.08" stroke="var(--accent-gold)" strokeWidth="0.5" />
                    <rect x="135" y="90" width="130" height="200" rx="12" fill="url(#pgG)" opacity="0.05" />
                    <circle cx="200" cy="320" r="16" fill="url(#pgG)" opacity="0.15" />
                    <rect x="155" y="270" width="90" height="6" rx="3" fill="url(#pgG)" opacity="0.12" />
                    <rect x="165" y="284" width="70" height="4" rx="2" fill="url(#pgG)" opacity="0.08" />
                    <path d="M160 370 L200 360 L240 370" stroke="var(--accent-gold)" strokeWidth="1.5" opacity="0.3" fill="none" />
                    <circle cx="130" cy="200" r="4" fill="var(--accent-gold)" opacity="0.2" />
                    <circle cx="270" cy="180" r="3" fill="var(--accent-gold)" opacity="0.15" />
                    <text x="200" y="430" textAnchor="middle" fontFamily="Playfair Display" fontSize="40" fontWeight="700" fill="var(--accent-gold)" opacity="0.08">01</text>
                    <defs>
                      <linearGradient id="pgG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c9a84c" />
                        <stop offset="100%" stopColor="#8b7355" />
                      </linearGradient>
                    </defs>
                  </svg>
                )}
                {i === 1 && (
                  <svg viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="400" height="500" rx="16" fill="url(#pgP)" opacity="0.04" />
                    <path d="M100 300 Q200 340 300 300 L280 200 Q200 240 120 200 Z" fill="url(#pgP)" opacity="0.1" />
                    <ellipse cx="200" cy="230" rx="80" ry="30" fill="url(#pgP)" opacity="0.06" />
                    <path d="M170 170 L190 230 L210 230 L230 170" stroke="var(--accent-gold)" strokeWidth="1.5" opacity="0.3" fill="none" />
                    <circle cx="200" cy="150" r="5" fill="var(--accent-gold)" opacity="0.2" />
                    <ellipse cx="200" cy="300" rx="60" ry="8" fill="url(#pgP)" opacity="0.08" />
                    <circle cx="160" cy="180" r="3" fill="var(--accent-gold)" opacity="0.15" />
                    <circle cx="240" cy="200" r="4" fill="var(--accent-gold)" opacity="0.12" />
                    <text x="200" y="430" textAnchor="middle" fontFamily="Playfair Display" fontSize="40" fontWeight="700" fill="var(--accent-gold)" opacity="0.08">02</text>
                    <defs>
                      <linearGradient id="pgP" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c9a84c" />
                        <stop offset="100%" stopColor="#8b7355" />
                      </linearGradient>
                    </defs>
                  </svg>
                )}
                {i === 2 && (
                  <svg viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="400" height="500" rx="16" fill="url(#pgH)" opacity="0.04" />
                    <rect x="100" y="180" width="200" height="160" rx="12" fill="url(#pgH)" opacity="0.08" stroke="var(--accent-gold)" strokeWidth="0.5" />
                    <rect x="115" y="192" width="170" height="120" rx="8" fill="url(#pgH)" opacity="0.05" />
                    <rect x="130" y="200" width="140" height="80" rx="4" fill="url(#pgH)" opacity="0.04" />
                    <path d="M155 330 L165 360 L235 360 L245 330" fill="url(#pgH)" opacity="0.08" />
                    <path d="M160 150 Q200 130 240 150" stroke="var(--accent-gold)" strokeWidth="1.5" opacity="0.25" fill="none" />
                    <path d="M170 140 Q200 120 230 140" stroke="var(--accent-gold)" strokeWidth="1" opacity="0.15" fill="none" />
                    <circle cx="140" cy="170" r="3" fill="var(--accent-gold)" opacity="0.2" />
                    <circle cx="260" cy="170" r="3" fill="var(--accent-gold)" opacity="0.2" />
                    <text x="200" y="430" textAnchor="middle" fontFamily="Playfair Display" fontSize="40" fontWeight="700" fill="var(--accent-gold)" opacity="0.08">03</text>
                    <defs>
                      <linearGradient id="pgH" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c9a84c" />
                        <stop offset="100%" stopColor="#8b7355" />
                      </linearGradient>
                    </defs>
                  </svg>
                )}
                {i === 3 && (
                  <svg viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="400" height="500" rx="16" fill="url(#pgD)" opacity="0.04" />
                    <rect x="110" y="130" width="180" height="200" rx="12" fill="url(#pgD)" opacity="0.08" stroke="var(--accent-gold)" strokeWidth="0.5" />
                    <rect x="125" y="140" width="150" height="130" rx="8" fill="url(#pgD)" opacity="0.05" />
                    <path d="M130 330 L140 380 L260 380 L270 330" fill="url(#pgD)" opacity="0.06" />
                    <path d="M160 120 L200 90 L240 120" stroke="var(--accent-gold)" strokeWidth="2" opacity="0.3" fill="none" />
                    <path d="M165 115 L200 95 L235 115" stroke="var(--accent-gold)" strokeWidth="1" opacity="0.15" fill="none" />
                    <circle cx="155" cy="270" r="4" fill="var(--accent-gold)" opacity="0.2" />
                    <circle cx="245" cy="250" r="3" fill="var(--accent-gold)" opacity="0.15" />
                    <path d="M260 340 L280 360 L320 320" stroke="var(--accent-gold)" strokeWidth="2" opacity="0.25" fill="none" />
                    <text x="200" y="430" textAnchor="middle" fontFamily="Playfair Display" fontSize="40" fontWeight="700" fill="var(--accent-gold)" opacity="0.08">04</text>
                    <defs>
                      <linearGradient id="pgD" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c9a84c" />
                        <stop offset="100%" stopColor="#8b7355" />
                      </linearGradient>
                    </defs>
                  </svg>
                )}
              </div>
              <div className="hm-process-body">
                <h2 className="hm-process-step-title">{step.title}</h2>
                <p className="hm-process-step-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== STATS BAND (DARK) ===== */}
      <section ref={statsRef} className={`hm-stats ${statsVisible ? 'is-revealed' : ''}`}>
        <div className="hm-stats-band">
          {stats.map((stat, i) => (
            <div key={i} className="hm-stat-item" style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="hm-stat-number">{stat.number}</span>
              <span className="hm-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section ref={ctaRef} className={`hm-cta ${ctaVisible ? 'is-revealed' : ''}`}>
        <div className="hm-cta-body">
          <h2 className="hm-cta-title">¿Listo para probar?</h2>
          <p className="hm-cta-desc">
            Hacé tu pedido hoy y recibilo en las próximas 24-48hs.
          </p>
          <button className="btn-gold" onClick={() => navigate('/products')}>
            <i className="bi bi-bag"></i>
            Comenzar mi pedido
          </button>
        </div>
      </section>

    </div>
  );
}

export default Home;

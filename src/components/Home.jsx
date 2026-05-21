import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { CarritoContext } from '../context/CarritoContext';
import { GiBread, GiCakeSlice, GiCupcake, GiCookie } from 'react-icons/gi';
import { SkeletonHome } from './Skeleton';
import useScrollReveal from '../hooks/useScrollReveal';
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

const testimonials = [
  { initials: 'MG', name: 'María G.', text: 'El pastel de cumpleaños fue espectacular. Todos preguntaron dónde lo compré.' },
  { initials: 'CR', name: 'Carlos R.', text: 'Pido todas las semanas. La calidad es consistente y el servicio impecable.' },
  { initials: 'AL', name: 'Ana L.', text: 'Las facturas son como las de mi abuela. Frescas, delicadas y deliciosas.' },
];

const stats = [
  { number: '15+', label: 'Años de experiencia' },
  { number: '50K+', label: 'Clientes felices' },
  { number: '200+', label: 'Productos artesanales' },
  { number: '100%', label: 'Frescura garantizada' },
];

function Home() {
  const navigate = useNavigate();
  const { category, setSelectCategory } = useContext(CarritoContext);
  const [heroRef] = useScrollReveal({ threshold: 0.1 });
  const [statsRef, statsVisible] = useScrollReveal();
  const [categoriesRef, catVisible] = useScrollReveal();
  const [processRef, procVisible] = useScrollReveal();
  const [testimonialsRef, testVisible] = useScrollReveal();
  const [featuresRef, featVisible] = useScrollReveal();
  const [ctaRef, ctaVisible] = useScrollReveal();

  const handleCategoryClick = (cat) => {
    setSelectCategory(cat);
    navigate('/products');
  };

  if (category.length === 0) {
    return <SkeletonHome />;
  }

  return (
    <div className="at-home">
      <section ref={heroRef} className="at-hero">
        <div className="at-hero-text" style={{ animationDelay: '0.1s' }}>
          <span className="at-hero-badge">Pastelería Artesanal</span>
          <h1 className="at-hero-title">
            El arte de la
            <span className="at-hero-title-italic">pastelería fina</span>
          </h1>
          <p className="at-hero-desc">
            Creaciones horneadas con ingredientes seleccionados y dedicación artesanal.
            Cada bocado cuenta una historia de tradición y calidad.
          </p>
          <div className="at-hero-actions">
            <button className="btn-gold" onClick={() => navigate('/products')}>
              <i className="bi bi-bag"></i>
              Ver Productos
            </button>
            <button className="btn-gold-outline" onClick={() => navigate('/products')}>
              Explorar Categorías
            </button>
          </div>
          <div className="at-hero-rating">
            <div className="at-hero-rating-stars">
              {[...Array(5)].map((_, i) => <i key={i} className="bi bi-star-fill"></i>)}
            </div>
            <span>4.9 — Más de 2,000 reseñas</span>
          </div>
        </div>
        <div className="at-hero-visual" style={{ animationDelay: '0.3s' }}>
          <div className="at-hero-accent" />
          <div className="at-hero-svg-wrapper">
            <svg viewBox="0 0 400 480" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="cakeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c9a84c" />
                  <stop offset="100%" stopColor="#8b7355" />
                </linearGradient>
                <linearGradient id="creamGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fdf8f3" />
                  <stop offset="100%" stopColor="#e8ddd0" />
                </linearGradient>
                <linearGradient id="layerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4a5a5" />
                  <stop offset="100%" stopColor="#c17f4e" />
                </linearGradient>
              </defs>
              <ellipse cx="200" cy="460" rx="160" ry="16" fill="rgba(0,0,0,0.06)" />
              <rect x="80" y="280" width="240" height="160" rx="16" fill="url(#cakeGrad)" />
              <rect x="60" y="250" width="280" height="50" rx="25" fill="url(#creamGrad)" stroke="#e8ddd0" strokeWidth="1" />
              <rect x="100" y="200" width="200" height="70" rx="12" fill="url(#layerGrad)" />
              <rect x="80" y="175" width="240" height="40" rx="20" fill="url(#creamGrad)" stroke="#e8ddd0" strokeWidth="1" />
              <ellipse cx="200" cy="175" rx="120" ry="20" fill="url(#creamGrad)" />
              <circle cx="155" cy="160" r="12" fill="#d4a5a5" />
              <circle cx="200" cy="148" r="14" fill="#d4a5a5" />
              <circle cx="245" cy="160" r="12" fill="#d4a5a5" />
              <path d="M160 100 Q200 60 240 100" stroke="var(--accent-gold)" strokeWidth="2" fill="none" opacity="0.5" />
              <text x="200" y="440" textAnchor="middle" fontFamily="Playfair Display" fontSize="18" fontWeight="600" fill="white">softpan</text>
              <text x="200" y="420" textAnchor="middle" fontFamily="Cormorant Garamond" fontSize="14" fontStyle="italic" fill="white" opacity="0.8">pastelería artesanal</text>
            </svg>
          </div>
        </div>
      </section>

      <section ref={statsRef} className={`at-stats ${statsVisible ? 'is-revealed' : ''}`}>
        <div className="at-stats-grid">
          {stats.map((stat, i) => (
            <div key={i} className="at-stat" style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="at-stat-number">{stat.number}</span>
              <span className="at-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section ref={categoriesRef} className={`at-categories ${catVisible ? 'is-revealed' : ''}`}>
        <div className="section-header" style={{ textAlign: 'center', padding: '0 24px' }}>
          <span className="section-tag">Categorías</span>
          <h2 className="section-title">Explora por Categoría</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Elegí entre nuestra variedad de productos artesanales
          </p>
        </div>
        <div className="at-categories-grid">
          {category.filter(c => c !== 'todas').map((cat, index) => {
            const cfg = categorySvgs[cat] || { icon: <GiBread />, gradient: ['#8b7355', '#5a4a3a'] };
            return (
              <button
                key={index}
                className="at-category-strip"
                style={{ animationDelay: `${index * 0.12}s` }}
                onClick={() => handleCategoryClick(cat)}
              >
                <div
                  className="at-category-bg"
                  style={{
                    background: `linear-gradient(135deg, ${cfg.gradient[0]}, ${cfg.gradient[1]})`,
                  }}
                />
                <div className="at-category-strip-content">
                  <div className="at-category-strip-icon">{cfg.icon}</div>
                  <h3 className="at-category-strip-title">
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </h3>
                  <span className="at-category-strip-count">Ver productos →</span>
                </div>
                <div className="at-category-strip-arrow">
                  <i className="bi bi-arrow-right"></i>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section ref={processRef} className={`at-process ${procVisible ? 'is-revealed' : ''}`}>
        <div className="section-header" style={{ textAlign: 'center', padding: '0 24px' }}>
          <span className="section-tag">Proceso</span>
          <h2 className="section-title">Cómo trabajamos</h2>
        </div>
        <div className="at-process-grid">
          {[
            { num: '01', title: 'Seleccionamos', desc: 'Los mejores ingredientes para cada creación' },
            { num: '02', title: 'Horneamos', desc: 'Con técnicas tradicionales y dedicación artesanal' },
            { num: '03', title: 'Decoramos', desc: 'Cada pieza con detalle y precisión' },
            { num: '04', title: 'Entregamos', desc: 'Fresco y listo para disfrutar' },
          ].map((step, i) => (
            <div key={i} className="at-process-step" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="at-process-number">{step.num}</div>
              <h3 className="at-process-step-title">{step.title}</h3>
              <p className="at-process-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section ref={testimonialsRef} className={`at-testimonials ${testVisible ? 'is-revealed' : ''}`}>
        <div className="section-header" style={{ textAlign: 'center', padding: '0 24px' }}>
          <span className="section-tag">Testimonios</span>
          <h2 className="section-title">Lo que dicen</h2>
        </div>
        <div className="at-testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="at-testimonial-card" style={{ animationDelay: `${i * 0.12}s` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="at-testimonial-seal">{t.initials}</div>
                <div>
                  <span className="at-testimonial-author">{t.name}</span>
                  <div className="at-testimonial-stars">
                    {[...Array(5)].map((_, j) => <i key={j} className="bi bi-star-fill"></i>)}
                  </div>
                </div>
              </div>
              <p className="at-testimonial-text">"{t.text}"</p>
            </div>
          ))}
        </div>
      </section>

      <section ref={featuresRef} className={`at-features ${featVisible ? 'is-revealed' : ''}`}>
        <div className="section-header" style={{ textAlign: 'center', padding: '0 24px' }}>
          <span className="section-tag" style={{ color: 'var(--accent-gold-light)' }}>Por qué elegirnos</span>
          <h2 className="section-title">Compromiso con la calidad</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Cada detalle importa para ofrecerte la mejor experiencia
          </p>
        </div>
        <div className="at-features-grid">
          {features.map((f, i) => (
            <div key={i} className="at-feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="at-feature-icon"><i className={f.icon}></i></div>
              <h3 className="at-feature-title">{f.title}</h3>
              <p className="at-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section ref={ctaRef} className={`at-cta ${ctaVisible ? 'is-revealed' : ''}`}>
        <div className="at-cta-inner">
          <h2 className="at-cta-title">¿Listo para probar lo mejor?</h2>
          <p className="at-cta-text">
            Hacé tu pedido hoy y recibilo fresco. Primera compra con 10% de descuento.
          </p>
          <div className="at-cta-actions">
            <button className="btn-gold" onClick={() => navigate('/products')}>
              <i className="bi bi-bag"></i>
              Comenzar mi pedido
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

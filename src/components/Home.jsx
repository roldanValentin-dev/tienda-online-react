import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { CarritoContext } from '../context/CarritoContext';
import { SkeletonHome } from './Skeleton';
import useScrollReveal from '../hooks/useScrollReveal';
import { useProducts } from '../hooks/useProducts';
import API_BASE_URL from '../config/api';
import { PLACEHOLDER_PRODUCT } from '../config/placeholders';
import '../style/home.css';

const HERO_IMAGE_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3Li6gopnVU9JbJHPHh5cNnOEdc99OrjClVoAvWsCmAQFp1qF-ATvWF3uu94GeGojbE4LD_8_AX9Dn3OQJuv_TQ8opJxAEf6sDKsc-9hNEir6CGSHDokfojruvrFqafkfQMQDBWjO34DMFo4ud6bFIhvKUJxW99oXmfILEtMoFSweYLxl-pPXmyVUuXZ3BuuCNVzk0U-s9is7N8VBGcNJ5KXXTEO0bO0-Kk6eHJb6vutE7AQU21n5meakEk2h0o6wb1L2I61mqD-0';

const categoryIcons = {
  panaderia: 'local_dining',
  pasteleria: 'cake',
  reposteria: 'cookie',
  galletas: 'cookie',
};

const features = [
  { icon: 'delivery_dining', title: 'Envío rápido', desc: 'Menos de 45 minutos en tu puerta.' },
  { icon: 'verified_user', title: 'Pago seguro', desc: 'Tus transacciones están protegidas.' },
  { icon: 'workspace_premium', title: 'Calidad premium', desc: 'Ingredientes frescos y seleccionados.' },
];

const processSteps = [
  { num: '01', title: 'Elegís tus platos', desc: 'Navegá por nuestra carta curada y seleccioná lo que más te tiente.' },
  { num: '02', title: 'Realizás el pedido', desc: 'Pagá de forma segura con tarjeta o billeteras virtuales en segundos.' },
  { num: '03', title: 'Recibís y disfrutás', desc: 'Nuestros repartidores llevan la experiencia gastronómica a tu puerta.' },
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
        <div className="hm-hero-bg" style={{ backgroundImage: `url(${HERO_IMAGE_URL})` }} />
        <div className="hm-hero-overlay" />
        <div className="hm-hero-body">
          <h1 className="hm-hero-title">Pedí online, recibí en casa</h1>
          <p className="hm-hero-desc">
            La mejor gastronomía local en la puerta de tu hogar. Calidad de restaurante, comodidad de delivery.
          </p>
          <div className="hm-hero-actions">
            <button className="hm-hero-cta" onClick={() => navigate('/products')}>
              Ver productos
            </button>
          </div>
        </div>
        <div className="hm-scroll-indicator">
          <span className="material-symbols-outlined">keyboard_arrow_down</span>
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
            const iconName = categoryIcons[cat] || 'restaurant';
            return (
              <button
                key={index}
                className="hm-category-btn"
                style={{ animationDelay: `${index * 0.08}s` }}
                onClick={() => handleCategoryClick(cat)}
              >
                <div className="hm-category-circle">
                  <span className="material-symbols-outlined" data-weight="fill">{iconName}</span>
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
            <span className="section-tag">Ofertas especiales</span>
            <h2 className="section-title">Selección del día</h2>
          </div>
          <div className="hm-offers-grid">
            {offerProducts.slice(0, 3).map((p, i) => {
              const discount = p.precioOferta && p.precioBase
                ? Math.round((1 - Number(p.precioOferta) / Number(p.precioBase)) * 100)
                : 0;
              const mainImg = p.imagenes?.find(i => i.esPrincipal) || p.imagenes?.[0];
              const rawUrl = mainImg?.url || p.imagenUrl || null;
              const imgUrl = rawUrl
                ? (rawUrl.startsWith('http') ? rawUrl : `${API_BASE_URL}${rawUrl}`)
                : PLACEHOLDER_PRODUCT;
              return (
                <div
                  key={p.id}
                  className={`hm-offer-card ${i === 0 ? 'hm-offer-card-featured' : ''}`}
                  onClick={() => navigate(`/products/${p.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/products/${p.id}`)}
                >
                  <div className="hm-offer-image">
                    <img src={imgUrl} alt={p.nombre} loading="lazy" />
                    {discount > 0 && (
                      <div className={`hm-offer-badge ${i === 0 ? 'hm-offer-badge-featured' : ''}`}>
                        -{discount}%
                      </div>
                    )}
                  </div>
                  <div className="hm-offer-info">
                    <h3 className="hm-offer-name">{p.nombre}</h3>
                    {p.descripcion && <p className="hm-offer-desc">{p.descripcion}</p>}
                    <div className="hm-offer-prices">
                      {p.precioOferta && (
                        <>
                          <span className="hm-offer-old">${Number(p.precioBase).toLocaleString('es-AR')}</span>
                          <span className="hm-offer-new">${Number(p.precioOferta).toLocaleString('es-AR')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="hm-offers-footer">
            <Link to="/products" className="hm-offers-link">
              Ver todos los productos <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </section>
      )}
      {!productsLoading && offerProducts.length === 0 && (
        <section className="hm-offers hm-offers-empty">
          <div className="section-header" style={{ textAlign: 'center' }}>
            <span className="section-tag">Ofertas especiales</span>
            <h2 className="section-title">Selección del día</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Pronto tendremos ofertas especiales para vos. ¡Volvé pronto!
            </p>
          </div>
        </section>
      )}

      {/* ===== FEATURES ===== */}
      <section ref={featuresRef} className={`hm-features ${featVisible ? 'is-revealed' : ''}`}>
        <div className="hm-features-header">
          <span className="section-tag">Por qué elegirnos</span>
          <h2 className="section-title">Compromiso con la calidad</h2>
        </div>
        <div className="hm-features-grid">
          {features.map((f, i) => (
            <div key={i} className="hm-feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="hm-feature-card-icon"><span className="material-symbols-outlined">{f.icon}</span></div>
              <div>
                <h3 className="hm-feature-card-title">{f.title}</h3>
                <p className="hm-feature-card-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PROCESS ===== */}
      <section ref={processRef} className={`hm-process ${procVisible ? 'is-revealed' : ''}`}>
        <h2 className="hm-process-title">¿Cómo funciona?</h2>
        <div className="hm-process-steps">
          {processSteps.map((step, i) => (
            <div key={i} className="hm-process-step">
              <div className="hm-process-num">{step.num}</div>
              <div>
                <h3 className="hm-process-step-title">{step.title}</h3>
                <p className="hm-process-step-desc">{step.desc}</p>
              </div>
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
            <span className="material-symbols-outlined">shopping_bag</span>
            Comenzar mi pedido
          </button>
        </div>
      </section>

    </div>
  );
}

export default Home;

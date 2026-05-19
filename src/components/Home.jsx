import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { CarritoContext } from '../context/CarritoContext';
import { GiBread, GiCupcake, GiCookie, GiCakeSlice } from 'react-icons/gi';
import { FaShoppingBag, FaShippingFast, FaCheckCircle, FaStar, FaQuoteLeft } from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md';
import { PLACEHOLDER_PRODUCT } from '../config/placeholders';
import { SkeletonHome } from './Skeleton';
import '../style/home.css';

const features = [
    { icon: <FaShippingFast />, title: 'Envíos Rápidos', desc: 'Entrega el mismo día en pedidos antes de las 12pm' },
    { icon: <FaCheckCircle />, title: '100% Frescura', desc: 'Horneamos todos los días, producto siempre fresco' },
    { icon: <FaStar />, title: 'Calidad Premium', desc: 'Ingredientes seleccionados y recetas tradicionales' },
    { icon: <MdSecurity />, title: 'Compra Segura', desc: 'Pago protegido con MercadoPago y transferencia' }
];

const testimonials = [
    { name: 'María G.', text: 'El pan de masa madre es el mejor que probé. Pido todas las semanas.', rating: 5 },
    { name: 'Carlos R.', text: 'Excelente servicio y la torta de cumpleaños fue espectacular.', rating: 5 },
    { name: 'Ana L.', text: 'Las facturas son como las de mi abuela. Frescas y deliciosas.', rating: 5 }
];

const stats = [
    { number: '15+', label: 'Años de experiencia' },
    { number: '50K+', label: 'Clientes felices' },
    { number: '200+', label: 'Productos artesanales' },
    { number: '100%', label: 'Frescura garantizada' }
];

const categoryImages = {
    'panaderia': 'https://images.unsplash.com/photo-1549931319-a545753467f7?w=400&h=400&fit=crop',
    'pasteleria': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
    'reposteria': 'https://images.unsplash.com/photo-1587248720327-8eb72564a84a?w=400&h=400&fit=crop',
    'galletas': 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop'
};

function Home() {
    const navigate = useNavigate();
    const { category, setSelectCategory } = useContext(CarritoContext);

    const handleCategoryClick = (cat) => {
        setSelectCategory(cat);
        navigate('/products');
    };

    const getCategoryIcon = (cat) => {
        const icons = {
            'panaderia': <GiBread />,
            'pasteleria': <GiCakeSlice />,
            'reposteria': <GiCupcake />,
            'galletas': <GiCookie />
        };
        return icons[cat] || <GiBread />;
    };

    if (category.length === 0) {
        return <SkeletonHome />;
    }

    return (
        <div className="home-page">
            {/* Hero */}
            <section className="hero-banner">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <div className="hero-badge">Panadería Artesanal</div>
                    <h1 className="hero-title">
                        El sabor de lo <span className="text-highlight">hecho con amor</span>
                    </h1>
                    <p className="hero-subtitle">
                        Horneamos todos los días con ingredientes seleccionados para traerte 
                        el pan, las facturas y los pasteles más frescos de la ciudad
                    </p>
                    <div className="hero-actions">
                        <button className="btn-hero" onClick={() => navigate('/products')}>
                            <FaShoppingBag /> Ver Productos
                        </button>
                        <button className="btn-hero-outline" onClick={() => navigate('/products')}>
                            Ver Categorías
                        </button>
                    </div>
                    <div className="hero-rating">
                        <div className="stars">
                            {[...Array(5)].map((_, i) => <FaStar key={i} />)}
                        </div>
                        <span>4.9 — Más de 2,000 reseñas</span>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="stats-section">
                <div className="container-custom">
                    <div className="stats-grid">
                        {stats.map((stat, i) => (
                            <div key={i} className="stat-card">
                                <span className="stat-number">{stat.number}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categorías */}
            <section className="categories-section">
                <div className="container-custom">
                    <div className="section-header">
                        <span className="section-tag">Categorías</span>
                        <h2 className="section-title">Explora por Categoría</h2>
                        <p className="section-subtitle">
                            Elegí entre nuestra gran variedad de productos artesanales
                        </p>
                    </div>
                    <div className="categories-grid">
                        {category.filter(cat => cat !== 'todas').map((cat, index) => (
                            <button
                                key={index}
                                className="category-card"
                                style={{ animationDelay: `${index * 0.1}s` }}
                                onClick={() => handleCategoryClick(cat)}
                            >
                                <div className="category-card-image">
                                    <img
                                        src={categoryImages[cat] || PLACEHOLDER_PRODUCT}
                                        alt={cat}
                                        loading="lazy"
                                    />
                                    <div className="category-card-overlay">
                                        <div className="category-icon-wrapper">
                                            {getCategoryIcon(cat)}
                                        </div>
                                        <span className="category-card-cta">Ver más →</span>
                                    </div>
                                </div>
                                <div className="category-card-footer">
                                    <span className="category-name">
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonios */}
            <section className="testimonials-section">
                <div className="container-custom">
                    <div className="section-header">
                        <span className="section-tag">Testimonios</span>
                        <h2 className="section-title">Lo que dicen nuestros clientes</h2>
                        <p className="section-subtitle">La opinión de quienes ya probaron nuestros productos</p>
                    </div>
                    <div className="testimonials-grid">
                        {testimonials.map((t, i) => (
                            <div key={i} className="testimonial-card">
                                <FaQuoteLeft className="testimonial-quote" />
                                <p className="testimonial-text">{t.text}</p>
                                <div className="testimonial-stars">
                                    {[...Array(t.rating)].map((_, j) => (
                                        <FaStar key={j} />
                                    ))}
                                </div>
                                <span className="testimonial-author">{t.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="features-section">
                <div className="container-custom">
                    <div className="features-grid">
                        {features.map((f, i) => (
                            <div key={i} className="feature-card">
                                <div className="feature-icon">{f.icon}</div>
                                <h3 className="feature-title">{f.title}</h3>
                                <p className="feature-description">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="cta-section">
                <div className="container-custom">
                    <div className="cta-content">
                        <h2 className="cta-title">¿Listo para probar lo mejor?</h2>
                        <p className="cta-text">
                            Hacé tu pedido hoy y recibilo fresco en tu casa. 
                            Primera compra con 10% de descuento
                        </p>
                        <button className="btn-cta" onClick={() => navigate('/products')}>
                            <FaShoppingBag /> Comenzar mi pedido
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;

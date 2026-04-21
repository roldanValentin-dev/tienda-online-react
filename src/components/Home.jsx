import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { CarritoContext } from '../context/CarritoContext';
import { GiBread, GiCupcake, GiCookie, GiCakeSlice } from 'react-icons/gi';
import { FaShoppingBag, FaShippingFast, FaLock, FaCheckCircle } from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md';
import { SkeletonHome } from './Skeleton';

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

    const features = [
        {
            icon: <FaShippingFast />,
            title: 'Envíos Rápidos',
            description: 'Entrega el mismo día'
        },
        {
            icon: <FaLock />,
            title: 'Compra Segura',
            description: 'Pago 100% protegido'
        },
        {
            icon: <MdSecurity />,
            title: 'Garantía Total',
            description: 'Satisfacción garantizada'
        },
        {
            icon: <FaCheckCircle />,
            title: 'Calidad Premium',
            description: 'Productos frescos diarios'
        }
    ];

    if (category.length === 0) {
        return <SkeletonHome />;
    }

    return (
        <div className="home-page">
            {/* Hero Banner */}
            <section className="hero-banner">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">
                            Bienvenido a <span className="text-highlight">Panadería</span>
                        </h1>
                        <p className="hero-subtitle">
                            Descubre los mejores productos de panadería y pastelería, 
                            horneados con amor cada día
                        </p>
                        <button 
                            className="btn-hero"
                            onClick={() => navigate('/products')}
                        >
                            <FaShoppingBag className="btn-icon" />
                            Ver Productos
                        </button>
                    </div>
                </div>
            </section>

            {/* Categorías */}
            <section className="categories-section">
                <div className="container-custom">
                    <h2 className="section-title">Explora por Categoría</h2>
                    <p className="section-subtitle">Selecciona tu categoría favorita</p>
                    <div className="categories-grid">
                        {category.filter(cat => cat !== 'todas').map((cat, index) => (
                            <button 
                                key={index}
                                className="category-btn"
                                style={{ animationDelay: `${index * 0.1}s` }}
                                onClick={() => handleCategoryClick(cat)}
                            >
                                <div className="category-icon-wrapper">
                                    {getCategoryIcon(cat)}
                                </div>
                                <span className="category-name">
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </span>
                                <div className="category-arrow">→</div>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container-custom">
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div 
                                key={index}
                                className="feature-card"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="feature-icon">{feature.icon}</div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;

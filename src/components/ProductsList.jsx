import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CarritoContext } from "../context/CarritoContext";
import { useProducts } from "../hooks/useProducts";
import { SkeletonGrid } from "./Skeleton";

function ProductsList() {
    const navigate = useNavigate();
    const { category, selectCategory, setSelectCategory } = useContext(CarritoContext);
    const { products, loading } = useProducts();
    const [sortBy, setSortBy] = useState('default');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const getSortedProducts = () => {
        let filtered = products.filter(p => p.activo);
        
        if (selectCategory !== 'todas') {
            filtered = filtered.filter(p => p.categoria === selectCategory);
        }
        
        switch(sortBy) {
            case 'price-asc':
                return filtered.sort((a, b) => a.precioBase - b.precioBase);
            case 'price-desc':
                return filtered.sort((a, b) => b.precioBase - a.precioBase);
            case 'name-asc':
                return filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
            case 'name-desc':
                return filtered.sort((a, b) => b.nombre.localeCompare(a.nombre));
            default:
                return filtered;
        }
    };

    const sortedProducts = getSortedProducts();

    return (
        <div className="products-page">
            {/* Hero Banner */}
            <section className="hero-banner-products">
                <div className="container-custom">
                    <h1 className="hero-title-products">Nuestra Repostería Artesanal</h1>
                    <p className="hero-subtitle-products">
                        Elaborados diariamente con ingredientes orgánicos, técnicas tradicionales y mucho amor para endulzar tu día.
                    </p>
                </div>
            </section>

            <div className="container-custom">
                {/* Filtros: Categorías a la izquierda, Ordenar a la derecha */}
                <div className="filters-bar">
                    <div className="category-filters">
                        {category.map((cat, index) => (
                            <button
                                key={index}
                                className={`category-pill ${selectCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectCategory(cat)}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                    
                    <select 
                        className="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="default">Ordenar por</option>
                        <option value="price-asc">Menor precio</option>
                        <option value="price-desc">Mayor precio</option>
                        <option value="name-asc">A-Z</option>
                        <option value="name-desc">Z-A</option>
                    </select>
                </div>

                {loading ? (
                    <SkeletonGrid count={8} />
                ) : sortedProducts.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🍞</div>
                        <h3>No hay productos disponibles</h3>
                        <p className="text-muted">Intenta con otra categoría</p>
                        <button 
                            className="btn-primary"
                            onClick={() => setSelectCategory('todas')}
                        >
                            Ver Todos
                        </button>
                    </div>
                ) : (
                    <div className="products-grid">
                        {sortedProducts.map((p, index) => (
                            <div 
                                key={p.id} 
                                className="product-card"
                                onClick={() => navigate(`/products/${p.id}`)}
                            >
                                <div className="product-image-container">
                                    <img 
                                        src={p.imagenUrl || 'https://via.placeholder.com/300x200'} 
                                        className="product-image" 
                                        alt={p.nombre}
                                    />
                                    <span className="product-category-badge">{p.categoria}</span>
                                </div>
                                <div className="product-body">
                                    <h3 className="product-name">{p.nombre}</h3>
                                    <p className="product-price">${p.precioBase.toLocaleString()}</p>
                                    <button className="product-btn">
                                        Comprar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductsList;

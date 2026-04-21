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
            <div className="container-custom">
                <div className="page-header">
                    <h1 className="page-title">Nuestros Productos</h1>
                    <p className="page-subtitle">Descubre nuestra selección de productos frescos</p>
                </div>
                
                <div className="filters-container">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <div className="filter-group">
                                <label className="filter-label">
                                    <i className="bi bi-sort-down me-2"></i>Ordenar
                                </label>
                                <select 
                                    className="filter-select"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="default">Más relevantes</option>
                                    <option value="price-asc">Menor precio</option>
                                    <option value="price-desc">Mayor precio</option>
                                    <option value="name-asc">A-Z</option>
                                    <option value="name-desc">Z-A</option>
                                </select>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="filter-group">
                                <label className="filter-label">
                                    <i className="bi bi-funnel me-2"></i>Categoría
                                </label>
                                <select 
                                    className="filter-select"
                                    value={selectCategory}
                                    onChange={(e) => setSelectCategory(e.target.value)}
                                >
                                    {category.map((cat, index) => (
                                        <option key={index} value={cat}>
                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
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
                    <div className="products-grid products-fade-in">
                        {sortedProducts.map((p, index) => (
                            <div 
                                key={p.id} 
                                className="product-card"
                                style={{ animationDelay: `${index * 0.05}s` }}
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
                                        <i className="bi bi-eye me-2"></i>
                                        Ver detalle
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

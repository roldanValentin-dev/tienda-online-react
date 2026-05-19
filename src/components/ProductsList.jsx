import { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CarritoContext } from "../context/CarritoContext";
import { useProducts } from "../hooks/useProducts";
import { SkeletonGrid } from "./Skeleton";
import API_BASE_URL from '../config/api';
import { PLACEHOLDER_PRODUCT } from '../config/placeholders';
import '../style/products.css';

function useDebounce(value, delay) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

function ProductsList() {
    const navigate = useNavigate();
    const { category, selectCategory, setSelectCategory } = useContext(CarritoContext);
    const { products, loading } = useProducts();
    const [sortBy, setSortBy] = useState('default');
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);
    const searchRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (searchRef.current) searchRef.current.focus();
    }, []);

    const filteredProducts = () => {
        let result = products.filter(p => p.activo);

        if (debouncedSearch.trim()) {
            const q = debouncedSearch.trim().toLowerCase();
            result = result.filter(p =>
                p.nombre.toLowerCase().includes(q) ||
                (p.descripcion && p.descripcion.toLowerCase().includes(q))
            );
        }

        if (selectCategory !== 'todas') {
            result = result.filter(p => p.categoria === selectCategory);
        }

        switch(sortBy) {
            case 'price-asc':
                return result.sort((a, b) => a.precioBase - b.precioBase);
            case 'price-desc':
                return result.sort((a, b) => b.precioBase - a.precioBase);
            case 'name-asc':
                return result.sort((a, b) => a.nombre.localeCompare(b.nombre));
            case 'name-desc':
                return result.sort((a, b) => b.nombre.localeCompare(a.nombre));
            default:
                return result;
        }
    };

    const displayProducts = filteredProducts();
    const hasActiveFilters = debouncedSearch.trim() || selectCategory !== 'todas' || sortBy !== 'default';

    const getProductImage = (producto) => {
        if (producto.imagenes && producto.imagenes.length > 0) {
            const imagenPrincipal = producto.imagenes.find(img => img.esPrincipal);
            const imagen = imagenPrincipal || producto.imagenes[0];
            return `${API_BASE_URL}${imagen.url}`;
        }
        return producto.imagenUrl || PLACEHOLDER_PRODUCT;
    };

    return (
        <div className="products-page">
            <div className="container-custom">
                <div className="page-header">
                    <h1 className="page-title">Nuestros Productos</h1>
                    <p className="page-subtitle">Descubre nuestra selección de productos frescos</p>
                </div>

                <div className="filters-container">
                    {/* Search bar */}
                    <div className="search-bar-container">
                        <div className="search-bar-wrapper">
                            <i className="bi bi-search search-icon"></i>
                            <input
                                ref={searchRef}
                                type="text"
                                className="search-input"
                                placeholder="Buscar productos por nombre o descripción..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    className="search-clear"
                                    onClick={() => setSearchQuery('')}
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            )}
                        </div>
                    </div>

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
                ) : displayProducts.length === 0 ? (
                    <div className="empty-state">
                        {debouncedSearch.trim() ? (
                            <>
                                <div className="empty-icon">🔍</div>
                                <h3>Sin resultados</h3>
                                <p className="text-muted">
                                    No encontramos productos que coincidan con <strong>"{debouncedSearch}"</strong>
                                </p>
                                <button
                                    className="btn-primary"
                                    onClick={() => { setSearchQuery(''); setSelectCategory('todas'); setSortBy('default'); }}
                                >
                                    Limpiar filtros
                                </button>
                            </>
                        ) : hasActiveFilters ? (
                            <>
                                <div className="empty-icon">🍞</div>
                                <h3>No hay productos en esta categoría</h3>
                                <p className="text-muted">Intenta con otra categoría</p>
                                <button
                                    className="btn-primary"
                                    onClick={() => { setSelectCategory('todas'); setSortBy('default'); }}
                                >
                                    Ver Todos
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="empty-icon">🍞</div>
                                <h3>No hay productos disponibles</h3>
                                <p className="text-muted">Vuelve más tarde</p>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        {debouncedSearch.trim() && (
                            <p className="search-results-info">
                                {displayProducts.length} resultado{displayProducts.length !== 1 ? 's' : ''} para <strong>"{debouncedSearch}"</strong>
                            </p>
                        )}
                        <div className="products-grid products-fade-in">
                            {displayProducts.map((p, index) => (
                                <div
                                    key={p.id}
                                    className="product-card"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                    onClick={() => navigate(`/products/${p.id}`)}
                                >
                                    <div className="product-image-container">
                                        <img
                                            src={getProductImage(p)}
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
                    </>
                )}
            </div>
        </div>
    );
}

export default ProductsList;

import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CarritoContext } from "../context/CarritoContext";

function ProductsList() {
    const navigate = useNavigate();
    const { products, loading, category, selectCategory, setSelectCategory } = useContext(CarritoContext);
    const [sortBy, setSortBy] = useState('default');

    const getSortedProducts = () => {
        let sorted = [...products.filter(p => p.activo)];

        switch (sortBy) {
            case 'price-asc':
                return sorted.sort((a, b) => a.precioBase - b.precioBase);
            case 'price-desc':
                return sorted.sort((a, b) => b.precioBase - a.precioBase);
            case 'name-asc':
                return sorted.sort((a, b) => a.nombre.localeCompare(b.nombre));
            case 'name-desc':
                return sorted.sort((a, b) => b.nombre.localeCompare(a.nombre));
            default:
                return sorted;
        }
    };

    const sortedProducts = getSortedProducts();

    return (
        <div className="products-page">
            <div className="container-custom">
                <div className="page-header">
                    <h1 className="page-title">Nuestros Productos</h1>
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
                    <div className="loading-container">
                        <div className="spinner mx-auto"></div>
                        <p className="text-muted-custom mt-3">Cargando productos...</p>
                    </div>
                ) : sortedProducts.length === 0 ? (
                    <div className="empty-state">
                        <i className="bi bi-inbox"></i>
                        <h3>No hay productos disponibles</h3>
                        <p className="text-muted-custom">Intenta con otra categoría</p>
                    </div>
                ) : (
                    <div className="products-grid">
                        {sortedProducts.map(p => (
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
                                </div>
                                <div className="product-body">
                                    <span className="product-category">{p.categoria}</span>
                                    <h3 className="product-name">{p.nombre}</h3>
                                    <p className="product-price">${p.precioBase.toLocaleString()}</p>
                                    <button className="product-btn">
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

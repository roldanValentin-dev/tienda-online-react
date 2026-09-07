import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CarritoContext } from "../context/CarritoContext";
import { useProducts } from "../hooks/useProducts";
import { SkeletonGrid } from "./Skeleton";
import API_BASE_URL from '../config/api';
import { PLACEHOLDER_PRODUCT } from '../config/placeholders';
import useScrollReveal from '../hooks/useScrollReveal';
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
  const [filterOferta, setFilterOferta] = useState(false);
  const [filterInmediato, setFilterInmediato] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [gridRef, gridVisible] = useScrollReveal({ threshold: 0.05 });

  useEffect(() => { window.scrollTo(0, 0); }, []);

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

    if (filterOferta && filterInmediato) {
      result = result.filter(p => p.enOferta === true || p.stockInmediato === true);
    } else if (filterOferta) {
      result = result.filter(p => p.enOferta === true);
    } else if (filterInmediato) {
      result = result.filter(p => p.stockInmediato === true);
    }

    switch(sortBy) {
      case 'price-asc': return [...result].sort((a, b) => a.precioBase - b.precioBase);
      case 'price-desc': return [...result].sort((a, b) => b.precioBase - a.precioBase);
      case 'name-asc': return [...result].sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'name-desc': return [...result].sort((a, b) => b.nombre.localeCompare(a.nombre));
      default: return result;
    }
  };

  const displayProducts = filteredProducts();

  const getProductImage = (producto) => {
    if (producto.imagenes && producto.imagenes.length > 0) {
      const img = producto.imagenes.find(i => i.esPrincipal) || producto.imagenes[0];
      return `${API_BASE_URL}${img.url}`;
    }
    return producto.imagenUrl
      ? (producto.imagenUrl.startsWith('http') ? producto.imagenUrl : `${API_BASE_URL}${producto.imagenUrl}`)
      : PLACEHOLDER_PRODUCT;
  };

  const calcDiscount = (p) => {
    if (!p.enOferta || !p.precioOferta || !p.precioBase) return null;
    return Math.round((1 - p.precioOferta / p.precioBase) * 100);
  };

  return (
    <div className="at-products">
      <div className="at-products-hero">
        <h1 className="at-products-hero-title">Nuestros Productos</h1>
      </div>

      <div className="at-products-catalog">
        <div className="at-products-catalog-header">
          <h2 style={{ textAlign: 'center', width: '100%' }}>Catálogo completo</h2>
        </div>

        <div className="at-products-layout">
          <aside className="at-filters-sidebar">
            <span className="at-filters-label">Filtrar</span>

            <div className="at-filter-chips">
              <button
                className={`at-filter-chip ${selectCategory === 'todas' ? 'is-active' : ''}`}
                onClick={() => setSelectCategory('todas')}
              >
                Todas
              </button>
              {category.filter(c => c !== 'todas').map(cat => (
                <button
                  key={cat}
                  className={`at-filter-chip ${selectCategory === cat ? 'is-active' : ''}`}
                  onClick={() => setSelectCategory(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            <div className="at-filter-tags">
              <button
                className={`at-filter-tag ${filterOferta ? 'is-active-oferta' : ''}`}
                onClick={() => { setFilterOferta(v => !v); setSelectCategory('todas'); }}
              >
                <span className="material-symbols-outlined">sell</span> En oferta
              </button>
              <button
                className={`at-filter-tag ${filterInmediato ? 'is-active-inmediato' : ''}`}
                onClick={() => { setFilterInmediato(v => !v); setSelectCategory('todas'); }}
              >
                <span className="material-symbols-outlined">schedule</span> Retiro hoy
              </button>
            </div>

            <div className="at-search-wrapper">
              <span className="material-symbols-outlined at-search-icon">search</span>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="at-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Más relevantes</option>
              <option value="price-asc">Menor precio</option>
              <option value="price-desc">Mayor precio</option>
              <option value="name-asc">A—Z</option>
              <option value="name-desc">Z—A</option>
            </select>
          </aside>

          <div>
            {loading ? (
              <SkeletonGrid count={8} />
            ) : displayProducts.length === 0 ? (
              <div className="at-products-empty">
                <div className="empty-state">
                  <div className="empty-icon"><span className="material-symbols-outlined">search</span></div>
                  <h3>Sin resultados</h3>
                  <p>
                    {debouncedSearch.trim()
                      ? `No encontramos productos para "${debouncedSearch}"`
                      : 'No hay productos en esta categoría'}
                  </p>
                  <button
                    className="btn-gold"
                    onClick={() => { setSearchQuery(''); setSelectCategory('todas'); setSortBy('default'); setFilterOferta(false); setFilterInmediato(false); }}
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            ) : (
              <>
                {debouncedSearch.trim() && (
                  <p className="at-search-info">
                    {displayProducts.length} resultado{displayProducts.length !== 1 ? 's' : ''}
                    <> para <strong>"{debouncedSearch}"</strong></>
                  </p>
                )}
                <div
                  ref={gridRef}
                  className="at-products-grid"
                  style={{
                    opacity: gridVisible ? 1 : 0,
                    transition: 'opacity 0.6s ease-out',
                  }}
                >
                  {displayProducts.map((p, index) => (
                    <div
                      key={p.id}
                      className="at-product-card"
                      style={{
                        animation: gridVisible ? `revealUp 0.6s var(--transition-base) both` : 'none',
                        animationDelay: `${index * 0.06}s`,
                      }}
                      onClick={() => navigate(`/products/${p.id}`)}
                    >
                      <div className="at-product-card-image">
                        <img src={getProductImage(p)} alt={p.nombre} />
                        <span className="at-product-card-category-badge">{p.categoria}</span>
                        {p.enOferta && calcDiscount(p) && (
                          <span className="at-badge-card-oferta">-{calcDiscount(p)}%</span>
                        )}
                        <div className="at-product-card-overlay">
                          <span className="at-product-card-add">
                            <span className="material-symbols-outlined">visibility</span> Ver detalle
                          </span>
                        </div>
                      </div>
                      <div className="at-product-card-body">
                        <h3 className="at-product-card-name">{p.nombre}</h3>
                        {p.enOferta && p.precioOferta ? (
                          <div className="at-product-card-price-group">
                            <span className="at-product-card-price at-product-card-price-old">${Number(p.precioBase).toLocaleString()}</span>
                            <span className="at-product-card-price at-product-card-price-oferta">${Number(p.precioOferta).toLocaleString()}</span>
                          </div>
                        ) : (
                          <span className="at-product-card-price">${Number(p.precioBase).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductsList;

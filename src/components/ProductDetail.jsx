import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CarritoContext } from '../context/CarritoContext';
import { useProducts } from '../hooks/useProducts';
import { SkeletonProductDetail } from './Skeleton';
import ProductoImagenService from '../services/ProductoImagenService';
import API_BASE_URL from '../config/api';
import { PLACEHOLDER_PRODUCT } from '../config/placeholders';
import '../style/product-detail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarAlCarrito } = useContext(CarritoContext);
  const { loading, getProductById } = useProducts();
  const [cantidad, setCantidad] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imagenes, setImagenes] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const cargarImagenes = async () => {
      setLoadingImages(true);
      try {
        const result = await ProductoImagenService.getImagenesByProductoId(id);
        if (result.success) {
          const ordenadas = [...result.data].sort((a, b) => {
            if (a.esPrincipal) return -1;
            if (b.esPrincipal) return 1;
            return a.orden - b.orden;
          });
          setImagenes(ordenadas);
        }
      } catch (error) {
        console.error('Error al cargar imágenes:', error);
      } finally {
        setLoadingImages(false);
      }
    };
    if (id) cargarImagenes();
  }, [id]);

  const product = getProductById(id);

  if (loading || loadingImages) return <SkeletonProductDetail />;
  if (!product) { navigate('/products'); return null; }

  const images = imagenes.length > 0
    ? imagenes.map(img => `${API_BASE_URL}${img.url}`)
    : [product.imagenUrl || PLACEHOLDER_PRODUCT];

  const handleAddToCart = () => {
    agregarAlCarrito(product, cantidad);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="at-detail">
      <div className="at-detail-breadcrumb">
        <Link to="/products"><i className="bi bi-arrow-left"></i> Volver a productos</Link>
      </div>

      <div className="at-detail-grid">
        <div className="at-detail-gallery">
          <div className="at-detail-main-image">
            <img
              src={images[selectedImage]}
              alt={product.nombre}
              style={{ animation: 'crossfade 0.4s ease-out' }}
            />
          </div>
          {images.length > 1 && (
            <div className="at-detail-thumbs">
              {images.map((img, index) => (
                <div
                  key={index}
                  className={`at-detail-thumb ${selectedImage === index ? 'is-active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={img} alt={`${product.nombre} ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="at-detail-info">
          <span className="at-detail-category">{product.categoria}</span>
          <h1 className="at-detail-name">{product.nombre}</h1>
          <span className="at-detail-price">${product.precioBase.toLocaleString()}</span>

          <div className="at-detail-desc">
            <strong>Descripción</strong>
            <p>{product.descripcion || 'Producto artesanal de alta calidad.'}</p>
          </div>

          <div className="at-detail-qty">
            <span className="at-detail-qty-label">Cantidad</span>
            <div className="at-qty-control">
              <button
                className="at-qty-btn"
                onClick={() => setCantidad(prev => Math.max(1, prev - 1))}
                disabled={cantidad <= 1}
              >
                <i className="bi bi-dash"></i>
              </button>
              <span className="at-qty-value">{cantidad}</span>
              <button
                className="at-qty-btn"
                onClick={() => setCantidad(prev => prev + 1)}
              >
                <i className="bi bi-plus"></i>
              </button>
            </div>
          </div>

          <button
            className={`at-detail-cart-btn ${added ? 'is-added' : ''}`}
            onClick={handleAddToCart}
          >
            {added ? (
              <><i className="bi bi-check-circle"></i> ¡Agregado!</>
            ) : (
              <><i className="bi bi-bag-plus"></i> Agregar al carrito</>
            )}
          </button>

          <button className="at-detail-back-btn" onClick={() => navigate('/products')}>
            <i className="bi bi-arrow-left"></i> Seguir comprando
          </button>

          <div className="at-detail-shipping">
            <div className="at-detail-shipping-item">
              <i className="bi bi-truck"></i>
              <span>Envío gratis en compras mayores a $50.000</span>
            </div>
            <div className="at-detail-shipping-item">
              <i className="bi bi-shield-check"></i>
              <span>Compra protegida</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;

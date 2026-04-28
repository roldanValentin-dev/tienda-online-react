import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CarritoContext } from '../context/CarritoContext';
import { useProducts } from '../hooks/useProducts';
import { SkeletonProductDetail } from './Skeleton';
import ProductoImagenService from '../services/ProductoImagenService';
import API_BASE_URL from '../config/api';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { agregarAlCarrito } = useContext(CarritoContext);
    const { loading, getProductById } = useProducts();
    
    const [cantidad, setCantidad] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [imagenes, setImagenes] = useState([]);
    const [loadingImages, setLoadingImages] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);

        const cargarImagenes = async () => {
            setLoadingImages(true);
            try {
                const result = await ProductoImagenService.getImagenesByProductoId(id);
                if (result.success) {
                    // Ordenar imágenes: primero la principal, luego por el campo orden
                    const imagenesOrdenadas = [...result.data].sort((a, b) => {
                        if (a.esPrincipal) return -1;
                        if (b.esPrincipal) return 1;
                        return a.orden - b.orden;
                    });
                    setImagenes(imagenesOrdenadas);
                }
            } catch (error) {
                console.error('Error al cargar imágenes del producto:', error);
            } finally {
                setLoadingImages(false);
            }
        };

        if (id) {
            cargarImagenes();
        }
    }, [id]);

    const product = getProductById(id);

    if (loading || loadingImages) {
        return <SkeletonProductDetail />;
    }

    if (!product) {
        navigate('/products');
        return null;
    }

    // Construir array de URLs de imágenes
    const images = imagenes.length > 0
        ? imagenes.map(img => `${API_BASE_URL}${img.url}`)
        : [product.imagenUrl || 'https://via.placeholder.com/600x400'];

    const handleIncrement = () => setCantidad(prev => prev + 1);
    const handleDecrement = () => {
        if (cantidad > 1) setCantidad(prev => prev - 1);
    };

    const handleAddToCart = () => {
        agregarAlCarrito(product, cantidad);
        const btn = document.getElementById('add-to-cart-btn');
        btn.innerHTML = '<i class="bi bi-check-circle me-2"></i>¡Agregado!';
        btn.style.background = '#7cb342';
        
        setTimeout(() => {
            btn.innerHTML = '<i class="bi bi-cart-plus me-2"></i>Agregar al carrito';
            btn.style.background = '';
        }, 2000);
    };

    return (
        <div className="detail-page">
            <div className="container-custom">
                <div className="breadcrumb-custom detail-fade-in">
                    <a href="/products">← Volver a productos</a>
                </div>

                <div className="detail-container detail-fade-in">
                    <div className="detail-grid">
                        <div className="detail-gallery-section">
                            <div className="gallery-main">
                                <img src={images[selectedImage]} alt={product.nombre} />
                            </div>
                            <div className="gallery-thumbs">
                                {images.map((img, index) => (
                                    <div 
                                        key={index}
                                        className={`thumb ${selectedImage === index ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <img src={img} alt={`${product.nombre} ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="detail-info detail-info-fade-in">
                            <span className="product-category">{product.categoria}</span>
                            <h1 className="detail-title">{product.nombre}</h1>
                            <p className="detail-price">${product.precioBase.toLocaleString()}</p>
                            
                            <div className="detail-description">
                                <strong>Descripción</strong>
                                <p>{product.descripcion}</p>
                            </div>

                            <div className="quantity-selector">
                                <span className="quantity-label">Cantidad</span>
                                <div className="quantity-controls">
                                    <button className="quantity-btn" onClick={handleDecrement}>
                                        <i className="bi bi-dash"></i>
                                    </button>
                                    <input 
                                        type="text" 
                                        className="quantity-input" 
                                        value={cantidad}
                                        readOnly
                                    />
                                    <button className="quantity-btn" onClick={handleIncrement}>
                                        <i className="bi bi-plus"></i>
                                    </button>
                                </div>
                            </div>

                            <div className="action-buttons">
                                <button 
                                    id="add-to-cart-btn"
                                    className="btn-add-cart"
                                    onClick={handleAddToCart}
                                >
                                    <i className="bi bi-cart-plus me-2"></i>
                                    Agregar al carrito
                                </button>
                                <button 
                                    className="btn-back"
                                    onClick={() => navigate('/products')}
                                >
                                    Seguir comprando
                                </button>
                            </div>

                            <div className="shipping-info">
                                <div className="shipping-item">
                                    <i className="bi bi-truck"></i>
                                    <span>Envío gratis en compras mayores a $50.000</span>
                                </div>
                                <div className="shipping-item">
                                    <i className="bi bi-shield-check"></i>
                                    <span>Compra protegida</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;

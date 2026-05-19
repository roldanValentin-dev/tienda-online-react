import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductoService from '../../services/ProductoService';
import ImageUploader from './ImageUploader';
import Swal from 'sweetalert2';
import '../../style/admin/imagenes.css';

const AdminProductoImagenes = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarProducto();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const cargarProducto = async () => {
        setLoading(true);
        const result = await ProductoService.getProductoById(id);
        if (result.success) {
            setProducto(result.data);
        } else {
            Swal.fire('Error', result.message || 'Producto no encontrado', 'error');
            navigate('/admin/productos');
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center p-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (!producto) return null;

    return (
        <div className="container-fluid p-0">
            <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                    {/* Header con botón volver */}
                    <div className="mb-4">
                        <button 
                            className="btn btn-outline-secondary btn-sm mb-3"
                            onClick={() => navigate('/admin/productos')}
                        >
                            ← Volver a productos
                        </button>
                        <h2 className="h4 mb-3">Gestión de Imágenes - {producto.nombre}</h2>
                        
                        {/* Info del producto */}
                        <div className="alert alert-info">
                            <div className="row">
                                <div className="col-md-4">
                                    <strong>Producto:</strong> {producto.nombre}
                                </div>
                                <div className="col-md-4">
                                    <strong>Categoría:</strong> {producto.categoria}
                                </div>
                                <div className="col-md-4">
                                    <strong>Precio:</strong> ${producto.precio?.toLocaleString() || producto.precioBase?.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Componente ImageUploader */}
                    <ImageUploader productoId={id} />
                </div>
            </div>
        </div>
    );
};

export default AdminProductoImagenes;
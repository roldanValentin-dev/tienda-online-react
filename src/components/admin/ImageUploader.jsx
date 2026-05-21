import { useState, useEffect } from 'react';
import ProductoImagenService from '../../services/ProductoImagenService';
import API_BASE_URL from '../../config/api';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import '../../style/admin/imagenes.css';

/**
 * Componente para gestionar las imágenes múltiples de un producto.
 * Permite subir, visualizar, establecer como principal y eliminar imágenes.
 */
const ImageUploader = ({ productoId, onUploadSuccess }) => {
    const [imagenes, setImagenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [orden, setOrden] = useState(0);
    const [esPrincipal, setEsPrincipal] = useState(false);

    const cargarImagenes = async () => {
        if (!productoId) return;
        
        setLoading(true);
        try {
            const result = await ProductoImagenService.getImagenesByProductoId(productoId);
            if (result.success) {
                // Ordenar: primero la principal, luego por el campo orden
                const imagenesOrdenadas = [...result.data].sort((a, b) => {
                    if (a.esPrincipal) return -1;
                    if (b.esPrincipal) return 1;
                    return a.orden - b.orden;
                });
                setImagenes(imagenesOrdenadas);
            } else {
                console.error(result.message);
            }
        } catch (error) {
            console.error('Error al cargar imágenes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarImagenes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productoId]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const validation = ProductoImagenService.validateImageFile(file);
        if (!validation.valid) {
            toast.error(validation.error);
            e.target.value = ''; // Limpiar el input
            return;
        }
        
        setSelectedFile(file);
        
        // Crear preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Selecciona una imagen primero');
            return;
        }
        
        setUploading(true);
        try {
            const result = await ProductoImagenService.uploadImagen(
                productoId, 
                selectedFile, 
                orden, 
                esPrincipal
            );
            
            if (result.success) {
                toast.success('Imagen subida exitosamente');
                // Limpiar formulario
                setSelectedFile(null);
                setPreviewUrl(null);
                setOrden(0);
                setEsPrincipal(false);
                // Recargar imágenes
                await cargarImagenes();
                // Callback opcional
                if (onUploadSuccess) onUploadSuccess();
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error('Error al subir la imagen');
        } finally {
            setUploading(false);
        }
    };

    const handleSetPrincipal = async (imagenId) => {
        const result = await Swal.fire({
            title: '¿Marcar como principal?',
            text: 'Esta será la imagen principal del producto',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#c9a84c',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, marcar',
            cancelButtonText: 'Cancelar'
        });
        
        if (result.isConfirmed) {
            const imagen = imagenes.find(img => img.id === imagenId);
            const updateResult = await ProductoImagenService.updateImagen(
                productoId,
                imagenId,
                imagen.orden,
                true // esPrincipal
            );
            
            if (updateResult.success) {
                toast.success('Imagen marcada como principal');
                await cargarImagenes();
            } else {
                toast.error(updateResult.message);
            }
        }
    };

    const handleDelete = async (imagenId) => {
        const result = await Swal.fire({
            title: '¿Eliminar imagen?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#c9a84c',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });
        
        if (result.isConfirmed) {
            const deleteResult = await ProductoImagenService.deleteImagen(productoId, imagenId);
            
            if (deleteResult.success) {
                toast.success('Imagen eliminada');
                await cargarImagenes();
            } else {
                toast.error(deleteResult.message);
            }
        }
    };

    return (
        <div className="image-uploader">
            <h3>Gestión de Imágenes</h3>
            
            <div className="upload-section">
                <h4>Subir Nueva Imagen</h4>
                <input 
                    type="file" 
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="form-control mb-3"
                />
                
                {previewUrl && (
                    <div className="preview-container">
                        <img src={previewUrl} alt="Preview" />
                    </div>
                )}
                
                <div className="upload-options mb-3">
                    <div className="form-check mb-2">
                        <input 
                            type="checkbox" 
                            className="form-check-input"
                            id="esPrincipalCheck"
                            checked={esPrincipal}
                            onChange={(e) => setEsPrincipal(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="esPrincipalCheck">
                            Marcar como imagen principal
                        </label>
                    </div>
                    
                    <div className="form-group d-flex align-items-center gap-2">
                        <label>Orden:</label>
                        <input 
                            type="number" 
                            className="form-control"
                            style={{ width: '80px' }}
                            value={orden}
                            onChange={(e) => setOrden(parseInt(e.target.value) || 0)}
                            min="0"
                        />
                    </div>
                </div>
                
                <button 
                    className="btn-upload"
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                >
                    {uploading ? 'Subiendo...' : 'Subir Imagen'}
                </button>
            </div>
            
            <div className="images-list">
                <h4>Imágenes Actuales ({imagenes.length})</h4>
                
                {loading ? (
                    <div className="p-3 text-center">Cargando imágenes...</div>
                ) : imagenes.length === 0 ? (
                    <div className="p-3 text-center text-muted">No hay imágenes para este producto</div>
                ) : (
                    <div className="images-grid">
                        {imagenes.map((img) => (
                            <div key={img.id} className="image-item">
                                <div className="img-wrapper">
                                    <img 
                                        src={`${API_BASE_URL}${img.url}`} 
                                        alt={`Imagen ${img.orden}`}
                                    />
                                </div>
                                
                                {img.esPrincipal && (
                                    <span className="badge-principal">Principal</span>
                                )}
                                
                                <div className="image-footer">
                                    <div className="image-info">
                                        <span>Orden: {img.orden}</span>
                                    </div>
                                    
                                    <div className="image-actions">
                                        {!img.esPrincipal && (
                                            <button 
                                                onClick={() => handleSetPrincipal(img.id)}
                                                className="btn-set-principal"
                                                title="Marcar como principal"
                                            >
                                                Principal
                                            </button>
                                        )}
                                        
                                        <button 
                                            onClick={() => handleDelete(img.id)}
                                            className="btn-delete"
                                            title="Eliminar imagen"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageUploader;
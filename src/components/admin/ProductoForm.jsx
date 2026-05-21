import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductoService from '../../services/ProductoService';
import Swal from 'sweetalert2';
import '../../style/admin/producto-form.css';

const ProductoForm = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Si existe, es modo edición
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        stockMinimo: '',
        categoria: '',
        activo: true
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // useEffect para cargar datos en modo edición
    useEffect(() => {
        // Solo cargar si hay un ID válido (no undefined, no null, no string vacío)
        if (id && id !== 'undefined' && id !== 'null') {
            cargarProducto();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cargarProducto = async () => {
        setLoading(true);
        const result = await ProductoService.getProductoById(id);
        if (result.success) {
            setFormData({
                
                nombre: result.data.nombre,
                descripcion: result.data.descripcion,
                precio: result.data.precioBase,
                stock: result.data.stock,
                stockMinimo: result.data.stockMinimo,
                categoria: result.data.categoria,
                activo: result.data.activo,
                id: parseInt(id)
            });
        } else {
            Swal.fire('Error', result.message, 'error');
            navigate('/admin/productos');
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Limpiar error del campo al escribir
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        } else if (formData.nombre.length < 3) {
            newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
        } else if (formData.nombre.length > 100) {
            newErrors.nombre = 'El nombre no puede exceder 100 caracteres';
        }

        if (!formData.descripcion.trim()) {
            newErrors.descripcion = 'La descripción es requerida';
        } else if (formData.descripcion.length < 10) {
            newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
        } else if (formData.descripcion.length > 500) {
            newErrors.descripcion = 'La descripción no puede exceder 500 caracteres';
        }

        if (!formData.precio || parseFloat(formData.precio) <= 0) {
            newErrors.precio = 'El precio debe ser mayor a 0';
        }

        if (formData.stock === '' || parseInt(formData.stock) < 0) {
            newErrors.stock = 'El stock debe ser un número mayor o igual a 0';
        }

        if (formData.stockMinimo === '' || parseInt(formData.stockMinimo) < 0) {
            newErrors.stockMinimo = 'El stock mínimo debe ser un número mayor o igual a 0';
        }

        if (!formData.categoria.trim()) {
            newErrors.categoria = 'La categoría es requerida';
        } else if (formData.categoria.length < 3) {
            newErrors.categoria = 'La categoría debe tener al menos 3 caracteres';
        } else if (formData.categoria.length > 50) {
            newErrors.categoria = 'La categoría no puede exceder 50 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            Swal.fire('Error', 'Por favor corrige los errores en el formulario', 'error');
            return;
        }

        setSaving(true);

        let dataToSend;
        let result;
        
        if (isEditMode) {
            // Para actualizar: enviar todos los campos que acepta UpdateProductoDto
            dataToSend = {
                id: parseInt(id),
                nombre: formData.nombre.trim(),
                descripcion: formData.descripcion.trim(),
                precioBase: parseFloat(formData.precio),
                stock: parseInt(formData.stock) || 0,
                stockMinimo: parseInt(formData.stockMinimo) || 0,
                categoria: formData.categoria.trim(),
                activo: formData.activo
            };
            result = await ProductoService.updateProducto(id, dataToSend);
        } else {
            // Para crear: enviar todos los campos
            dataToSend = {
                nombre: formData.nombre.trim(),
                descripcion: formData.descripcion.trim(),
                precioBase: parseFloat(formData.precio),
                stock: parseInt(formData.stock),
                stockMinimo: parseInt(formData.stockMinimo),
                categoria: formData.categoria.trim()
            };
            result = await ProductoService.createProducto(dataToSend);
        }

        setSaving(false);

        if (result.success) {
            Swal.fire(
                'Éxito',
                `Producto ${isEditMode ? 'actualizado' : 'creado'} correctamente`,
                'success'
            );
            navigate('/admin/productos');
        } else {
            Swal.fire('Error', result.message, 'error');
        }
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

    return (
        <div className="producto-form-page">
            <div className="form-header-admin">
                <button 
                    className="btn-volver"
                    onClick={() => navigate('/admin/productos')}
                    disabled={saving}
                >
                    <i className="bi bi-arrow-left"></i>
                    Volver
                </button>
                <div>
                    <h2 className="form-title-admin">
                        {isEditMode ? 'Editar Producto' : 'Crear Nuevo Producto'}
                    </h2>
                    <p className="form-subtitle-admin">
                        {isEditMode ? 'Modifica la información del producto' : 'Completa los datos del nuevo producto'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="form-admin-card">
                <div className="form-section">
                    <h3 className="section-title">
                        <i className="bi bi-info-circle"></i>
                        Información Básica
                    </h3>
                    <div className="form-grid">
                        <div className="form-group-admin full-width">
                            <label htmlFor="nombre" className="form-label-admin">
                                Nombre del Producto <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                className={`form-input-admin ${errors.nombre ? 'error' : ''}`}
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Ej: Laptop Dell Inspiron 15"
                            />
                            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
                        </div>

                        <div className="form-group-admin full-width">
                            <label htmlFor="descripcion" className="form-label-admin">
                                Descripción <span className="required">*</span>
                            </label>
                            <textarea
                                className={`form-textarea-admin ${errors.descripcion ? 'error' : ''}`}
                                id="descripcion"
                                name="descripcion"
                                rows="4"
                                value={formData.descripcion}
                                onChange={handleChange}
                                placeholder="Describe las características del producto..."
                            />
                            <div className="input-footer">
                                {errors.descripcion && <span className="error-message">{errors.descripcion}</span>}
                                <span className="char-count">{formData.descripcion.length}/500</span>
                            </div>
                        </div>

                        <div className="form-group-admin">
                            <label htmlFor="categoria" className="form-label-admin">
                                Categoría <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                className={`form-input-admin ${errors.categoria ? 'error' : ''}`}
                                id="categoria"
                                name="categoria"
                                value={formData.categoria}
                                onChange={handleChange}
                                placeholder="Ej: Electrónica, Ropa, Hogar"
                            />
                            {errors.categoria && <span className="error-message">{errors.categoria}</span>}
                        </div>

                        <div className="form-group-admin">
                            <label htmlFor="precio" className="form-label-admin">
                                Precio <span className="required">*</span>
                            </label>
                            <div className="input-with-icon">
                                <span className="input-icon">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    className={`form-input-admin with-icon ${errors.precio ? 'error' : ''}`}
                                    id="precio"
                                    name="precio"
                                    value={formData.precio}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                            </div>
                            {errors.precio && <span className="error-message">{errors.precio}</span>}
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">
                        <i className="bi bi-box-seam"></i>
                        Inventario
                    </h3>
                    <div className="form-grid">
                        <div className="form-group-admin">
                            <label htmlFor="stock" className="form-label-admin">
                                Stock Actual <span className="required">*</span>
                            </label>
                            <input
                                type="number"
                                className={`form-input-admin ${errors.stock ? 'error' : ''}`}
                                id="stock"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                placeholder="0"
                            />
                            {errors.stock && <span className="error-message">{errors.stock}</span>}
                        </div>

                        <div className="form-group-admin">
                            <label htmlFor="stockMinimo" className="form-label-admin">
                                Stock Mínimo <span className="required">*</span>
                            </label>
                            <input
                                type="number"
                                className={`form-input-admin ${errors.stockMinimo ? 'error' : ''}`}
                                id="stockMinimo"
                                name="stockMinimo"
                                value={formData.stockMinimo}
                                onChange={handleChange}
                                placeholder="0"
                            />
                            {errors.stockMinimo && <span className="error-message">{errors.stockMinimo}</span>}
                            <small className="input-help">Nivel de alerta para reposición</small>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">
                        <i className="bi bi-toggle-on"></i>
                        Estado
                    </h3>
                    <div className="form-check-admin">
                        <input
                            type="checkbox"
                            className="form-checkbox-admin"
                            id="activo"
                            name="activo"
                            checked={formData.activo}
                            onChange={handleChange}
                        />
                        <label className="form-check-label-admin" htmlFor="activo">
                            <span className="check-title">Producto Activo</span>
                            <span className="check-description">El producto será visible para los clientes</span>
                        </label>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-submit-admin" disabled={saving}>
                        {saving ? (
                            <>
                                <span className="spinner-admin"></span>
                                Guardando...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check-circle"></i>
                                {isEditMode ? 'Actualizar' : 'Crear'} Producto
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        className="btn-cancel-admin"
                        onClick={() => navigate('/admin/productos')}
                        disabled={saving}
                    >
                        <i className="bi bi-x-circle"></i>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductoForm;
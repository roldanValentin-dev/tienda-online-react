import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductoService from '../../services/ProductoService';
import API_BASE_URL from '../../config/api';
import Swal from 'sweetalert2';

const AdminProductos = () => {
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoriaFilter, setCategoriaFilter] = useState('todas');
    const [estadoFilter, setEstadoFilter] = useState('todos');

    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        setLoading(true);
        const result = await ProductoService.getAllProductos();
        if (result.success) {
            setProductos(result.data);
        } else {
            Swal.fire('Error', result.message, 'error');
        }
        setLoading(false);
    };

    const handleDelete = async (id, nombre) => {
        const confirm = await Swal.fire({
            title: `¿Eliminar ${nombre}?`,
            text: "Esta acción no se puede deshacer y eliminará también sus imágenes.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (confirm.isConfirmed) {
            const result = await ProductoService.deleteProducto(id);
            if (result.success) {
                setProductos(productos.filter(p => p.id !== id));
                Swal.fire('Eliminado', 'El producto ha sido eliminado correctamente.', 'success');
            } else {
                Swal.fire('Error', result.message, 'error');
            }
        }
    };

    // Obtener categorías únicas para el filtro
    const categorias = ['todas', ...new Set(productos.map(p => p.categoria))];

    // Lógica de filtrado
    const filteredProducts = productos.filter(p => {
        const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoriaFilter === 'todas' || p.categoria === categoriaFilter;
        const matchesStatus = estadoFilter === 'todos' ||
            (estadoFilter === 'activos' && p.activo) ||
            (estadoFilter === 'inactivos' && !p.activo);
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const getProductImage = (p) => {
        // 1️⃣ Primero: Verificar si tiene array imagenes
        if (p.imagenes && p.imagenes.length > 0) {
            // Buscar imagen principal
            const imagenPrincipal = p.imagenes.find(img => img.esPrincipal);
            const imagen = imagenPrincipal || p.imagenes[0];

            if (imagen && imagen.url) {
                // Si es URL completa, usarla; si no, agregar API_BASE_URL
                return imagen.url.startsWith('http')
                    ? imagen.url
                    : `${API_BASE_URL}${imagen.url}`;
            }
        }

        // 2️⃣ Segundo: Fallback a imagenUrl antiguo
        if (p.imagenUrl && p.imagenUrl.trim() !== '') {
            return p.imagenUrl.startsWith('http')
                ? p.imagenUrl
                : `${API_BASE_URL}${p.imagenUrl}`;
        }

        // 3️⃣ Tercero: Fallback SVG
        return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50"%3E%3Crect width="50" height="50" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="10" fill="%23999"%3ESin Imagen%3C/text%3E%3C/svg%3E';
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
        <div className="admin-productos-page">
            {/* Header con título y botón */}
            <div className="page-header-admin">
                <div>
                    <h2 className="page-title-admin">Gestión de Productos</h2>
                    <p className="page-subtitle-admin">Administra tu catálogo de productos</p>
                </div>
                <button
                    className="btn-nuevo-producto"
                    onClick={() => navigate('/admin/productos/nuevo')}
                >
                    <i className="bi bi-plus-circle"></i>
                    <span>Nuevo Producto</span>
                </button>
            </div>

            {/* Card de filtros */}
            <div className="filtros-card">
                <div className="filtros-grid">
                    <div className="filtro-item">
                        <label className="filtro-label">
                            <i className="bi bi-search"></i>
                            Buscar
                        </label>
                        <input
                            type="text"
                            className="filtro-input"
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filtro-item">
                        <label className="filtro-label">
                            <i className="bi bi-tag"></i>
                            Categoría
                        </label>
                        <select
                            className="filtro-select"
                            value={categoriaFilter}
                            onChange={(e) => setCategoriaFilter(e.target.value)}
                        >
                            {categorias.map((cat, index) => (
                                <option key={`cat-${index}-${cat}`} value={cat}>
                                    {cat === 'todas' ? 'Todas las categorías' : cat}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="filtro-item">
                        <label className="filtro-label">
                            <i className="bi bi-toggle-on"></i>
                            Estado
                        </label>
                        <select
                            className="filtro-select"
                            value={estadoFilter}
                            onChange={(e) => setEstadoFilter(e.target.value)}
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="activos">Solo Activos</option>
                            <option value="inactivos">Solo Inactivos</option>
                        </select>
                    </div>
                </div>
                <div className="filtros-info">
                    <i className="bi bi-info-circle"></i>
                    Mostrando <strong>{filteredProducts.length}</strong> de <strong>{productos.length}</strong> productos
                </div>
            </div>

            {/* Tabla Desktop */}
            <div className="tabla-productos-desktop">
                <div className="table-card">
                    <table className="table-admin">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>Imagen</th>
                                <th>Nombre</th>
                                <th>Categoría</th>
                                <th style={{ width: '120px' }}>Precio</th>
                                <th style={{ width: '100px' }}>Stock</th>
                                <th style={{ width: '100px' }}>Estado</th>
                                <th style={{ width: '180px' }} className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <img
                                            src={getProductImage(p)}
                                            alt={p.nombre}
                                            className="table-img"
                                        />
                                    </td>
                                    <td>
                                        <span className="table-nombre">{p.nombre}</span>
                                    </td>
                                    <td>
                                        <span className="table-categoria">{p.categoria}</span>
                                    </td>
                                    <td>
                                        <span className="table-precio">${p.precioBase?.toLocaleString()}</span>
                                    </td>
                                    <td>
                                        <span className={`table-stock ${p.stock <= p.stockMinimo ? 'bajo' : ''}`}>
                                            {p.stock <= p.stockMinimo && <i className="bi bi-exclamation-triangle"></i>}
                                            {p.stock}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`table-badge ${p.activo ? 'activo' : 'inactivo'}`}>
                                            {p.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="table-acciones">
                                            <button
                                                className="btn-table editar"
                                                onClick={() => navigate(`/admin/productos/editar/${p.id}`)}
                                                title="Editar"
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button
                                                className="btn-table imagenes"
                                                onClick={() => navigate(`/admin/productos/imagenes/${p.id}`)}
                                                title="Imágenes"
                                            >
                                                <i className="bi bi-images"></i>
                                            </button>
                                            <button
                                                className="btn-table eliminar"
                                                onClick={() => handleDelete(p.id, p.nombre)}
                                                title="Eliminar"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Grid Mobile (2 columnas) */}
            <div className="grid-productos-mobile">
                {filteredProducts.map(p => (
                    <div key={p.id} className="producto-card-mobile">
                        <div className="mobile-imagen-wrapper">
                            <img
                                src={getProductImage(p)}
                                alt={p.nombre}
                                className="mobile-imagen"
                            />
                            <div className="mobile-badges">
                                {p.stock <= p.stockMinimo && (
                                    <span className="badge-mobile stock-bajo">
                                        <i className="bi bi-exclamation-triangle"></i>
                                    </span>
                                )}
                                <span className={`badge-mobile estado ${p.activo ? 'activo' : 'inactivo'}`}>
                                    {p.activo ? '✓' : '✕'}
                                </span>
                            </div>
                        </div>
                        <div className="mobile-info">
                            <span className="mobile-categoria">{p.categoria}</span>
                            <h3 className="mobile-nombre">{p.nombre}</h3>
                            <div className="mobile-detalles">
                                <span className="mobile-precio">${p.precioBase?.toLocaleString()}</span>
                                <span className={`mobile-stock ${p.stock <= p.stockMinimo ? 'bajo' : ''}`}>
                                    Stock: {p.stock}
                                </span>
                            </div>
                            <div className="mobile-acciones">
                                <button
                                    className="btn-mobile editar"
                                    onClick={() => navigate(`/admin/productos/editar/${p.id}`)}
                                >
                                    <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                    className="btn-mobile imagenes"
                                    onClick={() => navigate(`/admin/productos/imagenes/${p.id}`)}
                                >
                                    <i className="bi bi-images"></i>
                                </button>
                                <button
                                    className="btn-mobile eliminar"
                                    onClick={() => handleDelete(p.id, p.nombre)}
                                >
                                    <i className="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty state */}
            {filteredProducts.length === 0 && (
                <div className="empty-state-admin">
                    <i className="bi bi-inbox empty-icon"></i>
                    <h3>No se encontraron productos</h3>
                    <p>No hay productos que coincidan con los filtros seleccionados.</p>
                    {searchTerm || categoriaFilter !== 'todas' || estadoFilter !== 'todos' ? (
                        <button
                            className="btn-limpiar-filtros"
                            onClick={() => {
                                setSearchTerm('');
                                setCategoriaFilter('todas');
                                setEstadoFilter('todos');
                            }}
                        >
                            <i className="bi bi-x-circle"></i>
                            Limpiar filtros
                        </button>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default AdminProductos;
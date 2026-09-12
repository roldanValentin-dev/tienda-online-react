import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductoService from '../../services/ProductoService';
import API_BASE_URL from '../../config/api';
import Swal from 'sweetalert2';
import { SWAL_COLOR } from '../../config/swal';
import '../../style/admin/productos.css';

const AdminProductos = () => {
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoriaFilter, setCategoriaFilter] = useState('todas');
    const [estadoFilter, setEstadoFilter] = useState('todos');

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

    useEffect(() => {
        const load = async () => {
            await cargarProductos();
        };
        load();
    }, []);

    const handleDelete = async (id, nombre) => {
        const confirm = await Swal.fire({
            title: `¿Eliminar ${nombre}?`,
            text: "Esta acción no se puede deshacer y eliminará también sus imágenes.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: SWAL_COLOR,
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

    const categorias = ['todas', ...new Set(productos.map(p => p.categoria))];

    const filteredProducts = productos.filter(p => {
        const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoriaFilter === 'todas' || p.categoria === categoriaFilter;
        const matchesStatus = estadoFilter === 'todos' ||
            (estadoFilter === 'activos' && p.activo) ||
            (estadoFilter === 'inactivos' && !p.activo);
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const getProductImage = (p) => {
        if (p.imagenes && p.imagenes.length > 0) {
            const imagenPrincipal = p.imagenes.find(img => img.esPrincipal);
            const imagen = imagenPrincipal || p.imagenes[0];
            if (imagen && imagen.url) {
                return imagen.url.startsWith('http')
                    ? imagen.url
                    : `${API_BASE_URL}${imagen.url}`;
            }
        }
        if (p.imagenUrl && p.imagenUrl.trim() !== '') {
            return p.imagenUrl.startsWith('http')
                ? p.imagenUrl
                : `${API_BASE_URL}${p.imagenUrl}`;
        }
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

            <div className="table-card">
                <table className="table-admin">
                    <thead>
                        <tr>
                            <th style={{ width: '80px' }}>Imagen</th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th style={{ width: '120px' }}>Precio</th>
                            <th style={{ width: '140px' }}>Etiquetas</th>
                            <th style={{ width: '100px' }}>Stock</th>
                            <th style={{ width: '100px' }}>Estado</th>
                            <th style={{ width: '180px' }} className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(p => (
                            <tr key={p.id}>
                                <td data-label="Imagen">
                                    <img
                                        src={getProductImage(p)}
                                        alt={p.nombre}
                                        className="table-img"
                                    />
                                </td>
                                <td data-label="Nombre">
                                    <span className="table-nombre">{p.nombre}</span>
                                </td>
                                <td data-label="Categoría">
                                    <span className="table-categoria">{p.categoria}</span>
                                </td>
                                <td data-label="Precio">
                                    <span className="table-precio">${p.precioBase?.toLocaleString()}</span>
                                </td>
                                <td data-label="Etiquetas">
                                    <div className="table-etiquetas">
                                        {p.enOferta && <span className="table-tag table-tag-oferta"><i className="bi bi-tag"></i> Oferta</span>}
                                        {p.stockInmediato && <span className="table-tag table-tag-inmediato"><i className="bi bi-clock"></i> Retiro</span>}
                                    </div>
                                </td>
                                <td data-label="Stock">
                                    <span className={`table-stock ${p.stock <= p.stockMinimo ? 'bajo' : ''}`}>
                                        {p.stock <= p.stockMinimo && <i className="bi bi-exclamation-triangle"></i>}
                                        {p.stock}
                                    </span>
                                </td>
                                <td data-label="Estado">
                                    <span className={`table-badge ${p.activo ? 'activo' : 'inactivo'}`}>
                                        {p.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td data-label="Acciones">
                                    <div className="table-acciones">
                                        <button
                                            className="btn-table editar"
                                            onClick={() => navigate(`/admin/productos/editar/${p.id}`)}
                                            title="Editar producto"
                                            aria-label={`Editar ${p.nombre}`}
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button
                                            className="btn-table imagenes"
                                            onClick={() => navigate(`/admin/productos/imagenes/${p.id}`)}
                                            title="Administrar imágenes"
                                            aria-label={`Imágenes de ${p.nombre}`}
                                        >
                                            <i className="bi bi-images"></i>
                                        </button>
                                        <button
                                            className="btn-table eliminar"
                                            onClick={() => handleDelete(p.id, p.nombre)}
                                            title="Eliminar producto"
                                            aria-label={`Eliminar ${p.nombre}`}
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

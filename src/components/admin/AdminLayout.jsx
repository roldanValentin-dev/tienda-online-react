import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

/**
 * Componente de diseño para el panel administrativo.
 * Provee sidebar de navegación, header con información de usuario y área de contenido.
 */
const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    
    const handleLogout = () => {
        Swal.fire({
            title: '¿Cerrar sesión?',
            text: '¿Estás seguro que deseas salir del panel?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ff6b35',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                logout();
                navigate('/');
            }
        });
    };
    
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const menuItems = [
        {
            path: '/admin/productos',
            icon: 'bi-box-seam',
            label: 'Productos',
            roles: ['Admin', 'Vendedor']
        },
        {
            path: '/admin/pedidos',
            icon: 'bi-receipt',
            label: 'Pedidos',
            roles: ['Admin', 'Vendedor']
        },
        {
            path: '/admin/reportes',
            icon: 'bi-graph-up',
            label: 'Reportes',
            roles: ['Admin']
        }
    ];
    
    // Filtrar items según rol del usuario
    const filteredMenu = menuItems.filter(item => 
        item.roles.includes(user?.role)
    );

    return (
        <div className="admin-container">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h2>🥐 Admin Panel</h2>
                    <button className="btn-toggle d-lg-none" onClick={toggleSidebar}>
                        <i className="bi bi-x"></i>
                    </button>
                </div>
                
                <nav className="sidebar-nav">
                    {filteredMenu.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <i className={`bi ${item.icon}`}></i>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
                
                <div className="sidebar-footer">
                    <div className="user-info">
                        <i className="bi bi-person-circle"></i>
                        <div>
                            <p className="user-name">{user?.firstName || user?.nombre}</p>
                            <p className="user-role">{user?.role}</p>
                        </div>
                    </div>
                    <button className="btn-logout" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right"></i>
                        Cerrar Sesión
                    </button>
                    <Link to="/" className="btn-back-home">
                        <i className="bi bi-house"></i>
                        Volver al Sitio
                    </Link>
                </div>
            </aside>
            
            {/* Main Content */}
            <div className="admin-main">
                {/* Header */}
                <header className="admin-header">
                    <button className="btn-toggle" onClick={toggleSidebar}>
                        <i className={`bi ${sidebarOpen ? 'bi-list' : 'bi-list'}`}></i>
                    </button>
                    <h1 className="page-title">Panel de Administración</h1>
                    <div className="header-actions">
                        <span className="user-badge">{user?.role}</span>
                    </div>
                </header>
                
                {/* Content */}
                <main className="admin-content">
                    {children}
                </main>
            </div>
            
            {/* Overlay para mobile */}
            {sidebarOpen && (
                <div className="sidebar-overlay d-lg-none" onClick={toggleSidebar}></div>
            )}
        </div>
    );
};

export default AdminLayout;
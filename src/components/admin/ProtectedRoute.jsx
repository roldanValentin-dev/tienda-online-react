import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../style/admin/layout.css';

/**
 * Componente de orden superior para proteger rutas según autenticación y roles.
 * @param {ReactNode} children - Componentes hijos a renderizar si se cumplen los requisitos.
 * @param {string} requiredRole - Rol mínimo necesario (por defecto 'Admin').
 */
const ProtectedRoute = ({ children, requiredRole = 'Admin' }) => {
    const { user, loading, isAuthenticated } = useAuth();
    
    // Mientras se verifica el estado de la sesión
    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }
    
    // Redirigir al login si no hay sesión activa
    if (!isAuthenticated()) {
        return <Navigate to="/auth" replace />;
    }
    
    // Verificar permisos: Admin tiene acceso total; otros roles deben coincidir exactamente
    if (requiredRole && user?.role !== 'Admin' && user?.role !== requiredRole) {
        return <Navigate to="/" replace />;
    }
    
    return children;
};

export default ProtectedRoute;
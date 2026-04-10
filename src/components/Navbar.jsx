import { Link, useLocation } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { CarritoContext } from '../context/CarritoContext';

function Navbar() {
    const { cart } = useContext(CarritoContext);
    const location = useLocation();
    
    const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);

    // Cerrar el menú cuando cambia la ruta
    useEffect(() => {
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.getElementById('navbarNav');
        
        // Si el menú está abierto, cerrarlo
        if (navbarCollapse && navbarCollapse.classList.contains('show')) {
            navbarToggler?.click();
        }
    }, [location]);

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">Mi Tienda</Link>
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/products">Products</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/cart">
                                Cart <span className="badge bg-primary">{totalItems}</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
export default Navbar;
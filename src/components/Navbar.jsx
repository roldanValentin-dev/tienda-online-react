import { Link, useLocation } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { CarritoContext } from '../context/CarritoContext';

function Navbar() {
    const { cart } = useContext(CarritoContext);
    const location = useLocation();
    
    const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);

    // Cerrar el offcanvas cuando cambia la ruta
    useEffect(() => {
        const offcanvasElement = document.getElementById('offcanvasNavbar');
        const backdrop = document.querySelector('.offcanvas-backdrop');
        
        if (offcanvasElement?.classList.contains('show')) {
            if (document.activeElement) {
                document.activeElement.blur();
            }
            
            offcanvasElement.classList.add('hiding');
            
            setTimeout(() => {
                offcanvasElement.classList.remove('show', 'hiding');
                offcanvasElement.removeAttribute('aria-modal');
                offcanvasElement.removeAttribute('role');
                
                document.body.classList.remove('offcanvas-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
                
                if (backdrop) {
                    backdrop.classList.add('fade');
                    backdrop.classList.remove('show');
                    setTimeout(() => backdrop.remove(), 150);
                }
            }, 300);
        }
    }, [location]);

    return (
        <>
            {/* Navbar para mobile con offcanvas */}
            <nav className="navbar d-lg-none">
                <div className="container-fluid">
                    <button 
                        className="navbar-toggler" 
                        type="button" 
                        data-bs-toggle="offcanvas" 
                        data-bs-target="#offcanvasNavbar"
                        aria-controls="offcanvasNavbar"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    
                    <Link className="navbar-brand mx-auto" to="/">🥐 Panadería</Link>
                    
                    <Link to="/cart" className="cart-icon-mobile">
                        <i className="bi bi-cart3"></i>
                        {totalItems > 0 && (
                            <span className="cart-badge">{totalItems}</span>
                        )}
                    </Link>
                </div>
            </nav>

            {/* Offcanvas para mobile */}
            <div 
                className="offcanvas offcanvas-start" 
                tabIndex="-1" 
                id="offcanvasNavbar"
                aria-labelledby="offcanvasNavbarLabel"
            >
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title" id="offcanvasNavbarLabel">Menú</h5>
                    <button 
                        type="button" 
                        className="btn-close" 
                        data-bs-dismiss="offcanvas"
                        aria-label="Close"
                    ></button>
                </div>
                <div className="offcanvas-body p-0">
                    <ul className="nav flex-column">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">
                                <i className="bi bi-house-door me-3"></i>Home
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/products">
                                <i className="bi bi-bag me-3"></i>Productos
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/cart">
                                <i className="bi bi-cart3 me-3"></i>Carrito
                                {totalItems > 0 && (
                                    <span className="badge-custom ms-2">{totalItems}</span>
                                )}
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Navbar fijo para desktop (sin desplegable) */}
            <nav className="navbar navbar-expand d-none d-lg-block">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">🥐 Panadería</Link>
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">
                                <i className="bi bi-house-door me-2"></i>Home
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/products">
                                <i className="bi bi-bag me-2"></i>Productos
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/cart">
                                <i className="bi bi-cart3 me-2"></i>Carrito
                                {totalItems > 0 && (
                                    <span className="badge-custom ms-2">{totalItems}</span>
                                )}
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    );
}

export default Navbar;

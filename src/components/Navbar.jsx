import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { CarritoContext } from '../context/CarritoContext';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { SWAL_COLOR } from '../config/swal';
import '../style/navbar.css';

function Navbar() {
  const { cart } = useContext(CarritoContext);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
    document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro que deseas cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: SWAL_COLOR,
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/');
        setMenuOpen(false);
        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada',
          text: '¡Hasta pronto!',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <>
      <header className={`at-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="at-header-inner">
          <Link className="at-logo" to="/">Gastronomía</Link>

          <ul className="at-nav-links">
            <li><Link className="at-nav-link" to="/">Inicio</Link></li>
            <li><Link className="at-nav-link" to="/products">Productos</Link></li>
            {user && (
              <li><Link className="at-nav-link" to="/mis-pedidos">Pedidos</Link></li>
            )}
          </ul>

          <div className="at-nav-right">
            <button className="at-cart-btn" onClick={() => navigate('/cart')} aria-label="Carrito">
              <span className="material-symbols-outlined">shopping_cart</span>
              {totalItems > 0 && (
                <span className="at-cart-badge">{totalItems > 9 ? '9+' : totalItems}</span>
              )}
            </button>

            {user ? (
              <>
                <div className="at-user-menu" onClick={() => navigate('/perfil')}>
                  <span className="material-symbols-outlined">person</span>
                  <span>{user.nombre || user.firstName || 'Perfil'}</span>
                </div>
                <button className="at-logout-btn" onClick={handleLogout} title="Cerrar sesión">
                  <span className="material-symbols-outlined">logout</span>
                </button>
              </>
            ) : (
              <Link className="at-auth-btn" to="/auth">Ingresar</Link>
            )}

            <button
              className={`at-hamburger ${menuOpen ? 'is-open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menú"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      <div className={`at-offcanvas-overlay ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen(false)} />
      <div className={`at-offcanvas ${menuOpen ? 'is-open' : ''}`}>
        <button className="at-offcanvas-close" onClick={() => setMenuOpen(false)}>×</button>
        <ul className="at-offcanvas-links">
          <li><Link className="at-offcanvas-link" to="/" onClick={() => setMenuOpen(false)}><span className="material-symbols-outlined">home</span>Inicio</Link></li>
          <li><Link className="at-offcanvas-link" to="/products" onClick={() => setMenuOpen(false)}><span className="material-symbols-outlined">shopping_bag</span>Productos</Link></li>
          <li><Link className="at-offcanvas-link" to="/cart" onClick={() => setMenuOpen(false)}><span className="material-symbols-outlined">shopping_cart</span>Carrito{totalItems > 0 && <span className="at-offcanvas-badge">{totalItems}</span>}</Link></li>
          <div className="at-offcanvas-divider" />
          {user ? (
            <>
              <li><Link className="at-offcanvas-link" to="/mis-pedidos" onClick={() => setMenuOpen(false)}><span className="material-symbols-outlined">inventory_2</span>Mis Pedidos</Link></li>
              <li><Link className="at-offcanvas-link" to="/perfil" onClick={() => setMenuOpen(false)}><span className="material-symbols-outlined">account_circle</span>Mi Perfil</Link></li>
              {user.role === 'Admin' && (
                <li><Link className="at-offcanvas-link" to="/admin/productos" onClick={() => setMenuOpen(false)}><span className="material-symbols-outlined">settings</span>Admin</Link></li>
              )}
              <div className="at-offcanvas-divider" />
              <li><button className="at-offcanvas-link" onClick={handleLogout} style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}><span className="material-symbols-outlined">logout</span>Cerrar Sesión</button></li>
            </>
          ) : (
            <li><Link className="at-offcanvas-link" to="/auth" onClick={() => setMenuOpen(false)}><span className="material-symbols-outlined">person</span>Ingresar</Link></li>
          )}
        </ul>
        <div className="at-offcanvas-footer">
          <p className="at-offcanvas-footer-text">Gastronomía — calidad y frescura</p>
        </div>
      </div>
    </>
  );
}

export default Navbar;

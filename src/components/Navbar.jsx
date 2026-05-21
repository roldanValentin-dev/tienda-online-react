import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { CarritoContext } from '../context/CarritoContext';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';
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
    if (menuOpen) {
      setMenuOpen(false);
    }
    document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      confirmButtonColor: '#c9a84c',
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
          <Link className="at-logo" to="/">softpan</Link>

          <ul className="at-nav-links">
            <li><Link className="at-nav-link" to="/">Inicio</Link></li>
            <li><Link className="at-nav-link" to="/products">Productos</Link></li>
            {user && (
              <li><Link className="at-nav-link" to="/mis-pedidos">Pedidos</Link></li>
            )}
          </ul>

          <div className="at-nav-right">
            <button className="at-cart-btn" onClick={() => navigate('/cart')} aria-label="Carrito">
              <i className="bi bi-bag"></i>
              {totalItems > 0 && (
                <span className="at-cart-badge">{totalItems > 9 ? '9+' : totalItems}</span>
              )}
            </button>

            {user ? (
              <>
                <div className="at-user-menu" onClick={() => navigate('/perfil')}>
                  <i className="bi bi-person"></i>
                  <span>{user.nombre || user.firstName || 'Perfil'}</span>
                </div>
                <button className="at-logout-btn" onClick={handleLogout} title="Cerrar sesión">
                  <i className="bi bi-box-arrow-right"></i>
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
          <li><Link className="at-offcanvas-link" to="/" onClick={() => setMenuOpen(false)}><i className="bi bi-house-door"></i>Inicio</Link></li>
          <li><Link className="at-offcanvas-link" to="/products" onClick={() => setMenuOpen(false)}><i className="bi bi-bag"></i>Productos</Link></li>
          <li><Link className="at-offcanvas-link" to="/cart" onClick={() => setMenuOpen(false)}><i className="bi bi-cart3"></i>Carrito{totalItems > 0 && <span className="at-offcanvas-badge">{totalItems}</span>}</Link></li>
          <div className="at-offcanvas-divider" />
          {user ? (
            <>
              <li><Link className="at-offcanvas-link" to="/mis-pedidos" onClick={() => setMenuOpen(false)}><i className="bi bi-box-seam"></i>Mis Pedidos</Link></li>
              <li><Link className="at-offcanvas-link" to="/perfil" onClick={() => setMenuOpen(false)}><i className="bi bi-person-circle"></i>Mi Perfil</Link></li>
              {user.role === 'Admin' && (
                <li><Link className="at-offcanvas-link" to="/admin/productos" onClick={() => setMenuOpen(false)}><i className="bi bi-gear"></i>Admin</Link></li>
              )}
              <div className="at-offcanvas-divider" />
              <li><button className="at-offcanvas-link" onClick={handleLogout} style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}><i className="bi bi-box-arrow-right"></i>Cerrar Sesión</button></li>
            </>
          ) : (
            <li><Link className="at-offcanvas-link" to="/auth" onClick={() => setMenuOpen(false)}><i className="bi bi-person"></i>Ingresar</Link></li>
          )}
        </ul>
        <div className="at-offcanvas-footer">
          <p className="at-offcanvas-footer-text">softpan — pastelería artesanal</p>
        </div>
      </div>
    </>
  );
}

export default Navbar;

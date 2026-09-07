import { Link } from 'react-router-dom';
import '../style/footer.css';

function Footer() {
  return (
    <footer className="at-footer">
      <div className="at-footer-inner">
        <div className="at-footer-grid">
          <div className="at-footer-col">
            <h3 className="at-footer-brand">Gastronomía</h3>
            <p className="at-footer-desc">
              Gastronomía de alta calidad. Cada plato se prepara con
              ingredientes seleccionados y dedicación, para momentos que merecen
              lo extraordinario.
            </p>
            <div className="at-footer-social">
              <a href="#" aria-label="Instagram"><span className="material-symbols-outlined">camera_alt</span></a>
              <a href="#" aria-label="Facebook"><span className="material-symbols-outlined">public</span></a>
              <a href="#" aria-label="WhatsApp"><span className="material-symbols-outlined">chat</span></a>
            </div>
          </div>

          <div className="at-footer-col">
            <h4 className="at-footer-heading">Enlaces</h4>
            <ul className="at-footer-links">
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/products">Productos</Link></li>
              <li><Link to="/cart">Carrito</Link></li>
              <li><Link to="/auth">Mi Cuenta</Link></li>
            </ul>
          </div>

          <div className="at-footer-col">
            <h4 className="at-footer-heading">Información</h4>
            <ul className="at-footer-links">
              <li><a href="#">Términos</a></li>
              <li><a href="#">Privacidad</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Pedidos Corporativos</a></li>
            </ul>
          </div>

          <div className="at-footer-col">
            <h4 className="at-footer-heading">Contacto</h4>
            <ul className="at-footer-contact">
              <li><span className="material-symbols-outlined">location_on</span><span>Av. Pastelería 123, Buenos Aires</span></li>
              <li><span className="material-symbols-outlined">call</span><span>+54 11 2345-6789</span></li>
              <li><span className="material-symbols-outlined">mail</span><span>contacto@gastronomia.com</span></li>
              <li><span className="material-symbols-outlined">schedule</span><span>Lun—Sab 8:00 — 20:00</span></li>
            </ul>
          </div>
        </div>

        <div className="at-footer-bottom">
          <p>&copy; {new Date().getFullYear()} Gastronomía — Todos los derechos reservados</p>
          <p>Hecho con dedicación y calidad</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

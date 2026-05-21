import { Link } from 'react-router-dom';
import '../style/footer.css';

function Footer() {
  return (
    <footer className="at-footer">
      <div className="at-footer-inner">
        <div className="at-footer-grid">
          <div className="at-footer-col">
            <h3 className="at-footer-brand">softpan</h3>
            <p className="at-footer-desc">
              Pastelería artesanal de alta calidad. Cada creación es horneada con
              ingredientes seleccionados y dedicación, para momentos que merecen
              lo extraordinario.
            </p>
            <div className="at-footer-social">
              <a href="#" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
              <a href="#" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
              <a href="#" aria-label="WhatsApp"><i className="bi bi-whatsapp"></i></a>
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
              <li><i className="bi bi-geo-alt"></i><span>Av. Pastelería 123, Buenos Aires</span></li>
              <li><i className="bi bi-telephone"></i><span>+54 11 2345-6789</span></li>
              <li><i className="bi bi-envelope"></i><span>hola@softpan.com</span></li>
              <li><i className="bi bi-clock"></i><span>Lun—Sab 8:00 — 20:00</span></li>
            </ul>
          </div>
        </div>

        <div className="at-footer-bottom">
          <p>&copy; {new Date().getFullYear()} softpan — Todos los derechos reservados</p>
          <p>Hecho con dedicación artesanal</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

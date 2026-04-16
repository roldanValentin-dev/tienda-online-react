import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-grid">
                    {/* Columna 1 - Sobre nosotros */}
                    <div className="footer-column">
                        <h3 className="footer-title">🥐 Panadería</h3>
                        <p className="footer-text">
                            Los mejores productos de panadería y pastelería, horneados con amor cada día.
                        </p>
                        <div className="footer-social">
                            <a href="#" className="social-link">
                                <i className="bi bi-facebook"></i>
                            </a>
                            <a href="#" className="social-link">
                                <i className="bi bi-instagram"></i>
                            </a>
                            <a href="#" className="social-link">
                                <i className="bi bi-twitter"></i>
                            </a>
                        </div>
                    </div>

                    {/* Columna 2 - Enlaces */}
                    <div className="footer-column">
                        <h4 className="footer-subtitle">Enlaces Rápidos</h4>
                        <ul className="footer-links">
                            <li><Link to="/">Inicio</Link></li>
                            <li><Link to="/products">Productos</Link></li>
                            <li><Link to="/cart">Carrito</Link></li>
                            <li><a href="#">Sobre Nosotros</a></li>
                        </ul>
                    </div>

                    {/* Columna 3 - Información */}
                    <div className="footer-column">
                        <h4 className="footer-subtitle">Información</h4>
                        <ul className="footer-links">
                            <li><a href="#">Términos y Condiciones</a></li>
                            <li><a href="#">Política de Privacidad</a></li>
                            <li><a href="#">Envíos y Devoluciones</a></li>
                            <li><a href="#">Preguntas Frecuentes</a></li>
                        </ul>
                    </div>

                    {/* Columna 4 - Contacto */}
                    <div className="footer-column">
                        <h4 className="footer-subtitle">Contacto</h4>
                        <ul className="footer-contact">
                            <li>
                                <i className="bi bi-geo-alt"></i>
                                <span>Av. Principal 123, Ciudad</span>
                            </li>
                            <li>
                                <i className="bi bi-telephone"></i>
                                <span>+54 11 1234-5678</span>
                            </li>
                            <li>
                                <i className="bi bi-envelope"></i>
                                <span>info@panaderia.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Panadería. Todos los derechos reservados.</p>
                    <p>Hecho con ❤️ en Argentina</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;

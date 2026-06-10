import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../services/AuthService';
import Swal from 'sweetalert2';
import '../style/auth.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Ingresá tu email', confirmButtonColor: '#c9a84c' });
            return;
        }
        setLoading(true);
        const result = await AuthService.forgotPassword(email.trim());
        setLoading(false);
        if (result.success) {
            setSent(true);
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: result.message, confirmButtonColor: '#c9a84c' });
        }
    };

    return (
        <div className="at-auth">
            <div className="at-auth-container">
                <div className="at-auth-card">
                    {sent ? (
                        <div className="at-auth-form">
                            <h2 className="at-auth-title">Revisá tu email</h2>
                            <p className="at-auth-subtitle">
                                Si existe una cuenta con ese email, vas a recibir un enlace para restablecer tu contraseña.
                            </p>
                            <Link to="/auth" className="at-auth-btn" style={{ textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                                Volver a iniciar sesión
                            </Link>
                        </div>
                    ) : (
                        <form className="at-auth-form" onSubmit={handleSubmit}>
                            <h2 className="at-auth-title">Recuperar contraseña</h2>
                            <p className="at-auth-subtitle">
                                Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
                            </p>
                            <div className="at-perfil-form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="at-auth-input"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    maxLength="254"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                            <button type="submit" className="at-auth-btn" disabled={loading}>
                                {loading ? 'Enviando...' : 'Enviar enlace'}
                            </button>
                            <Link to="/auth" className="at-auth-link" style={{ display: 'block', textAlign: 'center', marginTop: 16 }}>
                                Volver a iniciar sesión
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;

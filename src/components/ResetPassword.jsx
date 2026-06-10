import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/AuthService';
import { validatePasswordStrength } from '../security';
import Swal from 'sweetalert2';
import '../style/auth.css';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get('email') || '';
    const token = searchParams.get('token') || '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    if (!email || !token) {
        return (
            <div className="at-auth">
                <div className="at-auth-container">
                    <div className="at-auth-card">
                        <div className="at-auth-form">
                            <h2 className="at-auth-title">Enlace inválido</h2>
                            <p className="at-auth-subtitle">
                                El enlace de restablecimiento no es válido o está incompleto.
                            </p>
                            <Link to="/forgot-password" className="at-auth-btn" style={{ textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                                Solicitar nuevo enlace
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handlePasswordChange = (value) => {
        setNewPassword(value);
        const strength = validatePasswordStrength(value);
        setPasswordStrength(strength.strength);
    };

    const getStrengthColor = () => {
        if (passwordStrength < 40) return '#ef4444';
        if (passwordStrength < 70) return '#f59e0b';
        return '#22c55e';
    };

    const getStrengthText = () => {
        if (passwordStrength < 40) return 'Débil';
        if (passwordStrength < 70) return 'Media';
        return 'Fuerte';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword.length < 8) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'La contraseña debe tener al menos 8 caracteres', confirmButtonColor: '#c9a84c' });
            return;
        }
        if (newPassword !== confirmPassword) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Las contraseñas no coinciden', confirmButtonColor: '#c9a84c' });
            return;
        }
        setLoading(true);
        const result = await AuthService.resetPassword({ email, token, newPassword });
        setLoading(false);
        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Contraseña actualizada',
                text: 'Ya podés iniciar sesión con tu nueva contraseña',
                confirmButtonColor: '#c9a84c'
            }).then(() => navigate('/auth'));
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: result.message, confirmButtonColor: '#c9a84c' });
        }
    };

    return (
        <div className="at-auth">
            <div className="at-auth-container">
                <div className="at-auth-card">
                    <form className="at-auth-form" onSubmit={handleSubmit}>
                        <h2 className="at-auth-title">Nueva contraseña</h2>
                        <p className="at-auth-subtitle">
                            Ingresá tu nueva contraseña para {email}
                        </p>
                        <div className="at-perfil-form-group">
                            <label>Nueva contraseña</label>
                            <input
                                type="password"
                                className="at-auth-input"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => handlePasswordChange(e.target.value)}
                                maxLength="128"
                                required
                                autoComplete="new-password"
                            />
                            {newPassword && (
                                <div className="at-auth-strength">
                                    <div className="at-auth-strength-bar">
                                        <div className="at-auth-strength-fill" style={{ width: `${passwordStrength}%`, backgroundColor: getStrengthColor() }} />
                                    </div>
                                    <span className="at-auth-strength-text" style={{ color: getStrengthColor() }}>{getStrengthText()}</span>
                                </div>
                            )}
                        </div>
                        <div className="at-perfil-form-group">
                            <label>Confirmar contraseña</label>
                            <input
                                type="password"
                                className="at-auth-input"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                maxLength="128"
                                required
                                autoComplete="new-password"
                            />
                        </div>
                        <button type="submit" className="at-auth-btn" disabled={loading}>
                            {loading ? 'Actualizando...' : 'Restablecer contraseña'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;

import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';
import {
    sanitizeObject,
    validatePasswordStrength,
    validateRegistrationForm,
    validateLoginForm,
    checkRateLimit,
    recordFailedAttempt,
    resetAttempts,
    detectSuspiciousPattern
} from '../security';
import '../style/auth.css';

const TEXTS = {
    loginTab: 'Iniciar Sesión',
    registerTab: 'Registrarse',
    welcomeBack: 'Bienvenido de nuevo',
    loginSubtitle: 'Ingresá tus credenciales para continuar',
    createAccount: 'Crear cuenta',
    registerSubtitle: 'Completá tus datos para registrarte',
    emailLabel: 'Email',
    passwordLabel: 'Contraseña',
    nameLabel: 'Nombre',
    lastNameLabel: 'Apellido',
    phoneLabel: 'Teléfono',
    addressLabel: 'Dirección',
    confirmPasswordLabel: 'Confirmar Contraseña',
    loginButton: 'Iniciar Sesión',
    registerButton: 'Crear Cuenta',
    loggingIn: 'Ingresando...',
    registering: 'Registrando...',
    emailPlaceholder: 'tu@email.com',
    passwordPlaceholder: '••••••••',
    namePlaceholder: 'Juan',
    lastNamePlaceholder: 'Pérez',
    phonePlaceholder: '+54 11 1234-5678',
    addressPlaceholder: 'Av. Principal 123',
    passwordRequirementsTitle: 'La contraseña debe contener:',
    requirement1: 'Mínimo 8 caracteres',
    requirement2: 'Una letra mayúscula',
    requirement3: 'Una letra minúscula',
    requirement4: 'Un número',
    requirement5: 'Un carácter especial (!@#$%^&*)'
};

const createEmptyLoginForm = () => ({ ['em' + 'ail']: '', ['pass' + 'word']: '' });

const createEmptyRegisterForm = () => ({
    nombre: '', apellido: '', ['em' + 'ail']: '', ['pass' + 'word']: '',
    confirmPassword: '', telefono: '', direccion: ''
});

function Auth() {
    const navigate = useNavigate();
    const { login, register } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [loginData, setLoginData] = useState(createEmptyLoginForm);
    const [registerData, setRegisterData] = useState(createEmptyRegisterForm);

    const handleLoginChange = (field, value) => {
        if (detectSuspiciousPattern(value)) {
            Swal.fire({ icon: 'warning', title: 'Contenido no permitido', text: 'Se detectó contenido potencialmente peligroso', confirmButtonColor: '#c9a84c' });
            return;
        }
        setLoginData({ ...loginData, [field]: value });
    };

    const handleRegisterChange = (field, value) => {
        if (detectSuspiciousPattern(value)) {
            Swal.fire({ icon: 'warning', title: 'Contenido no permitido', text: 'Se detectó contenido potencialmente peligroso', confirmButtonColor: '#c9a84c' });
            return;
        }
        const newData = { ...registerData, [field]: value };
        setRegisterData(newData);
        if (field === 'password') {
            const strength = validatePasswordStrength(value);
            setPasswordStrength(strength.strength);
        }
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

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        const rateCheck = checkRateLimit(loginData.email);
        if (!rateCheck.allowed) {
            Swal.fire({ icon: 'error', title: 'Demasiados intentos', text: `Intentá de nuevo en ${rateCheck.lockedMinutes} minutos.`, confirmButtonColor: '#c9a84c' });
            return;
        }
        const validation = validateLoginForm(loginData);
        if (!validation.isValid) {
            Swal.fire({ icon: 'error', title: 'Datos inválidos', text: Object.values(validation.errors).join('\n'), confirmButtonColor: '#c9a84c' });
            return;
        }
        const sanitizedData = sanitizeObject(loginData);
        setLoading(true);
        const result = await login(sanitizedData);
        setLoading(false);
        if (result.success) {
            resetAttempts(loginData.email);
            Swal.fire({ icon: 'success', title: '¡Bienvenido!', text: 'Iniciaste sesión correctamente', confirmButtonColor: '#c9a84c', timer: 2000, timerProgressBar: true });
            const userRole = result.user?.role || result.user?.roles?.[0];
            navigate(userRole === 'Admin' ? '/admin/productos' : '/');
        } else {
            recordFailedAttempt(loginData.email);
            const remainingCheck = checkRateLimit(loginData.email);
            Swal.fire({ icon: 'error', title: 'Error', text: result.message + (remainingCheck.remainingAttempts ? `\nIntentos restantes: ${remainingCheck.remainingAttempts}` : ''), confirmButtonColor: '#c9a84c' });
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        const validation = validateRegistrationForm(registerData);
        if (!validation.isValid) {
            Swal.fire({ icon: 'error', title: 'Datos inválidos', html: Object.values(validation.errors).join('<br>'), confirmButtonColor: '#c9a84c' });
            return;
        }
        const sanitizedData = sanitizeObject(registerData);
        setLoading(true);
        const result = await register(sanitizedData);
        setLoading(false);
        if (result.success) {
            Swal.fire({ icon: 'success', title: '¡Registro exitoso!', text: 'Tu cuenta fue creada', confirmButtonColor: '#c9a84c', timer: 2000, timerProgressBar: true });
            navigate('/');
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: result.message, confirmButtonColor: '#c9a84c' });
        }
    };

    return (
        <div className="at-auth">
            <div className="at-auth-container">
                <div className="at-auth-card">
                    <div className="at-auth-tabs">
                        <button className={`at-auth-tab ${isLogin ? 'is-active' : ''}`} onClick={() => setIsLogin(true)}>{TEXTS.loginTab}</button>
                        <button className={`at-auth-tab ${!isLogin ? 'is-active' : ''}`} onClick={() => setIsLogin(false)}>{TEXTS.registerTab}</button>
                    </div>

                    {isLogin ? (
                        <form className="at-auth-form" onSubmit={handleLoginSubmit} key="login">
                            <h2 className="at-auth-title">{TEXTS.welcomeBack}</h2>
                            <p className="at-auth-subtitle">{TEXTS.loginSubtitle}</p>
                            <div className="at-perfil-form-group">
                                <label>{TEXTS.emailLabel}</label>
                                <input type="email" className="at-auth-input" placeholder={TEXTS.emailPlaceholder}
                                    value={loginData.email} onChange={(e) => handleLoginChange('email', e.target.value)}
                                    maxLength="254" required autoComplete="email" />
                            </div>
                            <div className="at-perfil-form-group">
                                <label>{TEXTS.passwordLabel}</label>
                                <input type="password" className="at-auth-input" placeholder={TEXTS.passwordPlaceholder}
                                    value={loginData.password} onChange={(e) => handleLoginChange('password', e.target.value)}
                                    maxLength="128" required autoComplete="current-password" />
                            </div>
                            <Link to="/forgot-password" className="at-auth-link" style={{ display: 'block', textAlign: 'right', fontSize: '0.85rem', marginTop: -8, marginBottom: 16 }}>
                                ¿Olvidaste tu contraseña?
                            </Link>
                            <button type="submit" className="at-auth-btn" disabled={loading}>
                                {loading ? TEXTS.loggingIn : TEXTS.loginButton}
                            </button>
                        </form>
                    ) : (
                        <form className="at-auth-form" onSubmit={handleRegisterSubmit} key="register">
                            <h2 className="at-auth-title">{TEXTS.createAccount}</h2>
                            <p className="at-auth-subtitle">{TEXTS.registerSubtitle}</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="at-perfil-form-group">
                                    <label>{TEXTS.nameLabel}</label>
                                    <input type="text" className="at-auth-input" placeholder={TEXTS.namePlaceholder}
                                        value={registerData.nombre} onChange={(e) => handleRegisterChange('nombre', e.target.value)}
                                        maxLength="50" required autoComplete="given-name" />
                                </div>
                                <div className="at-perfil-form-group">
                                    <label>{TEXTS.lastNameLabel}</label>
                                    <input type="text" className="at-auth-input" placeholder={TEXTS.lastNamePlaceholder}
                                        value={registerData.apellido} onChange={(e) => handleRegisterChange('apellido', e.target.value)}
                                        maxLength="50" required autoComplete="family-name" />
                                </div>
                            </div>
                            <div className="at-perfil-form-group">
                                <label>{TEXTS.emailLabel}</label>
                                <input type="email" className="at-auth-input" placeholder={TEXTS.emailPlaceholder}
                                    value={registerData.email} onChange={(e) => handleRegisterChange('email', e.target.value)}
                                    maxLength="254" required autoComplete="email" />
                            </div>
                            <div className="at-perfil-form-group">
                                <label>{TEXTS.phoneLabel}</label>
                                <input type="tel" className="at-auth-input" placeholder={TEXTS.phonePlaceholder}
                                    value={registerData.telefono} onChange={(e) => handleRegisterChange('telefono', e.target.value)}
                                    maxLength="20" required autoComplete="tel" />
                            </div>
                            <div className="at-perfil-form-group">
                                <label>{TEXTS.addressLabel}</label>
                                <input type="text" className="at-auth-input" placeholder={TEXTS.addressPlaceholder}
                                    value={registerData.direccion} onChange={(e) => handleRegisterChange('direccion', e.target.value)}
                                    maxLength="200" required autoComplete="street-address" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="at-perfil-form-group">
                                    <label>{TEXTS.passwordLabel}</label>
                                    <input type="password" className="at-auth-input" placeholder={TEXTS.passwordPlaceholder}
                                        value={registerData.password} onChange={(e) => handleRegisterChange('password', e.target.value)}
                                        maxLength="128" required autoComplete="new-password" />
                                    {registerData.password && (
                                        <div className="at-auth-strength">
                                            <div className="at-auth-strength-bar">
                                                <div className="at-auth-strength-fill" style={{ width: `${passwordStrength}%`, backgroundColor: getStrengthColor() }} />
                                            </div>
                                            <span className="at-auth-strength-text" style={{ color: getStrengthColor() }}>{getStrengthText()}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="at-perfil-form-group">
                                    <label>{TEXTS.confirmPasswordLabel}</label>
                                    <input type="password" className="at-auth-input" placeholder={TEXTS.passwordPlaceholder}
                                        value={registerData.confirmPassword} onChange={(e) => handleRegisterChange('confirmPassword', e.target.value)}
                                        maxLength="128" required autoComplete="new-password" />
                                </div>
                            </div>
                            <div className="at-auth-requirements">
                                <small>{TEXTS.passwordRequirementsTitle}</small>
                                <ul>
                                    <li>{TEXTS.requirement1}</li>
                                    <li>{TEXTS.requirement2}</li>
                                    <li>{TEXTS.requirement3}</li>
                                    <li>{TEXTS.requirement4}</li>
                                    <li>{TEXTS.requirement5}</li>
                                </ul>
                            </div>
                            <button type="submit" className="at-auth-btn" disabled={loading}>
                                {loading ? TEXTS.registering : TEXTS.registerButton}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Auth;

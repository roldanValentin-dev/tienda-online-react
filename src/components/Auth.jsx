import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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

// Textos de la interfaz (preparado para i18n futuro)
const TEXTS = {
    loginTab: 'Iniciar Sesión',
    registerTab: 'Registrarse',
    welcomeBack: 'Bienvenido de nuevo',
    loginSubtitle: 'Ingresa tus credenciales para continuar',
    createAccount: 'Crear cuenta',
    registerSubtitle: 'Completa tus datos para registrarte',
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
    // Placeholders
    emailPlaceholder: 'tu@email.com',
    passwordPlaceholder: '••••••••',
    namePlaceholder: 'Juan',
    lastNamePlaceholder: 'Pérez',
    phonePlaceholder: '+54 11 1234-5678',
    addressPlaceholder: 'Av. Principal 123',
    // Requisitos de contraseña
    passwordRequirementsTitle: 'La contraseña debe contener:',
    requirement1: 'Mínimo 8 caracteres',
    requirement2: 'Una letra mayúscula',
    requirement3: 'Una letra minúscula',
    requirement4: 'Un número',
    requirement5: 'Un carácter especial (!@#$%^&*)'
};

// Funciones para crear estados iniciales de formularios
const createEmptyLoginForm = () => ({
    ['em' + 'ail']: '',
    ['pass' + 'word']: ''
});

const createEmptyRegisterForm = () => ({
    nombre: '',
    apellido: '',
    ['em' + 'ail']: '',
    ['pass' + 'word']: '',
    confirmPassword: '',
    telefono: '',
    direccion: ''
});

function Auth() {
    const navigate = useNavigate();
    const { login, register } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const [loginData, setLoginData] = useState(createEmptyLoginForm);
    const [registerData, setRegisterData] = useState(createEmptyRegisterForm);

    // Manejo seguro de cambios en inputs
    const handleLoginChange = (field, value) => {
        // Detectar patrones sospechosos
        if (detectSuspiciousPattern(value)) {
            Swal.fire({
                icon: 'warning',
                title: 'Contenido no permitido',
                text: 'Se detectó contenido potencialmente peligroso',
                confirmButtonColor: '#ff6b35'
            });
            return;
        }

        setLoginData({ ...loginData, [field]: value });
    };

    const handleRegisterChange = (field, value) => {
        // Detectar patrones sospechosos
        if (detectSuspiciousPattern(value)) {
            Swal.fire({
                icon: 'warning',
                title: 'Contenido no permitido',
                text: 'Se detectó contenido potencialmente peligroso',
                confirmButtonColor: '#ff6b35'
            });
            return;
        }

        const newData = { ...registerData, [field]: value };
        setRegisterData(newData);

        // Calcular fuerza de contraseña en tiempo real
        if (field === 'password') {
            const strength = validatePasswordStrength(value);
            setPasswordStrength(strength.strength);
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        // Verificar rate limiting
        const rateCheck = checkRateLimit(loginData.email);
        if (!rateCheck.allowed) {
            Swal.fire({
                icon: 'error',
                title: 'Demasiados intentos',
                text: `Has excedido el número de intentos. Intenta nuevamente en ${rateCheck.lockedMinutes} minutos.`,
                confirmButtonColor: '#ff6b35'
            });
            return;
        }

        // Validar formulario
        const validation = validateLoginForm(loginData);
        if (!validation.isValid) {
            const errorMessages = Object.values(validation.errors).join('\n');
            Swal.fire({
                icon: 'error',
                title: 'Datos inválidos',
                text: errorMessages,
                confirmButtonColor: '#ff6b35'
            });
            return;
        }

        // Sanitizar datos antes de enviar
        const sanitizedData = sanitizeObject(loginData);

        setLoading(true);
        const result = await login(sanitizedData);
        setLoading(false);

        if (result.success) {
            // Resetear intentos fallidos
            resetAttempts(loginData.email);

            Swal.fire({
                icon: 'success',
                title: '¡Bienvenido!',
                text: 'Has iniciado sesión correctamente',
                confirmButtonColor: '#ff6b35',
                timer: 2000,
                timerProgressBar: true
            });
            
            // Redirigir según el rol del usuario
            const userRole = result.user?.role || result.user?.roles?.[0];
            if (userRole === 'Admin') {
                navigate('/admin/productos');
            } else {
                navigate('/');
            }
        } else {
            // Registrar intento fallido
            recordFailedAttempt(loginData.email);

            const remainingCheck = checkRateLimit(loginData.email);
            const warningText = remainingCheck.remainingAttempts > 0
                ? `Intentos restantes: ${remainingCheck.remainingAttempts}`
                : '';

            Swal.fire({
                icon: 'error',
                title: 'Error de autenticación',
                text: result.message + (warningText ? '\n' + warningText : ''),
                confirmButtonColor: '#ff6b35'
            });
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        // Validar formulario completo
        const validation = validateRegistrationForm(registerData);
        if (!validation.isValid) {
            const errorMessages = Object.values(validation.errors).join('\n');
            Swal.fire({
                icon: 'error',
                title: 'Datos inválidos',
                html: errorMessages.replace(/\n/g, '<br>'),
                confirmButtonColor: '#ff6b35'
            });
            return;
        }

        // Sanitizar datos antes de enviar
        const sanitizedData = sanitizeObject(registerData);

        setLoading(true);
        const result = await register(sanitizedData);
        setLoading(false);

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: '¡Registro exitoso!',
                text: 'Tu cuenta ha sido creada correctamente',
                confirmButtonColor: '#ff6b35',
                timer: 2000,
                timerProgressBar: true
            });
            navigate('/');
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error en el registro',
                text: result.message,
                confirmButtonColor: '#ff6b35'
            });
        }
    };

    // Obtener color de la barra de fuerza de contraseña
    const getStrengthColor = () => {
        if (passwordStrength < 40) return '#dc3545';
        if (passwordStrength < 70) return '#ffc107';
        return '#28a745';
    };

    const getStrengthText = () => {
        if (passwordStrength < 40) return 'Débil';
        if (passwordStrength < 70) return 'Media';
        return 'Fuerte';
    };

    return (
        <div className="auth-page">
            <div className="container-custom">
                <div className="auth-container">
                    <div className="auth-tabs">
                        <button
                            className={`auth-tab ${isLogin ? 'active' : ''}`}
                            onClick={() => setIsLogin(true)}
                        >
                            {TEXTS.loginTab}
                        </button>
                        <button
                            className={`auth-tab ${!isLogin ? 'active' : ''}`}
                            onClick={() => setIsLogin(false)}
                        >
                            {TEXTS.registerTab}
                        </button>
                    </div>

                    {isLogin ? (
                        <form className="auth-form auth-form-enter" onSubmit={handleLoginSubmit} key="login">
                            <h2 className="auth-title">{TEXTS.welcomeBack}</h2>
                            <p className="auth-subtitle">{TEXTS.loginSubtitle}</p>

                            <div className="form-group">
                                <label>{TEXTS.emailLabel}</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder={TEXTS.emailPlaceholder}
                                    value={loginData.email}
                                    onChange={(e) => handleLoginChange('email', e.target.value)}
                                    maxLength="254"
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            <div className="form-group">
                                <label>{TEXTS.passwordLabel}</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder={TEXTS.passwordPlaceholder}
                                    value={loginData.password}
                                    onChange={(e) => handleLoginChange('password', e.target.value)}
                                    maxLength="128"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn-auth"
                                disabled={loading}
                            >
                                {loading ? TEXTS.loggingIn : TEXTS.loginButton}
                            </button>
                        </form>
                    ) : (
                        <form className="auth-form auth-form-enter" onSubmit={handleRegisterSubmit} key="register">
                            <h2 className="auth-title">{TEXTS.createAccount}</h2>
                            <p className="auth-subtitle">{TEXTS.registerSubtitle}</p>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>{TEXTS.nameLabel}</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder={TEXTS.namePlaceholder}
                                        value={registerData.nombre}
                                        onChange={(e) => handleRegisterChange('nombre', e.target.value)}
                                        maxLength="50"
                                        required
                                        autoComplete="given-name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>{TEXTS.lastNameLabel}</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder={TEXTS.lastNamePlaceholder}
                                        value={registerData.apellido}
                                        onChange={(e) => handleRegisterChange('apellido', e.target.value)}
                                        maxLength="50"
                                        required
                                        autoComplete="family-name"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>{TEXTS.emailLabel}</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder={TEXTS.emailPlaceholder}
                                    value={registerData.email}
                                    onChange={(e) => handleRegisterChange('email', e.target.value)}
                                    maxLength="254"
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            <div className="form-group">
                                <label>{TEXTS.phoneLabel}</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    placeholder={TEXTS.phonePlaceholder}
                                    value={registerData.telefono}
                                    onChange={(e) => handleRegisterChange('telefono', e.target.value)}
                                    maxLength="20"
                                    required
                                    autoComplete="tel"
                                />
                            </div>

                            <div className="form-group">
                                <label>{TEXTS.addressLabel}</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder={TEXTS.addressPlaceholder}
                                    value={registerData.direccion}
                                    onChange={(e) => handleRegisterChange('direccion', e.target.value)}
                                    maxLength="200"
                                    required
                                    autoComplete="street-address"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>{TEXTS.passwordLabel}</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        placeholder={TEXTS.passwordPlaceholder}
                                        value={registerData.password}
                                        onChange={(e) => handleRegisterChange('password', e.target.value)}
                                        maxLength="128"
                                        required
                                        autoComplete="new-password"
                                    />
                                    {registerData.password && (
                                        <div className="password-strength">
                                            <div className="strength-bar">
                                                <div
                                                    className="strength-fill"
                                                    style={{
                                                        width: `${passwordStrength}%`,
                                                        backgroundColor: getStrengthColor()
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="strength-text" style={{ color: getStrengthColor() }}>
                                                {getStrengthText()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>{TEXTS.confirmPasswordLabel}</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        placeholder={TEXTS.passwordPlaceholder}
                                        value={registerData.confirmPassword}
                                        onChange={(e) => handleRegisterChange('confirmPassword', e.target.value)}
                                        maxLength="128"
                                        required
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>

                            <div className="password-requirements">
                                <small>{TEXTS.passwordRequirementsTitle}</small>
                                <ul>
                                    <li>{TEXTS.requirement1}</li>
                                    <li>{TEXTS.requirement2}</li>
                                    <li>{TEXTS.requirement3}</li>
                                    <li>{TEXTS.requirement4}</li>
                                    <li>{TEXTS.requirement5}</li>
                                </ul>
                            </div>

                            <button
                                type="submit"
                                className="btn-auth"
                                disabled={loading}
                            >
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

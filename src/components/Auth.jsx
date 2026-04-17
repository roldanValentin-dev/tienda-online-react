import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';

function Auth() {
    const navigate = useNavigate();
    const { login, register } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });

    const [registerData, setRegisterData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        confirmPassword: '',
        telefono: '',
        direccion: ''
    });

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateEmail(loginData.email)) {
            Swal.fire({
                icon: 'error',
                title: 'Email inválido',
                text: 'Por favor ingresa un email válido',
                confirmButtonColor: '#FA7268'
            });
            return;
        }

        setLoading(true);
        const result = await login(loginData);
        setLoading(false);

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: '¡Bienvenido!',
                text: 'Has iniciado sesión correctamente',
                confirmButtonColor: '#FA7268',
                timer: 2000
            });
            navigate('/');
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.message,
                confirmButtonColor: '#FA7268'
            });
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        if (!validateEmail(registerData.email)) {
            Swal.fire({
                icon: 'error',
                title: 'Email inválido',
                text: 'Por favor ingresa un email válido',
                confirmButtonColor: '#FA7268'
            });
            return;
        }

        if (!validatePassword(registerData.password)) {
            Swal.fire({
                icon: 'error',
                title: 'Contraseña débil',
                text: 'La contraseña debe tener al menos 6 caracteres',
                confirmButtonColor: '#FA7268'
            });
            return;
        }

        if (registerData.password !== registerData.confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Contraseñas no coinciden',
                text: 'Las contraseñas deben ser iguales',
                confirmButtonColor: '#FA7268'
            });
            return;
        }

        setLoading(true);
        const result = await register(registerData);
        setLoading(false);

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: '¡Registro exitoso!',
                text: 'Tu cuenta ha sido creada correctamente',
                confirmButtonColor: '#FA7268',
                timer: 2000
            });
            navigate('/');
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.message,
                confirmButtonColor: '#FA7268'
            });
        }
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
                            Iniciar Sesión
                        </button>
                        <button 
                            className={`auth-tab ${!isLogin ? 'active' : ''}`}
                            onClick={() => setIsLogin(false)}
                        >
                            Registrarse
                        </button>
                    </div>

                    {isLogin ? (
                        <form className="auth-form" onSubmit={handleLoginSubmit}>
                            <h2 className="auth-title">Bienvenido de nuevo</h2>
                            <p className="auth-subtitle">Ingresa tus credenciales para continuar</p>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="tu@email.com"
                                    value={loginData.email}
                                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Contraseña</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="btn-auth"
                                disabled={loading}
                            >
                                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                            </button>
                        </form>
                    ) : (
                        <form className="auth-form" onSubmit={handleRegisterSubmit}>
                            <h2 className="auth-title">Crear cuenta</h2>
                            <p className="auth-subtitle">Completa tus datos para registrarte</p>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nombre</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Juan"
                                        value={registerData.nombre}
                                        onChange={(e) => setRegisterData({...registerData, nombre: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Apellido</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Pérez"
                                        value={registerData.apellido}
                                        onChange={(e) => setRegisterData({...registerData, apellido: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="tu@email.com"
                                    value={registerData.email}
                                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Teléfono</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    placeholder="+54 11 1234-5678"
                                    value={registerData.telefono}
                                    onChange={(e) => setRegisterData({...registerData, telefono: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Dirección</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Av. Principal 123"
                                    value={registerData.direccion}
                                    onChange={(e) => setRegisterData({...registerData, direccion: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Contraseña</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        placeholder="••••••••"
                                        value={registerData.password}
                                        onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Confirmar Contraseña</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        placeholder="••••••••"
                                        value={registerData.confirmPassword}
                                        onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="btn-auth"
                                disabled={loading}
                            >
                                {loading ? 'Registrando...' : 'Crear Cuenta'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Auth;

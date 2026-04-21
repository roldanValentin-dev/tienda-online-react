import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from "../config/api";
import { sanitizeErrorMessage } from '../security';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } catch (error) {
                // Si hay error al parsear, limpiar datos corruptos
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const register = async (userData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/register-cliente`, {
                nombre: userData.nombre,
                apellido: userData.apellido,
                email: userData.email,
                password: userData.password,
                telefono: userData.telefono,
                direccion: userData.direccion
            }, {
                timeout: 10000, // Timeout de 10 segundos
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.token) {
                const { token, ...userInfo } = response.data;
                
                // Validar que el token no esté vacío
                if (!token || token.length < 10) {
                    throw new Error('Token inválido recibido del servidor');
                }
                
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userInfo));
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setUser(userInfo);
            }

            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error en registro:', error);
            
            // Sanitizar mensaje de error
            const errorMessage = error.response?.data?.message || error.message || 'Error al registrar usuario';
            const sanitizedMessage = sanitizeErrorMessage(errorMessage);
            
            return { 
                success: false, 
                message: sanitizedMessage
            };
        }
    };

    const login = async (credentials) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                email: credentials.email,
                password: credentials.password
            }, {
                timeout: 10000, // Timeout de 10 segundos
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.token) {
                const { token, ...userInfo } = response.data;
                
                // Validar que el token no esté vacío
                if (!token || token.length < 10) {
                    throw new Error('Token inválido recibido del servidor');
                }
                
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userInfo));
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setUser(userInfo);
            }

            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error en login:', error);
            
            // Sanitizar mensaje de error
            const errorMessage = error.response?.data?.message || error.message || 'Credenciales inválidas';
            const sanitizedMessage = sanitizeErrorMessage(errorMessage);
            
            return { 
                success: false, 
                message: sanitizedMessage
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const isAuthenticated = () => {
        return !!user;
    };

    // Interceptor para manejar errores 401 (token expirado)
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response?.status === 401) {
                    // Token expirado o inválido, cerrar sesión
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            register, 
            login, 
            logout, 
            isAuthenticated 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

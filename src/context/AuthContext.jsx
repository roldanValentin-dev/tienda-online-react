import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            setUser(JSON.parse(userData));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);

    const register = async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/auth/register-cliente`, {
                nombre: userData.nombre,
                apellido: userData.apellido,
                email: userData.email,
                password: userData.password,
                telefono: userData.telefono,
                direccion: userData.direccion
            });

            if (response.data.token) {
                const { token, ...userInfo } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userInfo));
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setUser(userInfo);
            }

            return { success: true, data: response.data };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Error al registrar usuario' 
            };
        }
    };

    const login = async (credentials) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email: credentials.email,
                password: credentials.password
            });

            if (response.data.token) {
                const { token, ...userInfo } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userInfo));
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setUser(userInfo);
            }

            return { success: true, data: response.data };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Credenciales inválidas' 
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

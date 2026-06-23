import axios from 'axios';
import API_BASE_URL from '../config/api';

class AuthService {
    constructor() {
        this.timeout = 10000;
    }

    async forgotPassword(email) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/auth/forgot-password`,
                { email },
                {
                    timeout: this.timeout,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            return { success: true, data: response.data };
        } catch (error) {
            const data = error.response?.data;
            return {
                success: false,
                message: data?.message || data?.title || 'Error al solicitar recuperación de contraseña'
            };
        }
    }

    async resetPassword({ email, token, newPassword }) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/auth/reset-password`,
                { email, token, newPassword },
                {
                    timeout: this.timeout,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            return { success: true, data: response.data };
        } catch (error) {
            const data = error.response?.data;
            if (error.response?.status === 400) {
                return {
                    success: false,
                    message: data?.message || data?.title || 'Solicitud inválida. El enlace puede haber expirado.'
                };
            }
            return {
                success: false,
                message: data?.message || data?.title || 'Error al restablecer la contraseña'
            };
        }
    }
}

export default new AuthService();

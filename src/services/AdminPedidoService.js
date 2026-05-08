import axios from 'axios';
import API_BASE_URL from '../config/api';

class AdminPedidoService {
    async getTodosLosPedidos() {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/pedidos/todos`, {
                timeout: 15000
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error al obtener pedidos:', error);
            return { success: false, message: error.response?.data?.message || 'Error al cargar pedidos' };
        }
    }

    async getPedidosPorEstado(estadoId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/pedidos/estado/${estadoId}`, {
                timeout: 10000
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error al filtrar pedidos:', error);
            return { success: false, message: error.response?.data?.message || 'Error al filtrar pedidos' };
        }
    }

    async cambiarEstado(pedidoId, nuevoEstadoId) {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/api/pedidos/${pedidoId}/estado`,
                { estadoId: nuevoEstadoId },
                { timeout: 10000 }
            );
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            return { success: false, message: error.response?.data?.message || 'Error al cambiar estado' };
        }
    }

    async getEstadisticas() {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/pedidos/estadisticas`, {
                timeout: 10000
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            return { success: false, data: null };
        }
    }
}

export default new AdminPedidoService();
/**
 * SERVICIO DE PEDIDOS
 * Maneja todas las operaciones relacionadas con pedidos del usuario
 * Endpoints: POST /api/pedidos, GET /api/pedidos/mis-pedidos, GET /api/pedidos/{id}
 */

import axios from 'axios';
import API_BASE_URL from '../config/api';

class PedidoService {
    /**
     * Crear un nuevo pedido
     * @param {Object} pedidoData - Datos del pedido (fechaEntrega, observaciones, detalles)
     * @returns {Promise<Object>} - { success: boolean, data?: Object, message?: string }
     */
    async createPedido(pedidoData) {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/pedidos`, pedidoData, {
                timeout: 15000, // 15 segundos para crear pedido
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error al crear pedido:', error);
            
            // Manejo específico de errores
            if (error.response?.status === 401) {
                return { success: false, message: 'Debes iniciar sesión para crear un pedido' };
            }
            if (error.response?.status === 400) {
                const backendMessage = error.response.data?.message || error.response.data?.title;
                return { success: false, message: backendMessage || 'Datos del pedido inválidos' };
            }
            if (error.response?.status === 500) {
                const backendMessage = error.response.data?.message || error.response.data?.title;
                return { 
                    success: false, 
                    message: backendMessage || 'Error en el servidor. Por favor, intenta nuevamente.' 
                };
            }
            
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Error al crear pedido. Intenta nuevamente.'
            };
        }
    }

    /**
     * Obtener todos los pedidos del usuario autenticado
     * @returns {Promise<Object>} - { success: boolean, data?: Array, message?: string }
     */
    async getMisPedidos() {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/pedidos/mis-pedidos`, {
                timeout: 10000
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error al obtener pedidos:', error);
            
            if (error.response?.status === 401) {
                return { success: false, message: 'Debes iniciar sesión para ver tus pedidos' };
            }
            
            return {
                success: false,
                message: error.response?.data?.message || 'Error al cargar pedidos'
            };
        }
    }

    /**
     * Obtener detalle de un pedido específico
     * @param {number} id - ID del pedido
     * @returns {Promise<Object>} - { success: boolean, data?: Object, message?: string }
     */
    async getPedidoById(id) {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/pedidos/${id}`, {
                timeout: 10000
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error al obtener pedido:', error);
            
            if (error.response?.status === 404) {
                return { success: false, message: 'Pedido no encontrado' };
            }
            if (error.response?.status === 403) {
                return { success: false, message: 'No tienes permiso para ver este pedido' };
            }
            
            return {
                success: false,
                message: error.response?.data?.message || 'Error al cargar detalle del pedido'
            };
        }
    }
}

// Exportar instancia única (Singleton)
export default new PedidoService();

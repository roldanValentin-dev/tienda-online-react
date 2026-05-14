const DEBUG = true;

function log(type, data) {
    if (!DEBUG) return;
    const map = { req: 'cyan', res: 'lime', err: 'red' };
    console.log(`%c[AdminPedidoService] ${type}`, `color: ${map[type] || 'blue'}`);
    console.log('  ', data);
}

function extractError(data, fallback) {
    if (!data) return fallback || 'Error';
    if (data.errors && typeof data.errors === 'object') {
        const parts = Object.entries(data.errors).map(([f, msgs]) => {
            const arr = Array.isArray(msgs) ? msgs : [msgs];
            return `${f.replace(/^\$\./, '')}: ${arr.join('. ')}`;
        });
        return parts.join(' | ');
    }
    return data.message || data.detail || data.title || fallback || 'Error';
}

import axios from 'axios';
import API_BASE_URL from '../config/api';

class AdminPedidoService {
    async getTodosLosPedidos() {
        try {
            log('req', 'GET /api/pedidos/todos');
            const response = await axios.get(`${API_BASE_URL}/api/pedidos/todos`, {
                timeout: 15000
            });
            log('res', { count: response.data?.length, firstId: response.data?.[0]?.id });
            return { success: true, data: response.data };
        } catch (error) {
            log('err', error.response?.data || error.message);
            return { success: false, message: extractError(error.response?.data, 'Error al cargar pedidos') };
        }
    }

    async getPedidosPorEstado(estadoId) {
        try {
            log('req', `GET /api/pedidos/estado/${estadoId}`);
            const response = await axios.get(`${API_BASE_URL}/api/pedidos/estado/${estadoId}`, {
                timeout: 10000
            });
            log('res', { count: response.data?.length });
            return { success: true, data: response.data };
        } catch (error) {
            log('err', error.response?.data || error.message);
            return { success: false, message: extractError(error.response?.data, 'Error al filtrar pedidos') };
        }
    }

    async getDetalle(pedidoId) {
        try {
            log('req', `GET /api/pedidos/detalle/${pedidoId}`);
            const response = await axios.get(`${API_BASE_URL}/api/pedidos/detalle/${pedidoId}`, {
                timeout: 10000
            });
            log('res', { id: response.data?.id, estado: response.data?.estado, tipoPago: response.data?.tipoPago });
            return { success: true, data: response.data };
        } catch (error) {
            log('err', error.response?.data || error.message);
            return { success: false, message: extractError(error.response?.data, 'Error al obtener detalle') };
        }
    }

    async cambiarEstado(pedidoId, nuevoEstadoId) {
        try {
            log('req', { url: `PUT /api/pedidos/${pedidoId}/estado`, body: { estadoId: nuevoEstadoId } });
            const response = await axios.put(
                `${API_BASE_URL}/api/pedidos/${pedidoId}/estado`,
                { estadoId: nuevoEstadoId },
                { timeout: 10000 }
            );
            log('res', response.data);
            return { success: true, data: response.data };
        } catch (error) {
            log('err', error.response?.data || error.message);
            return { success: false, message: extractError(error.response?.data, 'Error al cambiar estado') };
        }
    }

    async getEstadisticas() {
        try {
            log('req', 'GET /api/pedidos/estadisticas');
            const response = await axios.get(`${API_BASE_URL}/api/pedidos/estadisticas`, {
                timeout: 10000
            });
            log('res', response.data);
            return { success: true, data: response.data };
        } catch (error) {
            log('err', error.response?.data || error.message);
            return { success: false, data: null };
        }
    }

    async getPendientesPago() {
        try {
            log('req', 'GET /api/admin/pedidos/pendientes-pago');
            const response = await axios.get(`${API_BASE_URL}/api/admin/pedidos/pendientes-pago`, {
                timeout: 10000
            });
            log('res', { count: response.data?.length });
            return { success: true, data: response.data };
        } catch (error) {
            log('err', error.response?.data || error.message);
            return { success: false, message: extractError(error.response?.data, 'Error al cargar pedidos pendientes') };
        }
    }

    async confirmarPago(pedidoId) {
        try {
            log('req', { url: `POST /api/admin/pedidos/${pedidoId}/confirmar-pago` });
            const response = await axios.post(
                `${API_BASE_URL}/api/admin/pedidos/${pedidoId}/confirmar-pago`,
                {},
                { timeout: 10000 }
            );
            log('res', response.data);
            return { success: true, data: response.data };
        } catch (error) {
            log('err', error.response?.data || error.message);
            return { success: false, message: extractError(error.response?.data, 'Error al confirmar pago') };
        }
    }
}

export default new AdminPedidoService();
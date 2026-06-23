import axios from 'axios';
import API_BASE_URL from '../config/api';

const DEBUG = false;

function debugLog(type, data) {
    if (!DEBUG) return;
    const colorMap = { request: 'cyan', response: 'lime', error: 'red' };
    const label = type === 'request' ? '→ REQ' : type === 'response' ? '← RES' : '✖ ERR';
    console.log(`%c[PagoService] ${label}`, `color: ${colorMap[type] || 'blue'}`);
    console.log('  ', data);
}

function extractError(data, fallback) {
    if (!data) return fallback || 'Error desconocido';
    if (data.errors && typeof data.errors === 'object') {
        const parts = Object.entries(data.errors)
            .map(([field, msgs]) => {
                const label = field.replace(/^\$\./, '');
                const msgsArr = Array.isArray(msgs) ? msgs : [msgs];
                return `${label}: ${msgsArr.join('. ')}`;
            });
        return parts.join(' | ');
    }
    if (data.message) return data.message;
    if (data.detail) return data.detail;
    if (data.title) return data.title;
    return fallback || 'Error desconocido';
}

class PagoService {
    constructor() {
        this.timeout = 10000;
    }

    async getDatosPago(pedidoId) {
        try {
            debugLog('request', { url: `GET /api/pedidos/${pedidoId}/datos-pago` });
            const response = await axios.get(
                `${API_BASE_URL}/api/pedidos/${pedidoId}/datos-pago`,
                { timeout: this.timeout }
            );
            debugLog('response', { url: `GET /api/pedidos/${pedidoId}/datos-pago`, response: response.data });
            return { success: true, data: response.data };
        } catch (error) {
            const data = error.response?.data;
            debugLog('error', { url: `GET /api/pedidos/${pedidoId}/datos-pago`, error: data || error.message });
            if (error.response?.status === 404)
                return { success: false, message: 'Pedido no encontrado' };
            if (error.response?.status === 401)
                return { success: false, message: 'No tienes permiso para ver este pedido' };
            return { success: false, message: extractError(data, 'Error al obtener datos de pago') };
        }
    }

    async procesarPago(pedidoId) {
        try {
            debugLog('request', { url: `POST /api/pedidos/${pedidoId}/procesar-pago` });
            const response = await axios.post(
                `${API_BASE_URL}/api/pedidos/${pedidoId}/procesar-pago`,
                {},
                { timeout: this.timeout }
            );
            debugLog('response', { url: `POST /api/pedidos/${pedidoId}/procesar-pago`, response: response.data });
            return { success: true, data: response.data };
        } catch (error) {
            const data = error.response?.data;
            debugLog('error', { url: `POST /api/pedidos/${pedidoId}/procesar-pago`, error: data || error.message });
            return { success: false, message: extractError(data, 'Error al procesar el pago') };
        }
    }

    async crearPreferenciaMP(pedidoId, emailPagador) {
        try {
            debugLog('request', { url: `POST /api/mercadopago/crear-preferencia?pedidoId=${pedidoId}`, body: { emailPagador } });
            const response = await axios.post(
                `${API_BASE_URL}/api/mercadopago/crear-preferencia?pedidoId=${pedidoId}`,
                { emailPagador },
                {
                    timeout: 15000,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            debugLog('response', { url: `POST /api/mercadopago/crear-preferencia?pedidoId=${pedidoId}`, response: response.data });
            return { success: true, data: response.data };
        } catch (error) {
            const data = error.response?.data;
            debugLog('error', { url: `POST /api/mercadopago/crear-preferencia?pedidoId=${pedidoId}`, error: data || error.message });
            if (error.response?.status === 400)
                return { success: false, message: extractError(data, 'Error al crear preferencia de pago') };
            return { success: false, message: 'Error al conectar con Mercado Pago. Intenta nuevamente.' };
        }
    }
}

export default new PagoService();

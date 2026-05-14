import axios from 'axios';
import API_BASE_URL from '../config/api';

const DEBUG = true;

function debugLog( direction, data ) {
    if (!DEBUG) return;
    const arrow = direction === 'request' ? '→' : '←';
    const color = direction === 'request' ? '\x1b[36m' : '\x1b[32m';
    const reset = '\x1b[0m';
    console.log(`%c[CarritoService] ${arrow} ${direction === 'request' ? 'REQ' : 'RES'}${reset}`,
                `color: ${color === '\x1b[36m' ? 'cyan' : 'lime'}`);
    console.log(`  URL: ${data.url || data}`);
    if (data.body) console.log(`  Body:`, data.body);
    if (data.response) console.log(`  Data:`, data.response);
    if (data.error) console.log(`  Error:`, data.error);
    if (data.diff) console.log(`  Diff:`, data.diff);
}

class CarritoService {
    constructor() {
        this.baseURL = `${API_BASE_URL}/api/carrito`;
        this.timeout = 10000;
    }

    extractError(data, fallback) {
        if (!data) return fallback || 'Error desconocido';

        // Formato .NET ProblemDetails con errors de validación
        if (data.errors && typeof data.errors === 'object') {
            const parts = Object.entries(data.errors)
                .map(([field, msgs]) => {
                    const label = field.replace(/^\$\./, '');
                    const msgsArr = Array.isArray(msgs) ? msgs : [msgs];
                    return `${label}: ${msgsArr.join('. ')}`;
                });
            return parts.join(' | ');
        }

        // Formato simple: { message: "..." }
        if (data.message) return data.message;

        // Formato .NET ProblemDetails: { title: "...", detail: "..." }
        if (data.detail) return data.detail;
        if (data.title) return data.title;

        return fallback || 'Error desconocido';
    }

    async getCarrito() {
        try {
            debugLog('request', { url: 'GET /api/carrito' });
            const response = await axios.get(this.baseURL, { timeout: this.timeout });
            debugLog('response', { url: 'GET /api/carrito', response: response.data });
            return { success: true, data: response.data };
        } catch (error) {
            const data = error.response?.data;
            debugLog('response', { url: 'GET /api/carrito', error: data || error.message });
            return {
                success: false,
                message: this.extractError(data, 'Error al obtener carrito')
            };
        }
    }

    async addItem(productoId, cantidad) {
        try {
            debugLog('request', { url: 'POST /api/carrito/items', body: { productoId, cantidad } });
            const response = await axios.post(
                `${this.baseURL}/items`,
                { productoId, cantidad },
                {
                    timeout: this.timeout,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            debugLog('response', { url: 'POST /api/carrito/items', response: response.data });
            return { success: true, data: response.data };
        } catch (error) {
            const data = error.response?.data;
            debugLog('response', { url: 'POST /api/carrito/items', error: data || error.message });
            if (error.response?.status === 404)
                return { success: false, message: 'Producto no encontrado' };
            return {
                success: false,
                message: this.extractError(data, 'Error al agregar producto')
            };
        }
    }

    async updateItem(productoId, cantidad) {
        try {
            debugLog('request', { url: `PUT /api/carrito/items/${productoId}`, body: { cantidad } });
            const response = await axios.put(
                `${this.baseURL}/items/${productoId}`,
                { cantidad },
                {
                    timeout: this.timeout,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            debugLog('response', { url: `PUT /api/carrito/items/${productoId}`, response: response.data });
            return { success: true, data: response.data };
        } catch (error) {
            const data = error.response?.data;
            debugLog('response', { url: `PUT /api/carrito/items/${productoId}`, error: data || error.message });
            if (error.response?.status === 404)
                return { success: false, message: 'Producto no encontrado en el carrito' };
            return {
                success: false,
                message: this.extractError(data, 'Error al actualizar cantidad')
            };
        }
    }

    async removeItem(productoId) {
        try {
            debugLog('request', { url: `DELETE /api/carrito/items/${productoId}` });
            const response = await axios.delete(
                `${this.baseURL}/items/${productoId}`,
                { timeout: this.timeout }
            );
            debugLog('response', { url: `DELETE /api/carrito/items/${productoId}`, response: response.status });
            return { success: true };
        } catch (error) {
            const data = error.response?.data;
            debugLog('response', { url: `DELETE /api/carrito/items/${productoId}`, error: data || error.message });
            return {
                success: false,
                message: this.extractError(data, 'Error al eliminar producto')
            };
        }
    }

    async clearCarrito() {
        try {
            debugLog('request', { url: 'DELETE /api/carrito' });
            const response = await axios.delete(this.baseURL, { timeout: this.timeout });
            debugLog('response', { url: 'DELETE /api/carrito', response: response.data });
            return { success: true, data: response.data };
        } catch (error) {
            const data = error.response?.data;
            debugLog('response', { url: 'DELETE /api/carrito', error: data || error.message });
            return {
                success: false,
                message: this.extractError(data, 'Error al limpiar carrito')
            };
        }
    }

    async checkout({ fechaEntrega, observaciones, tipoPago }) {
        const body = { fechaEntrega };
        if (observaciones) body.observaciones = observaciones;
        if (tipoPago) body.tipoPago = tipoPago;
        try {
            debugLog('request', { url: 'POST /api/carrito/checkout', body });
            const response = await axios.post(
                `${this.baseURL}/checkout`,
                body,
                {
                    timeout: 15000,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            debugLog('response', { url: 'POST /api/carrito/checkout', response: response.data });
            return { success: true, data: response.data };
        } catch (error) {
            const data = error.response?.data;
            debugLog('response', { url: 'POST /api/carrito/checkout', error: data || error.message });
            if (error.response?.status === 401)
                return { success: false, message: 'Debes iniciar sesión para realizar un pedido' };
            return {
                success: false,
                message: this.extractError(data, 'Error al realizar checkout')
            };
        }
    }

    normalizeFromServer(serverData) {
        if (!serverData || !serverData.items) return [];
        return serverData.items.map(item => ({
            id: item.productoId,
            nombre: item.productoNombre,
            imagenUrl: item.productoImagen,
            categoria: item.productoCategoria,
            precioBase: item.precioUnitario,
            cantidad: item.cantidad,
        }));
    }

    formatForDebug(cartItems) {
        return cartItems.map(i => `${i.nombre} x${i.cantidad}`).join(', ');
    }

    debugMergeDiff(diff) {
        if (!DEBUG) return;
        debugLog('response', {
            url: 'MERGE DIFF',
            diff: {
                toAdd: diff.toAdd.map(i => ({ id: i.id, nombre: i.nombre, cantidad: i.cantidad })),
                toRemove: diff.toRemove.map(i => ({ id: i.productoId, nombre: i.productoNombre })),
                toUpdate: diff.toUpdate.map(i => ({ id: i.id, nombre: i.nombre, cantidad: i.cantidad })),
            }
        });
    }
}

export default new CarritoService();

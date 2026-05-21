import axios from 'axios';
import API_BASE_URL from '../config/api';

const DEBUG = false;

function log(type, data) {
    if (!DEBUG) return;
    const map = { req: 'cyan', res: 'lime', err: 'red' };
    console.log(`%c[AdminPagoService] ${type}`, `color: ${map[type] || 'blue'}`);
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

class AdminPagoService {
    constructor() {
        this.timeout = 10000;
    }

    async getDescuento() {
        try {
            log('req', 'GET /api/admin/configuracion/descuento');
            const r = await axios.get(`${API_BASE_URL}/api/admin/configuracion/descuento`, { timeout: this.timeout });
            log('res', r.data);
            return { success: true, data: r.data };
        } catch (e) {
            log('err', e.response?.data || e.message);
            return { success: false, message: extractError(e.response?.data, 'Error al obtener descuento') };
        }
    }

    async updateDescuento(valor) {
        try {
            log('req', { url: 'PUT /api/admin/configuracion/descuento', body: { valor } });
            const r = await axios.put(`${API_BASE_URL}/api/admin/configuracion/descuento`, { valor }, { timeout: this.timeout });
            log('res', r.data);
            return { success: true, data: r.data };
        } catch (e) {
            log('err', e.response?.data || e.message);
            return { success: false, message: extractError(e.response?.data, 'Error al actualizar descuento') };
        }
    }

    async getDatosBancarios() {
        try {
            log('req', 'GET /api/admin/datos-bancarios');
            const r = await axios.get(`${API_BASE_URL}/api/admin/datos-bancarios`, { timeout: this.timeout });
            log('res', r.data);
            return { success: true, data: r.data };
        } catch (e) {
            log('err', e.response?.data || e.message);
            return { success: false, message: extractError(e.response?.data, 'Error al obtener datos bancarios') };
        }
    }

    async createDatosBancarios(data) {
        try {
            log('req', { url: 'POST /api/admin/datos-bancarios', body: data });
            const r = await axios.post(`${API_BASE_URL}/api/admin/datos-bancarios`, data, {
                timeout: this.timeout,
                headers: { 'Content-Type': 'application/json' }
            });
            log('res', r.data);
            return { success: true, data: r.data };
        } catch (e) {
            log('err', e.response?.data || e.message);
            return { success: false, message: extractError(e.response?.data, 'Error al crear cuenta bancaria') };
        }
    }

    async updateDatosBancarios(id, data) {
        try {
            log('req', { url: `PUT /api/admin/datos-bancarios/${id}`, body: data });
            const r = await axios.put(`${API_BASE_URL}/api/admin/datos-bancarios/${id}`, data, {
                timeout: this.timeout,
                headers: { 'Content-Type': 'application/json' }
            });
            log('res', r.data);
            return { success: true, data: r.data };
        } catch (e) {
            log('err', e.response?.data || e.message);
            return { success: false, message: extractError(e.response?.data, 'Error al actualizar cuenta bancaria') };
        }
    }

    async deleteDatosBancarios(id) {
        try {
            log('req', `DELETE /api/admin/datos-bancarios/${id}`);
            await axios.delete(`${API_BASE_URL}/api/admin/datos-bancarios/${id}`, { timeout: this.timeout });
            log('res', '204 No Content');
            return { success: true };
        } catch (e) {
            log('err', e.response?.data || e.message);
            return { success: false, message: extractError(e.response?.data, 'Error al eliminar cuenta bancaria') };
        }
    }

    async getDireccionRetiro() {
        try {
            log('req', 'GET /api/admin/direccion-retiro');
            const r = await axios.get(`${API_BASE_URL}/api/admin/direccion-retiro`, { timeout: this.timeout });
            log('res', r.data);
            return { success: true, data: r.data };
        } catch (e) {
            log('err', e.response?.data || e.message);
            return { success: false, message: extractError(e.response?.data, 'Error al obtener dirección') };
        }
    }

    async updateDireccionRetiro(data) {
        try {
            log('req', { url: 'PUT /api/admin/direccion-retiro', body: data });
            const r = await axios.put(`${API_BASE_URL}/api/admin/direccion-retiro`, data, {
                timeout: this.timeout,
                headers: { 'Content-Type': 'application/json' }
            });
            log('res', r.data);
            return { success: true, data: r.data };
        } catch (e) {
            log('err', e.response?.data || e.message);
            return { success: false, message: extractError(e.response?.data, 'Error al actualizar dirección') };
        }
    }
}

export default new AdminPagoService();

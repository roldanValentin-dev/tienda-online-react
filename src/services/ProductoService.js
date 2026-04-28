/**
 * SERVICIO DE PRODUCTOS - CRUD COMPLETO
 * Maneja todas las operaciones CRUD de productos para el panel administrativo
 * Endpoints: GET/POST/PUT/DELETE /api/productos
 */

import axios from 'axios';
import API_BASE_URL from '../config/api';

class ProductoService {
    constructor() {
        this.timeout = 10000;
    }

    /**
     * Obtiene todos los productos (Admin/Vendedor)
     * @returns {Promise<Object>} - { success: boolean, data?: Array, message?: string }
     */
    async getAllProductos() {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/productos`,
                { timeout: this.timeout }
            );
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error al obtener productos:', error);
            
            if (error.response?.status === 401) {
                return { success: false, message: 'Debes iniciar sesión' };
            }
            
            return {
                success: false,
                message: error.response?.data?.message || 'Error al cargar productos'
            };
        }
    }

    /**
     * Obtiene un producto por ID (Admin/Vendedor)
     * @param {number} id - ID del producto
     * @returns {Promise<Object>} - { success: boolean, data?: Object, message?: string }
     */
    async getProductoById(id) {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/productos/${id}`,
                { timeout: this.timeout }
            );
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error al obtener producto:', error);
            
            if (error.response?.status === 404) {
                return { success: false, message: 'Producto no encontrado' };
            }
            if (error.response?.status === 401) {
                return { success: false, message: 'Debes iniciar sesión' };
            }
            
            return {
                success: false,
                message: error.response?.data?.message || 'Error al cargar producto'
            };
        }
    }

    /**
     * Crea un nuevo producto (Admin)
     * @param {Object} data - Datos del producto
     * @returns {Promise<Object>} - { success: boolean, data?: Object, message?: string }
     */
    async createProducto(data) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/productos`,
                data,
                {
                    timeout: this.timeout,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error al crear producto:', error);
            
            if (error.response?.status === 400) {
                return { 
                    success: false, 
                    message: error.response.data?.message || 'Datos inválidos' 
                };
            }
            if (error.response?.status === 401) {
                return { success: false, message: 'Debes iniciar sesión' };
            }
            if (error.response?.status === 403) {
                return { success: false, message: 'No tienes permisos para crear productos' };
            }
            
            return {
                success: false,
                message: error.response?.data?.message || 'Error al crear producto'
            };
        }
    }

    /**
     * Actualiza un producto existente (Admin)
     * @param {number} id - ID del producto
     * @param {Object} data - Datos a actualizar
     * @returns {Promise<Object>} - { success: boolean, data?: Object, message?: string }
     */
    async updateProducto(id, data) {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/api/productos/${id}`,
                data,
                {
                    timeout: this.timeout,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            
            if (error.response?.status === 404) {
                return { success: false, message: 'Producto no encontrado' };
            }
            if (error.response?.status === 400) {
                return { 
                    success: false, 
                    message: error.response.data?.message || 'Datos inválidos' 
                };
            }
            if (error.response?.status === 401) {
                return { success: false, message: 'Debes iniciar sesión' };
            }
            if (error.response?.status === 403) {
                return { success: false, message: 'No tienes permisos para actualizar productos' };
            }
            
            return {
                success: false,
                message: error.response?.data?.message || 'Error al actualizar producto'
            };
        }
    }

    /**
     * Actualiza solo el stock de un producto (Admin)
     * @param {number} id - ID del producto
     * @param {number} stock - Nueva cantidad en stock
     * @param {number} stockMinimo - Nuevo stock mínimo
     * @returns {Promise<Object>} - { success: boolean, data?: Object, message?: string }
     */
    async updateStock(id, stock, stockMinimo) {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/api/productos/${id}/stock`,
                { stock, stockMinimo },
                {
                    timeout: this.timeout,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error al actualizar stock:', error);
            
            if (error.response?.status === 404) {
                return { success: false, message: 'Producto no encontrado' };
            }
            if (error.response?.status === 400) {
                return { 
                    success: false, 
                    message: error.response.data?.message || 'Valores de stock inválidos' 
                };
            }
            if (error.response?.status === 401) {
                return { success: false, message: 'Debes iniciar sesión' };
            }
            if (error.response?.status === 403) {
                return { success: false, message: 'No tienes permisos para actualizar stock' };
            }
            
            return {
                success: false,
                message: error.response?.data?.message || 'Error al actualizar stock'
            };
        }
    }

    /**
     * Elimina un producto de forma permanente (Admin)
     * @param {number} id - ID del producto
     * @returns {Promise<Object>} - { success: boolean, message?: string }
     */
    async deleteProducto(id) {
        try {
            await axios.delete(
                `${API_BASE_URL}/api/productos/${id}`,
                { timeout: this.timeout }
            );
            return { success: true };
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            
            if (error.response?.status === 404) {
                return { success: false, message: 'Producto no encontrado' };
            }
            if (error.response?.status === 400) {
                return { 
                    success: false, 
                    message: 'No se puede eliminar el producto (tiene ventas o pedidos asociados)' 
                };
            }
            if (error.response?.status === 401) {
                return { success: false, message: 'Debes iniciar sesión' };
            }
            if (error.response?.status === 403) {
                return { success: false, message: 'No tienes permisos para eliminar productos' };
            }
            
            return {
                success: false,
                message: error.response?.data?.message || 'Error al eliminar producto'
            };
        }
    }
}

// Exportar instancia única (Singleton)
export default new ProductoService();
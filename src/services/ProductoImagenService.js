/**
 * SERVICIO DE IMÁGENES DE PRODUCTOS
 * Maneja todas las operaciones relacionadas con imágenes múltiples de productos
 * Endpoints: GET/POST/PUT/DELETE /api/productos/{productoId}/imagenes
 */

import axios from 'axios';
import API_BASE_URL from '../config/api';

class ProductoImagenService {
    constructor() {
        this.timeout = 10000;
        this.uploadTimeout = 15000;
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    }

    /**
     * Valida un archivo de imagen antes de subirlo
     * @param {File} file - Archivo a validar
     * @returns {Object} - { valid: boolean, error?: string }
     */
    validateImageFile(file) {
        if (!file) {
            return { valid: false, error: 'No se seleccionó ningún archivo' };
        }

        // Validar tamaño
        if (file.size > this.maxFileSize) {
            return { 
                valid: false, 
                error: `El archivo excede el tamaño máximo de ${this.maxFileSize / 1024 / 1024}MB` 
            };
        }

        // Validar extensión
        const extension = file.name.split('.').pop().toLowerCase();
        if (!this.allowedExtensions.includes(extension)) {
            return { 
                valid: false, 
                error: `Extensión no permitida. Permitidas: ${this.allowedExtensions.join(', ')}` 
            };
        }

        return { valid: true };
    }

    /**
     * Obtiene todas las imágenes de un producto
     * @param {number} productoId - ID del producto
     * @returns {Promise<Object>} - { success: boolean, data?: Array, message?: string }
     */
    async getImagenesByProductoId(productoId) {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/productos/${productoId}/imagenes`,
                { timeout: this.timeout }
            );
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error al obtener imágenes:', error);
            
            if (error.response?.status === 404) {
                return { success: false, message: 'Producto no encontrado' };
            }
            
            return {
                success: false,
                message: error.response?.data?.message || 'Error al cargar imágenes del producto'
            };
        }
    }

    /**
     * Sube una nueva imagen para un producto
     * @param {number} productoId - ID del producto
     * @param {File} file - Archivo de imagen
     * @param {number} orden - Orden de visualización (default: 0)
     * @param {boolean} esPrincipal - Si es la imagen principal (default: false)
     * @returns {Promise<Object>} - { success: boolean, data?: Object, message?: string }
     */
    async uploadImagen(productoId, file, orden = 0, esPrincipal = false) {
        try {
            // Validar archivo antes de enviar
            const validation = this.validateImageFile(file);
            if (!validation.valid) {
                return { success: false, message: validation.error };
            }

            // Crear FormData
            const formData = new FormData();
            formData.append('file', file);
            formData.append('orden', orden.toString());
            formData.append('esPrincipal', esPrincipal.toString());

            // Enviar petición (NO incluir Content-Type, axios lo configura automáticamente)
            const response = await axios.post(
                `${API_BASE_URL}/api/productos/${productoId}/imagenes`,
                formData,
                { 
                    timeout: this.uploadTimeout
                    // NO incluir headers: { 'Content-Type': 'multipart/form-data' }
                }
            );

            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error al subir imagen:', error);
            
            if (error.response?.status === 400) {
                const backendMessage = error.response.data?.message || error.response.data?.title;
                return { 
                    success: false, 
                    message: backendMessage || 'Archivo inválido o datos incorrectos' 
                };
            }
            if (error.response?.status === 401) {
                return { success: false, message: 'Debes iniciar sesión para subir imágenes' };
            }
            if (error.response?.status === 404) {
                return { success: false, message: 'Producto no encontrado' };
            }
            
            return {
                success: false,
                message: error.response?.data?.message || 'Error al subir imagen. Intenta nuevamente.'
            };
        }
    }

    /**
     * Actualiza las propiedades de una imagen (orden, esPrincipal)
     * @param {number} productoId - ID del producto
     * @param {number} imagenId - ID de la imagen
     * @param {number} orden - Nuevo orden
     * @param {boolean} esPrincipal - Si es la imagen principal
     * @returns {Promise<Object>} - { success: boolean, data?: Object, message?: string }
     */
    async updateImagen(productoId, imagenId, orden, esPrincipal) {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/api/productos/${productoId}/imagenes/${imagenId}`,
                { orden, esPrincipal },
                { 
                    timeout: this.timeout,
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error al actualizar imagen:', error);
            
            if (error.response?.status === 404) {
                return { success: false, message: 'Imagen o producto no encontrado' };
            }
            if (error.response?.status === 401) {
                return { success: false, message: 'Debes iniciar sesión para actualizar imágenes' };
            }
            
            return {
                success: false,
                message: error.response?.data?.message || 'Error al actualizar imagen'
            };
        }
    }

    /**
     * Elimina una imagen de forma permanente
     * @param {number} productoId - ID del producto
     * @param {number} imagenId - ID de la imagen
     * @returns {Promise<Object>} - { success: boolean, message?: string }
     */
    async deleteImagen(productoId, imagenId) {
        try {
            await axios.delete(
                `${API_BASE_URL}/api/productos/${productoId}/imagenes/${imagenId}`,
                { timeout: this.timeout }
            );

            return { success: true };
        } catch (error) {
            console.error('Error al eliminar imagen:', error);
            
            if (error.response?.status === 404) {
                return { success: false, message: 'Imagen no encontrada' };
            }
            if (error.response?.status === 401) {
                return { success: false, message: 'Debes iniciar sesión para eliminar imágenes' };
            }
            
            return {
                success: false,
                message: error.response?.data?.message || 'Error al eliminar imagen'
            };
        }
    }
}

// Exportar instancia única (Singleton)
export default new ProductoImagenService();

import axios from 'axios';

/**
 * Servicio singleton para gestionar el perfil del cliente online
 * Consume endpoints de /api/clientes-online/perfil
 */
class PerfilService {
  constructor() {
    this.baseURL = 'http://localhost:7097/api/clientes-online';
    this.timeout = 10000;
  }

  /**
   * Obtiene los datos del perfil del usuario autenticado
   * @returns {Promise<Object>} Datos del perfil (nombre, apellido, email, telefono, direccion)
   * @throws {Error} Si hay error en la petición o el usuario no está autenticado
   */
  async getPerfil() {
    try {
      const response = await axios.get(`${this.baseURL}/perfil`, {
        timeout: this.timeout
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          case 404:
            throw new Error('Perfil no encontrado.');
          default:
            throw new Error('Error al cargar el perfil. Intenta nuevamente.');
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Tiempo de espera agotado. Verifica tu conexión.');
      } else {
        throw new Error('Error de conexión. Verifica que el servidor esté disponible.');
      }
    }
  }

  /**
   * Actualiza los datos del perfil del usuario autenticado
   * @param {Object} datosActualizados - Datos a actualizar (nombre, apellido, telefono, direccion)
   * @returns {Promise<Object>} Datos del perfil actualizado
   * @throws {Error} Si hay error en la petición o validación
   */
  async updatePerfil(datosActualizados) {
    try {
      const response = await axios.put(`${this.baseURL}/perfil`, datosActualizados, {
        timeout: this.timeout
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            throw new Error(error.response.data?.message || 'Datos inválidos. Verifica la información.');
          case 401:
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          case 404:
            throw new Error('Perfil no encontrado.');
          default:
            throw new Error('Error al actualizar el perfil. Intenta nuevamente.');
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Tiempo de espera agotado. Verifica tu conexión.');
      } else {
        throw new Error('Error de conexión. Verifica que el servidor esté disponible.');
      }
    }
  }

  /**
   * Cambia la contraseña del usuario autenticado
   * @param {string} passwordActual - Contraseña actual
   * @param {string} passwordNueva - Nueva contraseña
   * @returns {Promise<Object>} Respuesta del servidor
   * @throws {Error} Si hay error en la petición o la contraseña actual es incorrecta
   */
  async cambiarPassword(passwordActual, passwordNueva) {
    try {
      const response = await axios.put(
        `${this.baseURL}/cambiar-password`,
        {
          passwordActual,
          passwordNueva
        },
        {
          timeout: this.timeout
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            throw new Error(error.response.data?.message || 'Contraseña actual incorrecta.');
          case 401:
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          default:
            throw new Error('Error al cambiar la contraseña. Intenta nuevamente.');
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Tiempo de espera agotado. Verifica tu conexión.');
      } else {
        throw new Error('Error de conexión. Verifica que el servidor esté disponible.');
      }
    }
  }
}

// Exportar instancia única del servicio
export default new PerfilService();

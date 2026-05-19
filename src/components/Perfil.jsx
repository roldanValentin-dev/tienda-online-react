import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PerfilService from '../services/PerfilService';
import { validatePasswordStrength, validatePhone } from '../security';
import Swal from 'sweetalert2';
import '../style/perfil.css';

/**
 * Componente de perfil de usuario
 * Permite ver y editar datos personales, y cambiar contraseña
 */
const Perfil = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estado para tabs
  const [activeTab, setActiveTab] = useState('datos');

  // Estado para datos personales
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Estado para formulario de datos personales
  const [formDatos, setFormDatos] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: ''
  });

  // Estado para formulario de cambio de contraseña
  const [formPassword, setFormPassword] = useState({
    passwordActual: '',
    passwordNueva: '',
    confirmarPassword: ''
  });
  const [cambiandoPassword, setCambiandoPassword] = useState(false);
  const [mostrarPasswords, setMostrarPasswords] = useState({
    actual: false,
    nueva: false,
    confirmar: false
  });

  // Errores de validación
  const [errores, setErrores] = useState({});

  /**
   * Verifica autenticación y carga datos del perfil al montar el componente
   */
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    cargarPerfil();
  }, [user, navigate]);

  /**
   * Carga los datos del perfil desde la API
   */
  const cargarPerfil = async () => {
    try {
      setLoading(true);
      const data = await PerfilService.getPerfil();
      
      setPerfil(data);
      setFormDatos({
        nombre: data.nombre || '',
        apellido: data.apellido || '',
        telefono: data.telefono || '',
        direccion: data.direccion || ''
      });
    } catch (error) {
      // Si es 404, probablemente es un usuario Admin sin ClienteOnline
      if (error.message.includes('Perfil no encontrado')) {
        Swal.fire({
          icon: 'warning',
          title: 'Perfil no disponible',
          text: 'Esta funcionalidad solo está disponible para clientes. Los usuarios administradores no tienen perfil de cliente.',
          confirmButtonText: 'Entendido'
        }).then(() => {
          navigate('/');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message
        });
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja cambios en el formulario de datos personales
   */
  const handleDatosChange = (e) => {
    const { name, value } = e.target;
    setFormDatos(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Maneja cambios en el formulario de cambio de contraseña
   */
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setFormPassword(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Valida el formulario de datos personales
   * @returns {boolean} true si es válido, false si hay errores
   */
  const validarDatos = () => {
    const nuevosErrores = {};

    if (!formDatos.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    } else if (formDatos.nombre.length < 2) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formDatos.apellido.trim()) {
      nuevosErrores.apellido = 'El apellido es requerido';
    } else if (formDatos.apellido.length < 2) {
      nuevosErrores.apellido = 'El apellido debe tener al menos 2 caracteres';
    }

    if (formDatos.telefono && !validatePhone(formDatos.telefono)) {
      nuevosErrores.telefono = 'Teléfono inválido (formato: +54 9 11 1234-5678)';
    }

    if (!formDatos.direccion.trim()) {
      nuevosErrores.direccion = 'La dirección es requerida';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  /**
   * Valida el formulario de cambio de contraseña
   * @returns {boolean} true si es válido, false si hay errores
   */
  const validarPassword = () => {
    const nuevosErrores = {};

    if (!formPassword.passwordActual) {
      nuevosErrores.passwordActual = 'La contraseña actual es requerida';
    }

    if (!formPassword.passwordNueva) {
      nuevosErrores.passwordNueva = 'La nueva contraseña es requerida';
    } else {
      const validacion = validatePasswordStrength(formPassword.passwordNueva);
      if (!validacion.isValid) {
        nuevosErrores.passwordNueva = validacion.errors.join('. ');
      }
    }

    if (!formPassword.confirmarPassword) {
      nuevosErrores.confirmarPassword = 'Debes confirmar la nueva contraseña';
    } else if (formPassword.passwordNueva !== formPassword.confirmarPassword) {
      nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  /**
   * Guarda los cambios en los datos personales
   */
  const handleGuardarDatos = async (e) => {
    e.preventDefault();

    if (!validarDatos()) return;

    try {
      setGuardando(true);
      const datosActualizados = await PerfilService.updatePerfil(formDatos);
      
      // Actualizar el estado local con los datos devueltos por el servidor
      setPerfil(datosActualizados);
      setFormDatos({
        nombre: datosActualizados.nombre || '',
        apellido: datosActualizados.apellido || '',
        telefono: datosActualizados.telefono || '',
        direccion: datosActualizados.direccion || ''
      });
      
      Swal.fire({
        icon: 'success',
        title: '¡Perfil actualizado!',
        text: 'Tus datos se guardaron correctamente',
        timer: 2000,
        showConfirmButton: false
      });

      setEditando(false);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });
    } finally {
      setGuardando(false);
    }
  };

  /**
   * Cancela la edición de datos personales
   */
  const handleCancelarEdicion = () => {
    setFormDatos({
      nombre: perfil.nombre || '',
      apellido: perfil.apellido || '',
      telefono: perfil.telefono || '',
      direccion: perfil.direccion || ''
    });
    setErrores({});
    setEditando(false);
  };

  /**
   * Alterna la visibilidad de un campo de contraseña
   */
  const togglePasswordVisibility = (campo) => {
    setMostrarPasswords(prev => ({
      ...prev,
      [campo]: !prev[campo]
    }));
  };

  /**
   * Cambia la contraseña del usuario
   */
  const handleCambiarPassword = async (e) => {
    e.preventDefault();

    if (!validarPassword()) return;

    try {
      setCambiandoPassword(true);
      await PerfilService.cambiarPassword(
        formPassword.passwordActual,
        formPassword.passwordNueva
      );

      Swal.fire({
        icon: 'success',
        title: '¡Contraseña actualizada!',
        text: 'Tu contraseña se cambió correctamente',
        timer: 2000,
        showConfirmButton: false
      });

      // Limpiar formulario
      setFormPassword({
        passwordActual: '',
        passwordNueva: '',
        confirmarPassword: ''
      });
      setErrores({});
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });
    } finally {
      setCambiandoPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="perfil-container">
        <div className="perfil-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <h1>Mi Perfil</h1>
        <p className="perfil-email">{perfil?.email}</p>
      </div>

      {/* Tabs */}
      <div className="perfil-tabs">
        <button
          className={`perfil-tab ${activeTab === 'datos' ? 'active' : ''}`}
          onClick={() => setActiveTab('datos')}
        >
          Datos Personales
        </button>
        <button
          className={`perfil-tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Cambiar Contraseña
        </button>
      </div>

      {/* Tab: Datos Personales */}
      {activeTab === 'datos' && (
        <div className="perfil-content">
          <form onSubmit={handleGuardarDatos}>
            <div className="perfil-form-group">
              <label htmlFor="nombre">Nombre *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formDatos.nombre}
                onChange={handleDatosChange}
                disabled={!editando}
                className={errores.nombre ? 'error' : ''}
              />
              {errores.nombre && <span className="error-message">{errores.nombre}</span>}
            </div>

            <div className="perfil-form-group">
              <label htmlFor="apellido">Apellido *</label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formDatos.apellido}
                onChange={handleDatosChange}
                disabled={!editando}
                className={errores.apellido ? 'error' : ''}
              />
              {errores.apellido && <span className="error-message">{errores.apellido}</span>}
            </div>

            <div className="perfil-form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formDatos.telefono}
                onChange={handleDatosChange}
                disabled={!editando}
                placeholder="+54 9 11 1234-5678"
                className={errores.telefono ? 'error' : ''}
              />
              {errores.telefono && <span className="error-message">{errores.telefono}</span>}
            </div>

            <div className="perfil-form-group">
              <label htmlFor="direccion">Dirección *</label>
              <textarea
                id="direccion"
                name="direccion"
                value={formDatos.direccion}
                onChange={handleDatosChange}
                disabled={!editando}
                rows="3"
                className={errores.direccion ? 'error' : ''}
              />
              {errores.direccion && <span className="error-message">{errores.direccion}</span>}
            </div>

            <div className="perfil-actions">
              {!editando ? (
                <button
                  type="button"
                  className="btn-editar"
                  onClick={() => setEditando(true)}
                >
                  Editar Datos
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn-cancelar"
                    onClick={handleCancelarEdicion}
                    disabled={guardando}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-guardar"
                    disabled={guardando}
                  >
                    {guardando ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Tab: Cambiar Contraseña */}
      {activeTab === 'password' && (
        <div className="perfil-content">
          <form onSubmit={handleCambiarPassword}>
            <div className="perfil-form-group">
              <label htmlFor="passwordActual">Contraseña Actual *</label>
              <div className="password-input-wrapper">
                <input
                  type={mostrarPasswords.actual ? 'text' : 'password'}
                  id="passwordActual"
                  name="passwordActual"
                  value={formPassword.passwordActual}
                  onChange={handlePasswordChange}
                  className={errores.passwordActual ? 'error' : ''}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => togglePasswordVisibility('actual')}
                  aria-label={mostrarPasswords.actual ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <i className={`bi ${mostrarPasswords.actual ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
              {errores.passwordActual && (
                <span className="error-message">{errores.passwordActual}</span>
              )}
            </div>

            <div className="perfil-form-group">
              <label htmlFor="passwordNueva">Nueva Contraseña *</label>
              <div className="password-input-wrapper">
                <input
                  type={mostrarPasswords.nueva ? 'text' : 'password'}
                  id="passwordNueva"
                  name="passwordNueva"
                  value={formPassword.passwordNueva}
                  onChange={handlePasswordChange}
                  className={errores.passwordNueva ? 'error' : ''}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => togglePasswordVisibility('nueva')}
                  aria-label={mostrarPasswords.nueva ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <i className={`bi ${mostrarPasswords.nueva ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
              {errores.passwordNueva && (
                <span className="error-message">{errores.passwordNueva}</span>
              )}
              <small className="form-hint">
                Mínimo 8 caracteres, incluye mayúsculas, minúsculas, números y símbolos
              </small>
            </div>

            <div className="perfil-form-group">
              <label htmlFor="confirmarPassword">Confirmar Nueva Contraseña *</label>
              <div className="password-input-wrapper">
                <input
                  type={mostrarPasswords.confirmar ? 'text' : 'password'}
                  id="confirmarPassword"
                  name="confirmarPassword"
                  value={formPassword.confirmarPassword}
                  onChange={handlePasswordChange}
                  className={errores.confirmarPassword ? 'error' : ''}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => togglePasswordVisibility('confirmar')}
                  aria-label={mostrarPasswords.confirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <i className={`bi ${mostrarPasswords.confirmar ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
              {errores.confirmarPassword && (
                <span className="error-message">{errores.confirmarPassword}</span>
              )}
            </div>

            <div className="perfil-actions">
              <button
                type="submit"
                className="btn-guardar"
                disabled={cambiandoPassword}
              >
                {cambiandoPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Perfil;

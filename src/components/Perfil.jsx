import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PerfilService from '../services/PerfilService';
import { validatePasswordStrength, validatePhone } from '../security';
import Swal from 'sweetalert2';
import '../style/perfil.css';

const Perfil = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('datos');
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formDatos, setFormDatos] = useState({ nombre: '', apellido: '', telefono: '', direccion: '' });
  const [formPassword, setFormPassword] = useState({ passwordActual: '', passwordNueva: '', confirmarPassword: '' });
  const [cambiandoPassword, setCambiandoPassword] = useState(false);
  const [mostrarPasswords, setMostrarPasswords] = useState({ actual: false, nueva: false, confirmar: false });
  const [errores, setErrores] = useState({});

  const cargarPerfil = useCallback(async () => {
    try {
      setLoading(true);
      const data = await PerfilService.getPerfil();
      setPerfil(data);
      setFormDatos({ nombre: data.nombre || '', apellido: data.apellido || '', telefono: data.telefono || '', direccion: data.direccion || '' });
    } catch (error) {
      if (error.message.includes('Perfil no encontrado')) {
        Swal.fire({ icon: 'warning', title: 'Perfil no disponible', text: 'Solo para clientes registrados.', confirmButtonText: 'Entendido', confirmButtonColor: '#c9a84c' }).then(() => navigate('/'));
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#c9a84c' });
      }
    } finally { setLoading(false); }
  }, [navigate]);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    cargarPerfil();
  }, [user, navigate, cargarPerfil]);

  const handleDatosChange = (e) => {
    const { name, value } = e.target;
    setFormDatos(prev => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setFormPassword(prev => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
  };

  const validarDatos = () => {
    const e = {};
    if (!formDatos.nombre.trim()) e.nombre = 'Requerido';
    else if (formDatos.nombre.length < 2) e.nombre = 'Mínimo 2 caracteres';
    if (!formDatos.apellido.trim()) e.apellido = 'Requerido';
    else if (formDatos.apellido.length < 2) e.apellido = 'Mínimo 2 caracteres';
    if (formDatos.telefono && !validatePhone(formDatos.telefono)) e.telefono = 'Formato inválido';
    if (!formDatos.direccion.trim()) e.direccion = 'Requerida';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const validarPassword = () => {
    const e = {};
    if (!formPassword.passwordActual) e.passwordActual = 'Requerida';
    if (!formPassword.passwordNueva) e.passwordNueva = 'Requerida';
    else {
      const v = validatePasswordStrength(formPassword.passwordNueva);
      if (!v.isValid) e.passwordNueva = v.errors.join('. ');
    }
    if (!formPassword.confirmarPassword) e.confirmarPassword = 'Requerida';
    else if (formPassword.passwordNueva !== formPassword.confirmarPassword) e.confirmarPassword = 'No coinciden';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardarDatos = async (e) => {
    e.preventDefault();
    if (!validarDatos()) return;
    try {
      setGuardando(true);
      const data = await PerfilService.updatePerfil(formDatos);
      setPerfil(data);
      setFormDatos({ nombre: data.nombre || '', apellido: data.apellido || '', telefono: data.telefono || '', direccion: data.direccion || '' });
      Swal.fire({ icon: 'success', title: '¡Perfil actualizado!', timer: 2000, showConfirmButton: false, confirmButtonColor: '#c9a84c' });
      setEditando(false);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#c9a84c' });
    } finally { setGuardando(false); }
  };

  const handleCancelarEdicion = () => {
    setFormDatos({ nombre: perfil.nombre || '', apellido: perfil.apellido || '', telefono: perfil.telefono || '', direccion: perfil.direccion || '' });
    setErrores({});
    setEditando(false);
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    if (!validarPassword()) return;
    try {
      setCambiandoPassword(true);
      await PerfilService.cambiarPassword(formPassword.passwordActual, formPassword.passwordNueva);
      Swal.fire({ icon: 'success', title: '¡Contraseña actualizada!', timer: 2000, showConfirmButton: false, confirmButtonColor: '#c9a84c' });
      setFormPassword({ passwordActual: '', passwordNueva: '', confirmarPassword: '' });
      setErrores({});
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#c9a84c' });
    } finally { setCambiandoPassword(false); }
  };

  if (loading) {
    return <div className="at-perfil"><div className="loading-container"><div className="spinner"></div><p style={{ marginTop: 16 }}>Cargando perfil...</p></div></div>;
  }

  return (
    <div className="at-perfil">
      <div className="at-perfil-header">
        <h1>Mi Perfil</h1>
        <p className="at-perfil-email">{perfil?.email}</p>
      </div>
      <div className="at-perfil-tabs">
        <button className={`at-perfil-tab ${activeTab === 'datos' ? 'is-active' : ''}`} onClick={() => setActiveTab('datos')}>Datos Personales</button>
        <button className={`at-perfil-tab ${activeTab === 'password' ? 'is-active' : ''}`} onClick={() => setActiveTab('password')}>Cambiar Contraseña</button>
      </div>

      {activeTab === 'datos' && (
        <div className="at-perfil-content">
          <form onSubmit={handleGuardarDatos}>
            {['nombre', 'apellido', 'telefono', 'direccion'].map(field => (
              <div key={field} className="at-perfil-form-group">
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}{field !== 'telefono' ? ' *' : ''}</label>
                {field === 'direccion' ? (
                  <textarea className={`at-perfil-input ${errores[field] ? 'error' : ''}`} id={field} name={field}
                    value={formDatos[field]} onChange={handleDatosChange} disabled={!editando} rows={3} />
                ) : (
                  <input type={field === 'telefono' ? 'tel' : 'text'} className={`at-perfil-input ${errores[field] ? 'error' : ''}`}
                    id={field} name={field} value={formDatos[field]} onChange={handleDatosChange} disabled={!editando}
                    placeholder={field === 'telefono' ? '+54 9 11 1234-5678' : ''} />
                )}
                {errores[field] && <span className="at-perfil-error">{errores[field]}</span>}
              </div>
            ))}
            <div className="at-perfil-actions">
              {!editando ? (
                <button type="button" className="at-perfil-btn gold" onClick={() => setEditando(true)}>Editar Datos</button>
              ) : (
                <>
                  <button type="button" className="at-perfil-btn ghost" onClick={handleCancelarEdicion} disabled={guardando}>Cancelar</button>
                  <button type="submit" className="at-perfil-btn gold" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar Cambios'}</button>
                </>
              )}
            </div>
          </form>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="at-perfil-content">
          <form onSubmit={handleCambiarPassword}>
            {[
              { key: 'passwordActual', label: 'Contraseña Actual', show: mostrarPasswords.actual, toggle: () => setMostrarPasswords(p => ({ ...p, actual: !p.actual })) },
              { key: 'passwordNueva', label: 'Nueva Contraseña', show: mostrarPasswords.nueva, toggle: () => setMostrarPasswords(p => ({ ...p, nueva: !p.nueva })) },
              { key: 'confirmarPassword', label: 'Confirmar Contraseña', show: mostrarPasswords.confirmar, toggle: () => setMostrarPasswords(p => ({ ...p, confirmar: !p.confirmar })) },
            ].map(f => (
              <div key={f.key} className="at-perfil-form-group">
                <label>{f.label} *</label>
                <div className="at-perfil-password-wrapper">
                  <input type={f.show ? 'text' : 'password'} className={`at-perfil-input ${errores[f.key] ? 'error' : ''}`}
                    name={f.key} value={formPassword[f.key]} onChange={handlePasswordChange} />
                  <button type="button" className="at-perfil-toggle-pw" onClick={f.toggle} aria-label="Mostrar/ocultar">
                    <i className={`bi ${f.show ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
                {errores[f.key] && <span className="at-perfil-error">{errores[f.key]}</span>}
                {f.key === 'passwordNueva' && <span className="at-perfil-hint">Mínimo 8 caracteres, mayúsculas, minúsculas, números y símbolos</span>}
              </div>
            ))}
            <div className="at-perfil-actions">
              <button type="submit" className="at-perfil-btn gold" disabled={cambiandoPassword}>
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

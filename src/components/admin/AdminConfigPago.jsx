import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import AdminPagoService from '../../services/AdminPagoService';
import '../../admin.css';

function AdminConfigPago() {
    const [tab, setTab] = useState('descuento');

    return (
        <div className="admin-config-pago">
            <div className="config-header">
                <h2><i className="bi bi-gear"></i> Configuración de Pagos</h2>
            </div>

            <div className="config-tabs">
                <button className={`config-tab ${tab === 'descuento' ? 'active' : ''}`} onClick={() => setTab('descuento')}>
                    <i className="bi bi-percent"></i> Descuento
                </button>
                <button className={`config-tab ${tab === 'bancos' ? 'active' : ''}`} onClick={() => setTab('bancos')}>
                    <i className="bi bi-bank"></i> Datos Bancarios
                </button>
                <button className={`config-tab ${tab === 'direccion' ? 'active' : ''}`} onClick={() => setTab('direccion')}>
                    <i className="bi bi-geo-alt"></i> Dirección de Retiro
                </button>
            </div>

            <div className="config-content">
                {tab === 'descuento' && <SeccionDescuento />}
                {tab === 'bancos' && <SeccionBancos />}
                {tab === 'direccion' && <SeccionDireccion />}
            </div>
        </div>
    );
}

function SeccionDescuento() {
    const [valor, setValor] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            const r = await AdminPagoService.getDescuento();
            if (r.success) setValor(String(r.data.valor ?? r.data));
            else toast.error(r.message);
            setLoading(false);
        };
        load();
    }, []);

    const handleSave = async () => {
        const num = parseInt(valor);
        if (isNaN(num) || num < 0 || num > 100) {
            toast.error('Ingresá un valor entre 0 y 100');
            return;
        }
        setSaving(true);
        const r = await AdminPagoService.updateDescuento(valor);
        setSaving(false);
        if (r.success) toast.success('Descuento actualizado');
        else toast.error(r.message);
    };

    if (loading) return <div className="config-loading"><div className="spinner-border" /></div>;

    return (
        <div className="config-card">
            <div className="config-card-header">
                <i className="bi bi-percent"></i>
                <h3>Descuento por pago en Efectivo o Transferencia</h3>
            </div>
            <p className="config-desc">Se aplica automáticamente al hacer checkout con Efectivo o Transferencia.</p>
            <div className="config-field">
                <label>Porcentaje de descuento</label>
                <div className="input-group-config">
                    <input
                        type="number"
                        className="form-input-config"
                        min="0"
                        max="100"
                        value={valor}
                        onChange={e => setValor(e.target.value)}
                    />
                    <span className="input-suffix">%</span>
                </div>
            </div>
            <button className="btn-save-config" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
            </button>
        </div>
    );
}

function SeccionBancos() {
    const [cuentas, setCuentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);

    const cargar = async () => {
        const r = await AdminPagoService.getDatosBancarios();
        if (r.success) setCuentas(Array.isArray(r.data) ? r.data : []);
        else toast.error(r.message);
        setLoading(false);
    };

    useEffect(() => { cargar(); }, []);

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: '¿Eliminar cuenta?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Eliminar',
        });
        if (!confirm.isConfirmed) return;
        const r = await AdminPagoService.deleteDatosBancarios(id);
        if (r.success) { toast.success('Cuenta eliminada'); cargar(); }
        else toast.error(r.message);
    };

    return (
        <div className="config-card">
            <div className="config-card-header">
                <i className="bi bi-bank"></i>
                <h3>Datos Bancarios para Transferencia</h3>
            </div>
            <p className="config-desc">Estos datos se muestran al cliente cuando elige pagar por transferencia.</p>

            {loading ? (
                <div className="config-loading"><div className="spinner-border" /></div>
            ) : (
                <>
                    {cuentas.length === 0 && !showForm && (
                        <div className="empty-bancos">
                            <p>No hay cuentas bancarias configuradas.</p>
                        </div>
                    )}

                    {cuentas.map(cuenta => (
                        <div key={cuenta.id} className="banco-card">
                            <div className="banco-grid">
                                <div><span className="banco-label">Banco</span><span>{cuenta.banco}</span></div>
                                <div><span className="banco-label">Titular</span><span>{cuenta.titular}</span></div>
                                <div><span className="banco-label">Tipo</span><span>{cuenta.tipoCuenta}</span></div>
                                <div><span className="banco-label">N° Cuenta</span><span>{cuenta.numeroCuenta}</span></div>
                                <div><span className="banco-label">CVU</span><span className="mono">{cuenta.cvu}</span></div>
                                <div><span className="banco-label">Alias</span><span className="mono">{cuenta.alias}</span></div>
                            </div>
                            <div className="banco-acciones">
                                <button className="btn-edit-banco" onClick={() => { setEditId(cuenta.id); setShowForm(true); }}>
                                    <i className="bi bi-pencil"></i> Editar
                                </button>
                                <button className="btn-delete-banco" onClick={() => handleDelete(cuenta.id)}>
                                    <i className="bi bi-trash"></i> Eliminar
                                </button>
                            </div>
                        </div>
                    ))}

                    {showForm && (
                        <BancoForm
                            editId={editId}
                            cuentas={cuentas}
                            onClose={() => { setShowForm(false); setEditId(null); }}
                            onSaved={() => { setShowForm(false); setEditId(null); cargar(); }}
                        />
                    )}

                    {!showForm && (
                        <button className="btn-add-banco" onClick={() => { setEditId(null); setShowForm(true); }}>
                            <i className="bi bi-plus-circle"></i> Agregar cuenta bancaria
                        </button>
                    )}
                </>
            )}
        </div>
    );
}

function BancoForm({ editId, cuentas, onClose, onSaved }) {
    const editing = cuentas.find(c => c.id === editId);
    const [form, setForm] = useState({
        banco: editing?.banco || '',
        titular: editing?.titular || '',
        tipoCuenta: editing?.tipoCuenta || 'Caja de Ahorro',
        numeroCuenta: editing?.numeroCuenta || '',
        cvu: editing?.cvu || '',
        alias: editing?.alias || '',
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.banco || !form.titular || !form.cvu) {
            toast.error('Banco, titular y CVU son obligatorios');
            return;
        }
        setSaving(true);
        const r = editId
            ? await AdminPagoService.updateDatosBancarios(editId, form)
            : await AdminPagoService.createDatosBancarios(form);
        setSaving(false);
        if (r.success) { toast.success(editId ? 'Cuenta actualizada' : 'Cuenta creada'); onSaved(); }
        else toast.error(r.message);
    };

    return (
        <form className="banco-form" onSubmit={handleSubmit}>
            <h4>{editId ? 'Editar cuenta' : 'Nueva cuenta bancaria'}</h4>
            <div className="banco-form-grid">
                <div className="form-group-config">
                    <label>Banco *</label>
                    <input name="banco" value={form.banco} onChange={handleChange} className="form-input-config" />
                </div>
                <div className="form-group-config">
                    <label>Titular *</label>
                    <input name="titular" value={form.titular} onChange={handleChange} className="form-input-config" />
                </div>
                <div className="form-group-config">
                    <label>Tipo de cuenta</label>
                    <select name="tipoCuenta" value={form.tipoCuenta} onChange={handleChange} className="form-input-config">
                        <option>Caja de Ahorro</option>
                        <option>Cuenta Corriente</option>
                        <option>Cuenta Sueldo</option>
                    </select>
                </div>
                <div className="form-group-config">
                    <label>N° Cuenta</label>
                    <input name="numeroCuenta" value={form.numeroCuenta} onChange={handleChange} className="form-input-config" />
                </div>
                <div className="form-group-config">
                    <label>CVU *</label>
                    <input name="cvu" value={form.cvu} onChange={handleChange} className="form-input-config" placeholder="0000003100000000000001" />
                </div>
                <div className="form-group-config">
                    <label>Alias</label>
                    <input name="alias" value={form.alias} onChange={handleChange} className="form-input-config" placeholder="misoftpan.mp" />
                </div>
            </div>
            <div className="banco-form-actions">
                <button type="submit" className="btn-save-config" disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" className="btn-cancel-config" onClick={onClose}>Cancelar</button>
            </div>
        </form>
    );
}

function SeccionDireccion() {
    const [form, setForm] = useState({ direccion: '', horarioInicio: '', horarioFin: '', telefono: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            const r = await AdminPagoService.getDireccionRetiro();
            if (r.success) setForm({
                direccion: r.data.direccion || '',
                horarioInicio: r.data.horarioInicio || '',
                horarioFin: r.data.horarioFin || '',
                telefono: r.data.telefono || '',
            });
            else toast.error(r.message);
            setLoading(false);
        };
        load();
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSave = async () => {
        if (!form.direccion) { toast.error('La dirección es obligatoria'); return; }
        setSaving(true);
        const r = await AdminPagoService.updateDireccionRetiro(form);
        setSaving(false);
        if (r.success) toast.success('Dirección actualizada');
        else toast.error(r.message);
    };

    if (loading) return <div className="config-loading"><div className="spinner-border" /></div>;

    return (
        <div className="config-card">
            <div className="config-card-header">
                <i className="bi bi-geo-alt"></i>
                <h3>Dirección de Retiro</h3>
            </div>
            <p className="config-desc">Esta dirección se muestra al cliente para que sepa dónde retirar su pedido.</p>
            <div className="direccion-form">
                <div className="form-group-config">
                    <label>Dirección *</label>
                    <input name="direccion" value={form.direccion} onChange={handleChange} className="form-input-config" placeholder="Av. Siempre Viva 123" />
                </div>
                <div className="form-row-config">
                    <div className="form-group-config">
                        <label>Horario apertura</label>
                        <input name="horarioInicio" type="time" value={form.horarioInicio} onChange={handleChange} className="form-input-config" />
                    </div>
                    <div className="form-group-config">
                        <label>Horario cierre</label>
                        <input name="horarioFin" type="time" value={form.horarioFin} onChange={handleChange} className="form-input-config" />
                    </div>
                </div>
                <div className="form-group-config">
                    <label>Teléfono de contacto</label>
                    <input name="telefono" value={form.telefono} onChange={handleChange} className="form-input-config" placeholder="123456789" />
                </div>
            </div>
            <button className="btn-save-config" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
            </button>
        </div>
    );
}

export default AdminConfigPago;

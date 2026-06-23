import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PagoService from '../services/PagoService';
import Swal from 'sweetalert2';
import '../style/pago.css';

const TIPO_PAGO = { 1: 'Efectivo', 2: 'Transferencia', 3: 'MercadoPago' };

function PagoPage() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [pagoData, setPagoData] = useState(null);
    const [error, setError] = useState(null);
    const [procesando, setProcesando] = useState(false);
    const [pagado, setPagado] = useState(false);
    const mpStatus = searchParams.get('status');

    const cargarDatosPago = useCallback(async () => {
        setLoading(true); setError(null);
        const result = await PagoService.getDatosPago(id);
        if (result.success) {
            setPagoData(result.data);
            if (result.data.estadoPago === 'Pagado') setPagado(true);
        } else {
            setError(result.message);
        }
        setLoading(false);
    }, [id]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (id) cargarDatosPago();
    }, [id, cargarDatosPago]);

    const handleProcesarPago = async () => {
        const confirm = await Swal.fire({
            title: '¿Ya transferiste?',
            text: 'Confirmá que ya transferiste el monto para que el admin verifique.',
            icon: 'question', showCancelButton: true,
            confirmButtonColor: '#c9a84c', cancelButtonColor: '#666',
            confirmButtonText: 'Sí, ya transferí', cancelButtonText: 'Cancelar',
        });
        if (!confirm.isConfirmed) return;
        setProcesando(true);
        const result = await PagoService.procesarPago(id);
        setProcesando(false);
        if (result.success) {
            setPagado(true);
            Swal.fire({ icon: 'success', title: '¡Pago registrado!', text: 'El admin verificará la transferencia.', confirmButtonColor: '#c9a84c' });
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: result.message, confirmButtonColor: '#c9a84c' });
        }
    };

    const handlePagarConMP = async () => {
        setProcesando(true);
        const result = await PagoService.crearPreferenciaMP(id, user?.email);
        setProcesando(false);
        if (result.success) {
            window.location.href = result.data.initPoint;
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: result.message, confirmButtonColor: '#c9a84c' });
        }
    };

    const formatearMonto = (monto) => monto == null ? '-' : `$${monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    const nombreTipo = TIPO_PAGO[pagoData?.tipoPago] || pagoData?.tipoPago || 'Pago';

    if (loading) {
        return (
            <div className="at-pago">
                <div className="at-pago-inner">
                    <div className="loading-container"><div className="spinner"></div><p style={{ marginTop: 16 }}>Cargando...</p></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="at-pago">
                <div className="at-pago-inner">
                    <div className="at-pago-error">
                        <div className="at-pago-error-icon">⚠️</div>
                        <h3>Error al cargar datos</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
                        <button className="btn-gold" onClick={() => navigate('/mis-pedidos')}>Volver a mis pedidos</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="at-pago">
            <div className="at-pago-inner">
                {mpStatus === 'success' && <div className="at-pago-banner success"><i className="bi bi-check-circle-fill"></i> ¡Pago recibido! Tu pedido está siendo procesado.</div>}
                {mpStatus === 'failure' && <div className="at-pago-banner error"><i className="bi bi-x-circle-fill"></i> El pago no pudo completarse. Podés intentar de nuevo.</div>}
                {mpStatus === 'pending' && <div className="at-pago-banner warning"><i className="bi bi-exclamation-circle-fill"></i> El pago está pendiente. Te avisaremos cuando se confirme.</div>}

                <div className="at-pago-header">
                    <h1>Pago del Pedido #{pagoData.pedidoId}</h1>
                    <span className="at-pago-badge">{nombreTipo}</span>
                </div>

                {pagado || pagoData.estadoPago === 'Pagado' ? (
                    <div className="at-pago-card at-pago-card-success">
                        <div className="at-pago-success-icon"><i className="bi bi-check-circle-fill"></i></div>
                        <h2>¡Pago registrado!</h2>
                        <p>Tu pago ya fue registrado. El admin confirmará tu pedido.</p>
                        <div className="at-pago-retiro">
                            <h3><i className="bi bi-geo-alt-fill"></i> Dirección de retiro</h3>
                            <p className="at-pago-direccion">{pagoData.direccionRetiro}</p>
                            {pagoData.horarioRetiro && <p className="at-pago-horario"><i className="bi bi-clock"></i> {pagoData.horarioRetiro}</p>}
                        </div>
                        <button className="btn-gold" style={{ marginTop: 16 }} onClick={() => navigate('/mis-pedidos')}>Ver mis pedidos</button>
                    </div>
                ) : (
                    <>
                        <div className="at-pago-card">
                            <h2>Resumen</h2>
                            <div className="at-pago-monto-row"><span>Total</span><span>{formatearMonto(pagoData.total)}</span></div>
                            {pagoData.montoConDescuento && pagoData.montoConDescuento < pagoData.total && (
                                <div className="at-pago-monto-row descuento"><span>Total con descuento</span><span className="at-pago-monto-descuento">{formatearMonto(pagoData.montoConDescuento)}</span></div>
                            )}
                        </div>

                        {pagoData.tipoPago === 'Efectivo' && (
                            <div className="at-pago-card">
                                <h2>Pago en Efectivo</h2>
                                <p>Acercate al local con el monto indicado para retirar tu pedido.</p>
                                <div className="at-pago-retiro">
                                    <h3><i className="bi bi-geo-alt-fill"></i> Dirección de retiro</h3>
                                    <p className="at-pago-direccion">{pagoData.direccionRetiro}</p>
                                    {pagoData.horarioRetiro && <p className="at-pago-horario"><i className="bi bi-clock"></i> {pagoData.horarioRetiro}</p>}
                                    {pagoData.telefonoContacto && <p className="at-pago-telefono"><i className="bi bi-telephone"></i> {pagoData.telefonoContacto}</p>}
                                </div>
                                <button className="btn-gold" onClick={() => navigate('/mis-pedidos')}>Ver mis pedidos</button>
                            </div>
                        )}

                        {pagoData.tipoPago === 'Transferencia' && pagoData.datosBancarios && (
                            <div className="at-pago-card">
                                <h2>Transferencia Bancaria</h2>
                                <p>Transferí el monto a la siguiente cuenta:</p>
                                <div className="at-pago-bank-details">
                                    <div className="at-pago-bank-row"><span className="at-pago-bank-label">Banco</span><span className="at-pago-bank-value">{pagoData.datosBancarios.banco}</span></div>
                                    <div className="at-pago-bank-row"><span className="at-pago-bank-label">Titular</span><span className="at-pago-bank-value">{pagoData.datosBancarios.titular}</span></div>
                                    <div className="at-pago-bank-row"><span className="at-pago-bank-label">Tipo</span><span className="at-pago-bank-value">{pagoData.datosBancarios.tipoCuenta}</span></div>
                                    <div className="at-pago-bank-row"><span className="at-pago-bank-label">N° Cuenta</span><span className="at-pago-bank-value">{pagoData.datosBancarios.numeroCuenta}</span></div>
                                    <div className="at-pago-bank-row"><span className="at-pago-bank-label">CVU</span><span className="at-pago-bank-value mono">{pagoData.datosBancarios.cvu}</span></div>
                                    <div className="at-pago-bank-row"><span className="at-pago-bank-label">Alias</span><span className="at-pago-bank-value mono">{pagoData.datosBancarios.alias}</span></div>
                                </div>
                                <div className="at-pago-copy-row">
                                    <button className="at-pago-copy-btn" onClick={() => { navigator.clipboard.writeText(pagoData.datosBancarios.cvu); Swal.fire({ icon: 'success', title: 'CVU copiado', timer: 1500, showConfirmButton: false }); }}>
                                        <i className="bi bi-clipboard"></i> Copiar CVU
                                    </button>
                                    <button className="at-pago-copy-btn" onClick={() => { navigator.clipboard.writeText(pagoData.datosBancarios.alias); Swal.fire({ icon: 'success', title: 'Alias copiado', timer: 1500, showConfirmButton: false }); }}>
                                        <i className="bi bi-clipboard"></i> Copiar Alias
                                    </button>
                                </div>
                                <div className="at-pago-retiro">
                                    <h3><i className="bi bi-geo-alt-fill"></i> Dirección de retiro</h3>
                                    <p className="at-pago-direccion">{pagoData.direccionRetiro}</p>
                                    {pagoData.horarioRetiro && <p className="at-pago-horario"><i className="bi bi-clock"></i> {pagoData.horarioRetiro}</p>}
                                </div>
                                <button className="at-pago-pay-btn green" onClick={handleProcesarPago} disabled={procesando}>
                                    {procesando ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, margin: 0 }}></span> Procesando...</> : <><i className="bi bi-check-circle"></i> Ya transferí</>}
                                </button>
                            </div>
                        )}

                        {pagoData.tipoPago === 'MercadoPago' && (
                            <div className="at-pago-card">
                                <h2>Mercado Pago</h2>
                                <p>Pagá con tarjeta de débito, crédito o en efectivo a través de Mercado Pago.</p>
                                <div className="at-pago-retiro">
                                    <h3><i className="bi bi-geo-alt-fill"></i> Dirección de retiro</h3>
                                    <p className="at-pago-direccion">{pagoData.direccionRetiro}</p>
                                    {pagoData.horarioRetiro && <p className="at-pago-horario"><i className="bi bi-clock"></i> {pagoData.horarioRetiro}</p>}
                                </div>
                                <button className="at-pago-pay-btn blue" onClick={handlePagarConMP} disabled={procesando}>
                                    {procesando ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, margin: 0 }}></span> Conectando...</> : <><i className="bi bi-credit-card"></i> Pagar con Mercado Pago</>}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default PagoPage;

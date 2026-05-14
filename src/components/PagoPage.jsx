import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PagoService from '../services/PagoService';
import Swal from 'sweetalert2';

const TIPO_PAGO = {
    1: 'Efectivo',
    2: 'Transferencia',
    3: 'MercadoPago',
};

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

    useEffect(() => {
        if (!id) return;
        cargarDatosPago();
    }, [id]);

    const cargarDatosPago = async () => {
        setLoading(true);
        setError(null);
        const result = await PagoService.getDatosPago(id);
        if (result.success) {
            setPagoData(result.data);
            if (result.data.estadoPago === 'Pagado' || result.data.estadoPago === 'Pagado') {
                setPagado(true);
            }
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    const handleProcesarPago = async () => {
        const confirm = await Swal.fire({
            title: '¿Ya realizaste la transferencia?',
            text: 'Confirma que ya transferiste el monto correspondiente para que el admin verifique el pago.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ff6b35',
            cancelButtonColor: '#666',
            confirmButtonText: 'Sí, ya transferí',
            cancelButtonText: 'Cancelar',
        });
        if (!confirm.isConfirmed) return;

        setProcesando(true);
        const result = await PagoService.procesarPago(id);
        setProcesando(false);

        if (result.success) {
            setPagado(true);
            Swal.fire({
                icon: 'success',
                title: '¡Pago registrado!',
                text: 'El admin verificará la transferencia y confirmará tu pedido.',
                confirmButtonColor: '#ff6b35',
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.message,
                confirmButtonColor: '#ff6b35',
            });
        }
    };

    const handlePagarConMP = async () => {
        setProcesando(true);
        const result = await PagoService.crearPreferenciaMP(id, user?.email);
        setProcesando(false);

        if (result.success) {
            window.location.href = result.data.initPoint;
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error al conectar con Mercado Pago',
                text: result.message,
                confirmButtonColor: '#ff6b35',
            });
        }
    };

    const formatearMonto = (monto) => {
        if (monto == null) return '-';
        return `$${monto.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const nombreTipo = TIPO_PAGO[pagoData?.tipoPago] || pagoData?.tipoPago || 'Pago';

    if (loading) {
        return (
            <div className="pago-page">
                <div className="container-custom">
                    <div className="pago-loading">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <h3>Cargando datos de pago...</h3>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pago-page">
                <div className="container-custom">
                    <div className="pago-error">
                        <div className="pago-error-icon">⚠️</div>
                        <h3>Error al cargar datos de pago</h3>
                        <p>{error}</p>
                        <button className="btn-primary" onClick={() => navigate('/mis-pedidos')}>
                            Volver a mis pedidos
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pago-page">
            <div className="container-custom">
                {/* MP Status Banner */}
                {mpStatus === 'success' && (
                    <div className="pago-status-banner success">
                        <i className="bi bi-check-circle-fill"></i>
                        <span>¡Pago recibido! Tu pedido está siendo procesado.</span>
                    </div>
                )}
                {mpStatus === 'failure' && (
                    <div className="pago-status-banner error">
                        <i className="bi bi-x-circle-fill"></i>
                        <span>El pago no pudo completarse. Podés intentar de nuevo.</span>
                    </div>
                )}
                {mpStatus === 'pending' && (
                    <div className="pago-status-banner warning">
                        <i className="bi bi-exclamation-circle-fill"></i>
                        <span>El pago está pendiente. Te avisaremos cuando se confirme.</span>
                    </div>
                )}

                <div className="pago-header">
                    <h1>Pago del Pedido #{pagoData.pedidoId}</h1>
                    <span className="pago-badge">{nombreTipo}</span>
                </div>

                {/* Ya pagado */}
                {pagado || pagoData.estadoPago === 'Pagado' ? (
                    <div className="pago-card pago-card-success">
                        <div className="pago-success-icon">
                            <i className="bi bi-check-circle-fill"></i>
                        </div>
                        <h2>¡Pago registrado!</h2>
                        <p>Tu pago ya fue registrado. El admin confirmará tu pedido.</p>
                        <div className="pago-retiro-info">
                            <h3><i className="bi bi-geo-alt-fill"></i> Dirección de retiro</h3>
                            <p className="pago-direccion">{pagoData.direccionRetiro}</p>
                            {pagoData.horarioRetiro && (
                                <p className="pago-horario">
                                    <i className="bi bi-clock"></i> {pagoData.horarioRetiro}
                                </p>
                            )}
                        </div>
                        <button className="btn-primary" onClick={() => navigate('/mis-pedidos')}>
                            Ver mis pedidos
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Resumen montos */}
                        <div className="pago-card pago-card-montos">
                            <h2>Resumen</h2>
                            <div className="pago-monto-row">
                                <span>Total</span>
                                <span>{formatearMonto(pagoData.total)}</span>
                            </div>
                            {pagoData.montoConDescuento && pagoData.montoConDescuento < pagoData.total && (
                                <div className="pago-monto-row descuento">
                                    <span>Total con descuento</span>
                                    <span className="pago-monto-descuento">{formatearMonto(pagoData.montoConDescuento)}</span>
                                </div>
                            )}
                        </div>

                        {/* Efectivo */}
                        {pagoData.tipoPago === 'Efectivo' && (
                            <div className="pago-card">
                                <div className="pago-section-icon">💵</div>
                                <h2>Pago en Efectivo</h2>
                                <p>Acercate al local con el monto indicado para retirar tu pedido.</p>
                                <div className="pago-retiro-info">
                                    <h3><i className="bi bi-geo-alt-fill"></i> Dirección de retiro</h3>
                                    <p className="pago-direccion">{pagoData.direccionRetiro}</p>
                                    {pagoData.horarioRetiro && (
                                        <p className="pago-horario">
                                            <i className="bi bi-clock"></i> {pagoData.horarioRetiro}
                                        </p>
                                    )}
                                    {pagoData.telefonoContacto && (
                                        <p className="pago-telefono">
                                            <i className="bi bi-telephone"></i> {pagoData.telefonoContacto}
                                        </p>
                                    )}
                                </div>
                                <button className="btn-primary" onClick={() => navigate('/mis-pedidos')}>
                                    Ver mis pedidos
                                </button>
                            </div>
                        )}

                        {/* Transferencia */}
                        {pagoData.tipoPago === 'Transferencia' && pagoData.datosBancarios && (
                            <div className="pago-card">
                                <div className="pago-section-icon">🏦</div>
                                <h2>Transferencia Bancaria</h2>
                                <p>Transferí el monto indicado a la siguiente cuenta:</p>
                                <div className="pago-datos-bancarios">
                                    <div className="pago-dato-row">
                                        <span className="pago-dato-label">Banco</span>
                                        <span className="pago-dato-value">{pagoData.datosBancarios.banco}</span>
                                    </div>
                                    <div className="pago-dato-row">
                                        <span className="pago-dato-label">Titular</span>
                                        <span className="pago-dato-value">{pagoData.datosBancarios.titular}</span>
                                    </div>
                                    <div className="pago-dato-row">
                                        <span className="pago-dato-label">Tipo de cuenta</span>
                                        <span className="pago-dato-value">{pagoData.datosBancarios.tipoCuenta}</span>
                                    </div>
                                    <div className="pago-dato-row">
                                        <span className="pago-dato-label">N° Cuenta</span>
                                        <span className="pago-dato-value">{pagoData.datosBancarios.numeroCuenta}</span>
                                    </div>
                                    <div className="pago-dato-row">
                                        <span className="pago-dato-label">CVU</span>
                                        <span className="pago-dato-value cvu">{pagoData.datosBancarios.cvu}</span>
                                    </div>
                                    <div className="pago-dato-row">
                                        <span className="pago-dato-label">Alias</span>
                                        <span className="pago-dato-value alias">{pagoData.datosBancarios.alias}</span>
                                    </div>
                                </div>
                                <div className="pago-copy-row">
                                    <button
                                        className="btn-copy"
                                        onClick={() => {
                                            navigator.clipboard.writeText(pagoData.datosBancarios.cvu);
                                            Swal.fire({ icon: 'success', title: 'CVU copiado', timer: 1500, showConfirmButton: false });
                                        }}
                                    >
                                        <i className="bi bi-clipboard"></i> Copiar CVU
                                    </button>
                                    <button
                                        className="btn-copy"
                                        onClick={() => {
                                            navigator.clipboard.writeText(pagoData.datosBancarios.alias);
                                            Swal.fire({ icon: 'success', title: 'Alias copiado', timer: 1500, showConfirmButton: false });
                                        }}
                                    >
                                        <i className="bi bi-clipboard"></i> Copiar Alias
                                    </button>
                                </div>
                                <div className="pago-retiro-info">
                                    <h3><i className="bi bi-geo-alt-fill"></i> Dirección de retiro</h3>
                                    <p className="pago-direccion">{pagoData.direccionRetiro}</p>
                                    {pagoData.horarioRetiro && (
                                        <p className="pago-horario">
                                            <i className="bi bi-clock"></i> {pagoData.horarioRetiro}
                                        </p>
                                    )}
                                </div>
                                <button
                                    className="btn-pago-transferencia"
                                    onClick={handleProcesarPago}
                                    disabled={procesando}
                                >
                                    {procesando ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span>Procesando...</>
                                    ) : (
                                        <><i className="bi bi-check-circle me-2"></i>Ya transferí</>
                                    )}
                                </button>
                                <button className="btn-back mt-2" onClick={() => navigate('/mis-pedidos')}>
                                    <i className="bi bi-arrow-left me-2"></i>Volver a mis pedidos
                                </button>
                            </div>
                        )}

                        {/* Mercado Pago */}
                        {pagoData.tipoPago === 'MercadoPago' && (
                            <div className="pago-card">
                                <div className="pago-section-icon">
                                    <i className="bi bi-credit-card-2-front" style={{ fontSize: 48, color: '#009ee3' }}></i>
                                </div>
                                <h2>Mercado Pago</h2>
                                <p>Pagá con tarjeta de débito, crédito o en efectivo a través de Mercado Pago.</p>
                                <div className="pago-retiro-info">
                                    <h3><i className="bi bi-geo-alt-fill"></i> Dirección de retiro</h3>
                                    <p className="pago-direccion">{pagoData.direccionRetiro}</p>
                                    {pagoData.horarioRetiro && (
                                        <p className="pago-horario">
                                            <i className="bi bi-clock"></i> {pagoData.horarioRetiro}
                                        </p>
                                    )}
                                </div>
                                <button
                                    className="btn-pago-mercadopago"
                                    onClick={handlePagarConMP}
                                    disabled={procesando}
                                >
                                    {procesando ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span>Conectando...</>
                                    ) : (
                                        <>
                                            <i className="bi bi-credit-card me-2"></i>
                                            Pagar con Mercado Pago
                                        </>
                                    )}
                                </button>
                                <button className="btn-back mt-2" onClick={() => navigate('/mis-pedidos')}>
                                    <i className="bi bi-arrow-left me-2"></i>Volver a mis pedidos
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

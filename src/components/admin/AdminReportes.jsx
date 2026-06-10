import { useState, useEffect } from 'react';
import AdminPedidoService from '../../services/AdminPedidoService';
import { SkeletonTable } from '../Skeleton';
import '../../style/admin/reportes.css';
import '../../style/admin/pedidos.css';

const TIPO_PAGO_MAP = {
    Efectivo: 'Efectivo',
    Transferencia: 'Transferencia',
    MercadoPago: 'Mercado Pago',
};

function AdminReportes() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [desde, setDesde] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d.toISOString().split('T')[0];
    });
    const [hasta, setHasta] = useState(() => new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            const r = await AdminPedidoService.getTodosLosPedidos();
            if (r.success) {
                const filtrados = (r.data || []).filter(p => p.estado !== 'Carrito');
                setPedidos(filtrados);
            }
            setLoading(false);
        };
        cargar();
    }, []);

    const pedidosPeriodo = pedidos.filter(p => {
        if (!p.fechaPedido) return false;
        const fecha = new Date(p.fechaPedido);
        const d = new Date(desde);
        const h = new Date(hasta);
        h.setHours(23, 59, 59, 999);
        return fecha >= d && fecha <= h;
    });

    const confirmados = pedidosPeriodo.filter(p => p.estadoPago === 'Pagado');
    const totalVentas = confirmados.reduce((sum, p) => sum + (p.montoConDescuento || p.total), 0);
    const totalSinDescuento = confirmados.reduce((sum, p) => sum + p.total, 0);
    const totalDescuentos = totalSinDescuento - totalVentas;

    const ventasPorPago = {};
    confirmados.forEach(p => {
        const tipo = TIPO_PAGO_MAP[p.tipoPago] || p.tipoPago || 'Sin tipo';
        ventasPorPago[tipo] = (ventasPorPago[tipo] || 0) + (p.montoConDescuento || p.total);
    });

    const todosDetalles = [];
    confirmados.forEach(p => {
        if (p.detalles) {
            p.detalles.forEach(d => {
                todosDetalles.push({ nombre: d.productoNombre, cantidad: d.cantidad, subtotal: d.subtotal });
            });
        }
    });

    const productosMap = {};
    todosDetalles.forEach(d => {
        if (!productosMap[d.nombre]) productosMap[d.nombre] = { cantidad: 0, total: 0 };
        productosMap[d.nombre].cantidad += d.cantidad;
        productosMap[d.nombre].total += d.subtotal;
    });
    const productosTop = Object.entries(productosMap)
        .map(([nombre, data]) => ({ nombre, ...data }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10);

    const formatearMonto = (monto) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);
    };

    return (
        <div className="admin-reportes">
            <div className="admin-pedidos-header">
                <h2><i className="bi bi-graph-up"></i> Reportes</h2>
                <button className="btn-refresh" onClick={() => window.location.reload()}>
                    <i className="bi bi-arrow-clockwise"></i> Actualizar
                </button>
            </div>

            <div className="reportes-filtros">
                <div className="reportes-filtro-group">
                    <label>Desde</label>
                    <input type="date" className="form-input-config" value={desde} onChange={e => setDesde(e.target.value)} />
                </div>
                <div className="reportes-filtro-group">
                    <label>Hasta</label>
                    <input type="date" className="form-input-config" value={hasta} onChange={e => setHasta(e.target.value)} />
                </div>
                <button className="btn-refresh" onClick={() => { setDesde(new Date().toISOString().split('T')[0]); setHasta(new Date().toISOString().split('T')[0]); }} style={{ alignSelf: 'flex-end' }}>
                    <i className="bi bi-calendar-event"></i> Hoy
                </button>
                <button className="btn-refresh" onClick={() => { const d = new Date(); d.setDate(1); setDesde(d.toISOString().split('T')[0]); setHasta(new Date().toISOString().split('T')[0]); }} style={{ alignSelf: 'flex-end' }}>
                    <i className="bi bi-calendar-month"></i> Este mes
                </button>
            </div>

            {loading ? (
                <SkeletonTable rows={5} />
            ) : (
                <>
                    <div className="reportes-cards">
                        <div className="reporte-card total-ventas">
                            <div className="reporte-card-icon"><i className="bi bi-cash-stack"></i></div>
                            <div className="reporte-card-info">
                                <span className="reporte-card-label">Total ventas</span>
                                <span className="reporte-card-value">{formatearMonto(totalVentas)}</span>
                                <span className="reporte-card-sub">{confirmados.length} pedido{confirmados.length !== 1 ? 's' : ''}</span>
                            </div>
                        </div>
                        <div className="reporte-card descuentos">
                            <div className="reporte-card-icon"><i className="bi bi-percent"></i></div>
                            <div className="reporte-card-info">
                                <span className="reporte-card-label">Descuentos aplicados</span>
                                <span className="reporte-card-value text-success">{formatearMonto(totalDescuentos)}</span>
                                <span className="reporte-card-sub">Sobre {formatearMonto(totalSinDescuento)} sin descuento</span>
                            </div>
                        </div>
                        <div className="reporte-card pedidos-totales">
                            <div className="reporte-card-icon"><i className="bi bi-receipt"></i></div>
                            <div className="reporte-card-info">
                                <span className="reporte-card-label">Pedidos en período</span>
                                <span className="reporte-card-value">{pedidosPeriodo.length}</span>
                                <span className="reporte-card-sub">{confirmados.length} confirmados / {pedidosPeriodo.length - confirmados.length} pendientes</span>
                            </div>
                        </div>
                    </div>

                    <div className="reportes-grid">
                        <div className="reportes-card">
                            <h3><i className="bi bi-pie-chart"></i> Ventas por tipo de pago</h3>
                            {Object.keys(ventasPorPago).length === 0 ? (
                                <p className="reportes-empty">No hay ventas en este período</p>
                            ) : (
                                <table className="reportes-table">
                                    <thead>
                                        <tr>
                                            <th>Tipo de pago</th>
                                            <th className="text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(ventasPorPago).map(([tipo, total]) => (
                                            <tr key={tipo}>
                                                <td>{tipo}</td>
                                                <td className="text-right">{formatearMonto(total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="reportes-card">
                            <h3><i className="bi bi-trophy"></i> Productos más vendidos</h3>
                            {productosTop.length === 0 ? (
                                <p className="reportes-empty">No hay ventas en este período</p>
                            ) : (
                                <table className="reportes-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Producto</th>
                                            <th className="text-right">Cantidad</th>
                                            <th className="text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productosTop.map((p, i) => (
                                            <tr key={p.nombre}>
                                                <td className="reportes-pos">{i + 1}</td>
                                                <td>{p.nombre}</td>
                                                <td className="text-right">{p.cantidad}</td>
                                                <td className="text-right">{formatearMonto(p.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    <div className="reportes-card">
                        <h3><i className="bi bi-list-ul"></i> Todos los pedidos del período</h3>
                        {pedidosPeriodo.length === 0 ? (
                            <p className="reportes-empty">No hay pedidos en este período</p>
                        ) : (
                            <div className="tabla-pedidos">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Cliente</th>
                                            <th>Fecha</th>
                                            <th>Tipo Pago</th>
                                            <th>Estado Pago</th>
                                            <th className="text-right">Total</th>
                                            <th className="text-right">Total c/desc.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pedidosPeriodo.map(p => (
                                            <tr key={p.id}>
                                                <td className="pedido-id" data-label="ID">#{p.id}</td>
                                                <td data-label="Cliente">{p.clienteNombre}</td>
                                                <td data-label="Fecha">{new Date(p.fechaPedido).toLocaleDateString('es-AR')}</td>
                                                <td data-label="Tipo Pago">{TIPO_PAGO_MAP[p.tipoPago] || p.tipoPago || '-'}</td>
                                                <td data-label="Estado"><span className={`badge-pago ${p.estadoPago === 'Pagado' ? 'pago-pagado' : 'pago-pendiente'}`}>{p.estadoPago || 'Pendiente'}</span></td>
                                                <td className="text-right" data-label="Total">{formatearMonto(p.total)}</td>
                                                <td className="text-right" data-label="Total c/Desc.">{p.montoConDescuento ? formatearMonto(p.montoConDescuento) : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default AdminReportes;

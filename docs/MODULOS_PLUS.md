# Módulos Plus — Tienda Online Panadería

> Documento de referencia para ofrecer funcionalidades adicionales al cliente.
> Los precios son sugeridos y pueden ajustarse según el alcance final.

---

## 🟢 Nivel 1 — Implementación rápida ($)

| # | Módulo | Descripción | Tiempo |
|---|--------|-------------|--------|
| 1 | **Login con Google** | Inicio de sesión mediante cuenta de Google. Requiere configuración en backend (.NET + Google Cloud Console) | ~3 h |
| 2 | **Compartir producto por WhatsApp** | Botón en detalle del producto que abre WhatsApp con link directo al producto | 15 min |
| 3 | **Filtro por rango de precios** | Slider o inputs de precio mínimo/máximo en el catálogo de productos | 30 min |
| 4 | **Exportar reportes a Excel** | Botón "Exportar" en la sección Reportes del panel admin que descarga CSV/XLSX de ventas | 1 h |
| 5 | **Notificaciones toast** | Feedback visual en todas las acciones del sistema (agregar carrito, confirmar pago, error, pedido creado, etc.) | 30 min |
| 6 | **Breadcrumbs** | Migas de pan en todas las páginas del catálogo y pedidos para mejor navegación | 30 min |
| 7 | **Botón "Volver arriba"** | Botón flotante en páginas largas (catálogo, mis pedidos, reportes) | 15 min |

---

## 🟡 Nivel 2 — Valor agregado medio ($$)

| # | Módulo | Descripción | Tiempo |
|---|--------|-------------|--------|
| 8 | **Cupones de descuento** | Panel admin para crear códigos promocionales con % o monto fijo, fecha de expiración, uso por cliente. Se aplican en el checkout | ~3 h |
| 9 | **Wishlist / Favoritos** | ❤️ Botón de favoritos en tarjetas de producto + página de lista de deseos + persistencia en backend | ~2 h |
| 10| **Notificaciones por email** | Envío automático de emails transaccionales vía SendGrid/Mailgun: confirmación de pedido, cambio de estado, aviso de pago confirmado | ~3 h |

---

## 🔴 Nivel 3 — Alto valor ($$$)

| # | Módulo | Descripción | Tiempo |
|---|--------|-------------|--------|
| 12 | **Punto de venta (POS)** | Sistema de cobro presencial para el mostrador: registro de ventas sin pedido online, control de caja, apertura/cierre, múltiples métodos de pago, ticket | ~6-8 h |
| 13 | **Facturación electrónica ARCA** | Integración con los Web Services de ARCA (ex AFIP): emisión de Factura C / Factura A, obtención de CAE, datos fiscales del cliente (CUIT/CUIL, condición de IVA), registro de operaciones | ~8-10 h |
| 14 | **Notificaciones WhatsApp** | Integración con WhatsApp Business API para enviar mensajes automáticos: "Tu pedido fue confirmado", "Tu pedido está listo para retirar", recordatorios | ~4-5 h |
| 15 | **Multi-sucursal** | Soporte para múltiples sucursales: cada sucursal con su propia dirección de retiro, horarios, administración independiente y reportes separados | ~6-8 h |
| 16 | **Programa de fidelización** | Sistema de puntos por compra, canje de productos, historial de puntos del cliente, niveles de membresía (bronce/plata/oro) con beneficios | ~4-5 h |

---

## 💼 Combos sugeridos

| Combo | Módulos incluidos | Ideal para |
|-------|-------------------|------------|
| **Combo Experiencia ($$)** | 2 + 5 + 6 + 7 + 9 | Mejorar UX del sitio y fidelizar clientes |
| **Combo Ventas ($$$)** | 8 + 9 + 10 + 11 | Aumentar conversión y medios de cobro |
| **Combo Negocio ($$$$)** | 10 + 12 + 13 | Sistema completo para administrar el negocio |
| **Combo Premium ($$$$$)** | 10 + 12 + 13 + 14 + 16 | Sistema integral con fidelización y comunicación |

---

## 📋 Funcionalidades a implementar a futuro (sin costo adicional)

> Estas tareas son mejoras técnicas y de mantenimiento del sistema base,
> no se cobran como módulo aparte.

| # | Tarea | Motivo |
|---|-------|--------|
| 1 | **Refactor CSS en módulos** | Separar los archivos CSS monolíticos en módulos por componente para facilitar el mantenimiento |
| 2 | **Lazy loading de rutas** | Implementar `React.lazy` + `Suspense` para reducir el tamaño del bundle inicial |
| 3 | **Caché de productos** | Guardar productos en `sessionStorage` con expiración de 5 minutos para evitar recargas innecesarias |
| 4 | **React.memo / useMemo** | Optimizar renderizados en componentes pesados (ProductsList, Cart) |
| 5 | **Optimización de imágenes** | Agregar `loading="lazy"` a imágenes del catálogo para mejorar rendimiento |
| 6 | **Placeholder interno** | Ya implementado: reemplazo de via.placeholder.com por SVG inline local |

---

*Documento generado el 13 de mayo de 2026*
*Proyecto: Tienda Online Panadería (Softpan)*

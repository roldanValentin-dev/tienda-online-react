# Documentación de Integración Frontend — Softpan

> Documento para el equipo de frontend sobre los nuevos endpoints y cambios en el backend.

---

## 📋 Índice de Cambios

| Fecha | Módulo | Cambio |
|-------|--------|--------|
| Mayo 2026 | Carrito | Nuevos endpoints CRUD para carrito de compras |
| Mayo 2026 | Pedidos | Nuevos campos de pago en respuestas |
| Mayo 2026 | Mercado Pago | Integración completa con Checkout Pro |
| Mayo 2026 | Admin Pagos | Panel de configuración de descuento, datos bancarios y dirección |
| Mayo 2026 | Flujo pagos | Separación: cliente marca pagado → admin confirma + descuenta stock |

---

## 1. Carrito de Compras

### Endpoints

#### `GET /api/carrito` — Obtener o crear carrito

**Auth:** Requiere JWT (Bearer token)

**Respuesta:**
```json
{
  "pedidoId": 1,
  "total": 1500.00,
  "totalItems": 3,
  "items": [
    {
      "productoId": 5,
      "productoNombre": "Pan Francés",
      "productoImagen": "/images/productos/abc123.jpg",
      "productoCategoria": "Panadería",
      "precioUnitario": 500.00,
      "cantidad": 2,
      "subtotal": 1000.00
    }
  ]
}
```

---

#### `POST /api/carrito/items` — Agregar producto al carrito

**Auth:** Requiere JWT

**Request:**
```json
{
  "productoId": 5,
  "cantidad": 2
}
```

**Reglas:**
- Valida que el producto exista y esté activo
- Valida stock suficiente (NO descuenta stock todavía)
- Si ya existe el producto en el carrito, **suma** las cantidades

**Respuesta:** Mismo `CarritoDto` actualizado

**Errores posibles:**
- `400` — Producto no disponible o stock insuficiente
- `404` — Producto no encontrado

---

#### `PUT /api/carrito/items/{productoId}` — Actualizar cantidad

**Auth:** Requiere JWT

**Request:**
```json
{
  "cantidad": 3
}
```

**Reglas:**
- `cantidad` es la cantidad **final**, no la suma
- Valida stock suficiente para la nueva cantidad

**Respuesta:** `CarritoDto` actualizado

---

#### `DELETE /api/carrito/items/{productoId}` — Quitar producto

**Auth:** Requiere JWT

**Respuesta:** `204 No Content`

---

#### `DELETE /api/carrito` — Limpiar carrito completo

**Auth:** Requiere JWT

**Respuesta:** `200` con el `CarritoDto` vacío

---

#### `POST /api/carrito/checkout` — Convertir carrito a pedido

**Auth:** Requiere JWT

**Request (actualizado):**
```json
{
  "fechaEntrega": "2026-05-20",
  "observaciones": "Dejar en recepción",
  "tipoPago": "Efectivo"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `fechaEntrega` | DateTime | ✅ | Fecha de entrega del pedido |
| `observaciones` | string | ❌ | Notas adicionales (máx 500 chars) |
| `tipoPago` | enum | ❌ | `Efectivo`, `Transferencia` o `MercadoPago` |

**Reglas:**
- Valida stock nuevamente (puede haber cambiado desde que se agregó)
- Si `tipoPago` es `Efectivo` o `Transferencia`: aplica **% de descuento configurable** desde el panel admin (default 10%)
- Si `tipoPago` es `MercadoPago`: NO aplica descuento (precios ya contemplan comisión de MP)
- Cambia estado de `Carrito` → `Pendiente`
- NO descuenta stock (se descuenta SOLO cuando admin confirma el pago)

**Respuesta:** `PedidoDto` (con campos de pago)

---

## 2. Pedidos — Nuevos campos

### `PedidoDto` — Respuesta ampliada

```json
{
  "id": 1,
  "clienteOnlineId": 3,
  "clienteNombre": "Juan Pérez",
  "clienteEmail": "juan@email.com",
  "clienteTelefono": "123456789",
  "fechaPedido": "2026-05-12T10:00:00Z",
  "fechaEntrega": "2026-05-15T00:00:00Z",
  "estado": "Pendiente",
  "estadoId": 1,
  "total": 1500.00,
  "observaciones": null,
  "tipoPago": "Efectivo",
  "estadoPago": "Pendiente",
  "montoConDescuento": 1350.00,
  "referenciaTransaccion": null,
  "fechaPago": null,
  "mercadoPagoPreferenceId": null,
  "mercadoPagoPaymentId": null,
  "paymentStatus": null,
  "detalles": [
    {
      "id": 1,
      "productoId": 5,
      "productoNombre": "Pan Francés",
      "productoImagen": "/images/productos/abc123.jpg",
      "productoCategoria": "Panadería",
      "cantidad": 2,
      "precioUnitario": 500.00,
      "subtotal": 1000.00
    }
  ]
}
```

### Estados posibles

**`estado` (EstadoPedidoEnum):**
| Valor | Significado |
|-------|-------------|
| `Carrito` | Todavía no finalizó la compra |
| `Pendiente` | Esperando pago o esperando confirmación admin |
| `Confirmado` | Pago confirmado por admin o webhook MP |
| `EnPreparacion` | Están preparando el pedido |
| `Listo` | Listo para entregar |
| `Entregado` | Entregado al cliente |
| `Cancelado` | Cancelado |

**`estadoPago` (EstadoPagoEnum):**
| Valor | Significado |
|-------|-------------|
| `Pendiente` | No se pagó todavía |
| `Pagado` | Pago registrado (cliente marcó o admin confirmó) |
| `Fallido` | Pago rechazado |
| `Reembolsado` | Pago devuelto |

**`tipoPago` (TipoPagoEnum):**
| Valor | Significado | Descuento |
|-------|-------------|-----------|
| `Efectivo` | Pago en efectivo al retirar | ✅ Configurable (default 10%) |
| `Transferencia` | Transferencia bancaria | ✅ Configurable (default 10%) |
| `MercadoPago` | Pago por Mercado Pago | ❌ Sin descuento |

---

## 3. FLUJO DE PAGO (ACTUALIZADO)

### Flujo Efectivo

```
Checkout (tipoPago: "Efectivo")
  → Se aplica descuento configurable
  → Estado: Pendiente, EstadoPago: Pendiente
  → Cliente ve dirección de retiro y monto a pagar

Cliente va al local, paga en efectivo

Admin:
  GET /api/admin/pedidos/pendientes-pago → ve pedido
  POST /api/admin/pedidos/{id}/confirmar-pago
    → Estado: Confirmado, EstadoPago: Pagado
    → Stock descontado
```

### Flujo Transferencia

```
Checkout (tipoPago: "Transferencia")
  → Se aplica descuento configurable
  → Estado: Pendiente, EstadoPago: Pendiente
  → Cliente ve CVU/datos bancarios y monto a transferir

Cliente transfiere y hace clic en "Ya transferí":
  POST /api/pedidos/{id}/procesar-pago
    → EstadoPago: Pagado (solo eso, NO confirma)

Admin verifica la transferencia:
  GET /api/admin/pedidos/pendientes-pago → ve pedido (Pagado)
  POST /api/admin/pedidos/{id}/confirmar-pago
    → Estado: Confirmado, Stock descontado
```

### Flujo Mercado Pago (sin cambios)

```
Checkout → Pendiente → Crear preferencia MP
  → Webhook MP → Confirmado + Stock automático
```

---

## 4. Endpoints de pago para el cliente

### `POST /api/pedidos/{id}/procesar-pago` — Marcar como pagado

**Auth:** Requiere JWT (dueño del pedido)

**Request:** Sin body

**¿Qué hace?** Solo marca el pedido como `Pagado`. **NO descuenta stock ni confirma.** El admin debe confirmar después mediante el endpoint de admin.

**Reglas:**
- Solo para pedidos con `tipoPago = Efectivo` o `Transferencia`
- Para Efectivo: el cliente NO necesita llamar a este endpoint (lo hace el admin directo)
- Para Transferencia: el cliente llama a este endpoint después de transferir

**Errores posibles:**
- `400` — El pedido no está Pendiente
- `400` — El tipo de pago es Mercado Pago
- `400` — El pedido ya fue pagado
- `401` — No es tu pedido
- `404` — Pedido no encontrado

---

### `GET /api/pedidos/{id}/datos-pago` — Obtener datos de pago

**Auth:** Requiere JWT (dueño del pedido)

**Respuesta según tipo de pago:**

**Efectivo:**
```json
{
  "pedidoId": 1,
  "total": 2000.00,
  "montoConDescuento": 1800.00,
  "tipoPago": "Efectivo",
  "estadoPago": "Pendiente",
  "estado": "Pendiente",
  "direccionRetiro": "Av. Siempre Viva 123",
  "horarioRetiro": "08:00 - 18:00",
  "telefonoContacto": "123456789",
  "datosBancarios": null
}
```

**Transferencia:**
```json
{
  "pedidoId": 1,
  "total": 2000.00,
  "montoConDescuento": 1800.00,
  "tipoPago": "Transferencia",
  "estadoPago": "Pendiente",
  "estado": "Pendiente",
  "direccionRetiro": "Av. Siempre Viva 123",
  "datosBancarios": {
    "banco": "Banco Nación",
    "titular": "Softpan SRL",
    "tipoCuenta": "Caja de Ahorro",
    "numeroCuenta": "12345678",
    "cvu": "0000003100000000000001",
    "alias": "misoftpan.mp",
    "activo": true
  }
}
```

**Mercado Pago (confirmado):**
```json
{
  "pedidoId": 1,
  "total": 2000.00,
  "tipoPago": "MercadoPago",
  "estadoPago": "Pagado",
  "estado": "Confirmado",
  "direccionRetiro": "Av. Siempre Viva 123",
  "horarioRetiro": "08:00 - 18:00",
  "datosBancarios": null
}
```

---

### `POST /api/pedidos` — Crear pedido (sin carrito)

**Auth:** Requiere JWT

**Request:**
```json
{
  "fechaEntrega": "2026-05-15",
  "observaciones": "Sin cebolla",
  "detalles": [
    {
      "productoId": 5,
      "cantidad": 2
    }
  ],
  "tipoPago": "Efectivo"
}
```

**Comportamiento según tipoPago:**
- `Efectivo` o `Transferencia`: Aplica % de descuento configurable desde BD
- `MercadoPago`: NO aplica descuento
- `null`: No aplica descuento

---

## 5. Mercado Pago — Checkout Pro

### Flujo completo para frontend

```
1. Usuario agrega productos al carrito (POST /api/carrito/items)
2. Usuario hace checkout (POST /api/carrito/checkout) con tipoPago: "MercadoPago"
3. Frontend obtiene pedidoId de la respuesta
4. Frontend llama a crear-preferencia
5. Frontend redirige al usuario a init_point
6. Usuario paga en Mercado Pago
7. Mercado Pago redirige al usuario de vuelta vía Back URLs
8. Frontend consulta GET /api/pedidos/{id}/datos-pago para ver dirección de retiro
```

### Endpoints

#### `POST /api/mercadopago/crear-preferencia` — Crear preferencia de pago

**Auth:** Requiere JWT

**Query parameter:** `pedidoId` (int)

**Request:**
```json
{
  "emailPagador": "juan@email.com"
}
```

**Respuesta:**
```json
{
  "preferenceId": "123456789-abc123",
  "initPoint": "https://www.mercadopago.com.ar/checkout/v1/redirect?...",
  "pedidoId": 1
}
```

**En el frontend:**
```javascript
window.location.href = response.initPoint;
```

**Reglas de seguridad:**
- El backend valida stock y precios desde la BD (NO confía en lo que envía el frontend)
- No es necesario enviar items en el body

---

#### `POST /api/mercadopago/webhook` — Recibir notificación de MP

**Auth:** `[AllowAnonymous]`

**No invocar desde frontend.** Es llamado por Mercado Pago automáticamente.

---

### Manejo de URLs de retorno (Back URLs)

| URL | Cuándo se dispara |
|-----|-------------------|
| `/pago-exitoso` | Pago aprobado |
| `/pago-fallido` | Pago rechazado |
| `/pago-pendiente` | Pago pendiente |

Configurable vía variable de entorno `MercadoPago:BaseUrl`.

---

## 6. Panel de Administración (nuevo)

### Endpoints para configuración de pagos

#### Descuento

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `GET` | `/api/admin/configuracion/descuento` | Admin | Ver % de descuento actual |
| `PUT` | `/api/admin/configuracion/descuento` | Admin | Cambiar % de descuento |

**PUT /api/admin/configuracion/descuento**
```json
{ "valor": "15" }
```
→ El descuento se aplica tanto en checkout como en creación directa de pedidos.

---

#### Datos Bancarios (para Transferencia)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `GET` | `/api/admin/datos-bancarios` | Admin | Listar cuentas |
| `POST` | `/api/admin/datos-bancarios` | Admin | Agregar cuenta |
| `PUT` | `/api/admin/datos-bancarios/{id}` | Admin | Editar cuenta |
| `DELETE` | `/api/admin/datos-bancarios/{id}` | Admin | Eliminar cuenta |

**POST /api/admin/datos-bancarios**
```json
{
  "banco": "Banco Nación",
  "titular": "Softpan SRL",
  "tipoCuenta": "Caja de Ahorro",
  "numeroCuenta": "12345678",
  "cvu": "0000003100000000000001",
  "alias": "misoftpan.mp"
}
```

---

#### Dirección de Retiro

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `GET` | `/api/admin/direccion-retiro` | Anónimo | Ver dirección (público) |
| `PUT` | `/api/admin/direccion-retiro` | Admin | Cambiar dirección |

**PUT /api/admin/direccion-retiro**
```json
{
  "direccion": "Av. Siempre Viva 123",
  "horarioInicio": "08:00",
  "horarioFin": "18:00",
  "telefono": "123456789"
}
```

---

#### Gestión de pedidos pendientes (Admin)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `GET` | `/api/admin/pedidos/pendientes-pago` | Admin | Pedidos Pagados esperando confirmación |
| `POST` | `/api/admin/pedidos/{id}/confirmar-pago` | Admin | Confirmar pago + descontar stock |

**Flujo para el panel admin:**

```
GET /api/admin/pedidos/pendientes-pago
  → Lista de pedidos con EstadoPago=Pagado, listos para confirmar

POST /api/admin/pedidos/1/confirmar-pago
  → Estado: Confirmado, Stock descontado
  → El cliente puede retirar
```

---

## 7. Resumen de todos los endpoints

### Cliente (con JWT)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/carrito` | Obtener/crear carrito |
| `POST` | `/api/carrito/items` | Agregar item al carrito |
| `PUT` | `/api/carrito/items/{productoId}` | Actualizar cantidad |
| `DELETE` | `/api/carrito/items/{productoId}` | Quitar item |
| `DELETE` | `/api/carrito` | Limpiar carrito |
| `POST` | `/api/carrito/checkout` | Checkout → Pedido (con tipoPago opcional) |
| `POST` | `/api/pedidos` | Crear pedido directo |
| `GET` | `/api/pedidos/{id}` | Ver pedido |
| `GET` | `/api/pedidos/{id}/datos-pago` | **Datos para pagar (dirección/CVU)** |
| `POST` | `/api/pedidos/{id}/procesar-pago` | Marcar como pagado (Transferencia) |
| `POST` | `/api/mercadopago/crear-preferencia` | Crear preferencia MP |

### Admin (con JWT + rol Admin)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/admin/configuracion/descuento` | Ver % descuento |
| `PUT` | `/api/admin/configuracion/descuento` | Cambiar % descuento |
| `GET` | `/api/admin/datos-bancarios` | Listar cuentas bancarias |
| `POST` | `/api/admin/datos-bancarios` | Agregar cuenta bancaria |
| `PUT` | `/api/admin/datos-bancarios/{id}` | Editar cuenta |
| `DELETE` | `/api/admin/datos-bancarios/{id}` | Eliminar cuenta |
| `GET` | `/api/admin/direccion-retiro` | Ver dirección de retiro |
| `PUT` | `/api/admin/direccion-retiro` | Cambiar dirección de retiro |
| `GET` | `/api/admin/pedidos/pendientes-pago` | Pedidos listos para confirmar |
| `POST` | `/api/admin/pedidos/{id}/confirmar-pago` | Confirmar pago + descontar stock |

### Público (sin auth)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/catalogo/productos` | Productos activos |
| `GET` | `/api/catalogo/categorias` | Categorías |
| `GET` | `/api/admin/direccion-retiro` | Dirección de retiro |
| `POST` | `/api/mercadopago/webhook` | Webhook MP (no invocar) |

---

## 8. Seguridad importante para el frontend

### 1. No confiar en el init_point

- El `initPoint` debe comenzar con `https://www.mercadopago.com.`
- NO mostrar la URL al usuario como texto, solo redirigir

### 2. Actualizar estado del pedido después del pago

Después de que el usuario vuelve de Mercado Pago, **NO asumir** que el pago fue exitoso:

```javascript
const pedido = await fetch(`/api/pedidos/${pedidoId}`);
if (pedido.estadoPago === "Pagado") {
    mostrarExito();
}
```

### 3. Mostrar descuento (configurable por admin)

El % de descuento se lee desde la BD y puede cambiarlo el admin. Mostrar:

```
Total original:    $1.000,00
Descuento:       -$100,00  (10%)
Total a pagar:    $900,00
```

---

## 9. Ejemplo de flujo completo (React)

```javascript
// 1. Login
const login = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
});
const { token } = await login.json();

// 2. Agregar al carrito
await fetch('/api/carrito/items', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ productoId: 1, cantidad: 2 })
});

// 3. Checkout con tipo de pago
const checkout = await fetch('/api/carrito/checkout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fechaEntrega: '2026-05-20', tipoPago: 'Efectivo' })
});
const pedido = await checkout.json();

// 4. Ver datos de pago (dirección o CVU)
const datosPago = await fetch(`/api/pedidos/${pedido.id}/datos-pago`, {
    headers: { Authorization: `Bearer ${token}` }
});
// → Muestra dirección de retiro y monto con descuento

// 5a. Si es Transferencia, cliente marca como pagado
await fetch(`/api/pedidos/${pedido.id}/procesar-pago`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
});

// 5b. Si es Mercado Pago
const preferencia = await fetch(`/api/mercadopago/crear-preferencia?pedidoId=${pedido.id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailPagador: userEmail })
});
const mp = await preferencia.json();
window.location.href = mp.initPoint;
```

---

*Documento para integrar frontend con backend — Proyecto Softpan — Actualizado Mayo 2026*

# Feature: Stock Inmediato

## Resumen del problema

Actualmente la tienda trata todos los productos por igual: se agregan al carrito, se checkout y quedan en estado `Pendiente` hasta que un administrador confirma manualmente el pedido. No hay distinción entre productos que **ya están producidos y listos para retirar** vs productos que **se hacen bajo pedido**.

### Ejemplo concreto

- La panadería produce 4 tortas de manzana que ya están físicamente en el local.
- Un cliente las ve en la web, las compra y quiere retirarlas **hoy mismo**.
- Con el sistema actual, el pedido queda `Pendiente` y el admin tiene que confirmarlo manualmente, cuando en realidad el stock ya existe y debería poder auto-confirmarse.

---

## Solución propuesta

Agregar el concepto de **stock inmediato** a nivel de producto, y **tipo de entrega** a nivel de pedido.

### 1. Entidades de dominio (`Softpan.Domain`)

#### `Entities/Producto.cs` — Nuevo campo

```csharp
public bool StockInmediato { get; set; } = false;
```

- `true` = el producto está físicamente disponible (stock inmediato).
- `false` = el producto se hace bajo pedido (comportamiento actual).
- No reemplaza `Stock` ni `StockMinimo`, los complementa.
- Un producto con `StockInmediato = true` y `Stock = 4` tiene 4 unidades listas para retirar hoy.
- Un producto con `StockInmediato = false` puede tener `Stock = 0` o cualquier valor (indica capacidad de producción).

#### `Entities/Pedido.cs` — Nuevos campos

```csharp
public bool EsRetiroInmediato { get; set; } = false;
public string? TipoEntrega { get; set; } // "RetiroInmediato", "RetiroProgramado", "Envio"
```

- `TipoEntrega` almacena la selección del cliente al hacer checkout.
- `EsRetiroInmediato` indica que el pedido completo califica para retiro inmediato (todos los items son `StockInmediato` y el cliente eligió retiro hoy).

#### `Enums/TipoEntregaEnum.cs` — Nuevo enum

```csharp
public enum TipoEntregaEnum
{
    RetiroInmediato = 1,   // Hoy mismo, stock ya disponible
    RetiroProgramado = 2,  // Fecha futura acordada
    Envio = 3              // A domicilio
}
```

---

### 2. Capa de aplicación (`Softpan.Application`)

#### DTOs a modificar

| DTO | Campo nuevo |
|-----|-------------|
| `ProductoDto` | `bool StockInmediato` |
| `ProductoDetalleDto` | `bool StockInmediato` |
| `CreateProductoDto` | `bool StockInmediato` |
| `UpdateProductoDto` | `bool StockInmediato` |
| `CarritoItemDto` | `bool ProductoStockInmediato` |
| `PedidoDto` | `string? TipoEntrega`, `bool EsRetiroInmediato` |
| `PedidoResumenDto` | `string? TipoEntrega`, `bool EsRetiroInmediato` |
| `ProcesarCheckoutDto` | `TipoEntregaEnum? TipoEntrega` |

#### `Validators/ProcesarCheckoutValidator.cs` — Validación condicional de fecha

La validación actual exige `FechaEntrega >= DateTime.Today`. Con el nuevo campo:

- Si `TipoEntrega = RetiroInmediato`: `FechaEntrega` puede ser hoy (se auto-asigna a la fecha actual si no se envía).
- Si `TipoEntrega = RetiroProgramado` o `Envio`: `FechaEntrega` debe ser futura (comportamiento actual).

#### `Services/PedidoService.cs` — Lógica de negocio

**`AgregarItemAlCarritoAsync`:**
- Decisión de negocio: ¿se permite mezclar items inmediatos y bajo pedido en un mismo carrito?

**`ProcesarCheckoutDesdeCarritoAsync`:**
- Si todos los items son `StockInmediato` y `TipoEntrega = RetiroInmediato`:
  - Auto-deducir stock (`DescontarStock`)
  - Marcar `StockDescontado = true`
  - Pasar directamente a `Estado = Confirmado` (salta la aprobación manual del admin)
  - Marcar `EsRetiroInmediato = true`
- Si hay items bajo pedido o `TipoEntrega = RetiroProgramado/Envio`:
  - Flujo normal: `Estado = Pendiente`, admin confirma manualmente

**`CancelarPedidoAsync` y `UpdateEstadoPedidoAsync`:**
- Si `EsRetiroInmediato` y `StockDescontado`, restaurar stock al cancelar.

**`UpdateEstadoPedidoAsync` (admin: Pendiente → Confirmado):**
- Ya descuenta stock. No necesita cambios, solo verificar que no intente descontar dos veces si ya se descontó en checkout inmediato.

---

### 3. Capa de API (`Softpan.API`)

#### Endpoints existentes (sin cambios, solo incluyen el nuevo campo automáticamente)

| Endpoint | Método | Cambio |
|----------|--------|--------|
| `GET /api/catalogo/productos` | GET | Incluirá `stockInmediato` en la respuesta |
| `GET /api/catalogo/productos/{id}` | GET | Incluirá `stockInmediato` |
| `GET /api/catalogo/productos/categoria/{categoria}` | GET | Incluirá `stockInmediato` |
| `GET /api/catalogo/productos/buscar` | GET | Incluirá `stockInmediato` |
| `POST /api/carrito/checkout` | POST | Aceptará `TipoEntrega` en el body |
| `GET /api/carrito` | GET | Incluirá `productoStockInmediato` por item |
| `GET /api/pedidos/mis-pedidos` | GET | Incluirá `tipoEntrega` y `esRetiroInmediato` |
| `GET /api/pedidos/{id}` | GET | Incluirá `tipoEntrega` y `esRetiroInmediato` |

#### Posibles nuevos endpoints admin

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `PUT /api/productos/{id}/stock-inmediato` | PUT | Toggle del flag |
| `GET /api/productos/inmediatos` | GET | Filtrar solo inmediatos |

---

### 4. Capa de infraestructura (`Softpan.Infrastructure`)

#### Migración EF Core

```sql
-- Tabla Productos
ALTER TABLE Productos ADD COLUMN StockInmediato bit NOT NULL DEFAULT 0;

-- Tabla Pedidos
ALTER TABLE Pedidos ADD COLUMN EsRetiroInmediato bit NOT NULL DEFAULT 0;
ALTER TABLE Pedidos ADD COLUMN TipoEntrega nvarchar(50) NULL;
```

---

### 5. Diagrama de flujo

```
Producto.StockInmediato = true               Producto.StockInmediato = false
       │                                              │
       │ Stock físico disponible                      │ Bajo pedido (se fabrica)
       │ Stock > 0                                    │ Stock puede ser 0
       │                                              │
  Checkout con                                     Checkout con
  TipoEntrega = RetiroInmediato                    TipoEntrega = RetiroProgramado o Envio
       │                                              │
       ▼                                              ▼
  Estado = Confirmado (automático)               Estado = Pendiente
  Stock descontado automático                     Stock NO descontado
  FechaEntrega = hoy (auto-asignado)              FechaEntrega = la que el cliente eligió
       │                                              │
       ▼                                              ▼
  Pendiente de pago (si aplica)                   Admin revisa pedido
  Luego: Estado = Listo → Entregado               Admin confirma → Confirmado
                                                   Stock descontado
                                                   Se prepara → Listo → Entregado
```

---

## Preguntas a definir

### 1. Mezcla de items en el carrito

¿Se permite mezclar productos con `StockInmediato = true` y productos con `StockInmediato = false` en un mismo carrito/pedido?

- Opción A: **No se permite mezclar**. Si hay algún item bajo pedido, el carrito completo se trata como "bajo pedido" (fecha futura). El frontend debería advertir al usuario.
- Opción B: **Se permite mezclar**, pero el pedido completo se trata como bajo pedido (el item inmediato espera hasta que el bajo pedido esté listo).
- Opción C: **Se permite mezclar** y se dividen en dos pedidos separados (uno inmediato, uno programado). Más complejo.

### 2. Nivel del tipo de entrega

¿El tipo de entrega se selecciona a nivel de **pedido completo** o a nivel de **cada item**?

- Pedido completo: un único método de entrega para todo el carrito (más simple).
- Por item: cada producto podría tener su propia entrega (ej: una torta inmediata para retirar hoy + otra personalizada para envío la próxima semana). Mucho más complejo.

### 3. Límite de cantidad para stock inmediato

¿Se debe validar que la cantidad solicitada no supere el stock disponible para productos inmediatos?

- Actualmente el sistema valida `TieneStock(cantidad)` en varios puntos. Para inmediatos, esta validación **sí aplica** (no se pueden vender más unidades de las que hay físicamente).
- Para bajo pedido, el stock es indicativo de capacidad de producción. ¿Se sigue validando?

### 4. Flujo de pago para retiro inmediato

Para retiro inmediato con auto-confirmación:

- Si el pago es **Efectivo** o **Transferencia**: el pedido se auto-confirma y el stock se descuenta, aunque el pago esté pendiente. ¿Es correcto?
- Si el pago es **Mercado Pago**: ¿esperar a que el pago se confirme antes de auto-confirmar y descontar stock?
- Opción: auto-confirmar SOLO si el pago es inmediato (MercadoPago). Para efectivo/transferencia, mantener el flujo actual (admin confirma).

### 5. Envío a domicilio

Para `TipoEntrega = Envio`:

- ¿Se necesita agregar un campo de dirección de envío en el checkout?
- ¿Hay un costo de envío? ¿Depende de la distancia?
- ¿El envío es solo para productos inmediatos o también para bajo pedido?

### 6. Catálogo: filtros y visibilidad

En la lista de productos (`ProductsList`):

- ¿Mostrar un badge/label "Disponible hoy" en los productos inmediatos?
- ¿Agregar filtro "Disponibilidad: Inmediato / Bajo pedido / Todos"?
- ¿Ocultar productos bajo pedido con stock 0?

### 7. Admin: gestión de stock inmediato

En el panel admin:

- ¿El flag `StockInmediato` se configura en el formulario de crear/editar producto?
- ¿Se necesita un endpoint rápido (toggle) para marcar/desmarcar desde la lista de productos?
- ¿Cuándo un producto inmediato agota stock, se desmarca automáticamente como `StockInmediato = false`?

# 🗺️ DIAGRAMA COMPLETO DEL SISTEMA - TIENDA ONLINE PANADERÍA

## 📊 ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TIENDA ONLINE PANADERÍA                             │
│                     React + Vite + ASP.NET Core API                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
            ┌───────▼────────┐                 ┌────────▼────────┐
            │  ÁREA CLIENTE  │                 │  ÁREA ADMIN     │
            │   (Pública)    │                 │  (Protegida)    │
            └───────┬────────┘                 └────────┬────────┘
                    │                                   │
        ┌───────────┴───────────┐          ┌───────────┴────────────┐
        │                       │          │                        │
    ┌───▼────┐            ┌────▼─────┐  ┌─▼──────┐         ┌──────▼──────┐
    │ CATÁLOGO│            │ USUARIO  │  │PRODUCTOS│         │   PEDIDOS   │
    └─────────┘            └──────────┘  └─────────┘         └─────────────┘
```

---

## 🎯 MÓDULO 1: AUTENTICACIÓN Y USUARIOS

```
┌──────────────────────────────────────────────────────────────┐
│                    SISTEMA DE AUTENTICACIÓN                   │
└──────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    ┌───▼────┐         ┌────▼─────┐       ┌────▼─────┐
    │ REGISTRO│         │  LOGIN   │       │  PERFIL  │
    └────┬───┘         └────┬─────┘       └────┬─────┘
         │                  │                   │
         │                  │                   │
    ┌────▼──────────────────▼───────────────────▼─────┐
    │                                                  │
    │  ✅ Registro de clientes                         │
    │  ✅ Login con email/password                     │
    │  ✅ JWT Token (localStorage)                     │
    │  ✅ Roles: Cliente, Admin, Vendedor              │
    │  ✅ Editar perfil (nombre, teléfono, dirección)  │
    │  ✅ Cambiar contraseña                           │
    │  ✅ Auto-logout en token expirado (401)          │
    │  ✅ Persistencia de sesión                       │
    │                                                  │
    └──────────────────────────────────────────────────┘

    📁 Archivos:
       - src/context/AuthContext.jsx
       - src/components/Auth.jsx
       - src/components/Perfil.jsx
       - src/services/PerfilService.js
```

---

## 🛍️ MÓDULO 2: CATÁLOGO Y PRODUCTOS (CLIENTE)

```
┌──────────────────────────────────────────────────────────────┐
│                    CATÁLOGO DE PRODUCTOS                      │
└──────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    ┌───▼────┐         ┌────▼─────┐       ┌────▼─────┐
    │  HOME  │         │  LISTA   │       │ DETALLE  │
    └────┬───┘         └────┬─────┘       └────┬─────┘
         │                  │                   │
         │                  │                   │
    ┌────▼──────────────────▼───────────────────▼─────┐
    │                                                  │
    │  ✅ Página de inicio con categorías              │
    │  ✅ Listado de productos activos                 │
    │  ✅ Filtro por categoría                         │
    │  ✅ Ordenamiento (precio, nombre, A-Z)           │
    │  ✅ Vista detalle con galería de imágenes        │
    │  ✅ Selector de cantidad                         │
    │  ✅ Agregar al carrito                           │
    │  ✅ Imágenes múltiples por producto              │
    │  ✅ Skeleton loading states                      │
    │  ✅ Responsive design                            │
    │                                                  │
    │  ❌ Búsqueda por texto (falta implementar)       │
    │  ❌ Filtro por rango de precios                  │
    │                                                  │
    └──────────────────────────────────────────────────┘

    📁 Archivos:
       - src/components/Home.jsx
       - src/components/ProductsList.jsx
       - src/components/ProductDetail.jsx
       - src/hooks/useProducts.js
```

---

## 🛒 MÓDULO 3: CARRITO DE COMPRAS

```
┌──────────────────────────────────────────────────────────────┐
│                    CARRITO DE COMPRAS                         │
└──────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    ┌───▼────┐         ┌────▼─────┐       ┌────▼─────┐
    │ AGREGAR│         │   VER    │       │ CHECKOUT │
    └────┬───┘         └────┬─────┘       └────┬─────┘
         │                  │                   │
         │                  │                   │
    ┌────▼──────────────────▼───────────────────▼─────┐
    │                                                  │
    │  ✅ Agregar productos con cantidad               │
    │  ✅ Ver carrito completo                         │
    │  ✅ Eliminar productos (con confirmación)        │
    │  ✅ Calcular total automático                    │
    │  ✅ Persistencia en localStorage                 │
    │  ✅ Contador en navbar                           │
    │  ✅ Vaciar carrito después de pedido             │
    │                                                  │
    │  ❌ Incrementar/decrementar cantidad (+/-)       │
    │  ❌ Validación de stock disponible               │
    │  ❌ Aplicar cupones de descuento                 │
    │                                                  │
    └──────────────────────────────────────────────────┘

    📁 Archivos:
       - src/context/CarritoContext.jsx
       - src/components/Cart.jsx
       - src/components/Checkout.jsx
```

---

## 📦 MÓDULO 4: PEDIDOS (CLIENTE)

```
┌──────────────────────────────────────────────────────────────┐
│                    GESTIÓN DE PEDIDOS                         │
└──────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    ┌───▼────┐         ┌────▼─────┐       ┌────▼─────┐
    │ CREAR  │         │   VER    │       │ CANCELAR │
    └────┬───┘         └────┬─────┘       └────┬─────┘
         │                  │                   │
         │                  │                   │
    ┌────▼──────────────────▼───────────────────▼─────┐
    │                                                  │
    │  ✅ Crear pedido desde carrito                   │
    │  ✅ Seleccionar fecha de entrega                 │
    │  ✅ Agregar observaciones                        │
    │  ✅ Ver historial de pedidos                     │
    │  ✅ Ver detalle de cada pedido                   │
    │  ✅ Estados visuales (Pendiente, Confirmado...)  │
    │  ✅ Cancelar pedidos pendientes                  │
    │  ✅ Restauración automática de stock             │
    │  ✅ Confirmación antes de cancelar               │
    │  ✅ Botón cancelar en tarjeta y modal            │
    │                                                  │
    │  ❌ Notificaciones por email                     │
    │  ❌ Seguimiento en tiempo real                   │
    │  ❌ Calificación de pedidos                      │
    │                                                  │
    └──────────────────────────────────────────────────┘

    📁 Archivos:
       - src/components/Checkout.jsx
       - src/components/MisPedidos.jsx
       - src/services/PedidoService.js
```

---

## 🔧 MÓDULO 5: PANEL ADMINISTRATIVO - PRODUCTOS

```
┌──────────────────────────────────────────────────────────────┐
│                  GESTIÓN DE PRODUCTOS (ADMIN)                 │
└──────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    ┌───▼────┐         ┌────▼─────┐       ┌────▼─────┐
    │  CRUD  │         │ IMÁGENES │       │  STOCK   │
    └────┬───┘         └────┬─────┘       └────┬─────┘
         │                  │                   │
         │                  │                   │
    ┌────▼──────────────────▼───────────────────▼─────┐
    │                                                  │
    │  ✅ Listar todos los productos                   │
    │  ✅ Crear nuevo producto                         │
    │  ✅ Editar producto existente                    │
    │  ✅ Eliminar producto (con confirmación)         │
    │  ✅ Activar/desactivar productos                 │
    │  ✅ Subir múltiples imágenes                     │
    │  ✅ Marcar imagen principal                      │
    │  ✅ Ordenar imágenes                             │
    │  ✅ Eliminar imágenes                            │
    │  ✅ Actualizar stock y stock mínimo              │
    │  ✅ Filtros: búsqueda, categoría, estado         │
    │  ✅ Vista responsive (tabla + grid mobile)       │
    │  ✅ Alertas de stock bajo                        │
    │                                                  │
    │  ❌ Importación masiva (CSV/Excel)               │
    │  ❌ Duplicar producto                            │
    │  ❌ Historial de cambios                         │
    │                                                  │
    └──────────────────────────────────────────────────┘

    📁 Archivos:
       - src/components/admin/AdminProductos.jsx
       - src/components/admin/ProductoForm.jsx
       - src/components/admin/AdminProductoImagenes.jsx
       - src/components/admin/ImageUploader.jsx
       - src/services/ProductoService.js
       - src/services/ProductoImagenService.js
```

---

## 📊 MÓDULO 6: PANEL ADMINISTRATIVO - PEDIDOS

```
┌──────────────────────────────────────────────────────────────┐
│                  GESTIÓN DE PEDIDOS (ADMIN)                   │
└──────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    ┌───▼────┐         ┌────▼─────┐       ┌────▼─────┐
    │ LISTAR │         │ CAMBIAR  │       │ REPORTES │
    │        │         │ ESTADO   │       │          │
    └────┬───┘         └────┬─────┘       └────┬─────┘
         │                  │                   │
         │                  │                   │
    ┌────▼──────────────────▼───────────────────▼─────┐
    │                                                  │
    │  ❌ Listar todos los pedidos                     │
    │  ❌ Filtrar por estado                           │
    │  ❌ Filtrar por fecha                            │
    │  ❌ Ver detalle completo                         │
    │  ❌ Cambiar estado del pedido                    │
    │  ❌ Ver datos del cliente                        │
    │  ❌ Dashboard con estadísticas                   │
    │  ❌ Pedidos del día/semana/mes                   │
    │  ❌ Productos más vendidos                       │
    │  ❌ Exportar a Excel/PDF                         │
    │                                                  │
    │  ⚠️  ACTUALMENTE: Solo placeholder               │
    │                                                  │
    └──────────────────────────────────────────────────┘

    📁 Archivos:
       - src/App.jsx (AdminPedidos placeholder)
       - ⚠️ Falta implementar componente completo
```

---

## 🔐 MÓDULO 7: SEGURIDAD Y PROTECCIÓN

```
┌──────────────────────────────────────────────────────────────┐
│                    SISTEMA DE SEGURIDAD                       │
└──────────────────────────────────────────────────────────────┘

    ✅ Autenticación JWT
    ✅ Protección de rutas admin (ProtectedRoute)
    ✅ Validación de roles (Admin, Vendedor, Cliente)
    ✅ Sanitización de errores (XSS prevention)
    ✅ Interceptor de errores 401 (auto-logout)
    ✅ Timeout en peticiones HTTP
    ✅ Validación de formularios
    ✅ Confirmaciones en acciones críticas
    ✅ Headers de seguridad (Content-Type)

    📁 Archivos:
       - src/security.js
       - src/components/admin/ProtectedRoute.jsx
       - src/context/AuthContext.jsx
```

---

## 🎨 MÓDULO 8: UI/UX Y NAVEGACIÓN

```
┌──────────────────────────────────────────────────────────────┐
│                    INTERFAZ Y EXPERIENCIA                     │
└──────────────────────────────────────────────────────────────┘

    ✅ Navbar responsive con menú hamburguesa
    ✅ Footer con información de contacto
    ✅ Skeleton screens (loading states)
    ✅ Animaciones CSS (fade-in, slide-in)
    ✅ Toast notifications (react-toastify)
    ✅ Modales de confirmación (SweetAlert2)
    ✅ Scroll automático al cambiar ruta
    ✅ Iconos (React Icons, Bootstrap Icons)
    ✅ Diseño responsive (mobile-first)
    ✅ Estados vacíos (empty states)
    ✅ Badges y etiquetas visuales

    📁 Archivos:
       - src/components/Navbar.jsx
       - src/components/Footer.jsx
       - src/components/Skeleton.jsx
       - src/App.css
       - src/index.css
       - src/admin.css
```

---

## 🔌 MÓDULO 9: INTEGRACIÓN CON API

```
┌──────────────────────────────────────────────────────────────┐
│                    SERVICIOS Y API REST                       │
└──────────────────────────────────────────────────────────────┘

    BASE URL: http://localhost:7097

    ✅ ENDPOINTS PÚBLICOS:
       GET  /api/catalogo/productos
       GET  /api/catalogo/productos/{id}
       GET  /api/catalogo/categorias
       GET  /api/catalogo/productos/buscar?q={query}
       POST /api/auth/login
       POST /api/auth/register-cliente

    ✅ ENDPOINTS CLIENTE (Auth requerida):
       GET  /api/pedidos/mis-pedidos
       GET  /api/pedidos/{id}
       POST /api/pedidos
       PUT  /api/pedidos/{id}/cancelar
       GET  /api/perfil
       PUT  /api/perfil
       PUT  /api/perfil/cambiar-password

    ✅ ENDPOINTS ADMIN (Auth + Role Admin):
       GET    /api/productos
       GET    /api/productos/{id}
       POST   /api/productos
       PUT    /api/productos/{id}
       PUT    /api/productos/{id}/stock
       DELETE /api/productos/{id}
       GET    /api/productos/{id}/imagenes
       POST   /api/productos/{id}/imagenes
       PUT    /api/productos/{id}/imagenes/{imagenId}
       DELETE /api/productos/{id}/imagenes/{imagenId}

    📁 Archivos:
       - src/config/api.js
       - src/services/ProductoService.js
       - src/services/PedidoService.js
       - src/services/PerfilService.js
       - src/services/ProductoImagenService.js
```

---

# 🚨 PROBLEMAS POR RESOLVER

## 🔴 CRÍTICOS (Bloqueantes para producción)

### 1. **GESTIÓN DE CANTIDAD EN CARRITO**
**Problema:** Actualmente solo se puede eliminar un producto completo del carrito, no se puede modificar la cantidad.

**Impacto:** UX deficiente - Si un usuario quiere cambiar de 5 a 3 unidades, debe eliminar y volver a agregar.

**Solución requerida:**
- Agregar botones `+` y `-` en cada item del carrito
- Función `incrementarCantidad(id)` en CarritoContext
- Función `decrementarCantidad(id)` en CarritoContext
- Si cantidad llega a 0, eliminar del carrito
- Validación: cantidad mínima = 1

**Archivos a modificar:**
- `src/context/CarritoContext.jsx` (agregar funciones)
- `src/components/Cart.jsx` (agregar botones UI)

**Complejidad:** 🟢 Baja (2-3 horas)

---

### 2. **BÚSQUEDA DE PRODUCTOS**
**Problema:** No existe barra de búsqueda. Los usuarios solo pueden filtrar por categoría.

**Impacto:** Dificulta encontrar productos específicos cuando hay muchos en el catálogo.

**Solución requerida:**
- Agregar input de búsqueda en Navbar
- Estado `searchQuery` en ProductsList o contexto global
- Filtrar productos por nombre/descripción en tiempo real
- Mostrar "No se encontraron resultados" si no hay coincidencias
- Opcional: Usar endpoint `/api/catalogo/productos/buscar?q={query}` del backend

**Archivos a modificar:**
- `src/components/Navbar.jsx` (agregar input)
- `src/components/ProductsList.jsx` (lógica de filtrado)
- Opcional: `src/context/CarritoContext.jsx` (estado global)

**Complejidad:** 🟡 Media (4-6 horas)

---

### 3. **PANEL DE GESTIÓN DE PEDIDOS (ADMIN)**
**Problema:** Actualmente es solo un placeholder. Los admins no pueden ver ni gestionar pedidos.

**Impacto:** CRÍTICO - Sin esto no pueden operar el negocio.

**Solución requerida:**
- Crear componente `AdminPedidos.jsx` completo
- Listar todos los pedidos con paginación
- Filtros: por estado, por fecha, por cliente
- Vista detalle de cada pedido
- Cambiar estado del pedido (Pendiente → Confirmado → En Preparación → Listo → Entregado)
- Mostrar datos del cliente
- Calcular totales y estadísticas básicas

**Endpoints disponibles (backend):**
- `GET /api/pedidos/todos`
- `GET /api/pedidos/estado/{estadoId}`
- `PUT /api/pedidos/{id}/estado`

**Archivos a crear/modificar:**
- `src/components/admin/AdminPedidos.jsx` (crear)
- `src/services/AdminPedidoService.js` (crear)
- `src/App.jsx` (reemplazar placeholder)

**Complejidad:** 🔴 Alta (12-16 horas)

---

## 🟠 IMPORTANTES (Mejoran significativamente la experiencia)

### 4. **VALIDACIÓN DE STOCK EN TIEMPO REAL**
**Problema:** El frontend no valida si hay stock disponible antes de agregar al carrito.

**Impacto:** Usuario puede agregar 100 unidades cuando solo hay 5 en stock.

**Solución requerida:**
- Validar stock disponible al agregar al carrito
- Mostrar stock disponible en ProductDetail
- Deshabilitar botón "Agregar" si no hay stock
- Mensaje: "Stock insuficiente" si intenta agregar más de lo disponible
- Actualizar stock después de crear pedido (backend ya lo hace)

**Archivos a modificar:**
- `src/components/ProductDetail.jsx`
- `src/context/CarritoContext.jsx`

**Complejidad:** 🟡 Media (3-4 horas)

---

### 5. **OPTIMIZACIÓN DE CARGA DE PRODUCTOS**
**Problema:** 
- Se cargan TODOS los productos al inicio (delay artificial de 2 segundos)
- No hay caché
- No hay lazy loading de imágenes
- Filtro por categoría se hace en frontend (ineficiente)

**Impacto:** Performance pobre con muchos productos (>100).

**Solución requerida:**
- Eliminar delay artificial en `useProducts.js`
- Implementar caché de productos (5 minutos)
- Usar endpoint `/api/catalogo/productos/categoria/{categoria}` para filtros
- Lazy loading de imágenes (Intersection Observer o librería)
- Opcional: Paginación o scroll infinito

**Archivos a modificar:**
- `src/hooks/useProducts.js`
- `src/components/ProductsList.jsx`
- `src/components/ProductDetail.jsx`

**Complejidad:** 🟡 Media (6-8 horas)

---

### 6. **DASHBOARD ADMINISTRATIVO**
**Problema:** No existe un dashboard con estadísticas y métricas del negocio.

**Impacto:** Los admins no tienen visibilidad de ventas, productos más vendidos, etc.

**Solución requerida:**
- Crear componente `Dashboard.jsx`
- Mostrar:
  - Total de pedidos del día/semana/mes
  - Total de ventas (dinero)
  - Productos con stock bajo
  - Productos más vendidos
  - Últimos pedidos
  - Gráficos básicos (opcional)

**Endpoints necesarios (backend):**
- Crear endpoints de estadísticas en backend
- O calcular en frontend desde datos existentes

**Archivos a crear:**
- `src/components/admin/Dashboard.jsx`
- `src/services/EstadisticasService.js`

**Complejidad:** 🔴 Alta (10-12 horas)

---

## 🟡 DESEABLES (Nice to have)

### 7. **NOTIFICACIONES POR EMAIL**
**Problema:** No se envían emails al crear/cambiar estado de pedidos.

**Solución:** Integrar servicio de email (SendGrid, Mailgun) en backend.

**Complejidad:** 🟡 Media (4-6 horas backend)

---

### 8. **FILTRO POR RANGO DE PRECIOS**
**Problema:** Solo se puede ordenar por precio, no filtrar por rango.

**Solución:** Agregar slider de rango de precios en ProductsList.

**Complejidad:** 🟢 Baja (2-3 horas)

---

### 9. **SISTEMA DE FAVORITOS/WISHLIST**
**Problema:** No se pueden guardar productos favoritos.

**Solución:** Contexto de favoritos + persistencia en localStorage.

**Complejidad:** 🟡 Media (4-5 horas)

---

### 10. **EXPORTACIÓN DE PEDIDOS**
**Problema:** No se pueden exportar pedidos a Excel/PDF.

**Solución:** Librería de exportación (xlsx, jsPDF) en AdminPedidos.

**Complejidad:** 🟡 Media (3-4 horas)

---

### 11. **COMPRESIÓN AUTOMÁTICA DE IMÁGENES**
**Problema:** Las imágenes subidas pueden ser muy pesadas.

**Solución:** Comprimir imágenes antes de subir (browser-image-compression).

**Complejidad:** 🟢 Baja (2-3 horas)

---

### 12. **HISTORIAL DE CAMBIOS EN PRODUCTOS**
**Problema:** No se registra quién modificó qué y cuándo.

**Solución:** Tabla de auditoría en backend + vista en frontend.

**Complejidad:** 🔴 Alta (8-10 horas)

---

## 📊 RESUMEN DE PRIORIDADES

| Prioridad | Problema | Complejidad | Tiempo Estimado |
|-----------|----------|-------------|-----------------|
| 🔴 CRÍTICO | Gestión de cantidad en carrito | 🟢 Baja | 2-3 horas |
| 🔴 CRÍTICO | Búsqueda de productos | 🟡 Media | 4-6 horas |
| 🔴 CRÍTICO | Panel de gestión de pedidos | 🔴 Alta | 12-16 horas |
| 🟠 IMPORTANTE | Validación de stock | 🟡 Media | 3-4 horas |
| 🟠 IMPORTANTE | Optimización de carga | 🟡 Media | 6-8 horas |
| 🟠 IMPORTANTE | Dashboard admin | 🔴 Alta | 10-12 horas |
| 🟡 DESEABLE | Notificaciones email | 🟡 Media | 4-6 horas |
| 🟡 DESEABLE | Filtro por precio | 🟢 Baja | 2-3 horas |
| 🟡 DESEABLE | Favoritos | 🟡 Media | 4-5 horas |
| 🟡 DESEABLE | Exportación pedidos | 🟡 Media | 3-4 horas |
| 🟡 DESEABLE | Compresión imágenes | 🟢 Baja | 2-3 horas |
| 🟡 DESEABLE | Historial de cambios | 🔴 Alta | 8-10 horas |

**TOTAL CRÍTICOS:** 18-25 horas  
**TOTAL IMPORTANTES:** 19-24 horas  
**TOTAL DESEABLES:** 23-31 horas  

**GRAN TOTAL:** 60-80 horas de desarrollo

---

## 🎯 PLAN DE ACCIÓN SUGERIDO

### **SPRINT 1: Funcionalidades Críticas (1 semana)**
1. ✅ Gestión de cantidad en carrito (Día 1)
2. ✅ Búsqueda de productos (Día 2)
3. ✅ Panel de gestión de pedidos (Días 3-5)

### **SPRINT 2: Optimizaciones (1 semana)**
4. ✅ Validación de stock (Día 1)
5. ✅ Optimización de carga (Días 2-3)
6. ✅ Dashboard admin (Días 4-5)

### **SPRINT 3: Mejoras Opcionales (según tiempo)**
7. Notificaciones email
8. Filtros adicionales
9. Exportaciones
10. Compresión de imágenes

---

## 📝 NOTAS FINALES

- El sistema está **80% completo** y funcional
- Los problemas críticos son principalmente de **UX y gestión**
- La arquitectura base es **sólida y escalable**
- El código está **bien organizado y documentado**
- Se recomienda resolver los **3 problemas críticos** antes de producción

**Fecha de creación:** 2024  
**Última actualización:** Hoy  
**Estado:** LISTO PARA DESARROLLO

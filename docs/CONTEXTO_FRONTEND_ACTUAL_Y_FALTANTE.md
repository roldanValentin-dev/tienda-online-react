# CONTEXTO ACTUAL DEL PROYECTO - FRONTEND
# Tienda Online Panadería

## 📋 TECNOLOGÍAS Y ESTACK ACTUAL
- **Framework**: React 19.2.4
- **Build Tool**: Vite 8.0.1
- **Routing**: React Router DOM v7.14.0
- **State Management**: React Context (AuthContext, CarritoContext)
- **HTTP Client**: Axios 1.15.0
- **UI Library**: Bootstrap 5.3.8 + CSS tradicional
- **Notificaciones**: React Toastify 11.1.0 (pendiente de implementar completamente)
- **Iconos**: React Icons 5.6.0
- **Alertas**: SweetAlert2 11.26.24
- **Formularios**: Validaciones básicas con HTML5 + JavaScript

## ✅ FUNCIONALIDADES FRONTEND YA IMPLEMENTADAS Y FUNCIONANDO

### 1. AUTENTICACIÓN Y SEGURIDAD
- ✅ Login/registro con validaciones robustas
- ✅ Manejo de JWT tokens con almacenamiento en localStorage
- ✅ Protección de rutas privadas
- ✅ Refresh implícito mediante interceptor de axios (manejo de 401)
- ✅ Sanitización de mensajes de error para evitar XSS
- ✅ Context provider para estado de autenticación global

### 2. CATÁLOGO DE PRODUCTOS
- ✅ Listado de productos con carga inicial y estados de esqueleto
- ✅ Detalle de producto individual
- ✅ Filtrado por categoría (obtenido del contexto de carrito)
- ✅ Ordenamiento por precio (asc/desc) y nombre (asc/desc)
- ✅ Visualización de imágenes con fallback a placeholders
- ✅ Navegación al detalle mediante clic en tarjeta
- ✅ Estado activo/inactivo de productos respetado

### 3. CARRITO DE COMPRAS
- ✅ Agregar productos al carrito
- ✅ Eliminar productos completos del carrito
- ✅ Persistencia en localStorage
- ✅ Cálculo automático del total
- ✅ Context provider para estado global del carrito
- ✅ Vinculación con categoría seleccionada para filtros

### 4. PROCESO DE PEDIDO (CHECKOUT)
- ✅ Validación de autenticación antes de acceder
- ✅ Validación de carrito vacío
- ✅ Validación de fecha de entrega (mínimo mañana)
- ✅ Preparación de datos según DTO del backend
- ✅ Envío de pedido mediante PedidoService
- ✅ Manejo de estados de carga
- ✅ Notificaciones de éxito/error con SweetAlert2
- ✅ Vaciar carrito tras pedido exitoso
- ✅ Redirección a mis pedidos después de confirmar

### 5. MIS PEDIDOS
- ✅ Listado de pedidos del usuario autenticado
- ✅ Detalle individual de pedido
- ✅ Visualización de items con imagen, nombre, cantidad y precio
- ✅ Visualización de total y fecha
- ✅ Indicadores visuales de estado (pendiente, completado, etc.)

### 6. PERFIL DE USUARIO
- ✅ Visualización de datos personales
- ✅ Edición de información de perfil
- ✅ Cambio de contraseña
- ✅ Validaciones en formularios

### 7. NAVEGACIÓN Y LAYOUT
- ✅ Navbar responsive con enlaces a secciones principales
- ✅ Footer informativo
- ✅ Scroll automático al inicio al cambiar de ruta
- ✅ Container personalizado para centrado de contenido
- ✅ Diseño responsive que adapta a móvil, tablet y desktop

### 8. COMPONENTES REUTILIZABLES
- ✅ Skeleton.jsx para estados de carga
- ✅ Layouts básicos para páginas
- ✅ Manejo de errores de imagen con fallback
- ✅ Toast notifications configuradas (pendiente de uso generalizado)

## ❌ FUNCIONALIDADES FRONTEND FALTANTES PARA IMPLEMENTAR

### **PRIORIDAD ALTA - Esenciales para MVP completo**

#### 1. GESTIÓN DE CANTIDAD EN CARRITO 🔴
- **Estado actual**: Solo eliminación completa de productos
- **Falta implementar**:
  - Botones de incrementar/decrementar cantidad (+/-) en cada item del carrito
  - Actualización en tiempo real del subtotal por producto
  - Validación de stock máximo (si aplica)
  - Eliminación automática cuando cantidad llega a 0
  - Persistencia inmediata en localStorage tras cambio de cantidad

#### 2. BÚSQUEDA DE PRODUCTOS 🔴
- **Estado actual**: Solo filtrado por categoría, no búsqueda por texto
- **Falta implementar**:
  - Barra de búsqueda en el navbar o en ProductsList
  - Búsqueda en tiempo real por nombre y descripción
  - Debounce para evitar llamadas excesivas al backend
  - Visualización de "No se encontraron resultados" cuando corresponde
  - Mantener filtros de categoría activos durante búsqueda
  - Indicador de carga durante búsqueda

#### 3. NOTIFICACIONES MEJORADAS (TOAST) 🟡
- **Estado actual**: Uso limitado de SweetAlert2, react-toastify instalado pero no generalizado
- **Falta implementar**:
  - Notificaciones toast para acciones comunes:
    - Producto agregado al carrito
    - Producto eliminado del carrito
    - Error al agregar producto (stock insuficiente)
    - Pedido creado exitosamente
    - Error al crear pedido
    - Sesión expirada
    - Actualización de perfil exitosa
  - Configuración de posición, duración y comportamiento
  - Reemplazo gradual de SweetAlert2 por toasts donde sea apropiado

#### 4. OPTIMIZACIONES DE RENDIMIENTO 🟡
- **Estado actual**: Renderizado estándar sin optimizaciones específicas
- **Falta implementar**:
  - React.memo en componentes que reciben props estables
  - useCallback para funciones pasadas como props a componentes hijos
  - useMemo para cálculos costosos (como filtrado y ordenamiento de productos)
  - Lazy loading de rutas mediante React.lazy y Suspense
  - Lazy loading de componentes no críticos (ej: Footer en carga inicial)
  - Optimización de imágenes con tamaños apropiados
  - Implementación de caché de productos en frontend (5-10 minutos)

#### 5. MEJORAS DE UX Y ACCESIBILIDAD 🟡
- **Estado actual**: UX básica funcional
- **Falta implementar**:
  - Indicador visual claro de "Agregado al carrito" (animación o cambio temporal)
  - Confirmación antes de eliminar del carrito (opcional, configurável)
  - Breadcrumbs en todas las páginas para mejor orientación
  - Botón "Volver arriba" en páginas largas
  - Mejora de accesibilidad:
    - Etiquetas ARIA en formularios y botones
    - Orden lógico de tabulación
    - Contraste adecuado en todos los elementos
    - Soporte para navegación con teclado
  - Estados de vacío más informativos con acciones sugeridas
  - Microinteracciones sutiles para mejorar percusión de rendimiento

### **PRIORIDAD MEDIA - Importantes pero no bloqueantes**

#### 6. ESTADÍSTICAS VISUALES EN PERFIL (OPCIONAL) 🟢
- **Estado actual**: No hay visualización de estadísticas de usuario
- **Falta implementar** (si se decide incluir):
  - Historial de gasto por mes
  - Productos más comprados
  - Frecuencia de pedidos
  - Ahorro estimado vs precios regulares (si aplica programa de lealtad)

#### 7. LISTA DE DESEOS/WISHLIST 🟢
- **Estado actual**: No implementado
- **Falta implementar**:
  - Botón "Guardar para después" en tarjetas de producto
  - Página de lista de deseos
  - Mover productos entre wishlist y carrito
  - Persistencia en localStorage o backend
  - Notificaciones cuando producto en wishlist vuelve a estar disponible

## 📑 RESUMEN EJECUTIVO PARA IMPLEMENTACIÓN

El frontend tiene una base sólida con autenticación, catálogo, carrito y checkout funcionando. Para alcanzar un MVP completo y pulido, las **prioridades inmediatas** son:

1. **Gestión de cantidad en carrito** - Mejora fundamental de UX que falta actualmente
2. **Búsqueda de productos** - Característica esencial para cualquier catálogo de productos
3. **Notificaciones toast** - Feedback inmediato y no intrusivo para acciones del usuario
4. **Optimizaciones de rendimiento** - Preparación para escalar a más productos y usuarios
5. **Mejoras de UX y accesibilidad** - Cumplimiento con estándares modernos y mejor experiencia

Estas implementaciones se pueden realizar de forma incremental, comenzando por las más críticas (gestión de cantidad y búsqueda) y progresando hacia las optimizaciones y mejoras de UX.

El contexto de autenticación y carrito ya está bien establecido, lo que facilita la integración de nuevas funcionalidades que dependan de estos estados globales.

---
*Documento generado para alimentación de IA de implementación*
*Fecha: 8 de mayo de 2026*
*Contexto: Proyecto Tienda Online Panadería - Estado actual del frontend*
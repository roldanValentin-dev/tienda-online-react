# 📋 RESUMEN EJECUTIVO - TAREAS PENDIENTES

## 🔴 CRÍTICO (Bloqueantes - Sin esto NO se puede lanzar)

### 1. PANEL DE ADMINISTRACIÓN
**Backend:**
- [ ] Tabla ProductoImagenes (id, productoId, url, orden, esPrincipal)
- [ ] POST /api/productos (crear)
- [ ] PUT /api/productos/{id} (editar)
- [ ] DELETE /api/productos/{id} (eliminar)
- [ ] POST /api/productos/{id}/imagenes (upload)
- [ ] DELETE /api/productos/{id}/imagenes/{imagenId}
- [ ] Modificar GET /api/catalogo/productos (incluir array de imágenes)

**Frontend:**
- [ ] Ruta /admin protegida (solo Admin)
- [ ] Layout admin (sidebar + header)
- [ ] Dashboard básico (estadísticas)
- [ ] Gestión de pedidos (listar, filtrar, cambiar estado)
- [ ] CRUD productos (crear, editar, eliminar, activar/desactivar)
- [ ] Upload múltiple de imágenes (drag & drop)
- [ ] Gestión de imágenes (ordenar, eliminar, marcar principal)

### 2. SISTEMA DE IMÁGENES REALES
- [ ] Decidir: ¿Local o Cloud? (Recomiendo Cloudinary)
- [ ] Configurar almacenamiento
- [ ] Actualizar ProductDetail para usar imágenes reales
- [ ] Actualizar ProductsList para mostrar imagen principal

### 3. GESTIÓN DE CANTIDAD EN CARRITO
- [ ] Botones +/- en Cart.jsx
- [ ] Función incrementarCantidad() en CarritoContext
- [ ] Función decrementarCantidad() en CarritoContext
- [ ] Validación mínimo 1

### 4. BÚSQUEDA DE PRODUCTOS
- [ ] Input de búsqueda en Navbar
- [ ] Estado searchQuery en ProductsList
- [ ] Filtrar productos por nombre/descripción
- [ ] Mostrar "No se encontraron resultados"

---

## 🟠 ALTO (Muy importantes)

### 5. OPTIMIZACIONES
- [ ] Backend: GET /api/catalogo/productos/categoria/{categoria}
- [ ] Frontend: Usar endpoint de categoría
- [ ] Lazy loading de imágenes
- [ ] Comprimir imágenes en upload

### 6. MEJORAS UX
- [ ] Instalar react-toastify
- [ ] Toast al agregar al carrito
- [ ] Toast al crear pedido
- [ ] Confirmación antes de eliminar del carrito
- [ ] Validación de stock en backend

---

## 🟡 MEDIO (Deseables)

### 7. FUNCIONALIDADES ADICIONALES
- [ ] Filtro por rango de precios
- [ ] Favoritos/Wishlist
- [ ] Compartir producto (WhatsApp)

### 8. REPORTES ADMIN
- [ ] Dashboard: ventas del día/semana/mes
- [ ] Productos más vendidos
- [ ] Exportar pedidos a Excel

---

## ⏱️ ESTIMACIÓN DE TIEMPO

**Crítico (1-4):** 12-15 días
**Alto (5-6):** 3-4 días
**Medio (7-8):** 3-4 días

**TOTAL:** 18-23 días de desarrollo

---

## 🎯 ORDEN DE IMPLEMENTACIÓN SUGERIDO

### SEMANA 1: Backend + Imágenes
1. Tabla ProductoImagenes + Migración
2. Endpoints CRUD productos
3. Endpoints upload/delete imágenes
4. Configurar Cloudinary (o local)
5. Modificar GET productos (incluir imágenes)

### SEMANA 2: Panel Admin
6. Layout admin + rutas protegidas
7. Dashboard básico
8. Gestión de pedidos (listar, cambiar estado)
9. CRUD productos (formularios)
10. Upload de imágenes (componente)

### SEMANA 3: Mejoras Cliente
11. Búsqueda de productos
12. Gestión cantidad en carrito
13. Toast notifications
14. Optimizaciones (lazy loading, caché)
15. Validación de stock

### SEMANA 4: Testing y Deploy
16. Testing completo
17. Corrección de bugs
18. Documentación
19. Deploy
20. Capacitación

---

## 🚀 EMPEZAR POR:

**OPCIÓN A: Backend primero (Recomendado)**
1. Tabla ProductoImagenes
2. Endpoints CRUD productos
3. Endpoints imágenes
4. Luego frontend admin

**OPCIÓN B: Frontend admin primero**
1. Layout y rutas admin
2. Gestión de pedidos
3. Luego backend productos
4. Luego CRUD productos frontend

**MI RECOMENDACIÓN: OPCIÓN A**
- Backend listo = Frontend puede consumir
- Menos bloqueos
- Puedes ir probando endpoints

---

## 📝 DECISIONES PENDIENTES

1. **Almacenamiento de imágenes:**
   - [ ] Local (/wwwroot/images)
   - [ ] Cloudinary (RECOMENDADO - gratis 25GB)
   - [ ] AWS S3

2. **Validación de stock:**
   - [ ] SÍ (recomendado)
   - [ ] NO (más simple)

3. **Notificaciones email:**
   - [ ] SÍ (para v1)
   - [ ] NO (para v2)

4. **Paginación:**
   - [ ] SÍ (si +50 productos)
   - [ ] NO (scroll infinito o sin paginación)

---

## 🎯 PRÓXIMO PASO INMEDIATO

**EMPEZAR CON:**
1. Crear rama `feature/admin-panel`
2. Backend: Tabla ProductoImagenes
3. Backend: Migración
4. Backend: Endpoints CRUD productos

**¿Arrancamos con esto?** 🚀

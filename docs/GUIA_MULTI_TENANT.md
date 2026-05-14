# Guía para vender el sistema a múltiples clientes

> Documento para entender cómo escalar el proyecto actual (Softpan)
> y venderlo a otros comercios sin morir en el intento.

---

## 📌 Situación actual

```
Repositorio único: D:\Repos\Softpan

API (.NET) ── Sirve a ── Frontend E-commerce (Bootstrap)
                             └── Frontend POS (Tailwind)

Una sola base de datos → Un solo cliente
```

**Problema:** Hoy solo funciona para un cliente. Para vender a otro, necesitamos separar datos.

---

## 🧠 Concepto clave: Multi-tenant

Multi-tenant = un mismo código, una base de datos distinta por cada cliente.

```
API deployada UNA SOLA VEZ
  │
  ├── Cliente A (pastelería)
  │     └── Base de datos A (softpan_cliente_a)
  │
  ├── Cliente B (panadería)
  │     └── Base de datos B (softpan_cliente_b)
  │
  └── Cliente C (cafetería)
        └── Base de datos C (softpan_cliente_c)
```

**El frontend es el mismo para todos.** Solo cambia qué base de datos se usa según quién se conecte.

---

## 🏗️ Cómo funciona el multi-tenant

### Paso 1: Tabla de clientes (base de datos maestra)

```csharp
public class Tenant {
    public Guid Id { get; set; }
    public string Nombre { get; set; }        // "Panadería La Central"
    public string Dominio { get; set; }        // "lacentral.com"
    public string ConnectionString { get; set; } // Cadena de conexión a su BD
    public DateTime FechaCreacion { get; set; }
}
```

### Paso 2: El frontend envía quién es

Cuando un cliente entra al sistema, el frontend envía un identificador:

```
Opción A (dominio):
  clienteA.misistema.com  →  API detecta "clienteA" → busca su BD

Opción B (header):
  Header: X-Tenant-Id: cliente-a  →  API busca por slug
```

### Paso 3: API usa la BD correcta

```csharp
// Middleware que se ejecuta en cada request
app.UseMiddleware<TenantMiddleware>();

// Adentro del middleware:
var tenant = await db.Tenants.FirstAsync(t => t.Dominio == dominio);
var dbContext = new AppDbContext(tenant.ConnectionString);
// El resto del request usa esta BD
```

### Paso 4: Al crear un cliente nuevo

```
1. Creás la base de datos vacía (script de migraciones)
2. Insertás un registro en la tabla Tenants con su ConnectionString
3. Asignás un subdominio: cliente.misistema.com
4. ¡Listo! El cliente ya puede usar el sistema
```

**Tiempo para agregar un cliente nuevo: ~30 minutos.**

---

## 📦 Cómo vender el sistema (pasos reales)

### Paso 1: Definir qué vendés

| Producto | Incluye | Precio sugerido |
|----------|---------|-----------------|
| **E-commerce** | Tienda online + catálogo + carrito + checkout | $$$
| **E-commerce + POS** | E-commerce + mostrador + clientes + pagos/cuenta corriente | $$$$|
| **ERP completo** | Todo + dashboard + reportes + producción | $$$$$ |

### Paso 2: Definir modelo de cobro

| Concepto | Monto | Frecuencia |
|----------|-------|------------|
| **Instalación** | Configuración + migración de datos | Único |
| **Hosting** | Servidor + base de datos + dominio + SSL | Mensual |
| **Soporte** | Atención técnica + actualizaciones | Mensual |
| **Módulos extra** | POS, facturación, reportes, etc. | Único o mensual |

### Paso 3: Conseguir clientes

| Canal | Cómo |
|-------|------|
| **Local** | Recorré panaderías, pastelerías, cafeterías de tu zona |
| **WhatsApp** | Grupos de comerciantes locales |
| **Google Maps** | Buscá "panadería" en tu ciudad y contactalas |
| **Recomendación** | Primer cliente (la pastelería actual) te recomiende |
| **Redes sociales** | Publicá el sistema funcionando en Instagram/TikTok |

### Paso 4: Presentación al cliente

No le digas "Es una API con multi-tenant y React Query". Decile:

> *"Es un sistema para manejar tu negocio desde el celular o la computadora.
>  Tus clientes pueden hacer pedidos online, vos ves los pedidos en tiempo real,
>  y tenés control de ventas, clientes y gastos. No necesitás instalar nada,
>  funciona en el navegador."*

---

## 💻 Infraestructura necesaria

| Recurso | Para empezar | Cuando crezcas |
|---------|-------------|----------------|
| **Servidor** | VPS de $10-15/mes (DigitalOcean, Hostinger, etc.) | Servidor dedicado |
| **Base de datos** | Una por cliente, en el mismo servidor | SQL Server separado |
| **Dominio** | Uno principal (misistema.com) + subdominios por cliente | — |
| **SSL** | Let's Encrypt (gratis) | Certificado pago |
| **Backups** | Script diario que exporta cada BD | Backup automatizado |

**Ejemplo de costos mensuales (inicio):**

| Concepto | Costo |
|----------|-------|
| VPS (2GB RAM, 2 CPUs) | $15 |
| Dominio + SSL (gratis Let's Encrypt) | $0 |
| **Total** | **~$15/mes** |

Con 2 clientes a $15/mes cada uno ya cubrís el servidor. De ahí en adelante es ganancia.

---

## 🚧 Lo que hay que programar

### Para el multi-tenant (API)

| Tarea | Archivos | Dificultad |
|-------|----------|------------|
| Crear entidad `Tenant` | `Domain/Entities/Tenant.cs` | 🟢 Fácil |
| Crear tabla y migración | `Infrastructure/.../Migrations` | 🟢 Fácil |
| Middleware que detecta el tenant | `API/Middlewares/TenantMiddleware.cs` | 🟡 Media |
| DbContext dinámico (ConnectionString por request) | `Infrastructure/AppDbContext.cs` | 🟡 Media |
| Endpoint para registrar tenants | `API/Controllers/AdminController.cs` | 🟢 Fácil |

### Para el deployment

| Tarea | Dificultad |
|-------|------------|
| Script para crear BD por tenant | 🟢 Fácil |
| Configurar subdominios (cliente.misistema.com) | 🟡 Media |
| Pipeline de deploy (GitHub Actions) | 🟡 Media |

### Para vender

| Tarea | Tiempo |
|-------|--------|
| Landing page simple del sistema | 1 día |
| Demo online funcional | Ya tenés — es el sistema actual |
| Video mostrando el sistema | 30 min con el celular |

---

## 🎯 Plan de acción recomendado

| Semana | Qué hacer |
|--------|-----------|
| **1** | Implementar multi-tenant en la API (2-3 días) |
| **2** | Deployar la API en un VPS con dominio propio |
| **3** | Crear script para dar de alta clientes nuevos |
| **4** | Armar presentación / demo / video del sistema |
| **5** | Salir a vender (recorrer comercios, WhatsApp, redes) |
| **6+** | Soporte + mejorar según feedback de clientes |

---

## ❓ Preguntas frecuentes

### ¿Un cliente puede ver datos de otro?
No. Cada uno tiene su base de datos. Es como si tuvieran sistemas separados.

### ¿Si un cliente se va, pierdo su código?
No. Solo eliminás su base de datos y subdominio. El código fuente sigue siendo tuyo.

### ¿Puedo actualizar todos los clientes a la vez?
Sí. Al ser el mismo código deployado, cualquier cambio se aplica a todos.

### ¿Y si un cliente necesita algo que otro no?
Se resuelve con feature flags: "Cliente A tiene POS, Cliente B no". El código está, solo se activa o desactiva.

### ¿Necesito un servidor potente para muchos clientes?
No. Una BD vacía ocupa ~5MB. Una VPS de $15 puede manejar decenas de clientes sin problemas.

### ¿Puedo vender el e-commerce solo sin el POS?
Sí. El frontend de e-commerce (`tienda-online`) ya está separado del frontend POS (`softpan-frontend`). Vendés el que el cliente necesite.

---

## 📚 Conceptos que conviene aprender

| Concepto | Para qué sirve |
|----------|----------------|
| **Multi-tenant** | Un código, múltiples clientes |
| **Feature flags** | Activar/desactivar funcionalidades por cliente |
| **CI/CD** | Pipeline de deploy automático (GitHub Actions) |
| **VPS** | Servidor virtual para hostear la API |
| **DNS / subdominios** | cliente.misistema.com |
| **Docker** | Facilitar deploy de la API + BD |

---

## 💬 Frase para cerrar

> No necesitás el sistema perfecto. Necesitás un sistema que funcione y venderlo.
> Después lo mejorás con el feedback de los clientes.

---

*Documento generado como guía personal — Mayo 2026*

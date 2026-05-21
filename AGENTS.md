# AGENTS.md — Tienda Online (Panadería)

## Commands
- `npm run dev` — Vite dev server
- `npm run build` — production build to `dist/`
- `npm run lint` — ESLint (flat config v9, `eslint .`)
- `npm run preview` — preview production build
- No tests, typecheck, or codegen commands exist

## Project layout
- **Single-page React 19 + Vite 8 app** (not a monorepo)
- **Bootstrap 5.3** via global CSS import in `src/main.jsx`
- **No TypeScript** — all `.jsx`
- **CSS**: traditional `.css` files in `src/style/`, CSS custom properties in `variables.css`
- **State**: React Context (`AuthContext`, `CarritoContext`) — no Redux
- **HTTP**: Axios with JWT interceptor (auto-logout on 401)
- **Active branch**: `rediseño` (currently ahead of `main`)

## API
- Base URL: `http://localhost:7097` in `src/config/api.js`
- 19 documented endpoints for auth, catalog, orders, profile, images, admin config
- See `ENDPOINTS_TIENDA_ONLINE.txt` for full reference
- JWT stored in localStorage keys `token` and `user`

## Architecture quirks
- **Services are singletons**: `export default new Service()` — all 8 services follow this pattern
- **Return shape**: every service method returns `{ success: boolean, data?: any, message?: string }`
- **Security module** (`src/security.js`) uses obfuscated field names like `'em' + 'ail'` — intentional, keep the pattern
- **Artificial 2-second delay** in `useProducts.js:12` — intentional for skeleton visibility, do not remove
- **`DEBUG = true`** hardcoded in CarritoService, CarritoContext, PagoService, AdminPedidoService, AdminPagoService — set to `false` before production

## Routes (defined in `src/App.jsx`)
| Path | Component |
|------|-----------|
| `/` | Home |
| `/products` | ProductsList |
| `/products/:id` | ProductDetail |
| `/cart` | Cart |
| `/auth` | Auth (login/register) |
| `/checkout` | Checkout |
| `/pago/:id` | PagoPage |
| `/pago-exitoso`, `/pago-fallido`, `/pago-pendiente` | PagoPage (payment callbacks) |
| `/mis-pedidos` | MisPedidos |
| `/perfil` | Perfil |
| `/admin/*` | Admin panel (protected, role `Admin`) |

Admin default redirect: `/admin/productos`

## Cart sync behavior
- Guest users: localStorage only
- Authenticated users: diff-based merge (local → server) on login
- Cart sync happens once when `user` is set; `cartInitialized` flag prevents re-sync
- See `CarritoContext.jsx:58-155` for merge logic

## Conventions
- **Image uploads**: do NOT set `Content-Type: multipart/form-data` — axios handles it automatically (`ProductoImagenService.js:96-104`)
- **CSS**: use `variables.css` custom properties (`--primary`, `--radius-md`, etc.), combine Bootstrap classes with custom CSS
- **Notifications**: SweetAlert2 for confirmations/alerts; `react-toastify` is configured in App.jsx but barely used in components
- **Image placeholders**: SVG-based from `src/config/placeholders.js`
- **Loading states**: skeleton components in `Skeleton.jsx`

## Outdated docs
- `docs/CONTEXTO_FRONTEND_ACTUAL_Y_FALTANTE.md` says quantity management is missing — it's actually implemented in Cart.jsx
- Trust executable code over docs prose when they conflict

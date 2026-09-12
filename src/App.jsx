import { lazy, Suspense, useEffect } from 'react';
import { CarritoProvider } from './context/CarritoContext';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Home from './components/Home';
import Navbar from './components/Navbar';
import ProductsList from './components/ProductsList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Auth from './components/Auth';
import Footer from './components/Footer';
import ProtectedRoute from './components/admin/ProtectedRoute';
import './style/skeleton.css';

const ForgotPassword = lazy(() => import('./components/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/ResetPassword'));
const Checkout = lazy(() => import('./components/Checkout'));
const PagoPage = lazy(() => import('./components/PagoPage'));
const MisPedidos = lazy(() => import('./components/MisPedidos'));
const Perfil = lazy(() => import('./components/Perfil'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminProductos = lazy(() => import('./components/admin/AdminProductos'));
const ProductoForm = lazy(() => import('./components/admin/ProductoForm'));
const AdminProductoImagenes = lazy(() => import('./components/admin/AdminProductoImagenes'));
const AdminPedidos = lazy(() => import('./components/admin/AdminPedidos'));
const AdminPendientesPago = lazy(() => import('./components/admin/AdminPendientesPago'));
const AdminConfigPago = lazy(() => import('./components/admin/AdminConfigPago'));
const AdminReportes = lazy(() => import('./components/admin/AdminReportes'));

/**
 * Componente que hace scroll al inicio cuando cambia la ruta
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

/**
 * Componente que maneja el contenido principal y la visibilidad de elementos globales
 */
function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app-wrapper" style={{ paddingTop: !isAdminRoute ? 'var(--nav-height)' : '0' }}>
      {!isAdminRoute && <Navbar />}
      <main className="main-content">
        <Suspense fallback={<div className="loading-container"><div className="spinner"></div><p style={{ marginTop: 16 }}>Cargando...</p></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductsList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/pago/:id" element={<PagoPage />} />
            <Route path="/pago-exitoso" element={<PagoPage />} />
            <Route path="/pago-fallido" element={<PagoPage />} />
            <Route path="/pago-pendiente" element={<PagoPage />} />
            <Route path="/mis-pedidos" element={<MisPedidos />} />
            <Route path="/perfil" element={<Perfil />} />

            {/* Rutas Admin - Protegidas */}
            <Route path="/admin/*" element={
              <ProtectedRoute requiredRole="Admin">
                <AdminLayout>
                  <Routes>
                    <Route path="productos" element={<AdminProductos />} />
                    <Route path="productos/nuevo" element={<ProductoForm />} />
                    <Route path="productos/editar/:id" element={<ProductoForm />} />
                    <Route path="productos/imagenes/:id" element={<AdminProductoImagenes />} />
                    <Route path="pedidos" element={<AdminPedidos />} />
                    <Route path="pendientes-pago" element={<AdminPendientesPago />} />
                    <Route path="config-pago" element={<AdminConfigPago />} />
                    <Route path="reportes" element={<AdminReportes />} />
                    <Route path="/" element={<Navigate to="/admin/productos" replace />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <BrowserRouter>
          <ScrollToTop />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <AppContent />
        </BrowserRouter>
      </CarritoProvider>
    </AuthProvider>
  );
}

export default App

import { CarritoProvider } from './context/CarritoContext';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useEffect } from 'react';
import Home from './components/Home';
import Navbar from './components/Navbar';
import ProductsList from './components/ProductsList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Auth from './components/Auth';
import Checkout from './components/Checkout';
import PagoPage from './components/PagoPage';
import MisPedidos from './components/MisPedidos';
import Perfil from './components/Perfil';
import Footer from './components/Footer';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminProductos from './components/admin/AdminProductos';
import ProductoForm from './components/admin/ProductoForm';
import AdminProductoImagenes from './components/admin/AdminProductoImagenes';
import AdminPedidos from './components/admin/AdminPedidos';
import AdminPendientesPago from './components/admin/AdminPendientesPago';
import AdminConfigPago from './components/admin/AdminConfigPago';
import AdminReportes from './components/admin/AdminReportes';
import './style/skeleton.css';

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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductsList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/auth" element={<Auth />} />
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

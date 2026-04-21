import { CarritoProvider } from './context/CarritoContext';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Navbar from './components/Navbar';
import ProductsList from './components/ProductsList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Auth from './components/Auth';
import Checkout from './components/Checkout';
import MisPedidos from './components/MisPedidos';
import Footer from './components/Footer';
import './App.css';
import './pedidos.css'; // Estilos para checkout y mis pedidos

function App() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <BrowserRouter>
          <div className="app-wrapper">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductsList />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/mis-pedidos" element={<MisPedidos />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </CarritoProvider>
    </AuthProvider>
  );
}

export default App

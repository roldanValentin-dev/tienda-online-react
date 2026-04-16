import { CarritoProvider } from './context/CarritoContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Navbar from './components/Navbar';
import ProductsList from './components/ProductsList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
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
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </CarritoProvider>
  );
}

export default App

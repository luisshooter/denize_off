import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { StoreConfigProvider } from './context/StoreConfigContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import MasculinoHome from './pages/MasculinoHome';
import MasculinoProducts from './pages/MasculinoProducts';

export default function App() {
  return (
    <StoreConfigProvider>
      <CartProvider>
        <BrowserRouter>
          <ThemeProvider>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/produtos" element={<Products />} />
              <Route path="/produto/:id" element={<ProductDetail />} />
              <Route path="/masculino" element={<MasculinoHome />} />
              <Route path="/masculino/produtos" element={<MasculinoProducts />} />
            </Routes>
          </ThemeProvider>
        </BrowserRouter>
      </CartProvider>
    </StoreConfigProvider>
  );
}

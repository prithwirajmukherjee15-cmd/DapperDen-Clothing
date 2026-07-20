import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MarqueeBar from "./components/MarqueeBar";
import { Toaster } from "./components/ui/toaster";

import Home from "./pages/Home";
import CategoryHub from "./pages/CategoryHub";
import PLP from "./pages/PLP";
import PDP from "./pages/PDP";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import Search from "./pages/Search";
import Help from "./pages/Help";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <div className="App grain min-h-screen bg-[#0a0a0b]">
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <ScrollToTop />
            <MarqueeBar />
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/men" element={<CategoryHub />} />
                <Route path="/men/:category" element={<PLP mode="category" />} />
                <Route path="/collection/:slug" element={<PLP mode="collection" />} />
                <Route path="/product/:slug" element={<PDP />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/account" element={<Account />} />
                <Route path="/search" element={<Search />} />
                <Route path="/help" element={<Help />} />
                <Route path="/returns" element={<Help />} />
              </Routes>
            </main>
            <Footer />
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;

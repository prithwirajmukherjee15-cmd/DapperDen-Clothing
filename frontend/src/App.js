import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { DataProvider } from "./context/DataContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MarqueeBar from "./components/MarqueeBar";
import CustomCursor from "./components/CustomCursor";
import ScrollProgress from "./components/ScrollProgress";
import { Toaster } from "./components/ui/toaster";

import Home from "./pages/Home";
import CategoryHub from "./pages/CategoryHub";
import PLP from "./pages/PLP";
import PDP from "./pages/PDP";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Search from "./pages/Search";
import Help from "./pages/Help";
import TrackOrder from "./pages/TrackOrder";
import Wishlist from "./pages/Wishlist";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <MarqueeBar />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/men" element={<CategoryHub gender="men" />} />
          <Route path="/men/:category" element={<PLP mode="category" gender="men" />} />
          <Route path="/women" element={<CategoryHub gender="women" />} />
          <Route path="/women/:category" element={<PLP mode="category" gender="women" />} />
          <Route path="/kids" element={<CategoryHub gender="kids" />} />
          <Route path="/kids/:category" element={<PLP mode="category" gender="kids" />} />
          <Route path="/collection/:slug" element={<PLP mode="collection" />} />
          <Route path="/product/:slug" element={<PDP />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/track" element={<TrackOrder />} />
          <Route path="/search" element={<Search />} />
          <Route path="/help" element={<Help />} />
          <Route path="/returns" element={<Help />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <div className="App grain min-h-screen bg-[#0a0a0b]">
      <BrowserRouter>
        <DataProvider>
          <CartProvider>
            <ScrollProgress />
            <CustomCursor />
            <AppRoutes />
            <Toaster />
          </CartProvider>
        </DataProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;

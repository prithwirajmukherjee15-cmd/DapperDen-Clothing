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
import Drop from "./pages/Drop";
import Feedback from "./pages/Feedback";

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    // Keyboard and screen-reader users start at the new page's content, not back at the top of the header.
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [pathname]);
  // Remember a friend's referral code from a shared link (?ref=CODE); the bag applies it.
  useEffect(() => {
    const ref = new URLSearchParams(search).get("ref");
    if (ref) { try { localStorage.setItem("dd_ref", ref.trim().toUpperCase().slice(0, 20)); } catch { /* storage blocked */ } }
  }, [search]);
  return null;
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-full focus:bg-lime focus:px-4 focus:py-2 focus:font-bold focus:text-[#0a0a0b]">Skip to content</a>
      <MarqueeBar />
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
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
          <Route path="/drop" element={<Drop />} />
          <Route path="/feedback" element={<Feedback />} />
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

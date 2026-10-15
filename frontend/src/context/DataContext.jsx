import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api";
import { PRODUCTS as MOCK_PRODUCTS } from "../mock/mock";

const DataContext = createContext(null);
export const useData = () => useContext(DataContext);

export function DataProvider({ children }) {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get("/products")
      .then((res) => {
        if (active && Array.isArray(res.data) && res.data.length) setProducts(res.data);
      })
      .catch(() => {
        // graceful fallback to bundled catalog
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const getProduct = (slug) => products.find((p) => p.slug === slug);
  const getProductsByCategory = (cat, gender = "men") =>
    products.filter((p) => p.category === cat && (p.gender || "men") === gender);
  const getProductsByCollection = (col) => products.filter((p) => p.collection === col);
  const byGender = (gender = "men") => products.filter((p) => (p.gender || "men") === gender);
  const searchProducts = (q) => {
    const s = (q || "").toLowerCase().trim();
    if (!s) return [];
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s) ||
        (p.gender || "").toLowerCase().includes(s) ||
        p.collection.replace(/-/g, " ").toLowerCase().includes(s)
    );
  };

  return (
    <DataContext.Provider
      value={{ products, loading, getProduct, getProductsByCategory, getProductsByCollection, byGender, searchProducts }}
    >
      {children}
    </DataContext.Provider>
  );
}

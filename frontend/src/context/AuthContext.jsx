import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Phase 1: mock auth persisted to localStorage. Backend (Emergent Google) wires in Phase 2.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const v = localStorage.getItem("dd_user");
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem("dd_user", JSON.stringify(user));
    else localStorage.removeItem("dd_user");
  }, [user]);

  const login = (u) => setUser(u);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("methynix_token"));

  const login = useCallback((newToken) => {
    localStorage.setItem("methynix_token", newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("methynix_token");
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, isAuthed: Boolean(token), login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) return { token: null, isAuthed: false, login: () => {}, logout: () => {} };
  return ctx;
};

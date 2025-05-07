import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  const login = (data) => {
    setUsuario(data.usuario);
    setToken(data.token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));
  };

  const logout = () => {
    setUsuario(null);
    setToken("");
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("activeProfile");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    try {
      if (storedUser && storedUser !== "undefined") {
        setUsuario(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error parsing stored user:", error);
      localStorage.removeItem("usuario"); // Limpia el valor inválido
    }
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
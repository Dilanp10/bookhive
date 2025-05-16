import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
const API = import.meta.env.VITE_API_URL

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://backend-bookhive.onrender.com/api/auth/login", {
        email,
        password,
      });
      login(res.data);
      toast.success("¡Bienvenido!");
      navigate("/perfil");
    } catch (error) {
      toast.error("Credenciales inválidas");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-900 to-purple-800">
      <div className="relative w-full max-w-md">
        {/* Efecto de partículas decorativas */}
        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl opacity-20 blur-lg"></div>
        
        {/* Botón de volver atrás */}
        <button 
          onClick={() => navigate("/")}
          className="absolute -top-12 left-0 flex items-center text-white/80 hover:text-white transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>
        
        <form
          onSubmit={handleLogin}
          className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl overflow-hidden p-8 dark:bg-gray-800/80"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              Iniciar Sesión
            </h2>
            <p className="mt-2 text-sm text-white/80 dark:text-gray-300">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white dark:text-gray-200">
                Correo electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 dark:bg-gray-700/50 border border-white/20 dark:border-gray-600 rounded-lg text-white placeholder-white/50 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white/50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white dark:text-gray-200">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 dark:bg-gray-700/50 border border-white/20 dark:border-gray-600 rounded-lg text-white placeholder-white/50 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white/50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Ingresar
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/70 dark:text-gray-400">
              ¿No tienes una cuenta?{" "}
              <button
              onClick={() => navigate("/Register")}
              className="text-cyan-300 hover:text-cyan-200 font-medium transition bg-transparent border-none p-0 cursor-pointer">
              Regístrate
        </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'comun',
  });

  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://backend-bookhive.onrender.com/api/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError('Error al registrarse. Verifica los datos.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-800 px-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Únete a nosotros
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Crea tu cuenta y comienza tu experiencia
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-red-500/20 text-red-100 rounded-lg border border-red-400/50 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white/90">Nombre</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition"
              placeholder="Tu nombre completo"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-white/90">Correo electrónico</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition"
              placeholder="tucorreo@ejemplo.com"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-white/90">Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-white/90">Rol</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent appearance-none transition"
            >
              <option value="comun" className="bg-gray-800">Usuario común</option>
              <option value="admin" className="bg-gray-800">Administrador</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Crear cuenta
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/70">
            ¿Ya tienes una cuenta?{' '}
            <button
              onClick={() => navigate("/login")}
              className="text-cyan-300 hover:text-cyan-200 font-medium transition bg-transparent border-none p-0 cursor-pointer">
              Inicia sesión
          </button>
          </p>
        </div>
      </div>
    </div>
  );
}
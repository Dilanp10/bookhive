import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";

export default function Catalogo() {
  const perfil = JSON.parse(localStorage.getItem("activeProfile"));
  const token = localStorage.getItem("token");

  const [libros, setLibros] = useState([]);
  const [genero, setGenero] = useState("");
  const [autor, setAutor] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLibros = async () => {
    try {
      const res = await axios.get("https://backend-bookhive.onrender.com/api/libros", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          genero,
          autor,
          nivelLectura: perfil.tipo, // tipo puede ser 'adulto', 'juvenil', 'infantil'
        },
      });
      setLibros(res.data);
    } catch (error) {
      toast.error("Error al cargar el catálogo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibros();
  }, [genero, autor]);

  const handleAddToWatchlist = async (libroId) => {
    try {
      await axios.post(
        `https://backend-bookhive.onrender.com/api/perfiles/${perfil._id}/watchlist`,
        { libroId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Agregado a tu lista");
    } catch (error) {
      toast.error("No se pudo agregar");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
       <Navbar />
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Catálogo de Libros</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Filtrar por autor"
          className="p-2 rounded border dark:bg-gray-900 dark:text-white"
          value={autor}
          onChange={(e) => setAutor(e.target.value)}
        />
        <select
          value={genero}
          onChange={(e) => setGenero(e.target.value)}
          className="p-2 rounded border dark:bg-gray-900 dark:text-white"
        >
          <option value="">Todos los géneros</option>
          <option value="fantasía">Fantasía</option>
          <option value="aventura">Aventura</option>
          <option value="terror">Terror</option>
          <option value="romance">Romance</option>
          <option value="ciencia ficción">Ciencia Ficción</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-600 dark:text-gray-300">Cargando...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {libros.map((libro) => (
            <div
              key={libro._id}
              className="bg-white dark:bg-gray-800 rounded shadow p-4 flex flex-col justify-between"
            >
              <Link to={`/libros/${libro._id}`}>
                <img
                  src={libro.coverImage || "https://via.placeholder.com/150x220"}
                  alt={libro.title}
                  className="h-48 w-full object-cover rounded mb-2"
                />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {libro.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{libro.author}</p>
              </Link>
              <button
                onClick={() => handleAddToWatchlist(libro._id)}
                className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Agregar a mi lista
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
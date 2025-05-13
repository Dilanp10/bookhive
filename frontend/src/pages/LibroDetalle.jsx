import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function LibroDetalle() {
  const { id } = useParams(); // ID del libro
  const [libro, setLibro] = useState(null);
  const [loading, setLoading] = useState(true);

  const perfil = JSON.parse(localStorage.getItem("activeProfile"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchLibro = async () => {
      try {
        const res = await axios.get(`https://backend-bookhive.onrender.com/api/libros/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLibro(res.data);
      } catch (err) {
        toast.error("Error al cargar el libro");
      } finally {
        setLoading(false);
      }
    };

    fetchLibro();
  }, [id, token]);

  const agregarAWL = async () => {
    try {
      await axios.post(
        `https://backend-bookhive.onrender.com/api/perfiles/${perfil._id}/watchlist`,
        { libroId: libro._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Libro agregado a la lista");
    } catch (error) {
      toast.error("No se pudo agregar el libro");
    }
  };

  if (loading) return <p className="p-6 text-gray-500 dark:text-gray-300">Cargando libro...</p>;
  if (!libro) return <p className="p-6 text-red-500">Libro no encontrado</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow">
      <div className="flex flex-col md:flex-row gap-6">
        <img
          src={libro.coverImage || "https://via.placeholder.com/150x220"}
          alt={libro.title}
          className="w-40 h-60 object-cover rounded"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{libro.title}</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-2">Autor: {libro.author}</p>
          <p className="text-gray-500 dark:text-gray-400 italic">{libro.synopsis}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {libro.genres.map((genre) => (
              <span
                key={genre}
                className="text-sm bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-white px-2 py-1 rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>

          <div className="mt-6">
            <button
              onClick={agregarAWL}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
            >
              Agregar a mi lista
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
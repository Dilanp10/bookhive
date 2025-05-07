import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Favoritos() {
  const [profile, setProfile] = useState(null);
  const [favoritos, setFavoritos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadFavorites = async () => {
      const storedProfile = localStorage.getItem("activeProfile");
      const token = localStorage.getItem("token");

      if (!storedProfile || !token) {
        navigate("/profiles");
        return;
      }

      try {
        const parsed = JSON.parse(storedProfile);
        setProfile(parsed);

        const response = await axios.get(`https://backend-bookhive-5.onrender.com/api/books`, {
          params: { profileId: parsed._id },
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setFavoritos(response.data);
      } catch (error) {
        console.error("Error al obtener favoritos:", error);
        if (error.response?.status === 401) {
          navigate("/profiles");
        }
      }
    };

    loadFavorites();
  }, [navigate]);

  const handleRemoveFavorite = async (bookId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://backend-bookhive-5.onrender.com/api/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavoritos(favoritos.filter(book => book._id !== bookId));
    } catch (error) {
      console.error("Error al eliminar favorito:", error);
    }
  };

  if (!profile) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-yellow-100 to-pink-200 dark:from-gray-900 dark:to-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
          Libros favoritos de {profile.name}
        </h1>
        <button
          onClick={() => navigate("/")}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow transition-colors"
        >
          Volver al home
        </button>
      </div>
      
      {favoritos.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-700 dark:text-gray-300 text-lg">
            Aún no agregaste libros a tus favoritos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favoritos.map((book) => (
            <div key={book._id} className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow relative hover:shadow-lg transition-shadow">
              <button 
                onClick={() => handleRemoveFavorite(book._id)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                title="Eliminar de favoritos"
              >
                ✕
              </button>
              
              {book.coverUrl ? (
                <img 
                  src={book.coverUrl} 
                  alt={book.title} 
                  className="w-full h-48 object-contain mb-4 rounded" 
                  onError={(e) => {
                    e.target.src = '/default-book-cover.jpg';
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-600 mb-4 rounded flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-300">Sin portada</span>
                </div>
              )}
              
              <div className="h-40 flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-300 italic mt-1">
                  por {book.author || "Autor desconocido"}
                </p>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-200 line-clamp-3 flex-grow">
                  {book.description || 'Sin descripción disponible'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favoritos;
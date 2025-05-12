import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Favoritos() {
  const [profile, setProfile] = useState(null);
  const [favoritos, setFavoritos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Cargar favoritos con manejo robusto de errores
  const loadFavorites = async () => {
    setIsLoading(true);
    setError(null);
  
    try {
      const storedProfile = localStorage.getItem("activeProfile");
      const token = localStorage.getItem("token");
  
      if (!storedProfile || !token) {
        navigate("/profiles");
        return;
      }
  
      const parsedProfile = JSON.parse(storedProfile);
      setProfile(parsedProfile);
  
      const response = await axios.get(
        `http://localhost:5000/api/favorites`,
        {
          params: { profileId: parsedProfile._id },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      // Manejar diferentes formatos de respuesta
      const responseData = response.data?.data || response.data;
      if (!Array.isArray(responseData)) {
        throw new Error("Formato de respuesta inesperado del servidor");
      }
  
      // Mapeo para conservar _id del FAVORITO al final
      setFavoritos(responseData);
    } catch (error) {
      console.error("Error al cargar favoritos:", {
        error: error.message,
        response: error.response?.data,
        stack: error.stack,
      });
  
      setError(error.response?.data?.message || error.message);
  
      // Si no está autenticado, redirige a perfiles
      if (error.response?.status === 401) {
        navigate("/profiles");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar favorito con actualización optimista
  const handleRemoveFavorite = async (favoriteId) => {
    // Guardar estado previo para posible rollback
    const previousFavorites = [...favoritos];
    
    try {
      const token = localStorage.getItem("token");
      const profile = JSON.parse(localStorage.getItem("activeProfile"));
  
      // Validaciones mejoradas
      if (!token || !profile) {
        throw new Error("missing_authentication");
      }
  
      // Actualización optimista
      setFavoritos(prev => prev.filter(fav => fav._id !== favoriteId));
  
      // Petición con timeout y manejo de cancelación
      const source = axios.CancelToken.source();
      const timeout = setTimeout(() => source.cancel("Timeout"), 8000);
  
      const response = await axios.delete(
        `http://localhost:5000/api/favorites/${favoriteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          cancelToken: source.token
        }
      );
  
      clearTimeout(timeout);
  
      // Verificación exhaustiva de respuesta
      if (!response.data?.success) {
        throw new Error(response.data.message || "invalid_response");
      }
  
      toast.success("Eliminado de favoritos", {
        position: "bottom-right",
        autoClose: 2000
      });
  
    } catch (error) {
      // Revertir cambio optimista
      setFavoritos(previousFavorites);
      
      // Manejo de errores detallado
      let errorMessage = "Error al eliminar";
      let shouldReload = false;
      let shouldLogout = false;
  
      if (axios.isCancel(error)) {
        errorMessage = "La solicitud tardó demasiado";
      } else if (error.message === "missing_authentication") {
        errorMessage = "Sesión expirada";
        shouldLogout = true;
      } else if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = "No autorizado - sesión expirada";
            shouldLogout = true;
            break;
          case 403:
            errorMessage = "No tienes permiso para esta acción";
            break;
          case 404:
            errorMessage = "El elemento ya no existe en favoritos";
            shouldReload = true;
            break;
          case 500:
            errorMessage = "Error del servidor";
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      }
  
      // Mostrar notificación
      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 3000
      });
  
      // Acciones adicionales
      if (shouldLogout) {
        localStorage.removeItem("token");
        localStorage.removeItem("activeProfile");
        setTimeout(() => navigate("/login"), 1500);
      }
  
      if (shouldReload) {
        await loadFavorites();
      }
  
      // Log para diagnóstico
      console.group("Error eliminando favorito");
      console.log("ID:", favoriteId);
      console.log("Error:", error.message);
      console.log("Response:", error.response?.data);
      console.log("Diagnóstico:", error.response?.data?.diagnostics);
      console.groupEnd();
    }
  };

  // Efecto para cargar al montar
  useEffect(() => {
    loadFavorites();
  }, [navigate]);

  // Pantalla de carga
  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 dark:bg-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  // Pantalla de error
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50 dark:bg-gray-800 p-4">
        <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-4">
            Error al cargar favoritos
          </h2>
          <p className="text-amber-600 dark:text-amber-400 mb-4">{error}</p>
          <div className="flex space-x-4">
            <button
              onClick={loadFavorites}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded flex-1"
            >
              Reintentar
            </button>
            <button
              onClick={() => navigate("/home")}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded flex-1"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizado principal
  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-amber-800 dark:text-amber-200">
            <span className="text-amber-600 dark:text-amber-400">Mis favoritos</span><br />
            {profile.name}'s Book Collection
          </h1>
          <p className="text-amber-600 dark:text-amber-400 mt-2">
            {favoritos.length} {favoritos.length === 1 ? 'libro guardado' : 'libros guardados'}
          </p>
        </div>
        <button
          onClick={() => navigate("/home")}
          className="flex items-center space-x-2 bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-lg shadow transition"
        >
          <span>←</span>
          <span>Volver a la biblioteca</span>
        </button>
      </div>
      
      {/* Contenido principal */}
      {favoritos.length === 0 ? (
        <div className="bg-white dark:bg-gray-700 rounded-xl p-8 text-center shadow max-w-2xl mx-auto">
          <div className="text-6xl mb-4 text-amber-400 dark:text-amber-500">📚</div>
          <h2 className="text-2xl font-serif font-bold text-amber-800 dark:text-amber-200 mb-4">
            Tu estantería de favoritos está vacía
          </h2>
          <p className="text-amber-600 dark:text-amber-400 mb-6">
            Guarda tus libros favoritos para encontrarlos fácilmente más tarde
          </p>
          <button
            onClick={() => navigate("/home")}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow transition"
          >
            Explorar libros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favoritos.map((favorite) => {
            const book = favorite.externalBook || favorite.manualBook || favorite;
            return (
              <div key={favorite._id} className="group bg-white dark:bg-gray-700 rounded-xl p-4 shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative">
                <button 
               onClick={() => handleRemoveFavorite(favorite._id)}  
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow transition opacity-0 group-hover:opacity-100 z-10"
                  title="Eliminar de favoritos"
                >
                  ✕
                </button>
                
                <div className="relative h-64 mb-4 rounded-lg overflow-hidden bg-amber-50 dark:bg-gray-600 flex items-center justify-center">
                  {book.coverUrl ? (
                    <img 
                      src={book.coverUrl} 
                      alt={book.title || 'Libro sin título'} 
                      className="h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = '/default-book-cover.jpg';
                        e.target.onerror = null;
                      }}
                    />
                  ) : (
                    <span className="text-5xl text-amber-300 dark:text-amber-500">📖</span>
                  )}
                </div>
                
                <div className="flex flex-col h-36">
                  <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2 line-clamp-2">
                    {book.title || 'Título no disponible'}
                  </h3>
                  <p className="text-sm text-amber-600 dark:text-amber-400 italic mb-1">
                    {book.author || "Autor desconocido"}
                  </p>
                  <p className="text-xs text-amber-500 dark:text-amber-300 line-clamp-3 flex-grow">
                    {book.description || 'Descripción no disponible'}
                  </p>
                  
                  {(book.category || book.categories) && (
                    <span className="mt-2 inline-block px-2 py-1 text-xs bg-amber-100 dark:bg-gray-600 text-amber-800 dark:text-amber-200 rounded-full">
                      {book.category || book.categories?.[0] || 'General'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Favoritos;
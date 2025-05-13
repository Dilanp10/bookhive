import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function Home() {
  const [profile, setProfile] = useState(null);
  const [externalBooks, setExternalBooks] = useState([]);
  const [localBooks, setLocalBooks] = useState([]);
  const [filteredExternalBooks, setFilteredExternalBooks] = useState([]);
  const [filteredLocalBooks, setFilteredLocalBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const categories = ["todos", "Ficción", "No ficción", "Ciencia", "Literatura"];
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLocal, setIsLoadingLocal] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedProfile = localStorage.getItem("activeProfile");
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Debes iniciar sesión");
      navigate("/login");
      return;
    }

    if (!storedProfile) {
      navigate("/profiles");
      return;
    }

    const parsedProfile = JSON.parse(storedProfile);

    // Obtener rol real del usuario
    axios.get("https://backend-bookhive.onrender.com/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        const merged = { ...parsedProfile, role: data.role };
        setProfile(merged);
        fetchBooks(parsedProfile.ageGroup);
        fetchLocalBooks(parsedProfile.ageGroup);
      })
      .catch((err) => {
        console.error(err);
        toast.error("No se pudo verificar tu rol");
        navigate("/login");
      });
  }, [navigate]);

  // Fetching books from the external API
  const fetchBooks = async (ageGroup) => {
    setIsLoading(true);
    try {
      const query = `libros para ${ageGroup}`;
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=40`
      );
      const items = response.data.items || [];
      const mapped = items.map((item) => ({
        id: item.id,
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors?.[0] || "Autor desconocido",
        description: item.volumeInfo.description || "Sin descripción",
        coverUrl: item.volumeInfo.imageLinks?.thumbnail || "",
        categories: item.volumeInfo.categories || ["General"],
        publishedDate: item.volumeInfo.publishedDate || "",
        type: "external",
      }));
      setExternalBooks(mapped);
      setFilteredExternalBooks(mapped);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar libros externos");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetching books from the local DB (manual entries)
  const fetchLocalBooks = async (ageGroup) => {
    setIsLoadingLocal(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Debes iniciar sesión para ver tus libros locales");
        return;
      }
      const response = await axios.get("https://backend-bookhive.onrender.com/api/manual-books", {
        params: { ageGroup },
        headers: { Authorization: `Bearer ${token}` },
      });
      const mapped = response.data.map((b) => ({ ...b, type: "local" }));
      setLocalBooks(mapped);
      setFilteredLocalBooks(mapped);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar libros locales");
    } finally {
      setIsLoadingLocal(false);
    }
  };

  // Filter both lists by search / category
  useEffect(() => {
    const term = searchTerm.toLowerCase();
  
    const normalizeString = (str) =>
      str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
    const matchesCategory = (bookCategories, filter) => {
      if (!bookCategories || !Array.isArray(bookCategories)) return false;
      return bookCategories.some((cat) =>
        normalizeString(cat).includes(normalizeString(filter))
      );
    };
  
    let ext = externalBooks;
    if (term) {
      ext = ext.filter((b) =>
        normalizeString(b.title).includes(normalizeString(term)) ||
        (b.author && normalizeString(b.author).includes(normalizeString(term)))
      );
    }
    if (categoryFilter !== "todos") {
      ext = ext.filter((b) => matchesCategory(b.categories, categoryFilter));
    }
    setFilteredExternalBooks(ext);
  
    let loc = localBooks;
    if (term) {
      loc = loc.filter((b) =>
        normalizeString(b.title).includes(normalizeString(term)) ||
        (b.author && normalizeString(b.author).includes(normalizeString(term)))
      );
    }
    if (categoryFilter !== "todos") {
      loc = loc.filter((b) => matchesCategory(b.categories, categoryFilter));
    }
    setFilteredLocalBooks(loc);
  }, [searchTerm, categoryFilter, externalBooks, localBooks]);

// Guarda libro externo como favorito
const handleSaveBook = async (book) => {
  console.log('🔥 handleSaveBook llamado con:', book);
  const token = localStorage.getItem("token");
  if (!token || !profile) {
    toast.error("Debes iniciar sesión para guardar libros");
    return;
  }
  try {
    const payload = {
      profileId:    profile._id,
      source:       "external",
      googleBookId: book.id,        // EL googleBookId de Google Books
      title:        book.title,
      author:       book.author,
      description:  book.description,
      coverUrl:     book.coverUrl,
      categories:   book.categories,
    };
    console.log('📤 Enviando a /api/favorites:', payload);

    const res = await axios.post(
      "https://backend-bookhive.onrender.com/api/favorites",
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('✅ Respuesta del servidor:', res.status, res.data);
    toast.success("Libro externo guardado en favoritos");
  } catch (err) {
    // Error completo
    console.error("❌ Error guardando libro externo:", err);

    if (err.response) {
      console.error("• Status:", err.response.status);
      console.error("• Data:", err.response.data);
    } else {
      console.error("• Sin respuesta del servidor");
    }

    const msg = err.response?.data?.message || "Error al guardar el libro externo";
    toast.error(msg);
  }
};

// Guarda libro local como favorito
const handleSaveLocalBook = async (book) => {
  const token = localStorage.getItem("token");
  const profile = JSON.parse(localStorage.getItem("activeProfile"));

  if (!token || !profile?._id || !book?._id) {
    toast.error("Faltan datos necesarios para guardar el favorito");
    return;
  }

  try {
    const response = await axios.post(
      "https://backend-bookhive.onrender.com/api/favorites",
      {
        profileId: profile._id,
        source: "manual",
        bookId: book._id
      },
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );

    toast.success("Libro guardado en favoritos");
    
    // Opcional: Puedes devolver los datos para actualizar el estado
    return response.data;

  } catch (error) {
    console.error("Error al guardar favorito:", {
      error: error.message,
      response: error.response?.data
    });

    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        "Error al guardar el libro";
    
    toast.error(errorMessage);
    throw error;
  }
};

  // Delete local manual book
  const handleDeleteLocalBook = async (bookId) => {
    const isConfirmed = window.confirm(
      "¿Estás seguro de que quieres eliminar este libro? Esta acción no se puede deshacer."
    );
    if (!isConfirmed) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Debes iniciar sesión para eliminar libros");
        return;
      }
      await axios.delete(`https://backend-bookhive.onrender.com/api/manual-books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Libro local eliminado correctamente");
      fetchLocalBooks(profile.ageGroup);
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar el libro local");
    }
  };

  if (!profile) return null;

 
return (
  <div className="min-h-screen p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-900">
    {/* Header */}
    <div className="flex justify-between items-start mb-8">
      <div>
        <h1 className="text-4xl font-serif font-bold text-amber-800 dark:text-amber-200 mb-2">
          ¡Bienvenido, {profile.name}!
        </h1>
        <p className="text-lg text-amber-600 dark:text-amber-400">
          Descubre tu próxima gran lectura...
        </p>
      </div>
      <div className="flex space-x-3">
        <button
          onClick={() => navigate("/favoritos")}
          className="flex items-center space-x-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg shadow transition"
        >
          <span>⭐</span>
          <span>Favoritos</span>
        </button>
        <button
          onClick={() => navigate("/perfil")}
          className="flex items-center space-x-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg shadow transition"
        >
          <span>👤</span>
          <span>Cambiar perfil</span>
        </button>
        {profile.role === "admin" && (
          <button
            onClick={() => navigate("/crear-libro")}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition"
          >
            <span>📖</span>
            <span>Nuevo libro</span>
          </button>
        )}
      </div>
    </div>

    {/* Filtros */}
    <div className="mb-10 bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold text-amber-800 dark:text-amber-200 mb-4">
        Buscar en la biblioteca
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-2">
            Buscar libros
          </label>
          <div className="relative">
            <input
              id="search"
              type="text"
              placeholder="Título, autor..."
              className="w-full p-3 pl-10 border border-amber-300 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-3 top-3 text-amber-500">🔍</span>
          </div>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-2">
            Categoría
          </label>
          <div className="relative">
            <select
              id="category"
              className="w-full p-3 border border-amber-300 rounded-lg dark:bg-gray-800 dark:text-white appearance-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "todos" ? "Todas las categorías" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-3 text-amber-500">📚</span>
          </div>
        </div>
        <div className="flex items-end">
          <button 
            onClick={() => { setSearchTerm(""); setCategoryFilter("todos"); }}
            className="w-full py-3 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>

    {/* Libros recomendados */}
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-amber-800 dark:text-amber-200">
          Libros recomendados
        </h2>
        <span className="text-amber-600 dark:text-amber-400">
          {filteredExternalBooks.length} resultados
        </span>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : filteredExternalBooks.length === 0 ? (
        <div className="bg-white dark:bg-gray-700 rounded-xl p-8 text-center shadow">
          <p className="text-lg text-amber-600 dark:text-amber-300 mb-4">
            {searchTerm || categoryFilter !== "todos" 
              ? "No encontramos libros con esos criterios" 
              : "No hay recomendaciones disponibles"}
          </p>
          <button 
            onClick={() => { setSearchTerm(""); setCategoryFilter("todos"); }}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow transition"
          >
            Ver todos los libros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredExternalBooks.map((book) => (
            <div 
              key={book.id} 
              className="group bg-white dark:bg-gray-700 rounded-xl p-4 shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-64 mb-4 rounded-lg overflow-hidden bg-amber-50 dark:bg-gray-600 flex items-center justify-center">
                {book.coverUrl ? (
                  <img 
                    src={book.coverUrl} 
                    alt={book.title} 
                    className="h-full object-contain transition-transform duration-300 group-hover:scale-105" 
                  />
                ) : (
                  <span className="text-5xl text-amber-300 dark:text-amber-500">📖</span>
                )}
              </div>
              <div className="flex flex-col h-36">
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2 line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-sm text-amber-600 dark:text-amber-400 mb-4 line-clamp-2">
                  {book.author}
                </p>
                <div className="mt-auto flex space-x-2">
                  <button
                    onClick={() => navigate(`/libro/${book.id}`)}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow transition"
                  >
                    Ver más
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveBook(book);
                    }}
                    className="w-10 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow transition flex items-center justify-center"
                    title="Guardar en favoritos"
                  >
                    ⭐
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>

    {/* Libros locales */}
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-amber-800 dark:text-amber-200">
          Tu colección personal
        </h2>
        <span className="text-amber-600 dark:text-amber-400">
          {filteredLocalBooks.length} libros
        </span>
      </div>
      
      {isLoadingLocal ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : filteredLocalBooks.length === 0 ? (
        <div className="bg-white dark:bg-gray-700 rounded-xl p-8 text-center shadow">
          <p className="text-lg text-amber-600 dark:text-amber-300 mb-4">
            {searchTerm || categoryFilter !== "todos" 
              ? "No hay libros en tu colección con esos criterios" 
              : "Tu colección está vacía"}
          </p>
          {profile.role === "admin" && (
            <button
              onClick={() => navigate("/crear-libro")}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition"
            >
              Agregar primer libro
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredLocalBooks.map((book) => (
            <div 
              key={book._id} 
              className="group bg-white dark:bg-gray-700 rounded-xl p-4 shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative"
            >
              {/* Botón de eliminar */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteLocalBook(book._id);
                }}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow transition opacity-0 group-hover:opacity-100 z-10"
                title="Eliminar libro"
              >
                ✕
              </button>
              
              <div className="relative h-64 mb-4 rounded-lg overflow-hidden bg-amber-50 dark:bg-gray-600 flex items-center justify-center">
                {book.coverUrl ? (
                  <img 
                    src={book.coverUrl} 
                    alt={book.title} 
                    className="h-full object-contain transition-transform duration-300 group-hover:scale-105" 
                  />
                ) : (
                  <span className="text-5xl text-amber-300 dark:text-amber-500">📖</span>
                )}
              </div>
              <div className="flex flex-col h-36">
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2 line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-sm text-amber-600 dark:text-amber-400 mb-4 line-clamp-2">
                  {book.author}
                </p>
                <div className="mt-auto flex space-x-2">
                  <button
                    onClick={() => navigate(`/libro/${book._id}`)}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow transition"
                  >
                    Ver más
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveLocalBook(book);
                    }}
                    className="w-10 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow transition flex items-center justify-center"
                    title="Guardar en favoritos"
                  >
                    ⭐
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  </div>
);

}

export default Home;
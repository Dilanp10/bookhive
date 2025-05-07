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
    if (storedProfile) {
      const parsed = JSON.parse(storedProfile);
      setProfile(parsed);
      fetchBooks(parsed.ageGroup);
      fetchLocalBooks(parsed.ageGroup);
    } else {
      navigate("/profiles");
    }
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
      const response = await axios.get("https://backend-bookhive-5.onrender.com/api/manual-books", {
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

    // External
    let ext = externalBooks;
    if (term) {
      ext = ext.filter((b) =>
        b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term)
      );
    }
    if (categoryFilter !== "todos") {
      ext = ext.filter((b) =>
        b.categories.some((c) => c.toLowerCase().includes(categoryFilter.toLowerCase()))
      );
    }
    setFilteredExternalBooks(ext);

    // Local
    let loc = localBooks;
    if (term) {
      loc = loc.filter((b) =>
        b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term)
      );
    }
    if (categoryFilter !== "todos") {
      loc = loc.filter((b) =>
        b.categories.some((c) => c.toLowerCase().includes(categoryFilter.toLowerCase()))
      );
    }
    setFilteredLocalBooks(loc);
  }, [searchTerm, categoryFilter, externalBooks, localBooks]);

  // Save external book as favorite
  const handleSaveBook = async (book) => {
    const token = localStorage.getItem("token");
    if (!token || !profile) {
      toast.error("Debes iniciar sesión para guardar libros");
      return;
    }
    try {
      await axios.post(
        "https://backend-bookhive-5.onrender.com/api/books",
        {
          profileId: profile._id,
          title: book.title,
          author: book.author,
          description: book.description,
          coverUrl: book.coverUrl,
          googleBookId: book.id,
          categories: book.categories,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Libro externo guardado en favoritos");
    } catch (err) {
      if (err.response?.status === 400) {
        toast.error("Ya habías guardado este libro externo");
      } else {
        console.error(err);
        toast.error("Error al guardar el libro externo");
      }
    }
  };

  // Save local manual book as favorite
  const handleSaveLocalBook = async (book) => {
    const token = localStorage.getItem("token");
    if (!token || !profile) {
      toast.error("Debes iniciar sesión para guardar libros");
      return;
    }
    try {
      await axios.post(
        "https://backend-bookhive-5.onrender.com/api/books",
        {
          profileId: profile._id,
          title: book.title,
          author: book.author,
          description: book.description,
          coverUrl: book.coverUrl,
          manualBookId: book._id,
          categories: book.categories,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Libro local guardado en favoritos");
    } catch (err) {
      if (err.response?.status === 400) {
        toast.error("Ya habías guardado este libro local");
      } else {
        console.error(err);
        toast.error("Error al guardar el libro local");
      }
    }
  };

  // Delete local manual book
  const handleDeleteLocalBook = async (bookId) => {
    const isConfirmed = window.confirm("¿Estás seguro de que quieres eliminar este libro? Esta acción no se puede deshacer.");
    
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Debes iniciar sesión para eliminar libros");
        return;
      }
      
      await axios.delete(`https://backend-bookhive-5.onrender.com/api/manual-books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success("Libro local eliminado correctamente");
      // Refresh the local books list
      fetchLocalBooks(profile.ageGroup);
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar el libro local");
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-pink-100 to-purple-200 dark:from-gray-900 dark:to-gray-800">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            ¡Hola, {profile.name}!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Recomendaciones de libros para vos:
          </p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <button onClick={() => navigate("/favoritos")} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow">
            Ver favoritos
          </button>
          <button onClick={() => navigate("/perfil")} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow">
            Elegir otro perfil
          </button>
          <button onClick={() => navigate("/crear-libro")} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow">
            crear libro
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-8 bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar por título o autor</label>
            <input
              id="search"
              type="text"
              placeholder="Escribe para buscar..."
              className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filtrar por categoría</label>
            <select
              id="category"
              className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Libros externos */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Libros recomendados</h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>
        ) : filteredExternalBooks.length === 0 ? (
          <p className="text-center text-gray-700 dark:text-gray-300">{searchTerm || categoryFilter !== "todos" ? "No se encontraron libros externos" : "No hay libros externos disponibles"}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredExternalBooks.map((book) => (
              <div key={book.id} className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow flex flex-col justify-between">
                {book.coverUrl
                  ? <img src={book.coverUrl} alt={book.title} className="w-full h-48 object-contain mb-4 rounded" />
                  : <div className="w-full h-48 bg-gray-200 dark:bg-gray-600 mb-4 rounded flex items-center justify-center"><span className="text-xl text-gray-500 dark:text-gray-300">Sin portada</span></div>
                }
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{book.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{book.author}</p>
                <button
                  onClick={() => handleSaveBook(book)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow"
                >Guardar en favoritos</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Libros locales */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">libros locales</h2>
        {isLoadingLocal ? (
          <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>
        ) : filteredLocalBooks.length === 0 ? (
          <p className="text-center text-gray-700 dark:text-gray-300">{searchTerm || categoryFilter !== "todos" ? "No se encontraron libros locales" : "No tienes libros locales añadidos"}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredLocalBooks.map((book) => (
              <div key={book._id} className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow flex flex-col justify-between relative">
                {/* Botón de eliminar */}
                <button 
                  onClick={() => handleDeleteLocalBook(book._id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-white rounded-full p-1 shadow"
                  title="Eliminar libro"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                {book.coverUrl
                  ? <img src={book.coverUrl} alt={book.title} className="w-full h-48 object-contain mb-4 rounded" />
                  : <div className="w-full h-48 bg-gray-200 dark:bg-gray-600 mb-4 rounded flex items-center justify-center"><span className="text-xl text-gray-500 dark:text-gray-300">Sin portada</span></div>
                }
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{book.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{book.author}</p>
                <button
                  onClick={() => handleSaveLocalBook(book)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow"
                >Guardar en favoritos</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
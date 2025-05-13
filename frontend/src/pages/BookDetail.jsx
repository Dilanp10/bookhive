import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function BookDetail() {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Función para verificar si es un ID de MongoDB
  const isMongoId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Debes iniciar sesión");
        navigate("/login");
        return;
      }

      // Si es MongoId, probar en local
      if (isMongoId(bookId)) {
        try {
          const localRes = await axios.get(
            `https://backend-bookhive.onrender.com/api/books/${bookId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setBook({ ...localRes.data, type: "local" });
          setLoading(false);
          return;
        } catch (err) {
          if (err.response?.status !== 404) {
            console.error(err);
            toast.error("Error al cargar libro local");
            navigate("/home");
            setLoading(false);
            return;
          }
        }
      }

      // Si no está local o no es MongoId, cargar desde Google
      try {
        const res = await axios.get(
          `https://www.googleapis.com/books/v1/volumes/${bookId}`
        );
        const item = res.data;
        setBook({
          id: item.id,
          title: item.volumeInfo.title,
          author: item.volumeInfo.authors?.join(", ") || "Autor desconocido",
          description: item.volumeInfo.description || "Sin descripción",
          coverUrl: item.volumeInfo.imageLinks?.thumbnail || "",
          categories: item.volumeInfo.categories || ["General"],
          publishedDate: item.volumeInfo.publishedDate || "",
          publisher: item.volumeInfo.publisher || "",
          pageCount: item.volumeInfo.pageCount || null,
          type: "external",
        });
      } catch (err) {
        console.error("Error al cargar desde Google Books:", err);
        toast.error("No se pudo cargar el libro");
        navigate("/home");
      } finally {
        setLoading(false);
      }
    };

    if (bookId) fetchBookDetails();
    else {
      toast.error("ID de libro no proporcionado");
      navigate("/home");
    }
  }, [bookId, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-amber-800">Libro no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition"
        >
          ← Volver atrás
        </button>

        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 p-6 flex justify-center">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="max-h-96 rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full h-64 bg-amber-100 dark:bg-gray-600 flex items-center justify-center rounded-lg">
                  <span className="text-5xl text-amber-400 dark:text-amber-500">📖</span>
                </div>
              )}
            </div>
            <div className="md:w-2/3 p-6">
              <h1 className="text-3xl font-serif font-bold text-amber-800 dark:text-amber-200 mb-2">
                {book.title}
              </h1>
              <p className="text-lg text-amber-600 dark:text-amber-400 mb-4">
                {book.author}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {book.categories?.map((cat, idx) => (
                  <span key={idx} className="px-3 py-1 bg-amber-100 dark:bg-gray-600 text-amber-800 dark:text-amber-200 rounded-full text-sm">
                    {cat}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-amber-700 dark:text-amber-300">Publicado</p>
                  <p className="text-amber-900 dark:text-amber-100">{book.publishedDate || "Desconocido"}</p>
                </div>
                <div>
                  <p className="text-sm text-amber-700 dark:text-amber-300">Editorial</p>
                  <p className="text-amber-900 dark:text-amber-100">{book.publisher || "Desconocido"}</p>
                </div>
                {book.pageCount && (
                  <div>
                    <p className="text-sm text-amber-700 dark:text-amber-300">Páginas</p>
                    <p className="text-amber-900 dark:text-amber-100">{book.pageCount}</p>
                  </div>
                )}
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">Descripción</h3>
                <p className="text-amber-900 dark:text-amber-100">{book.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetail;
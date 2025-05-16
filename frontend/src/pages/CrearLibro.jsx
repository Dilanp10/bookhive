import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CrearLibro() {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    coverUrl: "",
    ageGroup: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.author || !formData.ageGroup) {
      alert("Los campos Título, Autor y Grupo de Edad son obligatorios.");
      return;
    }

    try {
      const response = await fetch("https://backend-bookhive.onrender.com/api/manual-books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        navigate("/perfil");
      } else {
        const error = await response.json();
        alert("Error: " + error.message);
      }
    } catch (err) {
      console.error("Error al crear el libro:", err);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-pink-100 to-purple-200 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Crear Nuevo Libro</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Completa los detalles del libro
            </p>
          </div>
          <button 
            onClick={() => navigate("/perfil")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow"
          >
            Volver al perfil
          </button>
        </div>

        <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título del libro <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="Ej: Cien años de soledad"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white transition"
                required
              />
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Autor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="author"
                name="author"
                placeholder="Ej: Gabriel García Márquez"
                value={formData.author}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white transition"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Breve resumen del libro..."
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white transition"
              />
            </div>

            <div>
              <label htmlFor="coverUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL de la portada
              </label>
              <input
                type="text"
                id="coverUrl"
                name="coverUrl"
                placeholder="https://ejemplo.com/portada.jpg"
                value={formData.coverUrl}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white transition"
              />
            </div>

            <div>
              <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Grupo de edad <span className="text-red-500">*</span>
              </label>
              <select
                id="ageGroup"
                name="ageGroup"
                value={formData.ageGroup}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white transition"
                required
              >
                <option value="">Seleccione una opción</option>
                <option value="niño">Niño</option>
                <option value="adolescente">Adolescente</option>
                <option value="adulto">Adulto</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg shadow-md transition duration-200"
              >
                Guardar Libro
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CrearLibro;
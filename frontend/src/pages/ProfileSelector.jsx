import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function ProfileSelector() {
  const [profiles, setProfiles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    avatar: "", 
    age: "" // Cambiamos ageGroup por age (número)
  });
  const navigate = useNavigate();

  // Obtener perfiles del usuario
  const fetchProfiles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://backend-bookhive-5.onrender.com/api/profiles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfiles(res.data);
    } catch (error) {
      console.error("Error al obtener perfiles:", error);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Seleccionar perfil
  const handleSelect = (profile) => {
    localStorage.setItem("activeProfile", JSON.stringify(profile));
    navigate("/");
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Crear nuevo perfil
  const handleCreateProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://backend-bookhive-5.onrender.com/api/profiles", 
        {
          ...formData,
          age: Number(formData.age) // Aseguramos que sea número
        }, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProfiles([...profiles, res.data]);
      setFormData({ name: "", avatar: "", age: "" });
      setShowForm(false);
    } catch (error) {
      console.error("Error al crear perfil:", error.response?.data || error.message);
      alert(`Error: ${error.response?.data?.message || "Datos inválidos"}`);
    }
  };

  // Eliminar perfil
  const handleDeleteProfile = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://backend-bookhive-5.onrender.com/api/profiles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfiles(profiles.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Error al eliminar perfil:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-100 to-indigo-200 dark:from-gray-900 dark:to-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        ¿Quién está leyendo?
      </h1>

      {/* Lista de perfiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
        {profiles.map((profile) => (
          <div
            key={profile._id}
            className="relative p-4 bg-white dark:bg-gray-700 shadow-md rounded-lg hover:scale-105 transition transform duration-200"
          >
            <button
              onClick={() => handleSelect(profile)}
              className="w-full text-left"
            >
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {profile.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {profile.age} años • {profile.ageGroup}
              </p>
            </button>
            <button
              onClick={() => handleDeleteProfile(profile._id)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
              title="Eliminar"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Botón para mostrar/ocultar formulario */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
      >
        {showForm ? "Cancelar" : "Agregar perfil"}
      </button>

      {/* Formulario para crear perfil */}
      {showForm && (
        <div className="bg-white dark:bg-gray-700 p-6 rounded shadow-md w-full max-w-md space-y-4">
          <input
            name="name"
            placeholder="Nombre"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-2 rounded border dark:bg-gray-800 dark:text-white"
            required
          />
          <input
            name="avatar"
            placeholder="URL del avatar (opcional)"
            value={formData.avatar}
            onChange={handleInputChange}
            className="w-full p-2 rounded border dark:bg-gray-800 dark:text-white"
          />
          <input
            name="age"
            type="number"
            min="4"
            placeholder="Edad (ej: 8, 15, 30)"
            value={formData.age}
            onChange={handleInputChange}
            className="w-full p-2 rounded border dark:bg-gray-800 dark:text-white"
            required
          />
          <button
            onClick={handleCreateProfile}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            disabled={!formData.name || !formData.age}
          >
            Crear perfil
          </button>
          
        </div>
        
      )}
    </div>
  );
}

export default ProfileSelector;
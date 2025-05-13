import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function SelectProfile() {
  const [profiles, setProfiles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://backend-bookhive.onrender.com/api/profiles", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfiles(res.data);
      } catch (err) {
        toast.error("No se pudieron cargar los perfiles");
      }
    };
    fetchProfiles();
  }, []);

  const handleSelect = (profile) => {
    localStorage.setItem("activeProfile", JSON.stringify(profile));
    navigate("/catalogo");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">¿Quién está leyendo?</h1>
  
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => navigate("/crear-perfil")}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Crear Perfil
        </button>
        <button
          onClick={() => navigate("/crear-libro")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Crear Libro
        </button>
      </div>
  
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {profiles.map((profile) => (
          <button
            key={profile._id}
            onClick={() => handleSelect(profile)}
            className="flex flex-col items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <div className="w-20 h-20 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold uppercase mb-2">
              {profile.name.charAt(0)}
            </div>
            <span className="text-gray-800 dark:text-white font-medium">{profile.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
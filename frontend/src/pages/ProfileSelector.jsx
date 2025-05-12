import { useNavigate } from "react-router-dom";
import { useEffect, useState, Fragment } from "react";
import axios from "axios";
import { Dialog, Transition } from "@headlessui/react";
import toast, { Toaster } from "react-hot-toast";
import { FaBookOpen, FaUserEdit, FaSignOutAlt, FaTrash, FaPlus } from "react-icons/fa";

function ProfileSelector() {
  const [profiles, setProfiles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", avatar: "", age: "" });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  // Obtener perfiles del usuario
  const fetchProfiles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/profiles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfiles(res.data);
    } catch (error) {
      console.error("Error al obtener perfiles:", error);
      toast.error("No se pudieron cargar los perfiles.");
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Seleccionar perfil
  const handleSelect = (profile) => {
    localStorage.setItem("activeProfile", JSON.stringify(profile));
    navigate("/home");
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
        "http://localhost:5000/api/profiles",
        { ...formData, age: Number(formData.age) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfiles([...profiles, res.data]);
      setFormData({ name: "", avatar: "", age: "" });
      setShowForm(false);
      toast.success("Perfil creado exitosamente.");
    } catch (error) {
      console.error("Error al crear perfil:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Error al crear perfil.");
    }
  };

  // Eliminar perfil
  const handleDeleteProfile = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/profiles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfiles(profiles.filter((p) => p._id !== id));
      toast.success("Perfil eliminado.");
    } catch (error) {
      console.error("Error al eliminar perfil:", error);
      toast.error("No se pudo eliminar el perfil.");
    }
  };

  // Cerrar sesión
  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("activeProfile");
    toast.success("Sesión cerrada.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-900">
      {/* Toaster para notificaciones */}
      <Toaster position="top-right" toastOptions={{
        className: 'bg-amber-100 dark:bg-gray-700 text-gray-800 dark:text-amber-50 border-l-4 border-amber-500',
      }} />

      {/* Header con logo y botón de cerrar sesión */}
      <header className="w-full max-w-6xl flex justify-between items-center p-6">
        <div className="flex items-center space-x-2">
          <FaBookOpen className="text-3xl text-amber-600 dark:text-amber-400" />
          <h1 className="text-2xl font-serif font-bold text-amber-800 dark:text-amber-200">Biblioteca Digital</h1>
        </div>
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-amber-700 text-amber-50 rounded-lg shadow hover:bg-amber-800 transition"
        >
          <FaSignOutAlt />
          <span>Cerrar sesión</span>
        </button>
      </header>

      {/* Modal de confirmación de logout */}
      <Transition appear show={isLogoutModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsLogoutModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-amber-50 dark:bg-gray-700 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-amber-800 dark:text-amber-200"
                  >
                    Confirmar cierre de sesión
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-amber-600 dark:text-amber-100">
                      ¿Estás seguro de que deseas cerrar sesión?
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 bg-amber-200 text-amber-800 rounded hover:bg-amber-300 transition"
                      onClick={() => setIsLogoutModalOpen(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 transition"
                      onClick={confirmLogout}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Contenido principal */}
      <main className="flex flex-col items-center w-full max-w-6xl px-6 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif font-bold text-amber-800 dark:text-amber-200 mb-4">
            ¿Quién está leyendo hoy?
          </h1>
          <p className="text-amber-600 dark:text-amber-300 max-w-2xl">
            Selecciona tu perfil para acceder a tu biblioteca personal o crea un nuevo perfil para compartir la experiencia de lectura.
          </p>
        </div>

        {/* Lista de perfiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full mb-10">
          {profiles.map((profile) => (
            <div
              key={profile._id}
              className="relative group bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-2"
            >
              <button 
                onClick={() => handleSelect(profile)} 
                className="w-full h-full p-6 flex flex-col items-center"
              >
                <div className="w-24 h-24 mb-4 rounded-full bg-amber-100 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <FaBookOpen className="text-3xl text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-amber-800 dark:text-amber-200 mb-1">
                  {profile.name}
                </h3>
                <p className="text-sm text-amber-600 dark:text-amber-300">
                  {profile.age} años
                </p>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteProfile(profile._id); }}
                className="absolute top-3 right-3 p-2 text-amber-600 dark:text-amber-300 opacity-0 group-hover:opacity-100 hover:text-red-600 transition"
                title="Eliminar perfil"
              >
                <FaTrash />
              </button>
            </div>
          ))}

          {/* Tarjeta para agregar nuevo perfil */}
          <div 
            className={`bg-amber-50 dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border-2 border-dashed ${showForm ? 'border-amber-400' : 'border-amber-300 dark:border-gray-600'} transition-all hover:shadow-lg cursor-pointer`}
            onClick={() => !showForm && setShowForm(true)}
          >
            {showForm ? (
              <div className="p-6 w-full h-full">
                <h3 className="text-xl font-semibold text-amber-800 dark:text-amber-200 mb-4 flex items-center">
                  <FaUserEdit className="mr-2" /> Nuevo perfil
                </h3>
                <div className="space-y-4">
                  <input
                    name="name"
                    placeholder="Nombre"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border border-amber-300 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                  <input
                    name="avatar"
                    placeholder="URL del avatar (opcional)"
                    value={formData.avatar}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border border-amber-300 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <input
                    name="age"
                    type="number"
                    min="4"
                    placeholder="Edad"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border border-amber-300 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCreateProfile(); }}
                      className="flex-1 py-2 bg-amber-600 text-white rounded-lg shadow hover:bg-amber-700 transition flex items-center justify-center space-x-2"
                      disabled={!formData.name || !formData.age}
                    >
                      <FaPlus /> <span>Crear</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowForm(false); }}
                      className="flex-1 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full p-6 flex flex-col items-center justify-center">
                <div className="w-24 h-24 mb-4 rounded-full bg-amber-100 dark:bg-gray-700 flex items-center justify-center border-2 border-dashed border-amber-400 dark:border-amber-500">
                  <FaPlus className="text-3xl text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-amber-800 dark:text-amber-200">
                  Agregar perfil
                </h3>
              </div>
            )}
          </div>
        </div>

        {/* Nota adicional */}
        <p className="text-sm text-amber-600 dark:text-amber-400 text-center max-w-2xl">
          Cada perfil tiene su propia colección de libros, marcadores y preferencias personalizadas.
        </p>
      </main>
    </div>
  );
}

export default ProfileSelector;
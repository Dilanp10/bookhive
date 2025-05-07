import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleChangeProfile = () => {
    localStorage.removeItem("activeProfile");
    navigate("/perfil");
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800 shadow-md">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white">BookHive</h1>

      <button
        onClick={handleChangeProfile}
        className="text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Cambiar perfil
      </button>
    </nav>
  );
}

export default Navbar;
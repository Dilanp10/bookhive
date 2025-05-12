import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#135ae8] to-[#86169d] flex flex-col justify-center items-center text-center px-6">
      <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 animate-fade-in">
        Bienvenido a BookHive
      </h1>

      <p className="text-lg md:text-xl text-gray-900 max-w-2xl mb-8">
        📚 Tu biblioteca personalizada en la nube. Creá perfiles, descubrí recomendaciones según la edad, guardá tus favoritos y creá tus propios libros. Todo desde una interfaz moderna, simple y segura.
      </p>

      <div className="flex space-x-4 mb-12">
        <Link to="/register">
          <button className="bg-blue-600 hover:bg-black text-white text-lg px-6 py-3 rounded-xl transition shadow-md">
            Registrarse
          </button>
        </Link>
        <Link to="/login">
          <button className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-black text-lg px-6 py-3 rounded-xl transition shadow-md">
            Iniciar Sesión
          </button>
        </Link>
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-6 max-w-4xl w-full grid md:grid-cols-2 gap-6 animate-fade-in-up">
        <div className="text-left space-y-3">
          <h2 className="text-xl font-semibold text-blue-700">🚀 ¿Qué ofrece BookHive?</h2>
          <ul className="list-disc list-inside text-gray-600">
            <li>Perfiles personalizados por edad</li>
            <li>Favoritos por usuario y perfil</li>
            <li>Recomendaciones conectadas a Google Books</li>
            <li>Creación de libros personalizados</li>
            <li>Interfaz moderna con rutas protegidas</li>
          </ul>
        </div>
        <div className="flex justify-center items-center">
          <img
            src="https://tse1.mm.bing.net/th?id=OIP.AHHWPa0SnbhGQNbIiPafzwAAAA&pid=Api&P=0&h=180" // usá una ilustración en assets o una pública
            alt="Books illustration"
            className="w-64 md:w-80"
          />
        </div>
      </div>

      <p className="mt-10 text-sm text-gray-900">
        🧪 Usuario demo: <strong>demo@bookhive.com</strong> | Contraseña: <strong>123456</strong>
      </p>
    </div>
  );
}
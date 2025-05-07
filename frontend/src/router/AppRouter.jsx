import { BrowserRouter, Routes, Route } from "react-router-dom";

// Páginas
import Login from "../pages/Login";
import Home from "../pages/Home";
import Catalog from "../pages/Catalog";
import BookDetail from "../pages/BookDetail";
import LibroDetalle from "../pages/LibroDetalle";
import NotFound from "../pages/NotFound";
import ProfileSelector from "../pages/ProfileSelector"; 
import Favoritos from "../pages/Favoritos";
import CrearLibro from "../pages/CrearLibro";


// Rutas protegidas
import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/perfil" element={<ProfileSelector />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/libro/:id" element={<BookDetail />} />
          <Route path="/libros/:id" element={<LibroDetalle />} />
          <Route path="/favoritos" element={<Favoritos />} />
          <Route path="/crear-libro" element={<CrearLibro />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
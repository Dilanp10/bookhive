import { BrowserRouter, Routes, Route } from "react-router-dom";

// Páginas
import Login from "../pages/Login";
import Home from "../pages/Home";
import Catalog from "../pages/Catalog";
import BookDetail from "../pages/BookDetail";
import NotFound from "../pages/NotFound";
import ProfileSelector from "../pages/ProfileSelector"; 
import Favoritos from "../pages/Favoritos";
import CrearLibro from "../pages/CrearLibro";
import LandingPage from "../pages/LandingPage";
import Register from "../pages/Register";

// Rutas protegidas
import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
         <Route path="/" element={<LandingPage/> }/>
         <Route path="/login" element={<Login />} />
         <Route path="/Register" element={<Register/> }/>

         <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/perfil" element={<ProfileSelector />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/favoritos" element={<Favoritos />} />
          <Route path="/crear-libro" element={<CrearLibro />} />
          <Route path="/libro/:bookId" element={<BookDetail />} />
                    
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
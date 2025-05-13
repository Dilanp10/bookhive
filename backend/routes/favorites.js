import express from 'express';
import Favorite from '../models/Favorite.js';
import ManualBook from '../models/ManualBook.js';
import Book from '../models/book.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';


const router = express.Router();

// Middleware para validar ObjectIds
const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('ID inválido');
  }
};

// GET /api/favorites - Obtener todos los favoritos con manejo robusto
router.get('/', async (req, res) => {
  try {
    const { profileId } = req.query;

    // Validaciones
    if (!profileId) {
      return res.status(400).json({ 
        success: false,
        message: 'El parámetro profileId es requerido' 
      });
    }

    validateObjectId(profileId);

    // Obtener favoritos con población segura
    const favorites = await Favorite.find({ profileId })
      .populate({
        path: 'manualBook',
        model: 'ManualBook',
        options: { 
          allowNull: true,
          transform: (doc) => doc || null
        }
      })
      .populate({
        path: 'externalBook',
        model: 'Book',
        options: { 
          allowNull: true,
          transform: (doc) => doc || null
        }
      })
      .lean();

    // Limpiar referencias rotas
    const validFavorites = await Promise.all(
      favorites.map(async (fav) => {
        const hasValidRef = (fav.manualBook && fav.manualBook._id) || 
                          (fav.externalBook && fav.externalBook._id);
        
        if (!hasValidRef) {
          await Favorite.findByIdAndDelete(fav._id);
          return null;
        }
        return fav;
      })
    );

    // Formatear respuesta
    const result = validFavorites
    .filter(Boolean)
    .map(fav => ({
      // 1) Datos del libro (manualBook o externalBook)
      ...(fav.manualBook || fav.externalBook),
      // 2) Metadatos de tu favorito
      source: fav.manualBook ? 'manual' : 'external',
      addedAt: fav.createdAt,
      // 3) POR ÚLTIMO, el _id REAL del documento Favorite
      _id: fav._id
    }));

    return res.json({
      success: true,
      count: result.length,
      data: result
    });

  } catch (error) {
    console.error('Error en GET /api/favorites:', error);
    const status = error.message.includes('ID inválido') ? 400 : 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// POST /api/favorites - Añadir nuevo favorito
router.post('/', async (req, res) => {
  try {
    const { profileId, source, bookId, googleBookId } = req.body;

    // Validaciones
    if (!profileId || !source) {
      throw new Error('Faltan campos obligatorios: profileId y source');
    }

    validateObjectId(profileId);
    
    const favData = { profileId };

    if (source === 'manual') {
      if (!bookId) throw new Error('bookId es requerido para libros manuales');
      validateObjectId(bookId);

      const bookExists = await ManualBook.exists({ _id: bookId });
      if (!bookExists) throw new Error('El libro manual no existe');

      favData.manualBook = bookId;
    } 
    else if (source === 'external') {
      if (!googleBookId) throw new Error('googleBookId es requerido para libros externos');

      let book = await Book.findOne({ googleBookId });
      if (!book) {
        book = new Book({ googleBookId, ...req.body });
        await book.save();
      }

      favData.externalBook = book._id;
    } 
    else {
      throw new Error('El campo source debe ser "manual" o "external"');
    }

    // Verificar duplicados
    const exists = await Favorite.findOne(favData);
    if (exists) {
      throw new Error('Este libro ya está en favoritos');
    }

    // Crear y guardar
    const newFavorite = new Favorite(favData);
    await newFavorite.save();

    // Poblar y devolver
    const saved = await Favorite.findById(newFavorite._id)
      .populate('manualBook')
      .populate('externalBook')
      .lean();

    return res.status(201).json({
      success: true,
      message: 'Libro añadido a favoritos',
      data: saved
    });

  } catch (error) {
    console.error('Error en POST /api/favorites:', error);
    const status = error.message.includes('no existe') ? 404 : 
                  error.message.includes('ya está') ? 409 :
                  error.message.includes('inválido') ? 400 : 500;
    return res.status(status).json({
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// DELETE /api/favorites/:id - Versión corregida (eliminación segura)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    // 1. Validar token (opcional, si quieres que cualquiera pueda borrar sin auth)
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token requerido' });
    }

    // 2. Validar ID del favorito
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    // 3. Eliminar sin verificar permisos
    const deleted = await Favorite.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Favorito no encontrado' });
    }

    return res.json({ 
      success: true, 
      message: 'Favorito eliminado', 
      deletedId: id 
    });

  } catch (error) {
    console.error('Error en DELETE /favorites:', error);
    return res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});


export default router;
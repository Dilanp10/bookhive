import express from 'express';
import Book from '../models/book.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Obtener libros guardados (versión compatible con query params)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { profileId } = req.query;
    if (!profileId) {
      return res.status(400).json({ message: 'Se requiere profileId' });
    }
    
    const books = await Book.find({ profileId });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener libros', error });
  }
});

// Las rutas POST y DELETE se mantienen igual
router.post('/', verifyToken, async (req, res) => {
  try {
    const { profileId, title, author, description, coverUrl, googleBookId } = req.body;

    // Evitar duplicados
    const existing = await Book.findOne({ profileId, googleBookId });
    if (existing) return res.status(400).json({ message: 'Ya está en favoritos' });

    const newBook = new Book({ profileId, title, author, description, coverUrl, googleBookId });
    await newBook.save();

    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar libro', error });
  }
});

router.delete('/:bookId', verifyToken, async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.bookId);
    res.json({ message: 'Libro eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar libro', error });
  }
});

export default router;
import express from 'express';
import ManualBook from '../models/ManualBook.js';

const router = express.Router();

// Crear libro global
router.post('/', async (req, res) => {
  try {
    const { title, author, description, coverUrl, ageGroup } = req.body;

    if (!title || !author || !ageGroup) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    const newBook = new ManualBook({ title, author, description, coverUrl, ageGroup });
    await newBook.save();

    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear libro', error });
  }
});

// Obtener todos los libros (con filtro opcional por edad)
router.get('/', async (req, res) => {
  try {
    const { ageGroup } = req.query;
    const query = ageGroup ? { ageGroup } : {};
    
    const books = await ManualBook.find(query);
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener libros', error });
  }
});

// **NUEVA RUTA** – Obtener un libro por su ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const book = await ManualBook.findById(id);

    if (!book) {
      return res.status(404).json({ message: 'Libro no encontrado' });
    }

    res.json(book);
  } catch (error) {
    // Si el formato del ID no es válido
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de libro inválido' });
    }
    res.status(500).json({ message: 'Error al obtener libro', error });
  }
});

// Eliminar libro (público)
router.delete('/:id', async (req, res) => {
  try {
    const deletedBook = await ManualBook.findByIdAndDelete(req.params.id);

    if (!deletedBook) {
      return res.status(404).json({ 
        message: 'Libro no encontrado' 
      });
    }

    res.json({ 
      message: 'Libro eliminado correctamente',
      deletedBook 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al eliminar libro',
      error: error.message 
    });
  }
});

export default router;
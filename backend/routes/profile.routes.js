import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import Profile from '../models/Profile.js';

const router = express.Router();

// Obtener perfiles del usuario
router.get('/', verifyToken, async (req, res) => {
    try {
      const profiles = await Profile.find({ user: req.user.id });
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener perfiles', error });
    }
  });

// Crear nuevo perfil
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, avatar, age } = req.body;

    if (!name || !age) {
      return res.status(400).json({ message: 'Nombre y edad son requeridos' });
    }

    const newProfile = new Profile({
      name,
      avatar: avatar || 'default-avatar.png',
      age, // Guardamos la edad numérica
      // ageGroup se calculará automáticamente antes de guardar (ver modelo)
      user: req.user.id,
    });

    const savedProfile = await newProfile.save();
    res.status(201).json(savedProfile);

  } catch (error) {
    res.status(500).json({ 
      message: 'Error al crear el perfil',
      error: error.message 
    });
  }
});
// Eliminar perfil
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const profile = await Profile.findOne({ _id: req.params.id, user: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Perfil no encontrado' });

    await Profile.deleteOne({ _id: req.params.id }); // Cambia esto
    res.json({ message: 'Perfil eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el perfil', error });
  }
});

export default router;
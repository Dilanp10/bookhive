// controllers/auth.controller.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Registrar nuevo usuario
export async function register(req, res) {
  try {
    const { email, password, name, role } = req.body;

    // Verificar si ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'El correo ya está registrado' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Validación de rol: sólo 'admin' o 'user'
    const validRoles = ['admin', 'user'];
    const userRole = validRoles.includes(role) ? role : 'user';

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      role: userRole,
    });

    await newUser.save();

    res.status(201).json({
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
      message: 'Usuario registrado correctamente',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
}

// Login de usuario existente
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'Usuario no encontrado' });

    // Verificar contraseña
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: 'Credenciales inválidas' });

    // Firmar JWT incluyendo id y rol
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
}

// Devuelve datos del usuario logueado
export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user)
      return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
}
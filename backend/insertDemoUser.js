import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from './db.js';
import User from './models/User.js'; // Asegurate que la ruta sea correcta

const createDemoUser = async () => {
  await connectDB();

  const existingUser = await User.findOne({ email: 'demo@bookhive.com' });
  if (existingUser) {
    console.log('⚠️ El usuario ya existe.');
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash('123456', 10);

  const user = new User({
    name: 'Demo User',
    email: 'demo@bookhive.com',
    password: hashedPassword,
    role: 'admin', // o 'user'
  });

  await user.save();
  console.log('✅ Usuario demo creado con éxito.');
  process.exit(0);
};

createDemoUser();
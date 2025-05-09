import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from './routes/profile.routes.js';
import bookRoutes from './routes/bookRoutes.js';
import manualBookRoutes from './routes/manualBook.routes.js';

// Configuración de entorno
dotenv.config();

const app = express();

// 1. Configuración CORS para producción
const PRODUCTION_FRONTEND = 'https://backend-bookhive-5.onrender.com';
const NETLIFY_FRONTEND = 'https://inquisitive-gelato-4c1095.netlify.app'; // Agregar el frontend de Netlify

// Puedes agregar más orígenes de frontend en producción si es necesario
const corsOptions = {
  origin: [PRODUCTION_FRONTEND, NETLIFY_FRONTEND], // Permitir también el origen de Netlify
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Permitir cookies en la comunicación
  optionsSuccessStatus: 204, // Opcional, se usa para compatibilidad con algunos navegadores
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Permitir las peticiones OPTIONS

// 2. Middlewares optimizados
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Endpoint de salud mejorado
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    backend: 'https://backend-bookhive-5.onrender.com', // URL del backend
    frontend: NETLIFY_FRONTEND, // URL del frontend de Netlify
    dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// 4. Sistema de rutas
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/manual-books', manualBookRoutes);

// 5. Conexión a MongoDB con timeout configurable
const MONGO_URI = process.env.MONGO_URI;
const DB_CONNECTION_TIMEOUT = 30000; // 30 segundos

console.log("🔌 Iniciando conexión a MongoDB...");
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: DB_CONNECTION_TIMEOUT,
  socketTimeoutMS: DB_CONNECTION_TIMEOUT
})
.then(() => {
  console.log("📦 MongoDB conectado exitosamente");
  
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend operativo en: https://backend-bookhive-5.onrender.com`);
    console.log(`🔗 Frontend permitido: ${NETLIFY_FRONTEND}`);
  });

  server.on('error', (error) => {
    console.error('❌ Error crítico del servidor:', error);
    process.exit(1);
  });
})
.catch((error) => {
  console.error('❌ Falla de conexión a MongoDB:', error.message);
  process.exit(1);
});

// 6. Manejo avanzado de errores
process.on('unhandledRejection', (error) => {
  console.error('⚠️ Unhandled Rejection:', error.message || error);
  if (error.stack) console.error(error.stack);
});

// 7. Export para posibles tests de integración
export default app;
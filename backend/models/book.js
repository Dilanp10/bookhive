// backend/models/Book.js
import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
  title: String,
  author: String,
  description: String,
  coverUrl: String,
  googleBookId: String, // útil para evitar duplicados
});

const Book = mongoose.model('Book', bookSchema);
export default Book;
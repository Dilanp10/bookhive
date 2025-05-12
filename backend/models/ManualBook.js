import mongoose from 'mongoose';

const manualBookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: String,
  coverUrl: String,
  ageGroup: {
    type: String,
    enum: ['niño', 'adolescente', 'adulto'],
    lowercase: true,
    required: true,
  },
}, { timestamps: true });

// Middleware opcional: garantizar que ageGroup se convierta a minúsculas antes de guardar
manualBookSchema.pre('save', function (next) {
  if (this.ageGroup) {
    this.ageGroup = this.ageGroup.toLowerCase();
  }
  next();
});

const ManualBook = mongoose.model('ManualBook', manualBookSchema);
export default ManualBook;
import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avatar: { type: String, default: 'default-avatar.png' },
  age: { type: Number, required: true, min: 4 }, // Edad mínima 4 años
  ageGroup: { type: String, enum: ['Niño', 'Adolescente', 'Adulto'] }, // Se calculará automáticamente
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Middleware para calcular ageGroup antes de guardar
profileSchema.pre('save', function(next) {
  if (this.age >= 4 && this.age <= 11) {
    this.ageGroup = 'Niño';
  } else if (this.age >= 12 && this.age <= 17) {
    this.ageGroup = 'Adolescente';
  } else if (this.age >= 18) {
    this.ageGroup = 'Adulto';
  }
  next();
});

export default mongoose.model('Profile', profileSchema);
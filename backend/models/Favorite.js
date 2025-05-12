// backend/models/Favorite.js
import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  // O uno u otro:
  manualBook:   { type: mongoose.Schema.Types.ObjectId, ref: 'ManualBook', required: false },
  externalBook: { type: mongoose.Schema.Types.ObjectId, ref: 'Book',       required: false },
}, { timestamps: true });

// Validación: debe referenciar exactamente uno de los dos
favoriteSchema.pre('save', function(next) {
  if ((this.manualBook && this.externalBook) || (!this.manualBook && !this.externalBook)) {
    return next(new Error('Debes referenciar **o** manualBook **o** externalBook, nunca ambos ni ninguno.'));
  }
  next();
});

const Favorite = mongoose.model('Favorite', favoriteSchema);
export default Favorite;
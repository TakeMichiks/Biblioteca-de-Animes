const mongoose = require('mongoose');

const animeSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String, default: '' },
  portada: { type: String, default: '' }, // URL portada
  episodios: { type: Number, default: 0 },
  estado: { 
    type: String, 
    enum: ['Viendo', 'Completado', 'Pendiente', 'Abandonado'], 
    default: 'Pendiente' 
  },
  calificacion: { type: Number, min: 0, max: 10, default: 0 },
  notas: { type: String, default: '' },
  capVistos: { type: Number, default: 0 },
  capTotales: { type: Number, default: 0 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Anime', animeSchema);

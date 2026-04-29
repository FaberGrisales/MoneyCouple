import mongoose from 'mongoose';

const eventoUsuarioSchema = new mongoose.Schema(
  {
    usuarioId: { type: String, required: true, index: true },
    evento: { type: String, required: true },
    pantalla: { type: String },
    propiedades: { type: mongoose.Schema.Types.Mixed },
    sesionId: { type: String },
    plataforma: { type: String, enum: ['ios', 'android', 'web'] },
    version: { type: String },
  },
  { timestamps: true },
);

eventoUsuarioSchema.index({ usuarioId: 1, createdAt: -1 });

export const EventoUsuario = mongoose.model('EventoUsuario', eventoUsuarioSchema);

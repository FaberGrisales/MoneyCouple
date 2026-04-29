import mongoose from 'mongoose';

const transcripcionVozSchema = new mongoose.Schema(
  {
    usuarioId: { type: String, required: true, index: true },
    audioUrl: { type: String },
    duracionSegundos: { type: Number },
    transcripcionRaw: { type: String },
    transcripcionLimpia: { type: String },
    idioma: { type: String, default: 'es-CO' },
    confianza: { type: Number },
    gastoParseado: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

export const TranscripcionVoz = mongoose.model('TranscripcionVoz', transcripcionVozSchema);

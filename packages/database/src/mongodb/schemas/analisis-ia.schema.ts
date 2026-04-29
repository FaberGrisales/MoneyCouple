import mongoose from 'mongoose';

const analisisIASchema = new mongoose.Schema(
  {
    gastoId: { type: String, index: true },
    usuarioId: { type: String, required: true, index: true },
    tipo: {
      type: String,
      enum: ['factura', 'voz', 'texto'],
      required: true,
    },
    inputRaw: { type: String },
    resultadoBruto: { type: mongoose.Schema.Types.Mixed },
    modeloUsado: { type: String },
    confianza: { type: Number, min: 0, max: 1 },
    tiempoProcesamiento: { type: Number },
    tokensUsados: { type: Number },
    errores: [{ type: String }],
  },
  { timestamps: true },
);

export const AnalisisIA = mongoose.model('AnalisisIA', analisisIASchema);

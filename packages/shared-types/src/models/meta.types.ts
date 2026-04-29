import type { CategoriaGasto, EstadoMeta, TipoMeta } from '../enums';

export interface Meta {
  id: string;
  usuarioId?: string;
  parejaId?: string;
  titulo: string;
  descripcion?: string;
  tipo: TipoMeta;
  montoObjetivo: number;
  montoActual: number;
  moneda: string;
  fechaInicio: Date;
  fechaFin?: Date;
  categoriaLimite?: CategoriaGasto;
  estado: EstadoMeta;
  icono?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

import type { CategoriaGasto, FuenteRegistro, NivelPrivacidad, TipoGasto } from '../enums';

export interface ItemGasto {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
  categoriaItem?: string;
}

export interface Ubicacion {
  lat: number;
  lng: number;
  direccion?: string;
  ciudad?: string;
}

export interface Gasto {
  id: string;
  usuarioId: string;
  parejaId?: string;
  monto: number;
  moneda: string;
  descripcion?: string;
  categoria: CategoriaGasto;
  subcategoria?: string;
  establecimiento?: string;
  ubicacion?: Ubicacion;
  fechaGasto: Date;
  tipoGasto: TipoGasto;
  esCompartido: boolean;
  quienGasta?: string;
  esPrivado: boolean;
  nivelPrivacidad: NivelPrivacidad;
  items?: ItemGasto[];
  carteraId?: string;
  fuenteRegistro: FuenteRegistro;
  confianzaIA?: number;
  necesitaConfirmacion: boolean;
  confirmadoPorUsuario: boolean;
  fotoOriginalUrl?: string;
  fotoProcesadaUrl?: string;
  audioUrl?: string;
  etiquetas: string[];
  notas?: string;
  esRecurrente: boolean;
  frecuenciaRecurrencia?: string;
  proximoGasto?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type GastoCreateInput = Omit<
  Gasto,
  'id' | 'createdAt' | 'updatedAt' | 'confianzaIA' | 'necesitaConfirmacion' | 'confirmadoPorUsuario'
>;

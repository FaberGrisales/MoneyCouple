import type { CategoriaGasto, FuenteRegistro, TipoCartera, TipoDivision } from '../enums';

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  apellido?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateGastoRequest {
  monto: number;
  moneda?: string;
  descripcion?: string;
  categoria: CategoriaGasto;
  establecimiento?: string;
  fechaGasto: string;
  fuenteRegistro: FuenteRegistro;
  carteraId?: string;
  esCompartido?: boolean;
  esPrivado?: boolean;
  etiquetas?: string[];
  notas?: string;
}

export interface ProcesarFacturaRequest {
  imagenBase64: string;
  mimeType?: string;
}

export interface ProcesarVozRequest {
  audioBase64: string;
  mimeType?: string;
}

export interface ParsearTextoRequest {
  texto: string;
}

export interface CreateCarteraRequest {
  nombre: string;
  tipo: TipoCartera;
  saldoInicial: number;
  moneda?: string;
  icono: string;
  color: string;
  limiteCredito?: number;
  diaCorte?: number;
  diaPago?: number;
  numeroEnmascarado?: string;
}

export interface ConfigurarDivisionRequest {
  tipoDivision: TipoDivision;
  porcentajeUsuario1?: number;
  porcentajeUsuario2?: number;
}

export interface VincularParejaRequest {
  codigo: string;
}

export interface FiltrosGastoRequest {
  fechaDesde?: string;
  fechaHasta?: string;
  categorias?: CategoriaGasto[];
  carteraId?: string;
  tipoGasto?: string;
  montoMin?: number;
  montoMax?: number;
  busqueda?: string;
  page?: number;
  limit?: number;
}

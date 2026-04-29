import type { CategoriaGasto } from '../enums';

export interface FacturaProcesada {
  montoTotal: number;
  moneda: string;
  establecimiento: string;
  tipoEstablecimiento: string;
  fecha: string;
  hora?: string;
  items: FacturaItem[];
  subtotal?: number;
  impuestos?: number;
  propina?: number;
  metodoPago?: string;
  categoriaSugerida: CategoriaGasto;
  confianza: number;
  notasIA?: string;
  error?: string;
}

export interface FacturaItem {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
  categoriaItem?: string;
}

export interface GastoParseado {
  monto: number;
  moneda: string;
  establecimiento?: string;
  categoriaSugerida: CategoriaGasto;
  fecha: string;
  descripcion: string;
  confianza: number;
  necesitaClarificacion: boolean;
  preguntasClarificacion?: string[];
}

export interface CategoriaSugerida {
  categoria: CategoriaGasto;
  subcategoria?: string;
  confianza: number;
}

export interface Anomalia {
  tipo: 'gasto_inusual' | 'frecuencia_alta' | 'monto_alto';
  descripcion: string;
  gastoId?: string;
  monto?: number;
  promedioHistorico?: number;
}

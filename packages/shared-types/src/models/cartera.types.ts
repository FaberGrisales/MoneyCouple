import type { TipoCartera } from '../enums';

export interface Cartera {
  id: string;
  usuarioId: string;
  nombre: string;
  tipo: TipoCartera;
  saldoActual: number;
  saldoInicial: number;
  moneda: string;
  limiteCredito?: number;
  diaCorte?: number;
  diaPago?: number;
  icono: string;
  color: string;
  numeroEnmascarado?: string;
  activa: boolean;
  esCompartida: boolean;
  createdAt: Date;
  updatedAt: Date;
}

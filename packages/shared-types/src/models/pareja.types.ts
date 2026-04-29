import type { EstadoPareja, NivelTransparencia, TipoDivision } from '../enums';

export interface Pareja {
  id: string;
  estado: EstadoPareja;
  fechaVinculacion: Date;
  fechaDesvinculacion?: Date;
  tipoDivision: TipoDivision;
  porcentajeUsuario1?: number;
  porcentajeUsuario2?: number;
  presupuestoMensual?: number;
  nivelTransparencia: NivelTransparencia;
  codigoVinculacion?: string;
  codigoExpiracion?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Division {
  id: string;
  parejaId: string;
  mes: string;
  ingresoUsuario1: number;
  ingresoUsuario2: number;
  porcentajeUsuario1: number;
  porcentajeUsuario2: number;
  totalGastosCompartidos: number;
  usuario1DebePagar: number;
  usuario2DebePagar: number;
  usuario1YaPago: number;
  usuario2YaPago: number;
  balanceUsuario1: number;
  balanceUsuario2: number;
  deudorId?: string;
  acreedorId?: string;
  montoDebido?: number;
  saldado: boolean;
  createdAt: Date;
  updatedAt: Date;
}

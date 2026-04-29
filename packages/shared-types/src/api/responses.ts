import type { Cartera } from '../models/cartera.types';
import type { Gasto } from '../models/gasto.types';
import type { Meta } from '../models/meta.types';
import type { Division, Pareja } from '../models/pareja.types';
import type { UserPrivate, UserPublic } from '../models/user.types';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface AuthResponse {
  user: UserPrivate;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface DashboardPersonal {
  patrimonioNeto: number;
  moneda: string;
  cambioMensual: number;
  cambioPorcentaje: number;
  gastosMes: number;
  presupuestoMes?: number;
  categorias: Array<{
    categoria: string;
    monto: number;
    porcentaje: number;
    color: string;
  }>;
  topEstablecimientos: Array<{
    nombre: string;
    monto: number;
    visitas: number;
  }>;
  gastosPorDia: Array<{
    fecha: string;
    monto: number;
  }>;
  insights: Insight[];
}

export interface DashboardPareja {
  patrimonioConjunto: number;
  cambioMensual: number;
  divisionActual: Division;
  miGasto: number;
  suGasto: number;
  gastosCompartidos: Gasto[];
  insights: Insight[];
}

export interface Insight {
  tipo: 'patron' | 'alerta' | 'sugerencia' | 'logro';
  titulo: string;
  descripcion: string;
  impactoEconomico?: number;
  accionSugerida?: string;
  prioridad: 'alta' | 'media' | 'baja';
  categoriaRelacionada?: string;
}

export type { Cartera, Division, Gasto, Meta, Pareja, UserPrivate, UserPublic };

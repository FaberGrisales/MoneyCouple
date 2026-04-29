import type { TipoCuenta } from '../enums';

export interface UserPublic {
  id: string;
  nombre: string;
  apellido?: string;
  fotoPerfil?: string;
  tipoCuenta: TipoCuenta;
  esPremium: boolean;
  createdAt: Date;
}

export interface UserPrivate extends UserPublic {
  email: string;
  clerkId?: string;
  monedaDefault: string;
  idioma: string;
  modoOscuro: boolean;
  ingresoMensual?: number;
  monedaIngreso?: string;
  mostrarIngresoAPareja: boolean;
  emailVerificado: boolean;
  ultimoLogin?: Date;
  updatedAt: Date;
}

export interface ConfigPrivacidad {
  mostrarMontosAPareja: boolean;
  mostrarCategoriasAPareja: boolean;
  mostrarEstablecimientosAPareja: boolean;
  gastosPrivadosPorDefecto: boolean;
}

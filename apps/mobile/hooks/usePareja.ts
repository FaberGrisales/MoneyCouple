import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export interface ParejaUser {
  id: string;
  nombre: string;
  apellido?: string;
  fotoPerfil?: string;
}

export interface Pareja {
  id: string;
  usuarios: ParejaUser[];
  tipoDivision: string;
  fechaVinculacion: string;
  presupuestoMensual?: number;
}

export interface GastoCompartido {
  id: string;
  monto: number;
  descripcion?: string;
  categoria: string;
  fechaGasto: string;
  usuarioId: string;
  usuario?: { id: string; nombre: string };
}

export interface DivisionActual {
  mes: string;
  usuario1: { id: string; nombre: string; yaPago: number; debePagar: number; balance: number };
  usuario2: { id: string; nombre: string; yaPago: number; debePagar: number; balance: number };
  totalGastosCompartidos: number;
  tipoDivision: string;
  deudorId?: string;
  acreedorId?: string;
  montoDebido: number;
  saldado: boolean;
  gastos: GastoCompartido[];
}

export interface ParejaDashboard {
  pareja: {
    id: string;
    tipoDivision: string;
    fechaVinculacion: string;
    presupuestoMensual?: number;
  };
  usuarios: ParejaUser[];
  mes: string;
  totalGastosPersonalesU1: number;
  totalGastosPersonalesU2: number;
  totalGastosCompartidos: number;
  totalGeneral: number;
  porCategoria: { categoria: string; total: number; count: number }[];
  gastosRecientes: GastoCompartido[];
  division: {
    yaPago1: number;
    yaPago2: number;
    debePagar1: number;
    debePagar2: number;
    balance1: number;
    balance2: number;
    deudorId?: string;
    montoDebido: number;
  };
}

export function usePareja() {
  return useQuery<Pareja>({
    queryKey: ['pareja'],
    queryFn: async () => {
      const response = await api.get<Pareja>('/api/v1/parejas');
      return response.data;
    },
  });
}

export function useParejaGastos() {
  return useQuery<GastoCompartido[]>({
    queryKey: ['pareja-gastos'],
    queryFn: async () => {
      const response = await api.get<GastoCompartido[]>('/api/v1/parejas/gastos');
      return response.data;
    },
  });
}

export function useParejaDashboard() {
  return useQuery<ParejaDashboard>({
    queryKey: ['pareja-dashboard'],
    queryFn: async () => {
      const response = await api.get<ParejaDashboard>('/api/v1/parejas/dashboard');
      return response.data;
    },
  });
}

export function useDivisionActual() {
  return useQuery<DivisionActual>({
    queryKey: ['division-actual'],
    queryFn: async () => {
      const response = await api.get<DivisionActual>('/api/v1/divisiones/actual');
      return response.data;
    },
  });
}

export function useSaldarDivision() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { mes?: string }>({
    mutationFn: async (body: { mes?: string }) => {
      await api.post('/api/v1/divisiones/saldar', body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['division-actual'] });
      void queryClient.invalidateQueries({ queryKey: ['pareja-dashboard'] });
    },
  });
}

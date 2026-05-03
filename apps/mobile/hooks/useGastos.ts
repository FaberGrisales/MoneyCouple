import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

interface Gasto {
  id: string;
  usuarioId: string;
  monto: number;
  descripcion?: string;
  categoria: string;
  establecimiento?: string;
  fechaGasto: string;
  tipoGasto: string;
  esCompartido: boolean;
  carteraId?: string;
  notas?: string;
  etiquetas: string[];
  fuenteRegistro: string;
  createdAt: string;
  updatedAt: string;
}

interface GastosResponse {
  gastos: Gasto[];
  total: number;
  count: number;
}

interface CreateGastoInput {
  monto: number;
  descripcion?: string;
  categoria: string;
  establecimiento?: string;
  fechaGasto: string;
  tipoGasto?: string;
  carteraId?: string;
  esCompartido?: boolean;
  notas?: string;
  etiquetas?: string[];
}

interface DashboardData {
  mesActual: string;
  totalGastos: number;
  totalGastosPersonales: number;
  totalGastosCompartidos: number;
  porCategoria: { categoria: string; total: number; count: number }[];
  gastosRecientes: Gasto[];
  carteras: {
    id: string;
    nombre: string;
    tipo: string;
    saldoActual: number;
    icono: string;
    color: string;
  }[];
  metasActivas: {
    id: string;
    titulo: string;
    montoActual: number;
    montoObjetivo: number;
    tipo: string;
  }[];
}

export function useGastos(mes?: string) {
  return useQuery<GastosResponse>({
    queryKey: ['gastos', mes ?? 'current'],
    queryFn: async () => {
      const params = mes ? { mes } : {};
      const response = await api.get<GastosResponse>('/api/v1/gastos', { params });
      return response.data;
    },
  });
}

export function useCreateGasto() {
  const queryClient = useQueryClient();

  return useMutation<Gasto, Error, CreateGastoInput>({
    mutationFn: async (input: CreateGastoInput) => {
      const response = await api.post<Gasto>('/api/v1/gastos', input);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['gastos'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get<DashboardData>('/api/v1/dashboard');
      return response.data;
    },
  });
}

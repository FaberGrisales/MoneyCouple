import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export interface Cartera {
  id: string;
  nombre: string;
  tipo: string;
  saldoActual: number;
  icono: string;
  color: string;
  limiteCredito?: number;
  activa: boolean;
}

interface CarterasResponse {
  carteras: Cartera[];
}

interface CreateCarteraPayload {
  nombre: string;
  tipo: string;
  saldoActual: number;
  icono: string;
  color: string;
  limiteCredito?: number;
}

export function useCarteras() {
  return useQuery<CarterasResponse>({
    queryKey: ['carteras'],
    queryFn: async () => {
      const response = await api.get<CarterasResponse>('/api/v1/carteras');
      return response.data;
    },
  });
}

export function useCreateCartera() {
  const queryClient = useQueryClient();

  return useMutation<Cartera, Error, CreateCarteraPayload>({
    mutationFn: async (input: CreateCarteraPayload) => {
      const response = await api.post<Cartera>('/api/v1/carteras', input);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['carteras'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteCartera() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/carteras/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['carteras'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export interface UserProfile {
  id: string;
  email: string;
  nombre: string;
  ingresoMensual: number;
  tipoCuenta: string;
  emailVerificado: boolean;
  parejaId?: string;
}

interface UpdateProfilePayload {
  nombre?: string;
  email?: string;
}

interface UpdateIngresosPayload {
  ingresoMensual: number;
}

interface InvitarParejaResponse {
  codigo: string;
}

interface AceptarParejaPayload {
  codigo: string;
}

export function useProfile() {
  return useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get<UserProfile>('/api/v1/users/profile');
      return response.data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<UserProfile, Error, UpdateProfilePayload>({
    mutationFn: async (input: UpdateProfilePayload) => {
      const response = await api.put<UserProfile>('/api/v1/users/profile', input);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useUpdateIngresos() {
  const queryClient = useQueryClient();

  return useMutation<UserProfile, Error, UpdateIngresosPayload>({
    mutationFn: async (input: UpdateIngresosPayload) => {
      const response = await api.put<UserProfile>('/api/v1/users/ingresos', input);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useInvitarPareja() {
  return useMutation<InvitarParejaResponse, Error, void>({
    mutationFn: async () => {
      const response = await api.post<InvitarParejaResponse>('/api/v1/parejas/invitar');
      return response.data;
    },
  });
}

export function useAceptarPareja() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, AceptarParejaPayload>({
    mutationFn: async (input: AceptarParejaPayload) => {
      await api.post('/api/v1/parejas/aceptar', input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

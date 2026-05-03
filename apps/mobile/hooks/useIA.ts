import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export interface GastoParseado {
  monto: number;
  moneda: string;
  establecimiento?: string;
  categoriaSugerida?: string;
  fecha: string;
  descripcion: string;
  confianza: number;
  necesitaClarificacion: boolean;
  preguntasClarificacion?: string[];
}

export interface FacturaProcesada {
  montoTotal: number;
  moneda: string;
  establecimiento: string;
  tipoEstablecimiento: string;
  fecha: string;
  hora?: string;
  items: {
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    precioTotal: number;
    categoriaItem?: string;
  }[];
  subtotal?: number;
  impuestos?: number;
  propina?: number;
  metodoPago?: string;
  categoriaSugerida?: string;
  confianza: number;
  notasIA?: string;
}

interface GastoGuardado {
  id: string;
  monto: number;
  descripcion?: string;
  categoria: string;
  establecimiento?: string;
  fechaGasto: string;
  fuenteRegistro: string;
  usuarioId: string;
  createdAt: string;
  updatedAt: string;
}

interface ParsearTextoResponse {
  success: boolean;
  data: GastoParseado;
}

interface ProcesarFacturaResponse {
  success: boolean;
  data: FacturaProcesada;
}

interface TextoYGuardarResponse {
  success: boolean;
  gasto: GastoGuardado;
  parsed: GastoParseado;
}

interface FacturaYGuardarResponse {
  success: boolean;
  gasto: GastoGuardado;
  parsed: FacturaProcesada;
}

export function useParsearTexto() {
  return useMutation<GastoParseado, Error, { texto: string }>({
    mutationFn: async ({ texto }) => {
      const response = await api.post<ParsearTextoResponse>('/api/v1/ia/parsear-texto', { texto });
      return response.data.data;
    },
  });
}

export function useProcesarFactura() {
  return useMutation<FacturaProcesada, Error, { imagenBase64: string; mimeType?: string }>({
    mutationFn: async ({ imagenBase64, mimeType }) => {
      const response = await api.post<ProcesarFacturaResponse>('/api/v1/ia/procesar-factura', {
        imagenBase64,
        ...(mimeType != null && { mimeType }),
      });
      return response.data.data;
    },
  });
}

export function useProcesarTextoYGuardar() {
  const queryClient = useQueryClient();

  return useMutation<TextoYGuardarResponse, Error, { texto: string }>({
    mutationFn: async ({ texto }) => {
      const response = await api.post<TextoYGuardarResponse>(
        '/api/v1/ia/procesar-texto-y-guardar',
        { texto },
      );
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['gastos'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useProcesarFacturaYGuardar() {
  const queryClient = useQueryClient();

  return useMutation<FacturaYGuardarResponse, Error, { imagenBase64: string; mimeType?: string }>({
    mutationFn: async ({ imagenBase64, mimeType }) => {
      const response = await api.post<FacturaYGuardarResponse>(
        '/api/v1/ia/procesar-factura-y-guardar',
        {
          imagenBase64,
          ...(mimeType != null && { mimeType }),
        },
      );
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['gastos'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

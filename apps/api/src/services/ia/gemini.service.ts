import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  Anomalia,
  CategoriaSugerida,
  FacturaProcesada,
  GastoParseado,
} from '@moneycouple/shared-types';
import type { Insight } from '@moneycouple/shared-types';
import { err, ok, type Result } from '@moneycouple/shared-utils';

import { GEMINI_PROMPTS } from '../../utils/prompts/gemini-prompts';

export class GeminiService {
  private readonly model;

  constructor() {
    const apiKey = process.env['GEMINI_API_KEY'];
    if (!apiKey) throw new Error('GEMINI_API_KEY no configurada');
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async procesarFactura(
    imagenBase64: string,
    mimeType = 'image/jpeg',
  ): Promise<Result<FacturaProcesada>> {
    try {
      const result = await this.model.generateContent([
        {
          inlineData: { data: imagenBase64, mimeType },
        },
        GEMINI_PROMPTS.PROCESAR_FACTURA,
      ]);

      const text = result.response.text();
      const json = this.extractJSON(text);

      if (!json) return err(new Error('No se pudo extraer JSON de la respuesta'));
      if (json.error) return err(new Error(json.error as string));

      return ok(this.mapFactura(json));
    } catch (e) {
      return err(e instanceof Error ? e : new Error('Error procesando factura'));
    }
  }

  async parsearTextoGasto(texto: string): Promise<Result<GastoParseado>> {
    try {
      const result = await this.model.generateContent(GEMINI_PROMPTS.PARSEAR_TEXTO(texto));
      const text = result.response.text();
      const json = this.extractJSON(text);

      if (!json) return err(new Error('No se pudo parsear el texto'));

      return ok({
        monto: Number(json.monto) || 0,
        moneda: String(json.moneda || 'COP'),
        establecimiento: json.establecimiento ? String(json.establecimiento) : undefined,
        categoriaSugerida: json.categoria_sugerida,
        fecha: String(json.fecha || new Date().toISOString().split('T')[0]),
        descripcion: String(json.descripcion || texto),
        confianza: Number(json.confianza) || 0.5,
        necesitaClarificacion: Boolean(json.necesita_clarificacion),
        preguntasClarificacion: Array.isArray(json.preguntas_clarificacion)
          ? (json.preguntas_clarificacion as string[])
          : undefined,
      });
    } catch (e) {
      return err(e instanceof Error ? e : new Error('Error parseando texto'));
    }
  }

  async categorizarGasto(descripcion: string): Promise<Result<CategoriaSugerida>> {
    try {
      const result = await this.model.generateContent(
        GEMINI_PROMPTS.CATEGORIZAR_GASTO(descripcion),
      );
      const json = this.extractJSON(result.response.text());

      if (!json) return err(new Error('No se pudo categorizar'));

      return ok({
        categoria: json.categoria,
        subcategoria: json.subcategoria ?? undefined,
        confianza: Number(json.confianza) || 0.7,
      });
    } catch (e) {
      return err(e instanceof Error ? e : new Error('Error categorizando'));
    }
  }

  async generarInsights(gastosJson: string): Promise<Result<Insight[]>> {
    try {
      const result = await this.model.generateContent(GEMINI_PROMPTS.GENERAR_INSIGHTS(gastosJson));
      const json = this.extractJSON(result.response.text());

      if (!Array.isArray(json)) return err(new Error('Respuesta inválida'));

      return ok(
        (json as Record<string, unknown>[]).map((i) => ({
          tipo: i['tipo'] as Insight['tipo'],
          titulo: String(i['titulo']),
          descripcion: String(i['descripcion']),
          impactoEconomico:
            i['impacto_economico'] != null ? Number(i['impacto_economico']) : undefined,
          accionSugerida: i['accion_sugerida'] ? String(i['accion_sugerida']) : undefined,
          prioridad: (i['prioridad'] as Insight['prioridad']) || 'media',
          categoriaRelacionada: i['categoria_relacionada']
            ? String(i['categoria_relacionada'])
            : undefined,
        })),
      );
    } catch (e) {
      return err(e instanceof Error ? e : new Error('Error generando insights'));
    }
  }

  async detectarAnomalias(_gastosJson: string): Promise<Result<Anomalia[]>> {
    return ok([]);
  }

  private extractJSON(text: string): Record<string, unknown> | Record<string, unknown>[] | null {
    const match =
      text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (!match?.[1] && !match?.[0]) return null;

    try {
      return JSON.parse(match[1] ?? match[0] ?? '') as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private mapFactura(json: Record<string, unknown>): FacturaProcesada {
    return {
      montoTotal: Number(json['monto_total']) || 0,
      moneda: String(json['moneda'] || 'COP'),
      establecimiento: String(json['establecimiento'] || 'Desconocido'),
      tipoEstablecimiento: String(json['tipo_establecimiento'] || 'otro'),
      fecha: String(json['fecha'] || new Date().toISOString().split('T')[0]),
      hora: json['hora'] ? String(json['hora']) : undefined,
      items: Array.isArray(json['items'])
        ? (json['items'] as Record<string, unknown>[]).map((it) => ({
            nombre: String(it['nombre']),
            cantidad: Number(it['cantidad']) || 1,
            precioUnitario: Number(it['precio_unitario']) || 0,
            precioTotal: Number(it['precio_total']) || 0,
            categoriaItem: it['categoria_item'] ? String(it['categoria_item']) : undefined,
          }))
        : [],
      subtotal: json['subtotal'] != null ? Number(json['subtotal']) : undefined,
      impuestos: json['impuestos'] != null ? Number(json['impuestos']) : undefined,
      propina: json['propina'] != null ? Number(json['propina']) : undefined,
      metodoPago: json['metodo_pago'] ? String(json['metodo_pago']) : undefined,
      categoriaSugerida: json['categoria_sugerida'] as FacturaProcesada['categoriaSugerida'],
      confianza: Number(json['confianza']) || 0.5,
      notasIA: json['notas_ia'] ? String(json['notas_ia']) : undefined,
    };
  }
}

export const geminiService = new GeminiService();

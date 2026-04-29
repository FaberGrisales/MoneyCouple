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

type JSONObject = Record<string, unknown>;

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
        { inlineData: { data: imagenBase64, mimeType } },
        GEMINI_PROMPTS.PROCESAR_FACTURA,
      ]);

      const json = this.extractObject(result.response.text());
      if (!json) return err(new Error('No se pudo extraer JSON de la respuesta'));
      if (json['error']) return err(new Error(String(json['error'])));

      return ok(this.mapFactura(json));
    } catch (e) {
      return err(e instanceof Error ? e : new Error('Error procesando factura'));
    }
  }

  async parsearTextoGasto(texto: string): Promise<Result<GastoParseado>> {
    try {
      const result = await this.model.generateContent(GEMINI_PROMPTS.PARSEAR_TEXTO(texto));
      const json = this.extractObject(result.response.text());
      if (!json) return err(new Error('No se pudo parsear el texto'));

      const establecimiento = json['establecimiento'] ? String(json['establecimiento']) : undefined;
      const preguntasClarificacion = Array.isArray(json['preguntas_clarificacion'])
        ? (json['preguntas_clarificacion'] as string[])
        : undefined;

      return ok({
        monto: Number(json['monto']) || 0,
        moneda: String(json['moneda'] ?? 'COP'),
        ...(establecimiento != null && { establecimiento }),
        categoriaSugerida: json['categoria_sugerida'] as GastoParseado['categoriaSugerida'],
        fecha: String(json['fecha'] ?? new Date().toISOString().split('T')[0]),
        descripcion: String(json['descripcion'] ?? texto),
        confianza: Number(json['confianza']) || 0.5,
        necesitaClarificacion: Boolean(json['necesita_clarificacion']),
        ...(preguntasClarificacion != null && { preguntasClarificacion }),
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
      const json = this.extractObject(result.response.text());
      if (!json) return err(new Error('No se pudo categorizar'));

      const subcategoria = json['subcategoria'] ? String(json['subcategoria']) : undefined;

      return ok({
        categoria: json['categoria'] as CategoriaSugerida['categoria'],
        ...(subcategoria != null && { subcategoria }),
        confianza: Number(json['confianza']) || 0.7,
      });
    } catch (e) {
      return err(e instanceof Error ? e : new Error('Error categorizando'));
    }
  }

  async generarInsights(gastosJson: string): Promise<Result<Insight[]>> {
    try {
      const result = await this.model.generateContent(GEMINI_PROMPTS.GENERAR_INSIGHTS(gastosJson));
      const raw = this.extractJSON(result.response.text());
      if (!Array.isArray(raw)) return err(new Error('Respuesta inválida'));

      const insights: Insight[] = (raw as JSONObject[]).map((i) => {
        const impactoEconomico =
          i['impacto_economico'] != null ? Number(i['impacto_economico']) : undefined;
        const accionSugerida = i['accion_sugerida'] ? String(i['accion_sugerida']) : undefined;
        const categoriaRelacionada = i['categoria_relacionada']
          ? String(i['categoria_relacionada'])
          : undefined;

        return {
          tipo: i['tipo'] as Insight['tipo'],
          titulo: String(i['titulo']),
          descripcion: String(i['descripcion']),
          prioridad: (i['prioridad'] as Insight['prioridad']) ?? 'media',
          ...(impactoEconomico != null && { impactoEconomico }),
          ...(accionSugerida != null && { accionSugerida }),
          ...(categoriaRelacionada != null && { categoriaRelacionada }),
        };
      });

      return ok(insights);
    } catch (e) {
      return err(e instanceof Error ? e : new Error('Error generando insights'));
    }
  }

  async detectarAnomalias(_gastosJson: string): Promise<Result<Anomalia[]>> {
    return ok([]);
  }

  private extractJSON(text: string): JSONObject | JSONObject[] | null {
    const match =
      text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    const raw = match?.[1] ?? match?.[0];
    if (!raw) return null;
    try {
      return JSON.parse(raw) as JSONObject | JSONObject[];
    } catch {
      return null;
    }
  }

  private extractObject(text: string): JSONObject | null {
    const json = this.extractJSON(text);
    if (!json || Array.isArray(json)) return null;
    return json;
  }

  private mapFactura(json: JSONObject): FacturaProcesada {
    const hora = json['hora'] ? String(json['hora']) : undefined;
    const subtotal = json['subtotal'] != null ? Number(json['subtotal']) : undefined;
    const impuestos = json['impuestos'] != null ? Number(json['impuestos']) : undefined;
    const propina = json['propina'] != null ? Number(json['propina']) : undefined;
    const metodoPago = json['metodo_pago'] ? String(json['metodo_pago']) : undefined;
    const notasIA = json['notas_ia'] ? String(json['notas_ia']) : undefined;

    const items = Array.isArray(json['items'])
      ? (json['items'] as JSONObject[]).map((it) => {
          const categoriaItem = it['categoria_item'] ? String(it['categoria_item']) : undefined;
          return {
            nombre: String(it['nombre']),
            cantidad: Number(it['cantidad']) || 1,
            precioUnitario: Number(it['precio_unitario']) || 0,
            precioTotal: Number(it['precio_total']) || 0,
            ...(categoriaItem != null && { categoriaItem }),
          };
        })
      : [];

    return {
      montoTotal: Number(json['monto_total']) || 0,
      moneda: String(json['moneda'] ?? 'COP'),
      establecimiento: String(json['establecimiento'] ?? 'Desconocido'),
      tipoEstablecimiento: String(json['tipo_establecimiento'] ?? 'otro'),
      fecha: String(json['fecha'] ?? new Date().toISOString().split('T')[0]),
      categoriaSugerida: json['categoria_sugerida'] as FacturaProcesada['categoriaSugerida'],
      confianza: Number(json['confianza']) || 0.5,
      items,
      ...(hora != null && { hora }),
      ...(subtotal != null && { subtotal }),
      ...(impuestos != null && { impuestos }),
      ...(propina != null && { propina }),
      ...(metodoPago != null && { metodoPago }),
      ...(notasIA != null && { notasIA }),
    };
  }
}

export const geminiService = new GeminiService();

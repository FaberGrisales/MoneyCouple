export const GEMINI_PROMPTS = {
  PROCESAR_FACTURA: `Analiza esta factura colombiana y extrae los datos.

Devuelve SOLO un JSON válido con esta estructura exacta:
{
  "monto_total": número (sin símbolos),
  "moneda": "COP" | "USD",
  "establecimiento": string (nombre limpio),
  "tipo_establecimiento": "restaurante|cafe|supermercado|tienda|servicio|transporte|entretenimiento|otro",
  "fecha": "YYYY-MM-DD",
  "hora": "HH:mm" o null,
  "items": [
    {
      "nombre": string,
      "cantidad": número,
      "precio_unitario": número,
      "precio_total": número,
      "categoria_item": string
    }
  ],
  "subtotal": número o null,
  "impuestos": número o null,
  "propina": número o null,
  "metodo_pago": string o null,
  "categoria_sugerida": "COMIDA|TRANSPORTE|ENTRETENIMIENTO|SERVICIOS|COMPRAS|SALUD|EDUCACION|VIAJES|HOGAR|OTROS",
  "confianza": número entre 0 y 1,
  "notas_ia": string
}

Si no es una factura válida o no puedes extraer datos:
{ "error": "descripción del problema", "confianza": 0 }

Reglas:
- Para Colombia, montos en pesos sin decimales
- Si ves "Starbucks", "Juan Valdez" → COMIDA, subcategoría café
- IVA en Colombia es 19%
- Confianza alta si: monto claro, establecimiento legible, fecha visible
- Confianza baja si: foto borrosa, datos parciales`,

  PARSEAR_TEXTO: (texto: string) => `Analiza este texto y extrae datos de gasto.

Texto: "${texto}"

Devuelve JSON:
{
  "monto": número,
  "moneda": "COP",
  "establecimiento": string o null,
  "categoria_sugerida": "COMIDA|TRANSPORTE|ENTRETENIMIENTO|SERVICIOS|COMPRAS|SALUD|EDUCACION|VIAJES|HOGAR|OTROS",
  "fecha": "YYYY-MM-DD" (hoy si no especifica),
  "descripcion": string,
  "confianza": 0-1,
  "necesita_clarificacion": boolean,
  "preguntas_clarificacion": [string] o null
}

Convierte: "50 mil" → 50000, "veinte lucas" → 20000.
Contexto: Colombia, pesos colombianos COP.`,

  GENERAR_INSIGHTS: (
    gastosJson: string,
  ) => `Analiza estos gastos del usuario y genera 3-5 insights útiles.

Gastos: ${gastosJson}

Devuelve JSON array:
[
  {
    "tipo": "patron|alerta|sugerencia|logro",
    "titulo": "string corto",
    "descripcion": "string descriptiva",
    "impacto_economico": número o null,
    "accion_sugerida": string o null,
    "prioridad": "alta|media|baja",
    "categoria_relacionada": string o null
  }
]

Responde en español colombiano informal. Sé específico y accionable.`,

  CATEGORIZAR_GASTO: (descripcion: string) => `Categoriza este gasto: "${descripcion}"

Devuelve JSON:
{
  "categoria": "COMIDA|TRANSPORTE|ENTRETENIMIENTO|SERVICIOS|COMPRAS|SALUD|EDUCACION|VIAJES|HOGAR|MASCOTAS|REGALOS|IMPUESTOS|OTROS",
  "subcategoria": string o null,
  "confianza": 0-1
}`,
} as const;

import type { FastifyInstance } from 'fastify';

import { geminiService } from '../../services/ia/gemini.service';

export default async function iaRoutes(app: FastifyInstance) {
  app.post(
    '/procesar-factura',
    {
      schema: {
        tags: ['ia'],
        body: {
          type: 'object',
          required: ['imagenBase64'],
          properties: {
            imagenBase64: { type: 'string' },
            mimeType: { type: 'string' },
          },
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { imagenBase64, mimeType } = request.body as {
        imagenBase64: string;
        mimeType?: string;
      };
      const result = await geminiService.procesarFactura(imagenBase64, mimeType);
      if (!result.ok) {
        return reply.status(422).send({ success: false, error: result.error.message });
      }
      return reply.send({ success: true, data: result.value });
    },
  );

  app.post(
    '/parsear-texto',
    {
      schema: {
        tags: ['ia'],
        body: {
          type: 'object',
          required: ['texto'],
          properties: { texto: { type: 'string' } },
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { texto } = request.body as { texto: string };
      const result = await geminiService.parsearTextoGasto(texto);
      if (!result.ok) {
        return reply.status(422).send({ success: false, error: result.error.message });
      }
      return reply.send({ success: true, data: result.value });
    },
  );

  app.post(
    '/categorizar',
    {
      schema: {
        tags: ['ia'],
        body: {
          type: 'object',
          required: ['descripcion'],
          properties: { descripcion: { type: 'string' } },
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { descripcion } = request.body as { descripcion: string };
      const result = await geminiService.categorizarGasto(descripcion);
      if (!result.ok) {
        return reply.status(422).send({ success: false, error: result.error.message });
      }
      return reply.send({ success: true, data: result.value });
    },
  );

  app.post(
    '/procesar-texto-y-guardar',
    {
      schema: {
        tags: ['ia'],
        body: {
          type: 'object',
          required: ['texto'],
          properties: { texto: { type: 'string' } },
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { texto } = request.body as { texto: string };
      const result = await geminiService.parsearTextoGasto(texto);
      if (!result.ok) {
        return reply.status(422).send({ success: false, error: result.error.message });
      }

      const parsed = result.value;
      const establecimiento = parsed.establecimiento;

      const gasto = await app.prisma.gasto.create({
        data: {
          usuarioId: request.user.id,
          monto: parsed.monto,
          descripcion: parsed.descripcion,
          categoria: (parsed.categoriaSugerida ?? 'OTROS') as never,
          fechaGasto: parsed.fecha ? new Date(parsed.fecha) : new Date(),
          fuenteRegistro: 'CHAT' as never,
          ...(establecimiento != null && { establecimiento }),
        },
      });

      return reply.send({ success: true, gasto: { ...gasto, monto: Number(gasto.monto) }, parsed });
    },
  );

  app.post(
    '/procesar-factura-y-guardar',
    {
      schema: {
        tags: ['ia'],
        body: {
          type: 'object',
          required: ['imagenBase64'],
          properties: {
            imagenBase64: { type: 'string' },
            mimeType: { type: 'string' },
          },
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { imagenBase64, mimeType } = request.body as {
        imagenBase64: string;
        mimeType?: string;
      };
      const result = await geminiService.procesarFactura(imagenBase64, mimeType);
      if (!result.ok) {
        return reply.status(422).send({ success: false, error: result.error.message });
      }

      const parsed = result.value;
      const confianza = parsed.confianza;

      const gasto = await app.prisma.gasto.create({
        data: {
          usuarioId: request.user.id,
          monto: parsed.montoTotal,
          categoria: (parsed.categoriaSugerida ?? 'OTROS') as never,
          establecimiento: parsed.establecimiento,
          descripcion: parsed.notasIA ?? parsed.establecimiento,
          fechaGasto: parsed.fecha ? new Date(parsed.fecha) : new Date(),
          fuenteRegistro: 'FOTO_GEMMA' as never,
          ...(confianza != null && { confianzaIA: confianza }),
          necesitaConfirmacion: (confianza ?? 1) < 0.8,
        },
      });

      return reply.send({ success: true, gasto: { ...gasto, monto: Number(gasto.monto) }, parsed });
    },
  );
}

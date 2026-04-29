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
}

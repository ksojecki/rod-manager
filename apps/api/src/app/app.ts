import type { FastifyInstance } from 'fastify';
import { createServerPlatform } from '@rod-manager/server-platform';

export interface AppOptions {
  logLevel?: string;
}

/** Registers all server platform plugins and routes on the given Fastify instance. */
export function app(fastify: FastifyInstance, opts: AppOptions) {
  fastify.register(async (instance) => {
    await createServerPlatform(instance, opts);
  });
}

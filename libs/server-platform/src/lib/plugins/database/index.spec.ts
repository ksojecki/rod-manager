import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import databasePlugin from './index';

describe('database plugin', () => {
  afterEach(async () => {
    delete process.env.AUTH_INITIAL_USER_EMAIL;
    delete process.env.AUTH_INITIAL_USER_PASSWORD;
  });

  it('throws an actionable error when project config is missing', async () => {
    expect(() =>
      (
        databasePlugin as unknown as (
          fastify: FastifyInstance,
          opts: unknown,
        ) => void
      )({} as FastifyInstance, {}),
    ).toThrowError(
      'databasePlugin requires opts.project with database.path and database.seedInitialUser.',
    );
  });

  it('throws the same actionable error when options are undefined', async () => {
    expect(() =>
      (
        databasePlugin as unknown as (
          fastify: FastifyInstance,
          opts: unknown,
        ) => void
      )({} as FastifyInstance, undefined),
    ).toThrowError(
      'databasePlugin requires opts.project with database.path and database.seedInitialUser.',
    );
  });
});

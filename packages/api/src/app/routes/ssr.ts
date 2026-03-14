import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import fastifyMiddie from '@fastify/middie';
import fastifyStatic from '@fastify/static';
import type { FastifyInstance } from 'fastify';

type RenderFunction = (url: string) => Promise<string> | string;

interface RenderModule {
  render: RenderFunction;
}

function isApiRequest(url: string): boolean {
  return url === '/api' || url.startsWith('/api/');
}

async function renderPage(
  url: string,
  template: string,
  render: RenderFunction,
): Promise<string> {
  const appHtml = await render(url);
  return template.replace('<!--ssr-outlet-->', appHtml);
}

export default async function (fastify: FastifyInstance) {
  const webRoot = path.resolve(process.cwd(), 'packages/web');
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    const clientRoot = path.join(webRoot, 'dist/client');
    const serverEntryPath = path.join(webRoot, 'dist/server/entry-server.mjs');
    const templatePath = path.join(clientRoot, 'index.html');
    const template = await readFile(templatePath, 'utf-8');

    await fastify.register(fastifyStatic, {
      root: clientRoot,
      prefix: '/',
      wildcard: false,
    });

    const serverModule = (await import(
      pathToFileURL(serverEntryPath).href
    )) as RenderModule;

    fastify.get('/*', async (request, reply) => {
      const url = request.raw.url ?? '/';

      if (isApiRequest(url)) {
        reply.callNotFound();
        return;
      }

      try {
        const html = await renderPage(url, template, serverModule.render);
        await reply.type('text/html').send(html);
        return;
      } catch (error) {
        request.log.error(error);
        await reply.status(500).type('text/plain').send('SSR render failed');
        return;
      }
    });

    return;
  }

  await fastify.register(fastifyMiddie);

  const { createServer } = await import('vite');
  const vite = await createServer({
    root: webRoot,
    appType: 'custom',
    server: {
      middlewareMode: true,
    },
  });

  fastify.use(vite.middlewares);

  const templatePath = path.join(webRoot, 'index.html');

  fastify.addHook('onClose', async () => {
    await vite.close();
  });

  fastify.get('/*', async (request, reply) => {
    const url = request.raw.url ?? '/';

    if (isApiRequest(url)) {
      reply.callNotFound();
      return;
    }

    try {
      const template = await readFile(templatePath, 'utf-8');
      const transformedTemplate = await vite.transformIndexHtml(url, template);
      const serverModule = (await vite.ssrLoadModule(
        '/src/entry-server.tsx',
      )) as RenderModule;
      const html = await renderPage(
        url,
        transformedTemplate,
        serverModule.render,
      );

      await reply.type('text/html').send(html);
      return;
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      request.log.error(error);
      await reply.status(500).type('text/plain').send('SSR render failed');
      return;
    }
  });
}

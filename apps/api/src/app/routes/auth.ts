import { randomBytes, randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import type {
  AuthUser,
  LoginRequestBody,
  SessionResponse,
} from '@rod-manager/shared';

interface SessionRecord {
  user: AuthUser;
  expiresAt: number;
}

const SESSION_COOKIE_NAME = 'rod_manager_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const SESSION_TTL_MS = SESSION_TTL_SECONDS * 1000;

const demoUserCredentials = {
  email: process.env.AUTH_DEMO_EMAIL ?? 'demo@rod-manager.local',
  password: process.env.AUTH_DEMO_PASSWORD ?? 'demo1234',
};

const demoUser: AuthUser = {
  id: 'demo-user',
  email: demoUserCredentials.email,
  displayName: 'Demo User',
};

const sessionStore = new Map<string, SessionRecord>();

function createSessionToken(): string {
  return `${randomUUID()}-${randomBytes(16).toString('hex')}`;
}

function parseCookies(
  cookieHeader: string | undefined,
): Partial<Record<string, string>> {
  if (cookieHeader === undefined || cookieHeader.trim() === '') {
    return {};
  }

  return cookieHeader
    .split(';')
    .reduce<Partial<Record<string, string>>>((acc, cookie) => {
      const [rawName, ...rawValueParts] = cookie.trim().split('=');

      if (rawName.length === 0 || rawValueParts.length === 0) {
        return acc;
      }

      acc[rawName] = decodeURIComponent(rawValueParts.join('='));
      return acc;
    }, {});
}

function setSessionCookie(token: string, shouldExpireNow = false): string {
  const maxAge = shouldExpireNow ? 0 : SESSION_TTL_SECONDS;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const cookieValue = `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${String(maxAge)}${secure}`;

  return cookieValue;
}

function getSessionFromRequest(cookieHeader: string | undefined) {
  const cookies = parseCookies(cookieHeader);
  const token = cookies[SESSION_COOKIE_NAME];

  if (token === undefined) {
    return undefined;
  }

  const session = sessionStore.get(token);

  if (session === undefined || Date.now() > session.expiresAt) {
    sessionStore.delete(token);
    return undefined;
  }

  return { token, user: session.user };
}

export default function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: LoginRequestBody }>(
    '/api/auth/login',
    async (request, reply) => {
      const { email, password } = request.body;

      if (
        email !== demoUserCredentials.email ||
        password !== demoUserCredentials.password
      ) {
        await reply.status(401).send({ message: 'Invalid email or password.' });
        return;
      }

      const token = createSessionToken();

      sessionStore.set(token, {
        user: demoUser,
        expiresAt: Date.now() + SESSION_TTL_MS,
      });

      reply.header('set-cookie', setSessionCookie(token));
      const sessionResponse: SessionResponse = {
        authenticated: true,
        user: demoUser,
      };

      await reply.send(sessionResponse);
    },
  );

  fastify.get('/api/auth/session', async (request, reply) => {
    const session = getSessionFromRequest(request.headers.cookie);

    if (session === undefined) {
      await reply.status(401).send({ message: 'Not authenticated.' });
      return;
    }

    const sessionResponse: SessionResponse = {
      authenticated: true,
      user: session.user,
    };

    await reply.send(sessionResponse);
  });

  fastify.post('/api/auth/logout', async (request, reply) => {
    const session = getSessionFromRequest(request.headers.cookie);

    if (session !== undefined) {
      sessionStore.delete(session.token);
    }

    reply.header('set-cookie', setSessionCookie('', true));
    await reply.status(204).send();
  });
}

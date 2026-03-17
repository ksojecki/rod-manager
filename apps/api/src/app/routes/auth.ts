import { randomBytes, randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import type {
  AuthUser,
  LoginRequestBody,
  SessionResponse,
} from '@rod-manager/shared';

const SESSION_COOKIE_NAME = 'rod_manager_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const SESSION_TTL_MS = SESSION_TTL_SECONDS * 1000;

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

  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${String(maxAge)}${secure}`;
}

function getSessionTokenFromRequest(cookieHeader: string | undefined) {
  const cookies = parseCookies(cookieHeader);
  const token = cookies[SESSION_COOKIE_NAME];

  if (token === undefined) {
    return undefined;
  }

  return token;
}

export default function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: LoginRequestBody }>(
    '/api/auth/login',
    async (request, reply) => {
      const { email, password } = request.body;
      const user = fastify.authStore.findUserByEmail(email);

      if (
        user === undefined ||
        !fastify.authStore.verifyPassword(password, user.passwordHash)
      ) {
        await reply.status(401).send({ message: 'Invalid email or password.' });
        return;
      }

      const token = createSessionToken();

      fastify.authStore.createSession(
        token,
        user.id,
        Date.now() + SESSION_TTL_MS,
      );

      reply.header('set-cookie', setSessionCookie(token));
      const sessionResponse: SessionResponse = {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        },
      };

      await reply.send(sessionResponse);
    },
  );

  fastify.get('/api/auth/session', async (request, reply) => {
    fastify.authStore.deleteExpiredSessions(Date.now());
    const token = getSessionTokenFromRequest(request.headers.cookie);

    if (token === undefined) {
      await reply.status(401).send({ message: 'Not authenticated.' });
      return;
    }

    const session = fastify.authStore.findSession(token);

    if (session === undefined || Date.now() > session.expiresAt) {
      fastify.authStore.deleteSession(token);
      await reply.status(401).send({ message: 'Not authenticated.' });
      return;
    }

    const user: AuthUser = {
      id: session.userId,
      email: session.userEmail,
      displayName: session.userDisplayName,
    };

    const sessionResponse: SessionResponse = {
      authenticated: true,
      user,
    };

    await reply.send(sessionResponse);
  });

  fastify.post('/api/auth/logout', async (request, reply) => {
    const token = getSessionTokenFromRequest(request.headers.cookie);

    if (token !== undefined) {
      fastify.authStore.deleteSession(token);
    }

    reply.header('set-cookie', setSessionCookie('', true));
    await reply.status(204).send();
  });
}

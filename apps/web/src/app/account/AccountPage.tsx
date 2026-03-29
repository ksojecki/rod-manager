import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  OAuthProviderStatus,
  OAuthProviderType,
} from '@rod-manager/shared';
import { useAuth } from '../auth/AuthContext';
import {
  linkOAuthProvider,
  loadOAuthProviders,
  storeOAuthState,
  unlinkOAuthProvider,
} from '../auth/authApi';

const OAUTH_PROVIDER_LABELS: Record<OAuthProviderType, string> = {
  google: 'Google',
  apple: 'Apple',
  facebook: 'Facebook',
};

export const AccountPage = () => {
  const { t } = useTranslation('account');
  const { user } = useAuth();
  const [providers, setProviders] = useState<OAuthProviderStatus[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingProvider, setPendingProvider] =
    useState<OAuthProviderType | null>(null);

  const sortedProviders = useMemo(
    () =>
      [...providers].sort((left, right) =>
        OAUTH_PROVIDER_LABELS[left.provider].localeCompare(
          OAUTH_PROVIDER_LABELS[right.provider],
        ),
      ),
    [providers],
  );

  useEffect(() => {
    const loadProviders = async (): Promise<void> => {
      try {
        const response = await loadOAuthProviders();
        setProviders(response.providers);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
          return;
        }

        setErrorMessage('Failed to load OAuth providers.');
      }
    };

    void loadProviders();
  }, []);

  async function handleLinkProvider(
    provider: OAuthProviderType,
  ): Promise<void> {
    setErrorMessage(null);
    setSuccessMessage(null);
    setPendingProvider(provider);

    try {
      const { authorizationUrl, state, codeVerifier } =
        await linkOAuthProvider(provider);

      storeOAuthState(state, codeVerifier);
      window.location.href = authorizationUrl;
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Failed to start OAuth linking.');
      }
      setPendingProvider(null);
    }
  }

  async function handleUnlinkProvider(
    provider: OAuthProviderType,
  ): Promise<void> {
    setErrorMessage(null);
    setSuccessMessage(null);
    setPendingProvider(provider);

    try {
      await unlinkOAuthProvider(provider);
      const response = await loadOAuthProviders();
      setProviders(response.providers);
      setSuccessMessage(
        `${OAUTH_PROVIDER_LABELS[provider]} has been disconnected.`,
      );
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Failed to unlink OAuth provider.');
      }
    } finally {
      setPendingProvider(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1>{t('title')}</h1>
        <p>
          {t('welcome', { name: user?.displayName ?? t('fallbackUserName') })}
        </p>
        <p className="text-sm text-base-content/70">{user?.email ?? ''}</p>
        <p className="text-sm text-base-content/70">
          Role: {user?.role ?? 'user'}
        </p>
      </div>

      <div className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Connected OAuth providers</h2>
          <p className="text-sm text-base-content/70">
            Link an external provider to sign in to your existing account.
          </p>
        </div>

        {errorMessage !== null ? (
          <p className="mt-4 text-sm text-error">{errorMessage}</p>
        ) : null}

        {successMessage !== null ? (
          <p className="mt-4 text-sm text-success">{successMessage}</p>
        ) : null}

        <div className="mt-4 space-y-3">
          {sortedProviders.map((provider) => {
            const isPending = pendingProvider === provider.provider;

            return (
              <div
                className="flex items-center justify-between gap-4 rounded-box border border-base-300 px-4 py-3"
                key={provider.provider}
              >
                <div>
                  <p className="font-medium">
                    {OAUTH_PROVIDER_LABELS[provider.provider]}
                  </p>
                  <p className="text-sm text-base-content/70">
                    {provider.linked ? 'Connected' : 'Not connected'}
                  </p>
                </div>

                {provider.linked ? (
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={isPending}
                    onClick={() => {
                      void handleUnlinkProvider(provider.provider);
                    }}
                    type="button"
                  >
                    {isPending ? 'Disconnecting...' : 'Disconnect'}
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={isPending}
                    onClick={() => {
                      void handleLinkProvider(provider.provider);
                    }}
                    type="button"
                  >
                    {isPending ? 'Connecting...' : 'Connect'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

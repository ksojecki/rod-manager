import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { loadSession } from './authApi';

/**
 * OAuth callback handler page
 * Processes the OAuth callback and creates a session
 */
export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async (): Promise<void> => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const callbackError = searchParams.get('error');

      // Check for OAuth error
      if (callbackError) {
        setError(`OAuth error: ${callbackError}`);
        return;
      }

      // Validate parameters
      if (!code || !state) {
        setError('Missing OAuth callback parameters');
        return;
      }

      try {
        // Session should be created by backend callback
        // Load session to confirm authentication
        await loadSession();

        // Redirect to home
        await navigate('/', { replace: true });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to process OAuth callback',
        );
      }
    };

    void handleCallback();
  }, [searchParams, navigate]);

  if (error) {
    const handleBackToLogin = () => {
      void navigate('/login', { replace: true });
    };

    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Authentication Error</h1>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={handleBackToLogin} type="button">
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Processing OAuth callback...</h1>
      <p>Please wait while we complete your authentication.</p>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@sojecki/platform-web-platform';
import { frontendProductConfig } from '../productConfig';

export function LoginPanel() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      await navigate(frontendProductConfig.auth.postLoginRedirectTo, {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="flex max-w-md flex-col gap-3"
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
    >
      <label className="form-control">
        <span className="label-text">Email</span>
        <input
          className="input input-bordered"
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          value={email}
        />
      </label>

      <label className="form-control">
        <span className="label-text">Password</span>
        <input
          className="input input-bordered"
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          value={password}
        />
      </label>

      {errorMessage ? (
        <p className="text-sm text-error">{errorMessage}</p>
      ) : null}

      <button className="btn btn-primary" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}

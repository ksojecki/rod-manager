import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import {
  register as registerUser,
  useAuth,
} from '@sojecki/platform-web-platform';
import { frontendProductConfig } from '../productConfig';

export function RegisterPage() {
  const navigate = useNavigate();
  const { refreshSession, status } = useAuth();
  const { auth, registration } = frontendProductConfig;
  const [name, setName] = useState('Sample Portal');
  const [surname, setSurname] = useState('Admin');
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!registration.enabled) {
    return <Navigate replace to={registration.disabledRedirectTo} />;
  }

  if (status === 'authenticated') {
    return <Navigate replace to={auth.postRegistrationRedirectTo} />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await registerUser({
        email,
        name,
        password,
        surname,
      });
      await refreshSession();
      await navigate(auth.postRegistrationRedirectTo, { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Registration failed.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl rounded-box bg-base-100 p-6 shadow">
      <div className="mb-6 space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-base-content/60">
          Registration
        </p>
        <h1 className="text-3xl font-semibold">
          Create the first Sample Portal account
        </h1>
        <p className="text-base-content/75">
          This page is intentionally simple. Keep product-specific presentation
          local while reusing shared auth APIs and account routing contracts.
        </p>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <label className="form-control">
          <span className="label-text">Name</span>
          <input
            className="input input-bordered"
            onChange={(event) => setName(event.target.value)}
            type="text"
            value={name}
          />
        </label>

        <label className="form-control">
          <span className="label-text">Surname</span>
          <input
            className="input input-bordered"
            onChange={(event) => setSurname(event.target.value)}
            type="text"
            value={surname}
          />
        </label>

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

        <button
          className="btn btn-primary"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Creating account...' : 'Register'}
        </button>
      </form>
    </section>
  );
}

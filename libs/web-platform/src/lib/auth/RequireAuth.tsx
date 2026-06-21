import type { ReactElement, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import { useAuth } from './AuthProvider';

export interface RequireAuthProps {
  children: ReactElement;
  guestRedirectTo?: string;
  loadingFallback?: ReactNode;
}

export function RequireAuth({
  children,
  guestRedirectTo = '/',
  loadingFallback,
}: RequireAuthProps) {
  const { t } = useTranslation('auth');
  const { status } = useAuth();

  if (status === 'loading') {
    return loadingFallback ?? <p>{t('checkingSession')}</p>;
  }

  if (status === 'guest') {
    return <Navigate replace to={guestRedirectTo} />;
  }

  return children;
}

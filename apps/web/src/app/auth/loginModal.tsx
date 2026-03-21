import type { RefObject } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Modal, type ModalApi } from '@rod-manager/ui';
import { LoginForm } from './components/LoginForm';
import { OAuthLoginButtons } from './components/OAuthLoginButtons';

type LoginModalProps = {
  api: RefObject<ModalApi | null>;
};

/**
 * Modal dialog containing the login form and OAuth login buttons.
 */
export function LoginModal({ api }: LoginModalProps) {
  const { t } = useTranslation('auth');

  return (
    <Modal api={api}>
      <Modal.Title>{t('title')}</Modal.Title>
      <Modal.Content>
        <div className="flex flex-row gap-4">
          <div className="flex-1 h-fit">
            <OAuthLoginButtons />
          </div>
          <div className="flex-1">
            <LoginForm onSuccess={() => api.current?.close()} />
          </div>
        </div>
        <p className="mt-4 text-center text-sm">
          {t('noAccount')}{' '}
          <Link className="link link-primary" to="/register">
            {t('registerLink')}
          </Link>
        </p>
      </Modal.Content>
    </Modal>
  );
}

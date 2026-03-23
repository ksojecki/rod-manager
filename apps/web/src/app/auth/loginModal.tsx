import type { RefObject } from 'react';
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
          <div className="flex-1 flex gap-2 flex-col">
            <h3 className="text-l font-medium">Account with password</h3>
            <LoginForm onSuccess={() => api.current?.close()} />
          </div>

          <div className="divider divider-horizontal">{t('or')}</div>
          <div className="flex-1 h-fit flex gap-2 flex-col">
            <h3 className="text-l font-medium">External authenticators</h3>
            <OAuthLoginButtons />
          </div>
        </div>
      </Modal.Content>
      <Modal.Actions>
        <Modal.ActionButton to="/register">
          {t('noAccount')} {t('registerLink')}
        </Modal.ActionButton>
      </Modal.Actions>
    </Modal>
  );
}

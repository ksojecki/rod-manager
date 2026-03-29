import { useTranslation } from 'react-i18next';
import type { ModalWindowProps } from '@rod-manager/ui';
import { ModalWindow } from '@rod-manager/ui';
import { LoginForm } from './LoginForm';
import { OAuthLoginButtons } from './OAuthLoginButtons';

type LoginModalProps = Pick<ModalWindowProps, 'api'>;

/**
 * Modal dialog containing the login form and OAuth login buttons.
 */
export function LoginModal({ api }: LoginModalProps) {
  const { t } = useTranslation('auth');

  return (
    <ModalWindow api={api}>
      <ModalWindow.Title>{t('title')}</ModalWindow.Title>
      <ModalWindow.Content>
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
      </ModalWindow.Content>
      <ModalWindow.Actions>
        <ModalWindow.ActionButton to="/register">
          {t('noAccount')} {t('registerLink')}
        </ModalWindow.ActionButton>
      </ModalWindow.Actions>
    </ModalWindow>
  );
}

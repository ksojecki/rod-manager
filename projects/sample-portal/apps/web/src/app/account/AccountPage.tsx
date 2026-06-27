import { AccountShell, useAuth } from '@sojecki/platform-web-platform';
import { productAccountConfig } from './productAccountConfig';

export function AccountPage() {
  const { user } = useAuth();
  const sections = productAccountConfig.useSections();

  return (
    <AccountShell
      roleLabel="Role"
      sections={sections}
      title="Sample Portal account"
      user={user}
      welcomeMessage={`Welcome back, ${user?.displayName ?? user?.email ?? 'user'}.`}
    />
  );
}

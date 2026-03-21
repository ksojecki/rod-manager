import type { TranslationResources } from './pl';

const en: TranslationResources = {
  layout: {
    appName: 'Rod Manager',
    menuHome: 'Home',
    menuAccount: 'Account',
    menuLogin: 'Log in',
    menuLogout: 'Log out',
    languageLabel: 'Language',
    languageEnglish: 'EN',
    languagePolish: 'PL',
    footerText: 'Rod Manager',
  },
  home: {
    title: 'Home',
    description: 'Welcome to the community portal starter.',
    primaryAction: 'Create first post',
  },
  account: {
    title: 'Account',
    welcome: 'Welcome, {{name}}.',
    fallbackUserName: 'User',
  },
  auth: {
    title: 'Log in',
    hint: 'Use the demo credentials to sign in.',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    submit: 'Sign in',
    submitting: 'Signing in...',
    checkingSession: 'Checking session...',
    unexpectedError: 'Unexpected server error.',
    noAccount: "Don't have an account?",
    registerLink: 'Register',
    register: {
      title: 'Create account',
      nameLabel: 'First name',
      surnameLabel: 'Last name',
      emailLabel: 'Email',
      passwordLabel: 'Password (optional)',
      passwordHint:
        'Leave blank if you want to sign in with an OAuth provider.',
      submit: 'Create account',
      submitting: 'Creating account...',
      alreadyHaveAccount: 'Already have an account?',
      loginLink: 'Log in',
    },
  },
};

export default en;

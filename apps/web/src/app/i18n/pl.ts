const pl = {
  layout: {
    appName: 'Rod Manager',
    menuHome: 'Strona glowna',
    menuAccount: 'Konto',
    menuLogin: 'Zaloguj',
    menuLogout: 'Wyloguj',
    languageLabel: 'Jezyk',
    languageEnglish: 'EN',
    languagePolish: 'PL',
    footerText: 'Rod Manager',
  },
  home: {
    title: 'Strona glowna',
    description: 'Witaj w szkielecie portalu spolecznosci.',
    primaryAction: 'Utworz pierwszy wpis',
  },
  account: {
    title: 'Konto',
    welcome: 'Witaj, {{name}}.',
    fallbackUserName: 'Uzytkownik',
  },
  auth: {
    title: 'Logowanie',
    hint: 'Uzyj konta demo, aby sie zalogowac.',
    emailLabel: 'Email',
    passwordLabel: 'Haslo',
    submit: 'Zaloguj sie',
    submitting: 'Logowanie...',
    checkingSession: 'Sprawdzanie sesji...',
    unexpectedError: 'Nieoczekiwany blad serwera.',
  },
};

// eslint-disable-next-line no-restricted-syntax -- `typeof pl` needs the value declaration in place.
export type TranslationResources = typeof pl;

export default pl;

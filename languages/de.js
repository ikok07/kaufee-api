const deMessages = {
  business: {
    noBusinessWithThisId: 'Es wurde kein Unternehmen mit dieser ID gefunden.',
    noBusinessWithThisName: 'Es wurde kein Unternehmen mit diesem Namen gefunden.',
    noBusinessWithThisUserId: 'Es wurde kein Unternehmen mit dieser Benutzer-ID gefunden.',
    wrongEndpoint: 'Ungültiger Endpunkt! Bitte verwenden Sie /user/userId/business für diese Zwecke!',
  },
  product: {
    noProductWithThisId: 'Es wurde kein Produkt mit dieser ID gefunden.',
  },
  auth: {
    noEmailOrPassword: 'Bitte E-Mail und Passwort angeben!',
    incorrectPassword: 'Falsche E-Mail oder falsches Passwort',
    noPermission: 'Sie haben keine Berechtigung, diese Aktion durchzuführen!',
    notLoggedIn: 'Sie sind nicht eingeloggt! Bitte melden Sie sich an, um Zugang zu erhalten.',
    notExist: 'Der Benutzer, der zu diesem Token gehört, existiert nicht mehr.',
    recentlyChangedPassword: 'Der Benutzer hat kürzlich sein Passwort geändert! Bitte melden Sie sich erneut an.',
    noUserWithThisEmail: 'Es gibt keinen Benutzer mit dieser E-Mail-Adresse.',
    errorSendingEmail: 'Es ist ein Fehler beim Senden der E-Mail aufgetreten. Versuchen Sie es später noch einmal!',
    invalidToken: 'Token ist ungültig oder abgelaufen!',
    currentPasswordWrong: 'Ihr aktuelles Passwort ist falsch.',
  },
  factory: {
    noDocumentWithThisId: 'Es wurde kein Dokument mit dieser ID gefunden',
  },
  error: {
    invalidPath: err => `Ungültiger ${err.path}: ${err.value}.`,
    duplication: value => `Dieser ${value} ist bereits vergeben.`,
    invalidData: errors => `Ungültige Eingabedaten. ${errors.join('. ')}`,
    urlNotFound: url => `Wir können ${url} auf diesem Server nicht finden.`,
    invalidExpToken: 'Ungültiges Token. Bitte melden Sie sich erneut an!',
    genericMessage: 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später noch einmal!',
    sendEmail: 'Es ist ein Fehler beim Senden der E-Mail aufgetreten. Versuchen Sie es später noch einmal!',
    emailAlreadyConfirmed:
      'Es gibt einen Benutzer mit dieser E-Mail-Adresse, der die E-Mail bereits bestätigt hat oder es gibt keinen Benutzer mit dieser E-Mail Adresse.',
    notConfirmedEmail: 'Sie haben Ihre E-Mail-Adresse noch nicht bestätigt. Bitte bestätigen Sie sie, um dies zu tun!',
    noUserFoundWithThisIdForThisCoach: 'Kein Benutzer mit dieser ID für diesen Trainer gefunden.',
    invalidId: 'Ungültige ID.',
  },
  emailSubjects: {
    welcome: name => `Willkommen bei ${name}!`,
    passwordReset: 'Token zum Zurücksetzen des Passworts. Nur für 10 Minuten gültig!',
    emailConfirm: 'Bestätigen Sie Ihre E-Mail Adresse. Nur für 10 Minuten gültig!',
    twoFaLogin: 'Bestätigen Sie die Anmeldung. Nur für 10 Minuten gültig!',
    passwordChanged: 'Ihr Passwort wurde erfolgreich geändert!',
    loginDetected: 'Erfolgreiche Anmeldung in Ihrem Konto!',
    thanksForSubscription: 'Vielen Dank für das Abonnement!',
  },
  emailMessages: {
    passwordReset: 'Passwort zurücksetzen',
    emailConfirm: 'E-Mail bestätigen',
    twoFaLogin: 'Anmeldung',
  },
  emailAuthMessages: {
    emailVerification: 'E-Mail mit Token zum Bestätigen Ihrer E-Mail-Adresse gesendet!',
    twoFa: 'E-Mail mit Token zum Anmelden an Ihr Konto gesendet!',
    passwordReset: 'E-Mail mit Token zum Zurücksetzen Ihres Passworts gesendet!',
  },
  emailUrlAuthMessages: {
    emailVerification: 'E-Mail mit Link zum Bestätigen Ihrer E-Mail-Adresse gesendet!',
    twoFa: 'E-Mail mit Link zum Anmelden an Ihr Konto gesendet!',
    passwordReset: 'E-Mail mit Link zum Zurücksetzen Ihres Passworts gesendet!',
  },
};

module.exports = deMessages;

const bgMessages = {
  business: {
    noBusinessWithThisId: 'Не е намерен бизнес с този идентификатор.',
    noBusinessWithThisName: 'Не е намерен бизнес с това име.',
    noBusinessWithThisUserId: 'Не е намерен бизнес с този идентификатор на този потребител.',
    wrongEndpoint: 'Невалиден краен пункт! Моля използвайте /user/userId/business за тези цели!',
  },
  product: {
    noProductWithThisId: 'Не е намерен продукт с този идентификатор.',
  },
  auth: {
    noEmailOrPassword: 'Моля, посочете имейл и парола!',
    incorrectPassword: 'Неправилен имейл или парола!',
    noPermission: 'Нямате разрешение да извършите това действие!',
    notLoggedIn: 'Не сте влезли в системата! Моля, влезте, за да получите достъп.',
    notExist: 'Потребителят, принадлежащ към този токен, вече не съществува.',
    recentlyChangedPassword: 'Потребителят наскоро промени паролата си! Моля, влезте отново.',
    noUserWithThisEmail: 'Няма потребител с този имейл адрес.',
    errorSendingEmail: 'Имаше грешка при изпращането на имейла. Опитайте отново по-късно!',
    invalidToken: 'Невалиден или изтекъл токен. Моля, опитайте отново!',
    currentPasswordWrong: 'Текущата ви парола е грешна.',
  },
  factory: {
    noDocumentWithThisId: 'Не е намерен документ с този идентификатор.',
  },
  error: {
    invalidPath: err => `Невалиден ${err.path}: ${err.value}.`,
    duplication: value => `Този ${value} вече е зает.`,
    invalidData: errors => `Невалидни входни данни. ${errors.join('. ')}`,
    urlNotFound: url => `Не можем да намерим ${url}.`,
    invalidExpToken: 'Невалиден токен. Моля, влезте отново!',
    genericMessage: 'Нещо се обърка! Моля, опитайте отново по-късно.',
    sendEmail: 'Имаше грешка при изпращането на имейла. Опитайте отново по-късно!',
    emailAlreadyConfirmed:
      'Същестува потребител с този имейл адрес, който вече е потвърдил имейла си или не съществува потребител с този имейл адрес.',
    notConfirmedEmail: 'Все още не сте потвърдили имейл адреса си. Моля, потвърдете го, за да извършите това действие!',
    invalidId: 'Невалиден идентификатор.',
    noUserFoundWithThisIdForThisCoach: 'Не е намерен потребител с този идентификатор за този треньор.',
  },
  emailSubjects: {
    welcome: name => `Добре дошли в ${name}!`,
    passwordReset: 'Токен за възстановяване на паролата. Валиден само за 10 минути!',
    emailConfirm: 'Потвърждаване на имейл адрес. Валидно само за 10 минути!',
    twoFaLogin: 'Потвърждаване на влизане. Валидно само за 10 минути!',
    passwordChanged: 'Паролата ви беше променена успешно!',
    loginDetected: 'Успешен вход в профила ви!',
    thanksForSubscription: 'Благодарим ви за абонамента!',
  },
  emailMessages: {
    passwordReset: 'възстановяване на паролата',
    emailConfirm: 'потвърждаване на имейла',
    twoFaLogin: 'влизане в профила',
  },
  emailCodeAuthMessages: {
    emailVerification: 'Изпратен е имейл с код за потвърждение на вашия имейл адрес!',
    twoFa: 'Изпратен е имейл с код за влизане в профила ви!',
    passwordReset: 'Изпратен е имейл с код за възстановяване на паролата ви!',
  },
  emailUrlAuthMessages: {
    emailVerification: 'Изпратен е имейл с линк за потвърждение на вашия имейл адрес!',
    twoFa: 'Изпратен е имейл с линк за влизане в профила ви!',
    passwordReset: 'Изпратен е имейл с линк за възстановяване на паролата ви!',
  },
};

module.exports = bgMessages;

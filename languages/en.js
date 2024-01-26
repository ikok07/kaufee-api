const enMessages = {
  business: {
    noBusinessWithThisId: 'No business found with that ID.',
    noBusinessWithThisName: 'No business found with that name.',
    noBusinessWithThisUserId: 'No business found correspoding to that user.',
    wrongEndpoint: 'Invalid endpoint! Please use /user/userId/business for these purposes!',
  },
  product: {
    noProductWithThisId: 'No product found with that ID.',
  },
  auth: {
    noEmailOrPassword: 'Please provide email and password!',
    incorrectPassword: 'Incorrect email or password',
    noPermission: 'You do not have permission to perform this action!',
    notLoggedIn: 'You are not logged in! Please log in to get access.',
    notExist: 'The user belonging to this token does no longer exist.',
    recentlyChangedPassword: 'User recently changed password! Please log in again.',
    noUserWithThisEmail: 'There is no user with this email address.',
    errorSendingEmail: 'There was an error sending the email. Try again later!',
    invalidToken: 'Token is invalid or has expired!',
    currentPasswordWrong: 'Your current password is wrong.',
  },
  factory: {
    noDocumentWithThisId: 'No document found with that ID',
  },
  error: {
    invalidPath: err => `Invalid ${err.path}: ${err.value}.`,
    duplication: value => `This ${value} is already taken.`,
    invalidData: errors => `Invalid input data. ${errors.join('. ')}`,
    urlNotFound: url => `We can't find ${url} on this server.`,
    invalidExpToken: 'Invalid token. Please log in again!',
    genericMessage: 'Something went wrong. Please try again later!',
    sendEmail: 'There was an error sending the email. Try again later!',
    emailAlreadyConfirmed:
      'There is a user with this email address who has already confirmed the email or there is no user with this email address.',
    notConfirmedEmail: 'You have not confirmed your email address yet. Please confirm it in order to do this!',
    invalidId: 'Invalid id.',
    noUserFoundWithThisIdForThisCoach: 'No user found with this id for this coach.',
  },
  emailSubjects: {
    welcome: name => `Welcome to ${name}!`,
    passwordReset: 'Token for resetting password. Valid only for 10 minutes!',
    emailConfirm: 'Confirm your email address. Valid only for 10 minutes!',
    twoFaLogin: 'Confirm login. Valid only for 10 minutes!',
    passwordChanged: 'Your password has been successfully changed!',
    loginDetected: 'Successful login to your account!',
    thanksForSubscription: 'Thank you for the subscription!',
  },
  emailMessages: {
    passwordReset: 'password reset',
    emailConfirm: 'email confirmation',
    twoFaLogin: 'login confirmation',
  },
  emailCodeAuthMessages: {
    emailVerification: 'Sent email with token for confirming your email address!',
    twoFa: 'Sent email with token for logging in to your account!',
    passwordReset: 'Sent email with token for resetting your password!',
  },
  emailUrlAuthMessages: {
    emailVerification: 'Sent email with link for confirming your email address!',
    twoFa: 'Sent email with link for logging in to your account!',
    passwordReset: 'Sent email with link for resetting your password!',
  },
};

module.exports = enMessages;

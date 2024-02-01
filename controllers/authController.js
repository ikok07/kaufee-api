const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
const Email = require('../util/email');
const filterObj = require('../util/objects/filterObject');
const getMessages = require('../languages/getMessages');
const urlVerification = require('../util/verification/urlVerification');
const AuditLog = require('../models/auditLogModel');
const createAuditLogObject = require('../util/auditLog/createAuditLogObject');
const verifyAppleToken = require('verify-apple-id-token').default;
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');
const { default: axios } = require('axios');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = (verificationObj) =>
  catchAsync(async (req, res, next) => {
    const messages = getMessages(req.language);
    const body = filterObj(req.body, 'name', 'email', 'role', 'password', 'passwordConfirm');

    const existingUser = await User.findOne({ email: body.email, active: true });

    if (existingUser) {
      const auditLogObject = createAuditLogObject(req, existingUser.id, 'fail', { oldValue: null, newValue: null }, 'There is a user with this email address who is currently active.');

      await AuditLog.create(auditLogObject);

      return next(new AppError(messages.error.duplication('email'), 400, 'EmailAlreadyExists'));
    }

    const newUser = await User.create(body);

    const auditLogObject = createAuditLogObject(req, null, 'processing', { oldValue: null, newValue: newUser }, 'User successfully created. To be confirmed.');

    await AuditLog.create(auditLogObject);

    await verificationObj.createSendVerificationToken(newUser, messages, 'emailVerification', req, res, next);
  });

exports.authorizeOAuth2Apple = catchAsync(async (req, res, next) => {
  const messages = getMessages(req.language);
  const body = filterObj(req.body, 'name', 'email', 'nonce', 'identityToken', 'authorizationCode', 'deviceToken');

  const jwtClaims = await verifyAppleToken({
    idToken: body.identityToken || '',
    clientId: process.env.APPLE_CLIENT_ID,
    nonce: body.nonce || '',
  });

  if (!jwtClaims) return next(new AppError(messages.auth.invalidToken, 401, 'InvalidToken'));

  const clientSecret = await promisify(fs.readFile)('configuration/apple-client-secret-key', 'utf8');

  try {
    const { data: result } = await axios.post(
      process.env.APPLE_REQUEST_TOKEN_URL,
      {
        client_id: process.env.APPLE_CLIENT_ID,
        client_secret: clientSecret,
        code: body.authorizationCode,
        grant_type: 'authorization_code',
        redirect_uri: `https://${process.env.PRODUCTION_DOMAIN}`,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (!result.refresh_token) return next(new AppError(messages.auth.invalidToken, 401, 'InvalidToken'));

    let user = {};
    if (body.email) {
      const localUser = await User.findOne({ email: body.email, oauthProvider: 'local' });
      const googleUser = await User.findOne({ email: body.email, oauthProvider: 'google' });
      if (localUser || googleUser) {
        return next(new AppError(getMessages(req.language).auth.alreadyRegisteredAsDifferentType, 400, 'EmailAlreadyExists'));
      }

      const userAvailable = await User.findOne({ email: body.email });
      if (userAvailable) {
        user = await User.findOne({ oauthProviderUserId: jwtClaims.sub, email: jwtClaims.email });
        user.metadata.deviceTokens.push(body.deviceToken);
        await user.save();
        await new Email(user, req.language).sendLogInDetected(req.geolocation);
      } else
        user = await User.create({
          oauthProviderUserId: jwtClaims.sub,
          name: body.name,
          email: body.email,
          refreshToken: result.refresh_token,
          oauthProvider: 'apple',
          metadata: {
            deviceTokens: [body.deviceToken],
            emailVerified: true,
          },
        });
      await new Email(user, req.language).sendWelcome();
    } else {
      user = await User.findOne({ oauthProviderUserId: jwtClaims.sub, email: jwtClaims.email });
      if (user) {
        user.metadata.deviceTokens.push(body.deviceToken);
        await user.save();
        await new Email(user, req.language).sendLogInDetected(req.geolocation);
      } else {
        return next(new AppError(getMessages(req.language).auth.notExist, 400, 'EmailAlreadyExists'));
      }
    }

    createSendToken(user, 200, res);
  } catch (err) {
    let errorString = err;
    // if (err.response.data) {
    //   errorString = JSON.stringify(err.response.data);
    // }
    return next(new AppError(`${messages.auth.invalidToken} (${errorString})`, 401, 'InvalidToken'));
  }
});

exports.authorizeOAuth2Google = catchAsync(async (req, res, next) => {
  const body = filterObj(req.body, 'idToken');

  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken: body.idToken,
    audience: process.env.GOOGLE_AUDIENCE,
  });

  const payload = ticket.getPayload();
  let user = await User.findOne({ oauthProviderUserId: payload.sub, email: payload.email, oauthProvider: 'google' });

  if (await User.findOne({ email: payload.email, oauthProvider: 'local' })) {
    return next(new AppError(getMessages(req.language).auth.alreadyRegisteredAsDifferentType, 400, 'EmailAlreadyExists'));
  } else if (user) {
    user.metadata.deviceTokens.push(body.deviceToken);
    await user.save();
  } else if (!user) {
    user = await User.create({
      oauthProviderUserId: payload.sub,
      name: payload.name,
      email: payload.email,
      photo: payload.picture,
      oauthProvider: 'google',
      metadata: {
        deviceTokens: [body.deviceToken],
        emailVerified: true,
      },
    });
  }

  createSendToken(user, 200, res);
});

exports.emailConfirm = (verificationObj) =>
  catchAsync(async (req, res, next) => {
    const messages = getMessages(req.language);
    const user = await User.findOne({
      email: req.body.email,
      'metadata.emailVerified': false,
      active: true,
    });

    if (!user) return next(new AppError(messages.auth.noUserWithThisEmail, 401, 'UserNotFound'));

    const validated = await verificationObj.validateUserToken(user, req.body.token || req.params.token, 'emailVerification');

    if (!validated) {
      const auditLogObject = createAuditLogObject(
        req,
        user.id,
        'fail',
        {
          oldValue: {
            emailVerified: false,
          },
          newValue: {
            emailVerified: false,
          },
        },
        `This token is invalid or has expired. Token: ${req.body.token || req.params.token}`
      );

      await AuditLog.create(auditLogObject);

      return next(new AppError(messages.auth.invalidToken, 401, 'InvalidToken'));
    }

    const auditLogObject = createAuditLogObject(
      req,
      user.id,
      'success',
      {
        oldValue: {
          emailVerified: false,
        },
        newValue: {
          emailVerified: true,
        },
      },
      'User successfully verified and logged in!'
    );

    await AuditLog.create(auditLogObject);

    user.metadata.emailVerified = true;

    await user.save({ validateBeforeSave: false });

    await new Email(user, req.language).sendWelcome();
    createSendToken(user, 200, res);
  });

exports.resendEmailConfirmationToken = (verificationObj) =>
  catchAsync(async (req, res, next) => {
    const messages = getMessages(req.language);
    const user = await User.findOne({
      email: req.body.email,
      'metadata.emailVerified': false,
      active: true,
    });

    if (!user) return next(new AppError(messages.error.emailAlreadyConfirmed, 401, 'EmailAlreadyConfirmed'));

    await verificationObj.createSendVerificationToken(user, messages, 'emailVerification', req, res, next);
  });

exports.login = (verificationObj) =>
  catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const messages = getMessages(req.language);

    if (!email || !password) return next(new AppError(messages.auth.noEmailOrPassword, 400, 'NoEmailOrPassword'));

    const user = await User.findOne({ email, active: true }).select('+password');

    if (!user) return next(new AppError(messages.auth.noUserWithThisEmail, 401, 'UserNotFound'));

    if (!user || !(await user.correctPassword(password, user.password))) {
      const auditLogObject = createAuditLogObject(
        req,
        user.id,
        'fail',
        {
          oldValue: null,
          newValue: null,
        },
        'Someone is trying to access this account. Incorrect password attempt detected!'
      );

      await AuditLog.create(auditLogObject);

      return next(new AppError(messages.auth.incorrectPassword, 401, 'IncorrectCredentials'));
    }

    if (!user.metadata?.emailVerified) {
      const auditLogObject = createAuditLogObject(
        req,
        user.id,
        'fail',
        {
          oldValue: null,
          newValue: null,
        },
        'The user has been successfully authenticated, but the email belonging to this user has not been verified.'
      );

      await AuditLog.create(auditLogObject);

      return next(new AppError(messages.error.notConfirmedEmail, 401, 'EmailNotVerified'));
    }

    await verificationObj.createSendVerificationToken(user, messages, 'twoFa', req, res, next);
  });

exports.twoFaConfirm = (verificationObj) =>
  catchAsync(async (req, res, next) => {
    const messages = getMessages(req.language);
    const user = await User.findOne({
      email: req.body.email,
      'metadata.emailVerified': true,
      active: true,
    });

    if (!user) return next(new AppError(messages.auth.noUserWithThisEmail, 401, 'UserNotFound'));

    const validated = await verificationObj.validateUserToken(user, req.body.token || req.params.token, 'twoFa');

    if (!validated) {
      const auditLogObject = createAuditLogObject(
        req,
        user.id,
        'fail',
        {
          oldValue: {
            twoFaVerified: false,
          },
          newValue: {
            twoFaVerified: false,
          },
        },
        `This token is invalid or has expired. Token: ${req.body.token || req.params.token}`
      );

      await AuditLog.create(auditLogObject);

      return next(new AppError(messages.auth.invalidToken, 401, 'InvalidToken'));
    }

    const auditLogObject = createAuditLogObject(
      req,
      user.id,
      'success',
      {
        oldValue: {
          twoFaVerified: false,
        },
        newValue: {
          twoFaVerified: true,
        },
      },
      'Login verified!'
    );

    await AuditLog.create(auditLogObject);

    await new Email(user, req.language).sendLogInDetected(req.geolocation);
    createSendToken(user, 200, res);
  });

exports.logout = (req, res) => {
  const body = filterObj(req.body, 'deviceToken');

  req.user.metadata.deviceTokens = req.user.metadata.deviceTokens.filter((token) => token !== body.deviceToken);
  req.user.save({ validateBeforeSave: false });

  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.restrictTo =
  (...roles) =>
  async (req, res, next) => {
    const messages = getMessages(req.language);

    if (!roles.includes(req.user.role)) {
      const auditLogObject = createAuditLogObject(
        req,
        req.user.id,
        'fail',
        {
          oldValue: null,
          newValue: null,
        },
        'This user is trying to access an unauthorised route.'
      );

      await AuditLog.create(auditLogObject);

      return next(new AppError(messages.auth.noPermission, 403, 'NoPermission'));
    }

    next();
  };

exports.protect = catchAsync(async (req, res, next) => {
  const messages = getMessages(req.language);

  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) token = req.headers.authorization.split(' ')[1];
  else if (req.cookies?.jwt) token = req.cookies.jwt;

  if (!token) return next(new AppError(messages.auth.notLoggedIn, 401, 'NotLoggedIn'));

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) return next(new AppError(messages.auth.notExist, 401, 'UserNotFound'));

  if (currentUser.changedPasswordAfter(decoded.iat)) return next(new AppError(messages.auth.recentlyChangedPassword, 401, 'RecentlyChangedPassword'));

  req.user = currentUser;
  next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const messages = getMessages(req.language);

  const user = await User.findOne({ email, active: true }).select('+password');

  if (!user) return next(new AppError(messages.auth.noUserWithThisEmail, 401, 'UserNotFound'));

  if (!user.metadata?.emailVerified) {
    const auditLogObject = createAuditLogObject(
      req,
      user.id,
      'fail',
      {
        oldValue: null,
        newValue: null,
      },
      'The user has been successfully authenticated, but the email belonging to this user has not been verified.'
    );

    await AuditLog.create(auditLogObject);

    return next(new AppError(messages.error.notConfirmedEmail, 401, 'EmailNotVerified'));
  }

  await urlVerification.createSendVerificationToken(user, messages, 'passwordReset', req, res, next);
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const body = filterObj(req.body, 'email', 'password', 'passwordConfirm');

  const messages = getMessages(req.language);
  const user = await User.findOne({
    email: body.email,
    'metadata.emailVerified': true,
    active: true,
  });

  if (!user) return next(new AppError(messages.auth.noUserWithThisEmail, 401, 'UserNotFound'));

  const validated = await urlVerification.validateUserToken(user, req.params.token, 'passwordReset');

  if (!validated) {
    const auditLogObject = createAuditLogObject(
      req,
      user.id,
      'fail',
      {
        oldValue: {
          twoFaVerified: false,
        },
        newValue: {
          twoFaVerified: false,
        },
      },
      `This token is invalid or has expired. Token: ${req.body.token || req.params.token}`
    );

    await AuditLog.create(auditLogObject);

    return next(new AppError(messages.auth.invalidToken, 401, 'InvalidToken'));
  }

  user.password = body.password;
  user.passwordConfirm = body.passwordConfirm;
  await user.save();

  const auditLogObject = createAuditLogObject(
    req,
    user.id,
    'success',
    {
      oldValue: null,
      newValue: null,
    },
    'Password changed successfully! Password not displayed in old/new value for security reasons.'
  );

  await AuditLog.create(auditLogObject);

  await new Email(user, req.language).sendPasswordChanged(req.geolocation);
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const messages = getMessages(req.language);

  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    const auditLogObject = createAuditLogObject(
      req,
      user.id,
      'fail',
      {
        oldValue: null,
        newValue: null,
      },
      'Someone is trying to change password. Incorrect password attempt detected!'
    );

    await AuditLog.create(auditLogObject);

    return next(new AppError(messages.auth.currentPasswordWrong, 401, 'IncorrectCredentials'));
  }

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();

  const auditLogObject = createAuditLogObject(
    req,
    user.id,
    'success',
    {
      oldValue: null,
      newValue: null,
    },
    'Password changed successfully! Password not displayed in old/new value for security reasons.'
  );

  await AuditLog.create(auditLogObject);

  await new Email(user, req.language).sendPasswordChanged(req.geolocation);
  createSendToken(user, 200, res);
});

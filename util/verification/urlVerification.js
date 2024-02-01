const crypto = require('crypto');
const Token = require('../../models/tokenModel');
const Email = require('../email');
const AppError = require('../appError');
const AuditLog = require('../../models/auditLogModel');
const createAuditLogObject = require('../auditLog/createAuditLogObject');

exports.createSendVerificationToken = async function (user, messages, tokenType, req, res, next) {
  const firstLetterCapitalizedTokenType = tokenType[0].toUpperCase() + tokenType.slice(1);

  const existingToken = await Token.findOne({
    userId: user._id,
    'metadata.type': tokenType,
  });

  if (existingToken)
    await Token.deleteOne({
      _id: existingToken._id,
      userId: user._id,
      'metadata.type': tokenType,
    });

  const token = await Token.create({
    userId: user._id,
    metadata: {
      type: tokenType,
    },
  });

  const code = await token.generateHashedToken();
  token.save();

  let urlMiddle = 'welcome';
  if (tokenType === 'emailVerification') urlMiddle = 'email/confirm';
  else if (tokenType === 'passwordReset') urlMiddle = 'password/reset';
  else if (tokenType === 'twoFa') urlMiddle = 'login/confirm';

  try {
    const url = `${process.env.NODE_ENV === 'development' ? `http://localhost:${process.env.PORT}` : `https://${process.env.DOMAIN}`}/${req.language}/${urlMiddle}/${code}`;
    await new Email(user, req.language, url, code)[`send${firstLetterCapitalizedTokenType}Url`]();

    const auditLogObject = createAuditLogObject(
      req,
      user.id,
      'processing',
      {
        oldValue: null,
        newValue: {
          tokenType,
          token,
        },
      },
      `${firstLetterCapitalizedTokenType} token successfully sent to email.`
    );

    await AuditLog.create(auditLogObject);

    res.status(200).json({
      status: 'success',
      message: messages.emailUrlAuthMessages[tokenType],
    });
  } catch (err) {
    console.log(err);

    await Token.deleteOne({
      _id: token._id,
      userId: user._id,
      metadata: {
        type: tokenType,
      },
    });

    return next(new AppError(messages.error.sendEmail), 500);
  }
};

exports.validateUserToken = async function (user, candidateToken, tokenType) {
  const hashedToken = crypto.createHash('sha256').update(candidateToken).digest('hex');

  const token = await Token.findOne({
    userId: user._id,
    token: hashedToken,
    tokenExpires: {
      $gt: new Date(),
    },
    'metadata.type': tokenType,
  });

  if (!token) return false;

  await Token.deleteOne({
    _id: token._id,
    userId: user._id,
    'metadata.type': tokenType,
  });

  return true;
};

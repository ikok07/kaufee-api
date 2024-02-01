const User = require('../models/userModel');
const catchAsync = require('../util/catchAsync');
const factory = require('../util/handlerFactory');
const imageProcess = require('../util/assetProcess/imageProcess');
const getOutputDirectory = require('../util/getOutputDirectory');
const AuditLog = require('../models/auditLogModel');
const createAuditLogObject = require('../util/auditLog/createAuditLogObject');
const AppError = require('../util/appError');
const getMessages = require('../languages/getMessages');
const axios = require('axios');
const { promisify } = require('util');
const fs = require('fs');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  const { absolutePath } = await imageProcess(req.file.buffer, getOutputDirectory(process.env.NODE_ENV, 'img', 'profile-images'), `user-${req.user.id}-${Date.now()}.jpeg`);

  req.file.absolutePath = `https://${process.env.DOMAIN}${absolutePath}`;
  next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'name');
  if (req.file) filteredBody.photo = req.file.absolutePath;

  const oldUser = { ...req.user };

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  const auditLogObject = createAuditLogObject(req, req.user.id, 'success', { oldValue: oldUser, newValue: updatedUser }, 'Update user.');

  await AuditLog.create(auditLogObject);

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const clientSecret = await promisify(fs.readFile)('configuration/apple-client-secret-key', 'utf8');

  if (user.oauthProvider === 'apple') {
    try {
      await axios.post(
        process.env.APPLE_REVOKE_TOKEN_URL,
        {
          client_id: process.env.APPLE_CLIENT_ID,
          client_secret: clientSecret,
          token: user.refreshToken,
          token_type_hint: 'refresh_token',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
    } catch (err) {
      console.log(err);
      return next(new AppError(getMessages(req.language).error.genericMessage, 500));
    }
  }

  await user.deleteOne({ _id: req.user.id });

  res.status(200).json({
    status: 'success',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.getAuditLog = factory.getAll(AuditLog);

exports.getUser = factory.getOne(User);

exports.getAllUsers = factory.getAll(User);

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

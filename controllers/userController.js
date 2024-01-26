const User = require('../models/userModel');
const catchAsync = require('../util/catchAsync');
const factory = require('../util/handlerFactory');
const imageProcess = require('../util/assetProcess/imageProcess');
const getOutputDirectory = require('../util/getOutputDirectory');
const AuditLog = require('../models/auditLogModel');
const createAuditLogObject = require('../util/auditLog/createAuditLogObject');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  const { absolutePath } = await imageProcess(
    req.file.buffer,
    getOutputDirectory(process.env.NODE_ENV, 'img', 'profile-images'),
    `user-${req.user.id}-${Date.now()}.jpeg`
  );

  req.file.absolutePath = absolutePath;
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
  const auditLogObject = createAuditLogObject(req, req.user.id, 'success', { oldValue: req.user.id, newValue: null }, 'Deactivate user.');

  await User.findByIdAndUpdate(req.user.id, { active: false });

  await AuditLog.create(auditLogObject);

  res.status(204).json({
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

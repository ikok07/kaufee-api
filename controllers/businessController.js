const BusinessModel = require('../models/businessModel');
const catchAsync = require('../util/catchAsync');
const getMessages = require('../languages/getMessages');
const AppError = require('../util/appError');
const filterObj = require('../util/objects/filterObject');
const AuditLog = require('../models/auditLogModel');
const createAuditLogObject = require('../util/auditLog/createAuditLogObject');
const isValidObjectId = require('../util/mongoose/isValidObjectId');
const BasicFeatures = require('../util/features/basicFeatures');
const imageResize = require('../util/imageResize/imageResize');

exports.getAllBusinesses = catchAsync(async (req, res, next) => {
  const features = new BasicFeatures(BusinessModel.find(req.params.userId && isValidObjectId(req.params.userId) ? { userId: req.params.userId } : {}), req.query).filter().sort().limitFields().paginate();

  const businesses = await features.query;
  await Promise.all(
    businesses.map(async (business) => {
      await business.populate('products');
    })
  );

  res.status(200).json({
    status: 'success',
    results: businesses.length,
    data: {
      businesses,
    },
  });
});

exports.getBusiness = catchAsync(async (req, res, next) => {
  const messages = getMessages(req.language);
  if (!isValidObjectId(req.params.businessId)) return next(new AppError(messages.error.invalidId, 400, 'InvalidId'));

  const business = await BusinessModel.findOne({ _id: req.params.businessId });

  if (!business) return next(new AppError(messages.business.noBusinessWithThisId, 404, 'NoDocumentWithThisId'));

  await business.populate('products');

  res.status(200).json({
    status: 'success',
    data: {
      business,
    },
  });
});

exports.createBusiness = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'name', 'description');

  const business = await BusinessModel.create({ userId: req.user.id, ...filteredBody });
  await business.populate('products');

  if (req.file) {
    const photoPath = await imageResize(business._id, req.file.buffer, 'business');
    business.photo = `https://${process.env.DOMAIN}${photoPath}`;
    await business.save();
  }

  const auditLogObject = createAuditLogObject(
    req,
    req.user.id,
    'success',
    {
      oldValue: null,
      newValue: business,
    },
    'This user is creating new business.'
  );

  await AuditLog.create(auditLogObject);

  res.status(201).json({
    status: 'success',
    data: {
      business,
    },
  });
});

exports.updateBusiness = catchAsync(async (req, res, next) => {
  const messages = getMessages(req.language);
  if (!isValidObjectId(req.params.businessId)) return next(new AppError(messages.error.invalidId, 400, 'InvalidId'));

  const filteredBody = filterObj(req.body, 'name', 'description');

  const business = await BusinessModel.findOne({ userId: req.user.id, _id: req.params.businessId });

  if (!business) return next(new AppError(messages.factory.noDocumentWithThisId, 404, 'NoDocumentWithThisId'));

  const newBusiness = await BusinessModel.findByIdAndUpdate(business._id, filteredBody, {
    new: true,
    runValidators: true,
  });
  await newBusiness.populate('products');

  if (req.file) {
    const photoPath = await imageResize(newBusiness._id, req.file.buffer, 'business');
    business.photo = `https://${process.env.DOMAIN}${photoPath}`;
    await business.save();
  }

  const auditLogObject = createAuditLogObject(
    req,
    req.user.id,
    'success',
    {
      oldValue: null,
      newValue: newBusiness,
    },
    'This user is updating his business.'
  );

  await AuditLog.create(auditLogObject);

  res.status(201).json({
    status: 'success',
    data: {
      business: newBusiness,
    },
  });
});

exports.deleteBusiness = catchAsync(async (req, res, next) => {
  const messages = getMessages(req.language);
  if (!isValidObjectId(req.params.businessId)) return next(new AppError(messages.error.invalidId, 400, 'InvalidId'));

  const business = await BusinessModel.findOne({ userId: req.user.id, _id: req.params.businessId });

  if (!business) return next(new AppError(messages.business.noBusinessWithThisUserId, 404, 'NoDocumentWithThisIdForThisUser'));
  const businessMemoryClone = { ...business };

  await business.deleteOne();

  const auditLogObject = createAuditLogObject(
    req,
    req.user.id,
    'success',
    {
      oldValue: businessMemoryClone,
      newValue: null,
    },
    'This user is deleting his business.'
  );

  await AuditLog.create(auditLogObject);

  res.status(200).json({
    status: 'success',
    data: null,
  });
});

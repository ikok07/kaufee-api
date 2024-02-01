const Business = require('../models/businessModel');
const Product = require('../models/productModel');
const catchAsync = require('../util/catchAsync');
const isValidObjectId = require('../util/mongoose/isValidObjectId');
const filterObj = require('../util/objects/filterObject');
const AppError = require('../util/appError');
const getMessages = require('../languages/getMessages');
const imageResize = require('../util/imageResize/imageResize');

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const messages = getMessages(req.language);

  if (!isValidObjectId(req.params.businessId)) return next(new AppError(messages.error.invalidId, 400, 'InvalidId'));

  const business = await Business.findOne({ _id: req.params.businessId });

  if (!business) return next(new AppError(messages.business.noBusinessWithThisId, 404, 'NoDocumentWithThisId'));

  const products = await Product.find({ businessId: business._id });

  res.status(200).json({
    status: 'success',
    data: {
      products,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const messages = getMessages(req.language);

  if (!isValidObjectId(req.params.businessId) || !isValidObjectId(req.params.id)) return next(new AppError(messages.error.invalidId, 400, 'InvalidId'));

  const business = await Business.findOne({ _id: req.params.businessId });

  if (!business) return next(new AppError(messages.business.noBusinessWithThisId, 404, 'NoDocumentWithThisId'));

  const product = await Product.findOne({ businessId: business._id, _id: req.params.id });

  if (!product) return next(new AppError(messages.product.noProductWithThisId, 404, 'NoDocumentWithThisId'));

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const messages = getMessages(req.language);

  if (!isValidObjectId(req.params.userId) || !isValidObjectId(req.params.businessId)) return next(new AppError(messages.error.invalidId, 400, 'InvalidId'));

  const business = await Business.findOne({ userId: req.user.id, _id: req.params.businessId });

  if (!business) return next(new AppError(messages.business.noBusinessWithThisUserId, 404, 'NoDocumentWithThisIdForThisUser'));

  const filteredBody = filterObj(req.body, 'name', 'description', 'price', 'currency');

  const product = await Product.create({ businessId: business._id, ...filteredBody });

  if (req.file) {
    const photoPath = await imageResize(product._id, req.file.buffer, 'product');
    product.photo = `https://${process.env.DOMAIN}${photoPath}`;
    await product.save();
  }

  const updatedBusiness = await Business.findOneAndUpdate({ userId: req.user.id, _id: req.params.businessId }, { $push: { products: product._id } }, { new: true });

  res.status(201).json({
    status: 'success',
    data: {
      product,
      business: updatedBusiness,
    },
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const messages = getMessages(req.language);

  if (!isValidObjectId(req.params.userId) || !isValidObjectId(req.params.businessId) || !isValidObjectId(req.params.id)) return next(new AppError(messages.error.invalidId, 400, 'InvalidId'));

  const business = await Business.findOne({ userId: req.user.id, _id: req.params.businessId });

  if (!business) return next(new AppError(messages.business.noBusinessWithThisUserId, 404, 'NoDocumentWithThisIdForThisUser'));

  const product = await Product.findOneAndUpdate({ businessId: business._id, _id: req.params.id }, { ...req.body }, { new: true, runValidators: true });

  if (!product) return next(new AppError(messages.product.noProductWithThisId, 404, 'NoDocumentWithThisId'));

  if (req.file) {
    const photoPath = await imageResize(product._id, req.file.buffer, 'product');
    product.photo = `https://${process.env.DOMAIN}${photoPath}`;
    await product.save();
  }

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const messages = getMessages(req.language);

  if (!isValidObjectId(req.params.userId) || !isValidObjectId(req.params.businessId) || !isValidObjectId(req.params.id)) return next(new AppError(messages.error.invalidId, 400, 'InvalidId'));

  const business = await Business.findOne({ userId: req.user.id, _id: req.params.businessId });

  if (!business) return next(new AppError(messages.business.noBusinessWithThisUserId, 404, 'NoDocumentWithThisIdForThisUser'));

  const product = await Product.findOneAndDelete({ businessId: business._id, _id: req.params.id });

  if (!product) return next(new AppError(messages.product.noProductWithThisId, 404, 'NoDocumentWithThisId'));

  await Business.findOneAndUpdate({ userId: req.user.id, _id: req.params.businessId }, { $pull: { products: product._id } }, { new: true });

  res.status(200).json({
    status: 'success',
    data: null,
  });
});

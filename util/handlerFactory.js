const catchAsync = require('./catchAsync');
const AppError = require('./appError');
const BasicFeatures = require('./features/basicFeatures');
const getMessages = require('../languages/getMessages');

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    let filter = {};

    const features = new BasicFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate();
    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: doc,
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    const messages = getMessages(req.language);

    if (!doc) return next(new AppError(messages.factory.noDocumentWithThisId, 404));

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    const messages = getMessages(req.language);

    if (!doc) return next(new AppError(messages.factory.noDocumentWithThisId, 404));

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    const messages = getMessages(req.language);

    if (!doc) return next(new AppError(messages.factory.noDocumentWithThisId, 404));

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

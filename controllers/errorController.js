const AppError = require('../util/appError');
const getMessages = require('../languages/getMessages');

const handleCastErrorDB = (err, messages) => {
  const message = messages.error.invalidPath(err);
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err, messages) => {
  const message = messages.error.duplication(Object.keys(err.keyValue)[0]);
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err, messages) => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = messages.error.invalidData(errors);

  return new AppError(message, 400);
};

const handleJWTError = messages => new AppError(messages.error.invalidExpToken, 401);
const handleJWTExpiredError = messages => new AppError(messages.error.invalidExpToken, 401);

const sendErrorDev = (err, req, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res, messages) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.identifier && { identifier: err.identifier }),
    });
  }

  console.error('ERROR 💥', err);

  return res.status(500).json({
    status: 'fail',
    message: messages.error.genericMessage,
  });
};

module.exports = (err, req, res, next) => {
  const messages = getMessages(req.language);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';

  console.log(err);

  if (process.env.NODE_ENV === 'development') sendErrorDev(err, req, res);
  else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error, messages);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error, messages);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error, messages);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(messages);
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError(messages);

    sendErrorProd(error, req, res, messages);
  }
};

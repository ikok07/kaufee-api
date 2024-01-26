const AppError = require('../util/appError');

module.exports = async function (req, res, next) {
  const language = req.originalUrl.split('/')[1];
  const languages = ['bg', 'en', 'de'];
  if (!languages.includes(language))
    return next(new AppError('Sorry, we do not currently support this language. Please try another.', 400));
  req.language = language;
  next();
};

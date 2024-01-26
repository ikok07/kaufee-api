const I18n = require('../models/i18nModel');

const initI18n = async (req, res, next) => {
  const i18n = await I18n.findOne({ abbreviation: req.language });
  req.i18n = i18n;
  next();
};

module.exports = initI18n;

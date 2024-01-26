const mongoose = require('mongoose');

const i18n = new mongoose.Schema(
  {
    abbreviation: {
      type: String,
      required: [true, 'Please provide an abbreviation for the language.'],
    },
    name: {
      type: String,
      required: [true, 'Please provide a name for the language.'],
    },
  },
  {
    collection: 'i18n',
    versionKey: false,
  }
);

const I18n = mongoose.model('I18n', i18n);

module.exports = I18n;

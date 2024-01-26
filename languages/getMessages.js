const messages = require('./messages');

module.exports = function getMessagesByLanguage(language) {
  return messages[language];
};

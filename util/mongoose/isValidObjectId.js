const mongoose = require('mongoose');

const isValidObjectId = function (id) {
  return mongoose.Types.ObjectId.isValid(id);
};

module.exports = isValidObjectId;

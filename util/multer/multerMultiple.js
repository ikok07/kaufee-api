const multer = require('multer');
const getMessages = require('../../languages/getMessages');
const multerStorage = multer.memoryStorage();
const AppError = require('../appError');

const multerFilter = (req, file, cb) => {
  const messages = getMessages(req.language);
  if (file.mimetype.startsWith('image') || file.mimetype.startsWith('video')) cb(null, true);
  else cb(new AppError(messages.multer.notAnImageOrVideo, 400), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

module.exports = upload.array('asset');

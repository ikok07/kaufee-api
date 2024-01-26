const multer = require('multer');
const getMessages = require('../../languages/getMessages');
const multerStorage = multer.memoryStorage();
const AppError = require('../appError');

const multerFilter = (req, file, cb) => {
  const messages = getMessages(req.language);
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError(messages.multer.notAnImage, 400), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

module.exports = upload.single('photo');

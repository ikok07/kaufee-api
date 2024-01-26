const multer = require('multer');
const getMessages = require('../../languages/getMessages');
const multerStorage = multer.memoryStorage();
const AppError = require('../appError');

const multerFilter = (req, file, cb) => {
  const messages = getMessages(req.language);
  if (file.originalname.match(/\.(mp4|avi|mkv)$/)) cb(null, true);
  else cb(new AppError(messages.multer.notAVideo), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

module.exports = upload.single('files');

const mongoose = require('mongoose');
const catchAsync = require('./catchAsync');

exports.connectDB = catchAsync(async function () {
  await mongoose.connect(process.env.DB);
  console.log('DB connection successful!');
});

exports.runServer = function (app, port) {
  app.listen(port, () => console.log(`App running on port ${port}...`));
};

exports.defaultRoute = (req, res, next) => {
  res.redirect(`${process.env.APP_NAME}://${req.originalUrl.split('/').slice(2).join('/')}`);
};

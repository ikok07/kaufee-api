const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const compression = require('compression');
const morgan = require('morgan');

const AppError = require('./util/appError');
const identifyLanguage = require('./languages/identifyLanguage');
const initGeolocationObject = require('./util/geolocation/initGeolocationObject');
const globalErrorHandler = require('./controllers/errorController');

const userRouterV1 = require('./routes/userRoutes');
const userRouterV2 = require('./routes/userRoutesV2');
const businessRouter = require('./routes/businessRoutes');
const paymentRouter = require('./routes/paymentRoutes');
const defaultIndexRouter = require('./routes/defaultIndexRoutes');

const getMessages = require('./languages/getMessages');

const app = express();

app.use(helmet());
app.use(morgan('tiny'));

app.use(initGeolocationObject);
app.use(identifyLanguage);

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(mongoSanitize());

app.use(
  hpp({
    whitelist: [],
  })
);

app.use(compression());

app.use('/:lang/api/v1/user', userRouterV1);
app.use('/:lang/api/v2/user', userRouterV2);
app.use('/:lang/api/v1/business', businessRouter);
app.use('/:lang/api/v1/payments', paymentRouter);
app.use('/:lang', defaultIndexRouter);

app.all('*', (req, res, next) => next(new AppError(getMessages(req.language).error.urlNotFound(req.originalUrl), 404)));

app.use(globalErrorHandler);

module.exports = app;

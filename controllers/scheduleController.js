const { promisify } = require('util');
const fs = require('fs');
const catchAsync = require('../util/catchAsync');
const jwt = require('jsonwebtoken');

exports.refreshWeeklyAppleClientSecret = catchAsync(async (req, res, next) => {
  const appleClientKeyPath = 'configuration/apple-client-secret-key';
  const secretAppleKey = await promisify(fs.readFile)('configuration/kaufee-apple-services-key.p8', 'utf8');

  const result = jwt.sign(
    {
      iss: '6VFD2922M6',
      iat: Date.now() / 1000,
      exp: Date.now() / 1000 + 3600 * 24 * 8,
      aud: 'https://appleid.apple.com',
      sub: process.env.APPLE_CLIENT_ID,
    },
    secretAppleKey,
    {
      algorithm: 'ES256',
      header: {
        alg: 'ES256',
        kid: process.env.APPLE_KEY_ID,
        typ: undefined,
      },
    }
  );

  await promisify(fs.writeFile)(appleClientKeyPath, result, 'utf8');
});

const createAuditLogObject = function (req, userId, state, changes = {}, message = null) {
  const perpetratorId = req?.user?.role === 'admin' ? req.user.id : userId;

  if (process.env.NODE_ENV === 'development') req.geolocation = { development: true, ip: 'not tracked' };

  return {
    perpetratorId,
    userId,
    endpoint: {
      url: req.originalUrl,
      method: req.method,
    },
    geolocation: req.geolocation || { testingInProduction: true, ip: 'not tracked' },
    changes,
    state,
    metadata: {
      message,
    },
  };
};

module.exports = createAuditLogObject;

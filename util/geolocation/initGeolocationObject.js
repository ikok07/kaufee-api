const geolocation = require('./geolocation');

const initGeolocationObject = async (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.remoteAddress;

  if (!ip) {
    req.geolocation = null;
    return next();
  }

  try {
    const geolocationObj = await geolocation.findGeolocationData(ip);
    const formattedGeolocation = geolocation.formatGeolocationData(geolocationObj);

    req.geolocation = formattedGeolocation;
  } catch (err) {
    console.log(`Error with IP address: ${err.message}`);

    req.geolocation = null;
  }

  next();
};

module.exports = initGeolocationObject;

const path = require('path');
const catchAsync = require('../catchAsync');
const Reader = require('@maxmind/geoip2-node').Reader;

exports.findGeolocationData = catchAsync(async ip => {
  const pathDatabase = path.join(__dirname, 'GeoLite2-City.mmdb');

  const reader = await Reader.open(pathDatabase);

  const response = reader.city(ip);

  return response;
});

exports.formatGeolocationData = geolocationObj => {
  const { city, continent, country, location, postal, registered_country, subdivisions, traits } = geolocationObj;

  const formattedGeolocation = {
    city: city?.names?.en,
    continent: continent?.names?.en,
    country: country?.names?.en,
    location: {
      accuracyRadius: location?.accuracyRadius,
      latitude: location?.latitude,
      longitude: location?.longitude,
      timeZone: location?.timeZone,
    },
    postal: postal?.code,
    registered_country: registered_country?.names?.en,
    subdivisions: subdivisions?.[0]?.names?.en,
    traits: {
      autonomousSystemNumber: traits?.autonomousSystemNumber,
      autonomousSystemOrganization: traits?.autonomousSystemOrganization,
      domain: traits?.domain,
      ipAddress: traits?.ipAddress,
      isAnonymous: traits?.isAnonymous,
      isAnonymousProxy: traits?.isAnonymousProxy,
      isAnonymousVpn: traits?.isAnonymousVpn,
      isHostingProvider: traits?.isHostingProvider,
      isLegitimateProxy: traits?.isLegitimateProxy,
      isPublicProxy: traits?.isPublicProxy,
      isResidentialProxy: traits?.isResidentialProxy,
      isSatelliteProvider: traits?.isSatelliteProvider,
      isTorExitNode: traits?.isTorExitNode,
      isp: traits?.isp,
      network: traits?.network,
      organization: traits?.organization,
      staticIpScore: traits?.staticIpScore,
      userCount: traits?.userCount,
    },
  };

  return formattedGeolocation;
};

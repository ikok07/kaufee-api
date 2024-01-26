const getOutputDirectory = function (environment, assetType, mediaType) {
  const firstPart = environment === 'production' ? '../../../../websites/wellsavor' : '../../public';
  return `${firstPart}/${assetType}/${mediaType}/`;
};

module.exports = getOutputDirectory;

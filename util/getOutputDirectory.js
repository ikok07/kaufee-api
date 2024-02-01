const getOutputDirectory = function (environment, assetType, mediaType) {
  const firstPart = environment === 'production' ? '../../assets' : '../../public';
  return `${firstPart}/${assetType}/${mediaType}/`;
};

module.exports = getOutputDirectory;

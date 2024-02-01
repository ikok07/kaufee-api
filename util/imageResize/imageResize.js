const imageProcess = require('../assetProcess/imageProcess');
const getOutputDirectory = require('../getOutputDirectory');

const imageResize = async function (id, buffer, namePrefix) {
  if (!buffer || !id) return;

  const { absolutePath } = await imageProcess(buffer, getOutputDirectory(process.env.NODE_ENV, 'img', `${namePrefix}-images`), `${namePrefix}-${id}-${Date.now()}.jpeg`);

  return absolutePath;
};

module.exports = imageResize;

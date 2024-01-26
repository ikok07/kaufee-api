const path = require('path');
const sharp = require('sharp');

const imageProcess = async function (buffer, outputDirectory, outputName) {
  const outputPath = path.join(__dirname, outputDirectory, outputName);

  return {
    relativePath: outputPath,
    absolutePath: `/${outputPath.split('/').slice(-3).join('/')}`,
    name: outputName,
    ...(await sharp(buffer).resize(500, 500).toFormat(process.env.DEFAULT_PHOTO_EXTENSION).jpeg({ quality: 90 }).toFile(outputPath)),
  };
};

module.exports = imageProcess;

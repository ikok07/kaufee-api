const path = require('path');
const fs = require('fs');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const videoProcess = function (buffer, outputDirectory, outputName) {
  const inputPath = path.join(__dirname, outputDirectory, `${outputName}-temp`);
  const outputPath = path.join(__dirname, outputDirectory, outputName);

  fs.writeFileSync(inputPath, buffer);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .videoBitrate('1024k')
      .audioBitrate('128k')
      .size('720x?')
      .outputOptions('-movflags frag_keyframe+empty_moov')
      .on('error', function (err) {
        console.log('An error occurred: ' + err.message);
        reject(err);
      })
      .on('end', function () {
        fs.unlinkSync(inputPath);
        resolve({
          relativePath: outputPath,
          absolutePath: `/${outputPath.split('/').slice(-3).join('/')}`,
          name: outputName,
          format: process.env.DEFAULT_VIDEO_EXTENSION,
          width: 720,
          height: 1280,
        });
      })
      .save(outputPath);
  });
};

module.exports = videoProcess;

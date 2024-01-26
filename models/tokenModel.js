const crypto = require('crypto');
const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
    },
    tokenExpires: {
      type: Date,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    metadata: {
      creation: {
        type: Date,
        default: new Date(),
      },
      type: {
        type: String,
        enum: ['emailVerification', 'twoFa', 'passwordReset'],
        required: true,
      },
    },
  },
  {
    collection: 'tokens',
    versionKey: false,
  }
);

tokenSchema.methods.generateHashedToken = async function () {
  const token = crypto.randomBytes(32).toString('hex');

  this.token = crypto.createHash('sha256').update(token).digest('hex');
  this.tokenExpires = Date.now() + 600 * 1000;

  return token;
};

tokenSchema.methods.generateDigitToken = async function () {
  const randomNumber = crypto.randomInt(100000, 999999);

  this.token = randomNumber;
  this.tokenExpires = Date.now() + 600 * 1000;

  return randomNumber;
};

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;

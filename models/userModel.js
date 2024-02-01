const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    oauthProviderUserId: {
      type: String,
      required: function () {
        return this.oauthProvider !== 'local';
      },
    },
    name: {
      type: String,
      required: [true, 'Please tell us your name!'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email.'],
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email.'],
      unique: true,
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      type: String,
      enum: ['customer', 'business'],
      default: 'customer',
    },
    password: {
      type: String,
      required: function () {
        return this.oauthProvider === 'local';
      },
      select: false,
      validate: [
        {
          validator: function (el) {
            return el.length >= 8;
          },
          message: 'Password must be at least 8 characters long!',
        },
        {
          validator: function (el) {
            return el.match(/\d+/g);
          },
          message: 'Password must contain at least one number!',
        },
        {
          validator: function (el) {
            return el.match(/[a-z]/g);
          },
          message: 'Password must contain at least one lowercase letter!',
        },
        {
          validator: function (el) {
            return el.match(/[A-Z]/g);
          },
          message: 'Password must contain at least one uppercase letter!',
        },
        {
          validator: function (el) {
            return el.match(/[^a-zA-Z\d]/g);
          },
          message: 'Password must contain at least one special character!',
        },
      ],
    },
    passwordConfirm: {
      type: String,
      required: function () {
        return this.oauthProvider === 'local';
      },
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords are not the same!',
      },
    },
    refreshToken: {
      type: String,
      required: function () {
        return this.oauthProvider === 'apple';
      },
    },
    oauthProvider: {
      type: String,
      enum: ['google', 'apple', 'local'],
      default: 'local',
      required: true,
    },
    metadata: {
      creation: {
        type: Date,
        default: new Date(),
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      emailVerified: {
        type: Boolean,
        default: false,
      },
      deviceTokens: {
        type: [String],
        default: [],
      },
      passwordChangedAt: Date,
    },
  },
  {
    collection: 'users',
    versionKey: false,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.metadata.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.metadata.passwordChangedAt) {
    const changedTimestamp = parseInt(this.metadata.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

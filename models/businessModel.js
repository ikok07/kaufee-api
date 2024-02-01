const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    name: {
      type: String,
      required: [true, 'A business must have a name!'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'A business must have a description!'],
      trim: true,
    },
    products: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
      },
    ],
    metadata: {
      creation: {
        type: Number,
        default: Date.now(),
      },
    },
  },
  {
    collection: 'businesses',
    versionKey: false,
  }
);

const Business = mongoose.model('Business', businessSchema);

module.exports = Business;

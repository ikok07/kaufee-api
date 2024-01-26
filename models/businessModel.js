const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
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
        type: Date,
        default: new Date(),
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

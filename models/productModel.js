const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Business',
      required: [true, 'A product must belong to a business!'],
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    name: {
      type: String,
      required: [true, 'A product must have a name!'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'A product must have a description!'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'A product must have a price!'],
    },
    currency: {
      type: String,
      enum: ['eur', 'usd', 'bgn'],
      default: 'eur',
    },
    metadata: {
      creation: {
        type: Number,
        default: Date.now(),
      },
    },
  },
  {
    collection: 'products',
    versionKey: false,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

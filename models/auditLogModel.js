const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    perpetratorId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: false,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: false,
    },
    endpoint: {
      url: {
        type: String,
        required: true,
      },
      method: {
        type: String,
        required: true,
      },
    },
    geolocation: {
      type: Object,
      required: true,
    },
    changes: {
      oldValue: {
        type: Object,
      },
      newValue: {
        type: Object,
      },
    },
    state: {
      type: String,
      enum: ['fail', 'processing', 'success'],
      default: 'processing',
      required: true,
    },
    metadata: {
      message: {
        type: String,
      },
      date: {
        type: Date,
        default: new Date(),
      },
    },
  },
  {
    collection: 'audit-log',
    versionKey: false,
  }
);

const AuditLog = mongoose.model('Audit-Log', auditLogSchema);

module.exports = AuditLog;

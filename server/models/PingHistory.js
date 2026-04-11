import mongoose from 'mongoose';

const pingHistorySchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['UP', 'DOWN'],
    required: true,
  },
  responseTime: {
    type: Number,
    required: true,
  },
  checkedAt: {
    type: Date,
    default: Date.now,
  },
  errorMessage: {
    type: String,
    default: null,
  },
});

// Compound index for efficient querying per URL + time range
pingHistorySchema.index({ urlId: 1, checkedAt: -1 });

// Auto-delete records older than 30 days
pingHistorySchema.index({ checkedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const PingHistory = mongoose.models.PingHistory || mongoose.model('PingHistory', pingHistorySchema);

export default PingHistory;

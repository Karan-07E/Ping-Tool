import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'URL is required'],
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['UP', 'DOWN', 'PENDING'],
      default: 'PENDING',
    },
    responseTime: {
      type: Number,
      default: null,
    },
    lastChecked: {
      type: Date,
      default: null,
    },
    uptimePercent: {
      type: Number,
      default: null,
    },
    totalChecks: {
      type: Number,
      default: 0,
    },
    successfulChecks: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Url = mongoose.models.Url || mongoose.model('Url', urlSchema);

export default Url;

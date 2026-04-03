import mongoose from 'mongoose';

// Prevent model recompilation in hot-reload / serverless warm starts
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
  },
  { timestamps: true }
);

const Url = mongoose.models.Url || mongoose.model('Url', urlSchema);

export default Url;

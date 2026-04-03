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
  },
  { timestamps: true }
);

const Url = mongoose.model('Url', urlSchema);

export default Url;

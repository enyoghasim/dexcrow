import { Schema, model, Document } from 'mongoose';

type otpType = 'verify-email' | 'activate-account';

export interface IOtp extends Document {
  otp: string;
  user: string | Schema.Types.ObjectId;
  expires: Date;
  createdAt: Date;
  type: otpType;
}

const otpSchema = new Schema<IOtp>(
  {
    otp: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.Mixed,
      required: true,
    },
    expires: {
      type: Date,
      required: true,
      default: Date.now() + 10 * 60 * 1000,
      index: { expires: '10m' },
    },
    type: {
      type: String,
      required: true,
      enum: ['verify-email', 'activate-account'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: '10m' },
    },
  },
  { timestamps: true },
);

export default model<IOtp>('Otps', otpSchema);

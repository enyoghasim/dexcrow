import { Document, model, Schema } from 'mongoose';

type VerificationTokenType = 'reset-password';

export interface IVerificationToken extends Document {
  user: Schema.Types.ObjectId;
  selector: string;
  token: string;
  createdAt: Date;
  expires: Date;
  type: VerificationTokenType;
}

const ResetPasswordTokenSchema = new Schema<IVerificationToken>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    selector: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['reset-password'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: '10m' },
    },
  },
  {
    timestamps: true,
  },
);

export default model<IVerificationToken>('VerificationTokens', ResetPasswordTokenSchema);

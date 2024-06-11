import { Schema, model, Document } from 'mongoose';

const lockSchema = new Schema({
  type: { type: String, required: true, enum: ['login'] },
  unlockTime: { type: Date, required: true },
});

export interface IUser extends Document {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: string;
  isEmailVerified: boolean;
  liftLockAt: Date;
  nowPaymentsSubAccountId: string;
  locks: Array<{
    type: string;
    unlockTime: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    nowPaymentsSubAccountId: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      required: true,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    locks: [lockSchema],
  },
  { timestamps: true },
);

export default model<IUser>('Users', userSchema);

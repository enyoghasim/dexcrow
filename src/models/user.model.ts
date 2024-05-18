import { Schema, model, Document } from 'mongoose';

const lockSchema = new Schema({
  type: { type: String, required: true, enum: ['login'] },
  unlockTime: { type: Date, required: true },
});

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  isEmailVerified: boolean;
  liftLockAt: Date;
  locks: Array<{
    type: string;
    unlockTime: Date;
  }>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
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

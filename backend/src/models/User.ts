import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: 'user' | 'admin';
  passwordHash: string;

  passwordResetTokenHash?: string | null;
  passwordResetExpires?: Date | null;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    passwordHash: { type: String, required: true },

    // Store a hash of the raw reset token, never the raw token itself.
    passwordResetTokenHash: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);


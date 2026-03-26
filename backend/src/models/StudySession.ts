import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStudySession extends Document {
  duration: number; // in minutes
  subject: string;
  date: Date;
  user: Types.ObjectId;
}

const StudySessionSchema: Schema = new Schema({
  duration: { type: Number, required: true },
  subject: { type: String, required: true },
  date: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model<IStudySession>('StudySession', StudySessionSchema);

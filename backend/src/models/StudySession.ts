import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStudySession extends Document {
  userId: Types.ObjectId;
  duration: number; // in minutes
  subject: string;
  date: Date;
}

const StudySessionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  duration: { type: Number, required: true },
  subject: { type: String, required: true },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model<IStudySession>('StudySession', StudySessionSchema);

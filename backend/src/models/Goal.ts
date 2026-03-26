import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGoal extends Document {
  title: string;
  progress: number;
  deadline: Date;
  user: Types.ObjectId;
}

const GoalSchema: Schema = new Schema({
  title: { type: String, required: true },
  progress: { type: Number, default: 0 },
  deadline: { type: Date },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model<IGoal>('Goal', GoalSchema);

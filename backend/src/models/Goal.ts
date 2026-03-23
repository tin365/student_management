import mongoose, { Schema, Document } from 'mongoose';

export interface IGoal extends Document {
  title: string;
  progress: number;
  deadline: Date;
}

const GoalSchema: Schema = new Schema({
  title: { type: String, required: true },
  progress: { type: Number, default: 0 },
  deadline: { type: Date },
}, { timestamps: true });

export default mongoose.model<IGoal>('Goal', GoalSchema);

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGoal extends Document {
  title: string;
  progress: number;
  deadline: Date;
  status: 'active' | 'completed';
  completedAt?: Date | null;
}

const GoalSchema: Schema = new Schema({
  title: { type: String, required: true },
  progress: { type: Number, default: 0 },
  deadline: { type: Date },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model<IGoal>('Goal', GoalSchema);

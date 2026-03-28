import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGoal extends Document {
  title: string;
  category: 'academic' | 'health' | 'skill' | string;
  deadline?: Date | null;
  priority: 'high' | 'medium' | 'low';
  description?: string;
  progress: number;
  status: 'active' | 'completed';
  completedAt?: Date | null;
  tasks?: Types.ObjectId[];
}

const GoalSchema: Schema = new Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['academic', 'health', 'skill', 'other'], default: 'other' },
  deadline: { type: Date, default: null },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  description: { type: String, default: '' },
  progress: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  completedAt: { type: Date, default: null },
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
}, { timestamps: true });

export default mongoose.model<IGoal>('Goal', GoalSchema);

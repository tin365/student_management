import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  status: 'not_started' | 'in_progress' | 'completed';
  dueDate?: Date | null;
}

const TaskSchema = new Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
  dueDate: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model<ITask>('Task', TaskSchema);
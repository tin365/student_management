import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITask extends Document {
  userId: Types.ObjectId;
  title: string;
  status: 'not_started' | 'in_progress' | 'completed';
  dueDate?: Date | null;
}

const TaskSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
  dueDate: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model<ITask>('Task', TaskSchema);
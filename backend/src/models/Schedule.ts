import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISchedule extends Document {
  title: string;
  startTime: Date;
  endTime: Date;
  user: Types.ObjectId;
}

const ScheduleSchema: Schema = new Schema({
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model<ISchedule>('Schedule', ScheduleSchema);

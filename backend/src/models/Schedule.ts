import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISchedule extends Document {
  title: string;
  startTime: Date;
  endTime: Date;
}

const ScheduleSchema: Schema = new Schema({
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.model<ISchedule>('Schedule', ScheduleSchema);

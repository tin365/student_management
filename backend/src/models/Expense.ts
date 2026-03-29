import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IExpense extends Document {
  userId: Types.ObjectId;
  amount: number;
  currency: string;
  category: string;
  note: string;
  date: Date;
}

const ExpenseSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: 'RM' },
  category: { type: String, required: true },
  note: { type: String },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model<IExpense>('Expense', ExpenseSchema);

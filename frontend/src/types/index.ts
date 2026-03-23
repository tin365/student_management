export interface Expense {
  _id?: string;
  amount: number;
  category: string;
  note?: string;
  date: Date | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Goal {
  _id?: string;
  title: string;
  progress: number;
  deadline?: Date | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudySession {
  _id?: string;
  duration: number;
  subject: string;
  date: Date | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Schedule {
  _id?: string;
  title: string;
  startTime: Date | string;
  endTime: Date | string;
  createdAt?: string;
  updatedAt?: string;
}

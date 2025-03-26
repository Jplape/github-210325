import type { Task } from './task';

export interface TaskChange {
  new: Task | null;
  old: Task | null;
}

export interface TaskChangePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Task | null;
  old: Task | null;
  schema: string;
  table: string;
  commit_timestamp: string;
}
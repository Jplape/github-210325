import { Database } from '../types_new/supabase';

export type Task = Database['public']['Tables']['tasks']['Row'];
export type Client = Database['public']['Tables']['clients']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
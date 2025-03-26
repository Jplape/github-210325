export interface Task {
  id: string;
  title: string;
  client: string;
  date: string;
  startTime: string;
  duration: number;
  technicianId?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  description?: string;
  equipment?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  type?: 'maintenance' | 'intervention';
  maintenanceType?: 'preventive' | 'corrective';
  parts?: string[];
  cost?: number;
  nextMaintenanceDate?: string;
  actions?: string[];
  createdAt: string;
  updatedAt: string;
  reportId?: string; // Add this field to link to reports
  origin?: 'local' | 'remote'; // For sync conflict resolution
}
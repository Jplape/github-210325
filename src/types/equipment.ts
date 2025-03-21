export interface MaintenanceContract {
  id: string;
  type: 'warranty' | 'maintenance';
  startDate: string;
  endDate: string;
  provider: string;
  terms: string;
  coverage: string[];
  cost?: number;
  renewalDate?: string;
  attachments?: string[];
}

export interface MaintenanceHistory {
  id: string;
  date: string;
  type: 'preventive' | 'corrective';
  technician: string;
  description: string;
  actions: string[];
  parts?: string[];
  cost?: number;
  nextMaintenanceDate?: string;
  attachments?: string[];
}

export interface Equipment {
  id: string;
  number: string; // Numéro d'équipement
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  status: 'functional' | 'partial' | 'non_functional';
  installationDate: string;
  client: {
    id: string;
    name: string;
  };
  location: string;
  department?: string;
  maintenanceContract?: MaintenanceContract;
  maintenanceHistory: MaintenanceHistory[];
  nextPreventiveMaintenance?: string;
  alerts?: {
    type: 'preventive' | 'urgent';
    message: string;
    dueDate: string;
  }[];
  specifications?: Record<string, string>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Task } from '../types/task';
import { Equipment } from '../types/equipment';

export interface InterventionReport {
  id: string;
  taskId: string;
  equipmentId: string;
  technicianId: string;
  date: string;
  clientName: string;
  service: string;
  equipmentType: string;
  serialNumber: string;
  brand: string;
  specifications: string;
  description: string;
  findings: string[];
  recommendations: string[];
  nextMaintenanceDate?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  approvedBy?: string;
}

interface ReportState {
  reports: InterventionReport[];
  addReport: (data: Omit<InterventionReport, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<InterventionReport>;
  updateReport: (id: string, updates: Partial<InterventionReport>) => void;
  deleteReport: (id: string) => void;
  getReportByTaskId: (taskId: string) => InterventionReport | undefined;
  submitReport: (id: string) => void;
  approveReport: (id: string, adminId: string) => void;
  rejectReport: (id: string, adminId: string, reason: string) => void;
  canSubmitReport: (id: string) => { canSubmit: boolean; reason?: string };
  canApproveReport: (id: string) => { canApprove: boolean; reason?: string };
}

function generateReportId(): string {
  const prefix = 'R';
  const date = format(new Date(), 'yyyyMMdd');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${date}-${random}`;
}

export const useReportStore = create<ReportState>()(
  persist(
    (set, get) => ({
      reports: [],

      addReport: async (data) => {
        const now = new Date().toISOString();
        const report: InterventionReport = {
          ...data,
          id: generateReportId(),
          status: 'draft',
          createdAt: now,
          updatedAt: now
        };

        set(state => ({
          reports: [...state.reports, report]
        }));

        return report;
      },

      updateReport: (id, updates) => {
        set(state => ({
          reports: state.reports.map(report =>
            report.id === id
              ? { ...report, ...updates, updatedAt: new Date().toISOString() }
              : report
          )
        }));
      },

      deleteReport: (id) => {
        set(state => ({
          reports: state.reports.filter(report => report.id !== id)
        }));
      },

      getReportByTaskId: (taskId) => {
        return get().reports.find(report => report.taskId === taskId);
      },

      canSubmitReport: (id) => {
        const report = get().reports.find(r => r.id === id);
        if (!report) {
          return { canSubmit: false, reason: 'Rapport introuvable' };
        }

        if (report.status !== 'draft' && report.status !== 'rejected') {
          return { canSubmit: false, reason: 'Le rapport doit être en brouillon ou rejeté pour être soumis' };
        }

        // Vérifier les champs requis
        if (!report.description?.trim()) {
          return { canSubmit: false, reason: 'Les détails de l\'intervention sont requis' };
        }

        if (!report.findings?.length) {
          return { canSubmit: false, reason: 'Les actions réalisées sont requises' };
        }

        return { canSubmit: true };
      },

      submitReport: (id) => {
        const { canSubmit, reason } = get().canSubmitReport(id);
        if (!canSubmit) {
          throw new Error(reason);
        }

        set(state => ({
          reports: state.reports.map(report =>
            report.id === id
              ? {
                  ...report,
                  status: 'submitted',
                  submittedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              : report
          )
        }));
      },

      canApproveReport: (id) => {
        const report = get().reports.find(r => r.id === id);
        if (!report) {
          return { canApprove: false, reason: 'Rapport introuvable' };
        }

        if (report.status !== 'submitted') {
          return { canApprove: false, reason: 'Le rapport doit être soumis pour être approuvé ou rejeté' };
        }

        return { canApprove: true };
      },

      approveReport: (id, adminId) => {
        const { canApprove, reason } = get().canApproveReport(id);
        if (!canApprove) {
          throw new Error(reason);
        }

        set(state => ({
          reports: state.reports.map(report =>
            report.id === id
              ? {
                  ...report,
                  status: 'approved',
                  approvedAt: new Date().toISOString(),
                  approvedBy: adminId,
                  updatedAt: new Date().toISOString()
                }
              : report
          )
        }));
      },

      rejectReport: (id, adminId, reason) => {
        const { canApprove } = get().canApproveReport(id);
        if (!canApprove) {
          throw new Error('Le rapport ne peut pas être rejeté');
        }

        if (!reason?.trim()) {
          throw new Error('Une raison de rejet est requise');
        }

        set(state => ({
          reports: state.reports.map(report =>
            report.id === id
              ? {
                  ...report,
                  status: 'rejected',
                  rejectedAt: new Date().toISOString(),
                  rejectionReason: reason,
                  updatedAt: new Date().toISOString()
                }
              : report
          )
        }));
      }
    }),
    {
      name: 'reports-storage',
      version: 1
    }
  )
);
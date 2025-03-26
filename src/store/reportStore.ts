import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import { syncInterventionReports } from '../lib/firestore';

export interface StatusTransition {
  from: 'draft' | 'submitted' | 'approved' | 'rejected';
  to: 'draft' | 'submitted' | 'approved' | 'rejected';
  timestamp: string;
  userId: string;
  comment?: string;
}

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
  statusHistory: StatusTransition[];
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
  validateTransition: (id: string,
                     currentStatus: 'draft' | 'submitted' | 'approved' | 'rejected',
                     newStatus: 'draft' | 'submitted' | 'approved' | 'rejected',
                     userId: string) => { isValid: boolean; reason?: string };
  saveDraft: (id: string, updates: Partial<InterventionReport>) => Promise<void>;
  initialize: () => () => void;
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
      
      // Initialize Firestore sync
      initialize: () => {
        return syncInterventionReports.subscribeToReports((firestoreReports) => {
          set({ reports: firestoreReports });
        });
      },

      addReport: async (data) => {
        const now = new Date().toISOString();
        const report: InterventionReport = {
          ...data,
          id: generateReportId(),
          status: 'draft',
          createdAt: now,
          updatedAt: now,
          statusHistory: [{
            from: 'draft',
            to: 'draft',
            timestamp: now,
            userId: data.technicianId
          }]
        };

        // Sync with Firestore
        await syncInterventionReports.saveReport(report);

        set(state => ({
          reports: [...state.reports, report]
        }));

        return report;
      },

      updateReport: async (id, updates) => {
        const now = new Date().toISOString();
        const updatedReport = {
          ...updates,
          updatedAt: now
        };
        
        // Sync with Firestore
        await syncInterventionReports.updateReport(id, updatedReport);

        set(state => ({
          reports: state.reports.map(report => {
            if (report.id !== id) return report;
            
            let newHistory = report.statusHistory;
            if (updates.status && updates.status !== report.status) {
              // Valider la transition et obtenir l'userId
              const validation = get().validateTransition(
                report.id,
                report.status,
                updates.status,
                report.technicianId // Utiliser technicianId comme fallback
              );
              
              if (!validation.isValid) {
                throw new Error(validation.reason || 'Transition non autorisée');
              }

              newHistory = [
                ...report.statusHistory,
                {
                  from: report.status,
                  to: updates.status as 'draft' | 'submitted' | 'approved' | 'rejected',
                  timestamp: now,
                  userId: report.technicianId // Utiliser technicianId pour cohérence
                }
              ];
            }

            return {
              ...report,
              ...updatedReport,
              statusHistory: newHistory
            };
          })
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

      canSubmitReport: (id: string) => {
        const report = get().reports.find(r => r.id === id);
        if (!report) return { canSubmit: false, reason: 'Rapport introuvable' };
        
        const { isValid } = get().validateTransition(id, report.status, 'submitted', report.technicianId);
        if (!isValid) return { canSubmit: false, reason: 'Transition non autorisée' };

        if (!report.description?.trim()) {
          return { canSubmit: false, reason: 'Description requise' };
        }
        if (!report.findings?.length) {
          return { canSubmit: false, reason: 'Findings requis' };
        }
        return { canSubmit: true };
      },

      validateTransition: (id: string, currentStatus: 'draft' | 'submitted' | 'approved' | 'rejected',
                         newStatus: 'draft' | 'submitted' | 'approved' | 'rejected', userId: string) => {
        return {
          isValid: true,
          userId
        };
        const validTransitions: Record<string, string[]> = {
          draft: ['draft', 'submitted'],
          submitted: ['approved', 'rejected'],
          rejected: ['draft', 'submitted'],
          approved: []
        };

        if (!validTransitions[currentStatus]?.includes(newStatus)) {
          return {
            isValid: false,
            reason: `Transition invalide de ${currentStatus} à ${newStatus}`
          };
        }

        // Validation supplémentaire pour certaines transitions
        if (newStatus === 'submitted') {
          const report = get().reports.find(r => r.id === id);
          if (!report?.description?.trim()) {
            return { isValid: false, reason: 'Description requise' };
          }
          if (!report?.findings?.length) {
            return { isValid: false, reason: 'Findings requis' };
          }
        }

        return { isValid: true };
      },

      saveDraft: async (id, updates) => {
        const now = new Date().toISOString();
        await syncInterventionReports.updateReport(id, updates);
        
        set(state => ({
          reports: state.reports.map(report =>
            report.id === id
              ? {
                  ...report,
                  ...updates,
                  updatedAt: now,
                  statusHistory: [
                    ...report.statusHistory,
                    {
                      from: report.status,
                      to: 'draft',
                      timestamp: now,
                      userId: report.technicianId
                    }
                  ]
                }
              : report
          )
        }));
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

      rejectReport: (id, _, reason) => {
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
import { useState } from 'react';
import { useReportStore } from '../../store/reportStore';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

interface ReportStatusActionsProps {
  reportId: string;
  currentStatus: 'draft' | 'submitted' | 'approved' | 'rejected';
  onStatusChange?: () => void;
}

export default function ReportStatusActions({ 
  reportId, 
  currentStatus,
  onStatusChange 
}: ReportStatusActionsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const { submitReport, approveReport, rejectReport, canSubmitReport, canApproveReport } = useReportStore();
  const { user } = useAuthStore();

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      submitReport(reportId);
      toast.success('Rapport soumis avec succès');
      onStatusChange?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      approveReport(reportId, user.id);
      toast.success('Rapport approuvé');
      onStatusChange?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'approbation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!user || !rejectionReason.trim()) return;
    
    try {
      setIsSubmitting(true);
      rejectReport(reportId, user.id, rejectionReason);
      toast.success('Rapport rejeté');
      setShowRejectDialog(false);
      onStatusChange?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors du rejet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { canSubmit, reason: submitReason } = canSubmitReport(reportId);
  const { canApprove, reason: approveReason } = canApproveReport(reportId);

  return (
    <div className="space-y-4">
      {currentStatus === 'draft' && (
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          title={!canSubmit ? submitReason : undefined}
          className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Soumettre le rapport
        </button>
      )}

      {currentStatus === 'submitted' && user?.role === 'admin' && (
        <div className="flex space-x-3">
          <button
            onClick={handleApprove}
            disabled={!canApprove || isSubmitting}
            title={!canApprove ? approveReason : undefined}
            className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Approuver
          </button>
          <button
            onClick={() => setShowRejectDialog(true)}
            disabled={!canApprove || isSubmitting}
            className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Rejeter
          </button>
        </div>
      )}

      {showRejectDialog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Motif du rejet
            </h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Veuillez indiquer la raison du rejet..."
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
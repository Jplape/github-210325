import { useState } from 'react';
import { X, Download } from 'lucide-react';
import { InterventionReport } from '../../store/reportStore';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ReportStatusActions from './ReportStatusActions';

interface ReportGeneratorProps {
  report: InterventionReport;
  onClose: () => void;
  onExport: (format: 'pdf' | 'excel') => Promise<void>;
  onUpdate?: (reportId: string, updates: Partial<InterventionReport>) => void;
}

export default function ReportGenerator({ report, onClose, onExport, onUpdate }: ReportGeneratorProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [formData, setFormData] = useState({
    description: report.description || '',
    findings: report.findings || [],
    recommendations: report.recommendations || [],
    nextMaintenanceDate: report.nextMaintenanceDate || '',
    confirmed: false
  });

  const isEditable = report.status !== 'approved';

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (isExporting) return;

    try {
      setIsExporting(true);
      await onExport(format);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Erreur lors de l'export en ${format.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.confirmed) {
      toast.error('Veuillez confirmer l\'exactitude des informations');
      return;
    }

    if (onUpdate) {
      onUpdate(report.id, {
        description: formData.description,
        findings: formData.findings,
        recommendations: formData.recommendations,
        nextMaintenanceDate: formData.nextMaintenanceDate
      });
    }
  };

  const handleFindingsChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      findings: value.split('\n').filter(line => line.trim() !== '')
    }));
  };

  const handleRecommendationsChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      recommendations: value.split('\n').filter(line => line.trim() !== '')
    }));
  };

  const handleStatusChange = () => {
    // Refresh the form data after status change
    setFormData({
      description: report.description || '',
      findings: report.findings || [],
      recommendations: report.recommendations || [],
      nextMaintenanceDate: report.nextMaintenanceDate || '',
      confirmed: false
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Rapport d'Intervention
              </h3>
              <div className="mt-1">
                <ReportStatusActions
                  reportId={report.id}
                  currentStatus={report.status}
                  onStatusChange={handleStatusChange}
                />
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* En-tête */}
          <div className="border-b pb-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="h-16 w-32 bg-gray-100 flex items-center justify-center text-gray-400">
                  LOGO
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold">Rapport d'Intervention</h2>
                <p className="text-gray-600">Gabon (Libreville)</p>
                <p className="text-gray-600">E.S.T.T.M & Co</p>
              </div>
            </div>
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date d'intervention</label>
              <p className="mt-1">{format(new Date(report.date), 'dd MMMM yyyy', { locale: fr })}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Technicien</label>
              <p className="mt-1">{report.technicianId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Client</label>
              <p className="mt-1">{report.clientName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Service</label>
              <p className="mt-1">{report.service || 'Non spécifié'}</p>
            </div>
          </div>

          {/* Équipement */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Équipement</h4>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type d'appareil</label>
                <p className="mt-1">{report.equipmentType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">N° série</label>
                <p className="mt-1">{report.serialNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Marque</label>
                <p className="mt-1">{report.brand}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Spécifications</label>
                <p className="mt-1">{report.specifications || 'Non spécifié'}</p>
              </div>
            </div>
          </div>

          {/* Détails de l'intervention */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Détails de l'intervention</label>
            {isEditable ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            ) : (
              <p className="mt-1 whitespace-pre-wrap">{formData.description}</p>
            )}
          </div>

          {/* Actions réalisées */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Actions réalisées</label>
            {isEditable ? (
              <textarea
                value={formData.findings.join('\n')}
                onChange={(e) => handleFindingsChange(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Une action par ligne"
              />
            ) : (
              <ul className="mt-1 list-disc list-inside space-y-1">
                {formData.findings.map((finding, index) => (
                  <li key={index}>{finding}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Recommandations */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Recommandations</label>
            {isEditable ? (
              <textarea
                value={formData.recommendations.join('\n')}
                onChange={(e) => handleRecommendationsChange(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Une recommandation par ligne"
              />
            ) : (
              <ul className="mt-1 list-disc list-inside space-y-1">
                {formData.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Prochaine maintenance */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Prochaine maintenance prévue</label>
            {isEditable ? (
              <input
                type="date"
                value={formData.nextMaintenanceDate}
                onChange={(e) => setFormData(prev => ({ ...prev, nextMaintenanceDate: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            ) : (
              <p className="mt-1">
                {formData.nextMaintenanceDate ? 
                  format(new Date(formData.nextMaintenanceDate), 'dd MMMM yyyy', { locale: fr }) :
                  'Non spécifié'
                }
              </p>
            )}
          </div>

          {/* Confirmation et actions */}
          <div className="border-t pt-6 space-y-4">
            {isEditable && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="confirmation"
                  checked={formData.confirmed}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmed: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="confirmation" className="ml-2 text-sm text-gray-700">
                  Je confirme que les informations fournies sont exactes
                </label>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              {isEditable && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Enregistrer les modifications
                </button>
              )}
              <button
                type="button"
                onClick={() => handleExport('pdf')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Download className="h-5 w-5 mr-2 inline-block" />
                Exporter en PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
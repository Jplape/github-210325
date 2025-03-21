import { format, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText, User, Wrench, Building2 } from 'lucide-react';
import { InterventionReport } from '../../store/reportStore';

interface ReportCardProps {
  report: InterventionReport;
  onClick: () => void;
}

export default function ReportCard({ report, onClick }: ReportCardProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        return 'Date invalide';
      }
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      console.error('Invalid date:', dateString);
      return 'Date invalide';
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:border-indigo-500 cursor-pointer transition-all duration-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <FileText className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">{report.id}</h3>
            <p className="text-sm text-gray-500">
              {report.date ? formatDate(report.date) : 'Date non définie'}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          report.status === 'approved' ? 'bg-green-100 text-green-800' :
          report.status === 'rejected' ? 'bg-red-100 text-red-800' :
          report.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {report.status === 'approved' ? 'Approuvé' :
           report.status === 'rejected' ? 'Rejeté' :
           report.status === 'submitted' ? 'Soumis' : 'Brouillon'}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Building2 className="h-4 w-4 mr-2 text-gray-400" />
          {report.clientName || 'Client non défini'}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Wrench className="h-4 w-4 mr-2 text-gray-400" />
          {report.equipmentType || 'Équipement non défini'}
        </div>
      </div>

      {report.description && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-2">
            {report.description}
          </p>
        </div>
      )}
    </div>
  );
}
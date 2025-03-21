import { format, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MaintenanceContract } from '../../types/equipment';
import { Calendar, FileText, AlertTriangle } from 'lucide-react';

interface MaintenanceContractCardProps {
  contract: MaintenanceContract;
  onEdit?: () => void;
}

export default function MaintenanceContractCard({
  contract,
  onEdit
}: MaintenanceContractCardProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        return 'Date invalide';
      }
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch {
      return 'Date invalide';
    }
  };

  const isExpiringSoon = () => {
    try {
      const endDate = parseISO(contract.endDate);
      if (!isValid(endDate)) return false;
      
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return endDate <= thirtyDaysFromNow;
    } catch {
      return false;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {contract.type === 'warranty' ? 'Garantie' : 'Contrat de maintenance'}
        </h3>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-sm text-indigo-600 hover:text-indigo-900"
          >
            Modifier
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-sm font-medium text-gray-500">Prestataire</div>
          <div className="mt-1 text-sm text-gray-900">{contract.provider}</div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-500">Période</div>
            <div className="mt-1 text-sm text-gray-900">
              Du {formatDate(contract.startDate)}
              {' au '}
              {formatDate(contract.endDate)}
            </div>
          </div>

          {isExpiringSoon() && (
            <div className="flex items-center text-yellow-600">
              <AlertTriangle className="h-5 w-5 mr-1.5" />
              <span className="text-sm">Expiration proche</span>
            </div>
          )}
        </div>

        {contract.coverage && contract.coverage.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-500">Couverture</div>
            <ul className="mt-1 list-disc list-inside text-sm text-gray-900">
              {contract.coverage.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {contract.terms && (
          <div>
            <div className="text-sm font-medium text-gray-500">Conditions</div>
            <div className="mt-1 text-sm text-gray-900">{contract.terms}</div>
          </div>
        )}

        {contract.renewalDate && (
          <div className="flex items-center text-sm text-blue-600">
            <Calendar className="h-4 w-4 mr-1.5" />
            Renouvellement prévu le{' '}
            {formatDate(contract.renewalDate)}
          </div>
        )}

        {contract.attachments && contract.attachments.length > 0 && (
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-gray-400" />
            <div className="text-sm text-gray-500">
              {contract.attachments.length} document{contract.attachments.length > 1 ? 's' : ''} attaché{contract.attachments.length > 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
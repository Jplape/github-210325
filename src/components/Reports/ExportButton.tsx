import { useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ExportButtonProps {
  onExport: (format: 'pdf' | 'excel') => Promise<void>;
  disabled?: boolean;
}

export default function ExportButton({ onExport, disabled = false }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (isExporting) return;

    try {
      setIsExporting(true);
      await onExport(format);
      toast.success(`Export en ${format.toUpperCase()} réussi`);
    } catch (error) {
      toast.error(`Erreur lors de l'export en ${format.toUpperCase()}`);
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        disabled={disabled || isExporting}
        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => handleExport('pdf')}
      >
        <Download className="h-5 w-5 mr-2" />
        Exporter
        {isExporting && (
          <span className="ml-2 animate-pulse">...</span>
        )}
      </button>
      
      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block">
        <div className="py-1" role="menu">
          <button
            onClick={() => handleExport('pdf')}
            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            role="menuitem"
          >
            Exporter en PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            role="menuitem"
          >
            Exporter en Excel
          </button>
        </div>
      </div>
    </div>
  );
}
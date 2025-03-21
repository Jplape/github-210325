import { useState } from 'react';
import { Search, Download, Filter, Plus, X, ChevronDown, ChevronUp, Link as LinkIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useReportStore, InterventionReport } from '../store/reportStore';
import { useTaskStore } from '../store/taskStore';
import { useEquipmentStore } from '../store/equipmentStore';
import ReportGenerator from '../components/Reports/ReportGenerator';
import InterventionReportForm from '../components/Reports/InterventionReportForm';
import ExportButton from '../components/Reports/ExportButton';
import { generatePDF, generateExcel } from '../utils/reportExport';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';

type SortField = 'id' | 'date' | 'client' | 'equipment' | 'status' | 'taskId';
type SortDirection = 'asc' | 'desc';

export default function InterventionReports() {
  const { reports, addReport } = useReportStore();
  const { tasks } = useTaskStore();
  const { equipment } = useEquipmentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<InterventionReport | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | InterventionReport['status']>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      let blob: Blob;
      if (format === 'pdf' && selectedReport) {
        blob = await generatePDF(selectedReport);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport-${selectedReport.id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'excel') {
        blob = await generateExcel(reports);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rapports.xlsx';
        a.click();
        URL.revokeObjectURL(url);
      }
      toast.success(`Export en ${format.toUpperCase()} réussi`);
    } catch (error) {
      toast.error(`Erreur lors de l'export en ${format.toUpperCase()}`);
    }
  };

  const handleNewReport = () => {
    const incompleteTasks = tasks.filter(task => task.status !== 'completed');
    if (incompleteTasks.length === 0) {
      toast.error('Aucune tâche disponible pour générer un rapport');
      return;
    }
    setSelectedTaskId(incompleteTasks[0].id);
    setIsFormOpen(true);
  };

  const handleReportSubmit = async (formData: any) => {
    try {
      const report = await addReport(formData);
      toast.success('Rapport créé avec succès');
      setIsFormOpen(false);
      setSelectedReport(report);
    } catch (error) {
      toast.error('Erreur lors de la création du rapport');
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Date non définie';
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

  const sortReports = (a: InterventionReport, b: InterventionReport) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'id':
        return direction * (a.id || '').localeCompare(b.id || '');
      case 'taskId':
        return direction * (a.taskId || '').localeCompare(b.taskId || '');
      case 'date':
        if (!a.date || !b.date) return 0;
        try {
          const dateA = parseISO(a.date);
          const dateB = parseISO(b.date);
          if (!isValid(dateA) || !isValid(dateB)) return 0;
          return direction * (dateA.getTime() - dateB.getTime());
        } catch {
          return 0;
        }
      case 'client':
        return direction * (a.clientName || '').localeCompare(b.clientName || '');
      case 'equipment':
        return direction * (a.equipmentType || '').localeCompare(b.equipmentType || '');
      case 'status':
        return direction * (a.status || '').localeCompare(b.status || '');
      default:
        return 0;
    }
  };

  const filteredReports = reports
    .filter(report => {
      const matchesSearch = 
        (report.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.taskId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.equipmentType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.description || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort(sortReports);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  const getStatusStyle = (status: InterventionReport['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: InterventionReport['status']) => {
    switch (status) {
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      case 'submitted':
        return 'Soumis';
      default:
        return 'Brouillon';
    }
  };

  const getEquipmentNumber = (equipmentId: string) => {
    const eq = equipment.find(e => e.id === equipmentId);
    return eq?.number || 'N/A';
  };

  const getTaskTitle = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    return task?.title || 'N/A';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rapports d'intervention</h2>
          <p className="mt-1 text-sm text-gray-500">
            Consultez et gérez les rapports d'intervention
          </p>
        </div>
        <div className="flex space-x-4">
          <ExportButton onExport={handleExport} disabled={!selectedReport} />
          <button
            onClick={handleNewReport}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouveau rapport
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Rechercher un rapport..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <div className="flex space-x-2">
                {(['all', 'draft', 'submitted', 'approved', 'rejected'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      statusFilter === status
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'all' ? 'Tous' :
                     status === 'draft' ? 'Brouillons' :
                     status === 'submitted' ? 'Soumis' :
                     status === 'approved' ? 'Approuvés' : 'Rejetés'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center space-x-1">
                    <span>N° Rapport</span>
                    <SortIcon field="id" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('taskId')}
                >
                  <div className="flex items-center space-x-1">
                    <span>N° Tâche</span>
                    <SortIcon field="taskId" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    <SortIcon field="date" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('client')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Client</span>
                    <SortIcon field="client" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('equipment')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Équipement</span>
                    <SortIcon field="equipment" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N° Équipement
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Statut</span>
                    <SortIcon field="status" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr 
                  key={report.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedReport(report)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link 
                      to={`/tasks/${report.taskId}`}
                      className="flex items-center text-indigo-600 hover:text-indigo-900"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {report.taskId}
                      <LinkIcon className="h-4 w-4 ml-1" />
                    </Link>
                    <div className="text-xs text-gray-500">
                      {getTaskTitle(report.taskId)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(report.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{report.equipmentType}</div>
                      <div className="text-xs text-gray-500">
                        {report.brand} {report.serialNumber}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getEquipmentNumber(report.equipmentId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(report.status)}`}>
                      {getStatusLabel(report.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExport('pdf');
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Exporter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Nouveau rapport d'intervention
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <InterventionReportForm
                taskId={selectedTaskId}
                onSubmit={handleReportSubmit}
                onCancel={() => setIsFormOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {selectedReport && (
        <ReportGenerator
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onExport={handleExport}
        />
      )}
    </div>
  );
}
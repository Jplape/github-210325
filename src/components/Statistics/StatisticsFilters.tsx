import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { useTeamStore } from '../../store/teamStore';

interface StatisticsFiltersProps {
  onFilterChange: (filters: any) => void;
  clients: string[];
  period: string;
  onPeriodChange: (period: string) => void;
}

export default function StatisticsFilters({ 
  onFilterChange, 
  clients, 
  period,
  onPeriodChange 
}: StatisticsFiltersProps) {
  const { members } = useTeamStore();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const [filters, setFilters] = useState({
    technician: 'all',
    client: 'all',
  });

  const handleFilterChange = (filterName: string, value: string) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    
    const active = Object.entries(newFilters)
      .filter(([_, val]) => val !== 'all')
      .map(([key]) => key);
    setActiveFilters(active);
    
    onFilterChange(newFilters);
  };

  const clearFilter = (filterName: string) => {
    handleFilterChange(filterName, 'all');
  };

  const clearAllFilters = () => {
    setFilters({
      technician: 'all',
      client: 'all',
    });
    setActiveFilters([]);
    onFilterChange({
      technician: 'all',
      client: 'all',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filtres</span>
          {activeFilters.length > 0 && (
            <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-600">
              {activeFilters.length} actif{activeFilters.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {activeFilters.length > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Période
          </label>
          <select
            value={period}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="1m">Dernier mois</option>
            <option value="3m">3 derniers mois</option>
            <option value="6m">6 derniers mois</option>
            <option value="1y">Cette année</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Technicien
          </label>
          <select
            value={filters.technician}
            onChange={(e) => handleFilterChange('technician', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">Tous les techniciens</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client
          </label>
          <select
            value={filters.client}
            onChange={(e) => handleFilterChange('client', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">Tous les clients</option>
            {clients.map((client) => (
              <option key={client} value={client}>
                {client}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {activeFilters.map((filter) => (
            <span
              key={filter}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700"
            >
              {filter}
              <button
                onClick={() => clearFilter(filter)}
                className="ml-2 hover:text-indigo-900"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
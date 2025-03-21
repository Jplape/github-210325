import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie } from 'recharts';
import { Download } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import StatisticsFilters from '../components/Statistics/StatisticsFilters';
import { useNavigate } from 'react-router-dom';
import { subMonths, isWithinInterval, startOfYear } from 'date-fns';

export default function Statistics() {
  const navigate = useNavigate();
  const { tasks } = useTaskStore();
  const [period, setPeriod] = useState('6m');
  const [filters, setFilters] = useState({
    technician: 'all',
    client: 'all',
  });

  const clients = useMemo(() => {
    return Array.from(new Set(tasks.map(task => task.client)));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '1m':
        startDate = subMonths(now, 1);
        break;
      case '3m':
        startDate = subMonths(now, 3);
        break;
      case '6m':
        startDate = subMonths(now, 6);
        break;
      case '1y':
        startDate = startOfYear(now);
        break;
      default:
        startDate = subMonths(now, 6);
    }

    return tasks.filter(task => {
      const taskDate = new Date(task.date);
      const withinPeriod = isWithinInterval(taskDate, { start: startDate, end: now });

      const matchesTechnician = filters.technician === 'all' || 
        task.technicianId === filters.technician;
      const matchesClient = filters.client === 'all' || 
        task.client === filters.client;

      return withinPeriod && matchesTechnician && matchesClient;
    });
  }, [tasks, period, filters]);

  const interventionData = useMemo(() => {
    const data = new Map();
    
    filteredTasks.forEach(task => {
      const month = new Date(task.date).toLocaleString('fr-FR', { month: 'short' });
      if (!data.has(month)) {
        data.set(month, { month, completed: 0, pending: 0, inProgress: 0 });
      }
      const entry = data.get(month);
      
      if (task.status === 'completed') entry.completed++;
      else if (task.status === 'in_progress') entry.inProgress++;
      else entry.pending++;
    });

    return Array.from(data.values());
  }, [filteredTasks]);

  const clientSatisfaction = useMemo(() => {
    const completedTasks = filteredTasks.filter(task => task.status === 'completed');
    const total = completedTasks.length;
    
    if (total === 0) return [];

    const onTime = completedTasks.filter(task => {
      const taskDate = new Date(`${task.date}T${task.startTime}`);
      return taskDate >= new Date();
    }).length;

    const delayed = total - onTime;
    
    return [
      { name: 'Dans les délais', value: (onTime / total) * 100 },
      { name: 'En retard', value: (delayed / total) * 100 },
    ];
  }, [filteredTasks]);

  const handleBarClick = (data: any) => {
    if (data && data.activePayload) {
      const month = data.activePayload[0].payload.month;
      navigate(`/tasks?month=${month}`);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      return (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-4 text-sm">
              <span className={`
                px-2 py-0.5 rounded-full
                ${entry.name === 'completed' ? 'bg-green-100 text-green-800' :
                  entry.name === 'inProgress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'}
              `}>
                {entry.name === 'completed' ? 'Terminées' :
                 entry.name === 'inProgress' ? 'En cours' : 'En attente'}: {entry.value}
              </span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-900">
              Total: {total} tâches
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Statistiques</h2>
          <p className="mt-1 text-sm text-gray-500">
            Analysez les performances et générez des rapports détaillés
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          <Download className="h-5 w-5 mr-2" />
          Exporter
        </button>
      </div>

      <StatisticsFilters
        onFilterChange={setFilters}
        clients={clients}
        period={period}
        onPeriodChange={setPeriod}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Interventions par mois
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={interventionData}
                onClick={handleBarClick}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completed" name="Terminées" fill="#10B981" stackId="a" />
                <Bar dataKey="inProgress" name="En cours" fill="#3B82F6" stackId="a" />
                <Bar dataKey="pending" name="En attente" fill="#D1D5DB" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Taux de complétion
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={clientSatisfaction}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                 </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
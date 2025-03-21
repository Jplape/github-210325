import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Task } from '../../store/taskStore';
import { format, startOfWeek, addDays, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

interface InteractiveChartProps {
  tasks: Task[];
  onBarClick: (date: string, status?: string) => void;
}

export default function InteractiveChart({ tasks, onBarClick }: InteractiveChartProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const generateWeekData = useMemo(() => {
    const currentDate = new Date();
    const weekStart = startOfWeek(currentDate, { locale: fr });
    const weekEnd = addDays(weekStart, 6);
    
    const weekRange = `${format(weekStart, 'dd MMMM', { locale: fr })} - ${format(weekEnd, 'dd MMMM yyyy', { locale: fr })}`;
    
    const data = Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayTasks = tasks.filter(task => task.date === dateStr);
      
      return {
        name: format(date, 'EEE', { locale: fr }),
        fullDate: format(date, 'dd/MM', { locale: fr }),
        date: dateStr,
        completed: dayTasks.filter(task => task.status === 'completed').length,
        inProgress: dayTasks.filter(task => task.status === 'in_progress').length,
        pending: dayTasks.filter(task => task.status === 'pending').length,
        unassigned: dayTasks.filter(task => !task.technicianId).length,
        isToday: isToday(date)
      };
    });

    return { data, weekRange };
  }, [tasks]);

  const { data, weekRange } = generateWeekData;

  interface TooltipProps {
    active?: boolean;
    payload?: { value: number; dataKey: string; payload: { date: string; fullDate: string } }[];
    label?: string;
  }

  const CustomTooltip = ({ active, payload = [], label }: TooltipProps) => {
    if (active && payload.length > 0) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      const date = payload[0].payload.fullDate;
      
      return (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-2">{label} ({date})</p>
          {payload.map((entry: any, index: number) => (
            <div 
              key={index}
              className="flex items-center justify-between space-x-4 text-sm"
              onClick={() => onBarClick(payload[0].payload.date, entry.dataKey)}
            >
              <span className={`
                px-2 py-0.5 rounded-full cursor-pointer hover:opacity-80
                ${entry.dataKey === 'completed' ? 'bg-green-100 text-green-800' :
                  entry.dataKey === 'inProgress' ? 'bg-blue-100 text-blue-800' :
                  entry.dataKey === 'pending' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'}
              `}>
                {entry.dataKey === 'completed' ? 'Terminées' :
                 entry.dataKey === 'inProgress' ? 'En cours' :
                 entry.dataKey === 'pending' ? 'En attente' : 'Non assignées'}: {entry.value}
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

  const handleLegendClick = (entry: any) => {
    setSelectedStatus((prevStatus) => (prevStatus === entry.dataKey ? null : entry.dataKey));
  };

  interface LegendProps {
    payload?: { dataKey: string }[];
  }

  const CustomLegend = ({ payload }: LegendProps) => {
    if (!payload || payload.length === 0) {
      return null;
    }
  
    return (
      <div className="flex justify-center space-x-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <button
            key={index}
            onClick={() => handleLegendClick(entry)}
            className={`
              px-3 py-1 rounded-full text-sm transition-colors
              ${selectedStatus === entry.dataKey ? 'ring-2 ring-offset-2' : ''}
              ${entry.dataKey === 'completed' ? 'bg-green-100 text-green-800 ring-green-400' :
                entry.dataKey === 'inProgress' ? 'bg-blue-100 text-blue-800 ring-blue-400' :
                entry.dataKey === 'pending' ? 'bg-gray-100 text-gray-800 ring-gray-400' :
                'bg-yellow-100 text-yellow-400 ring-yellow-400'}
            `}
          >
            {entry.dataKey === 'completed' ? 'Terminées' :
             entry.dataKey === 'inProgress' ? 'En cours' :
             entry.dataKey === 'pending' ? 'En attente' : 'Non assignées'}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Suivi hebdomadaire</h3>
          <p className="text-sm text-gray-500 mt-1">{weekRange}</p>
        </div>
        <div className="text-sm text-gray-500">
          Cliquez sur les barres ou la légende pour filtrer
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            onClick={(state) => {
              if (state?.activeTooltipIndex !== undefined) {
                onBarClick(data[state.activeTooltipIndex].date, selectedStatus || undefined);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              aria-label="Day of the week"
              tick={({ x, y, payload }) => (
                <g transform={`translate(${x},${y})`}>
                  <text 
                    x={0} 
                    y={0} 
                    dy={16} 
                    textAnchor="middle" 
                    fill={payload.isToday ? '#4F46E5' : '#6B7280'}
                    className={payload.isToday ? 'font-medium' : ''}
                  >
                    {payload.value}
                  </text>
                </g>
              )}
            />
            <YAxis aria-label="Number of tasks" />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            <Bar
              dataKey="completed"
              name="Terminées"
              stackId="a"
              fill="#10B981"
              cursor="pointer"
              opacity={!selectedStatus || selectedStatus === 'completed' ? 1 : 0.3}
            />
            <Bar
              dataKey="inProgress"
              name="En cours"
              stackId="a"
              fill="#3B82F6"
              cursor="pointer"
              opacity={!selectedStatus || selectedStatus === 'inProgress' ? 1 : 0.3}
            />
            <Bar
              dataKey="pending"
              name="En attente"
              stackId="a"
              fill="#D1D5DB"
              cursor="pointer"
              opacity={!selectedStatus || selectedStatus === 'pending' ? 1 : 0.3}
            />
            <Bar
              dataKey="unassigned"
              name="Non assignées"
              stackId="a"
              fill="#FCD34D"
              cursor="pointer"
              opacity={!selectedStatus || selectedStatus === 'unassigned' ? 1 : 0.3}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
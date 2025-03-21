import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Task } from '../../store/taskStore';

interface WorkloadChartProps {
  tasks: Task[];
  onSegmentClick: (status: string) => void;
}

export default function WorkloadChart({ tasks, onSegmentClick }: WorkloadChartProps) {
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;

  const data = [
    { name: 'Terminées', value: completedTasks, color: '#10B981' },
    { name: 'En cours', value: inProgressTasks, color: '#3B82F6' },
    { name: 'En attente', value: pendingTasks, color: '#D1D5DB' }
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 shadow rounded-lg border border-gray-200">
          <p className="text-sm">
            <span className="font-medium">{payload[0].name}</span>: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center text-sm text-gray-500 py-4">
        Aucune tâche assignée
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-900 mb-2">
        Répartition des tâches
      </h4>
      <div className="relative h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={60}
              paddingAngle={2}
              dataKey="value"
              onClick={(_, index) => onSegmentClick(data[index].name.toLowerCase())}
              cursor="pointer"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-semibold text-gray-900">
              {tasks.length}
            </div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-4">
        {data.map((item, index) => (
          <button
            key={index}
            onClick={() => onSegmentClick(item.name.toLowerCase())}
            className="flex items-center text-sm hover:bg-gray-50 px-2 py-1 rounded transition-colors"
          >
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-600">{item.name} ({item.value})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
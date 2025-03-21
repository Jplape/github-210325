import { LucideIcon } from 'lucide-react';

interface AlertCardProps {
  type: 'warning' | 'urgent' | 'info';
  message: string;
  icon: LucideIcon;
  color: string;
  link: string;
}

export default function AlertCard({ message, icon: Icon, color, link }: AlertCardProps) {
  return (
    <a
      href={link}
      className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 flex items-center space-x-4"
    >
      <div className={color}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{message}</p>
      </div>
    </a>
  );
}
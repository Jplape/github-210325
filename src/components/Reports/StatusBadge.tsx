import { Check, Clock, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'completed' | 'pending' | 'in_progress';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onClick?: () => void;
}

export default function StatusBadge({ 
  status, 
  size = 'md',
  interactive = false,
  onClick 
}: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: Check,
          bg: 'bg-green-100',
          text: 'text-green-800',
          hover: 'hover:bg-green-200',
          label: 'Terminé'
        };
      case 'in_progress':
        return {
          icon: Clock,
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          hover: 'hover:bg-blue-200',
          label: 'En cours'
        };
      case 'pending':
        return {
          icon: AlertCircle,
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          hover: 'hover:bg-yellow-200',
          label: 'En attente'
        };
      default:
        return {
          icon: Clock,
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          hover: 'hover:bg-gray-200',
          label: status
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const className = `
    inline-flex items-center rounded-full
    ${config.bg} ${config.text}
    ${interactive ? `cursor-pointer ${config.hover}` : ''}
    ${sizeClasses[size]}
    transition-colors duration-150
  `;

  return (
    <div
      className={className}
      onClick={interactive ? onClick : undefined}
    >
      <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1.5`} />
      <span className="font-medium">{config.label}</span>
    </div>
  );
}
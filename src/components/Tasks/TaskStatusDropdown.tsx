import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Task } from '../../store/taskStore';

interface TaskStatusDropdownProps {
  status: Task['status'];
  onChange: (newStatus: Task['status']) => void;
}

export default function TaskStatusDropdown({ status, onChange }: TaskStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const statuses: { value: Task['status']; label: string; className: string }[] = [
    { value: 'pending', label: 'En attente', className: 'bg-gray-100 text-gray-800' },
    { value: 'in_progress', label: 'En cours', className: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Terminée', className: 'bg-green-100 text-green-800' }
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentStatus = statuses.find(s => s.value === status);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`
          px-3 py-1 rounded-full text-xs font-semibold
          inline-flex items-center space-x-1
          ${currentStatus?.className}
          transition-colors duration-150
          hover:opacity-80
        `}
      >
        <span>{currentStatus?.label}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu">
            {statuses.map((option) => (
              <button
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full text-left px-4 py-2 text-sm
                  flex items-center justify-between
                  ${status === option.value ? 'bg-gray-50' : 'hover:bg-gray-50'}
                `}
                role="menuitem"
              >
                <span className={`px-2 py-1 rounded-full text-xs ${option.className}`}>
                  {option.label}
                </span>
                {status === option.value && (
                  <Check className="h-4 w-4 text-indigo-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';
import { X } from 'lucide-react';
import { useClientStore } from '../../store/clientStore';
import { toast } from 'react-hot-toast';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface FormErrors {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export default function NewClientModal({ isOpen, onClose }: NewClientModalProps) {
  const { addClient } = useClientStore();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    phone: '',
    email: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    
    if (!formData.address?.trim()) {
      newErrors.address = 'L\'adresse est requise';
    }
    
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Le téléphone est requis';
    } else {
      // Regex for Gabonese phone numbers (+241 XX XX XX XX)
      const phoneRegex = /^\+241\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Format invalide. Ex: +241 XX XX XX XX';
      }
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        addClient({
          ...formData,
          status: 'active',
          equipment: [],
          installations: 0, // Valeur par défaut
          lastService: new Date().toISOString() // Par exemple, date actuelle
        });
        
        toast.success('Client ajouté avec succès');
        onClose();
      } catch (error) {
        toast.error('Erreur lors de l\'ajout du client');
      }
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters except '+'
    let phone = value.replace(/[^\d+]/g, '');
    
    // Ensure the number starts with +241
    if (!phone.startsWith('+241') && phone.startsWith('241')) {
      phone = '+' + phone;
    }
    
    // Format the number with spaces
    if (phone.startsWith('+241')) {
      const rest = phone.slice(4);
      const formatted = rest.match(/.{1,2}/g)?.join(' ') || rest;
      phone = '+241 ' + formatted;
    }
    
    return phone;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Nouveau client
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nom
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Adresse
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.address ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ 
                ...formData, 
                phone: formatPhoneNumber(e.target.value)
              })}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              placeholder="+241 XX XX XX XX"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
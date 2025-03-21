import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Equipment {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  status: 'functional' | 'warning' | 'broken';
  lastMaintenance?: string;
  nextMaintenance?: string;
  assignedTechnicianId?: string;
  pendingParts?: string[];
  notes?: string;
}

export interface Client {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  equipment: Equipment[];
  createdAt: string;
  updatedAt: string;
  installations: number; // Ajout de la propriété installations
  lastService: string;   // Ajout de la propriété lastService
}

interface ClientState {
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClient: (id: number, updates: Partial<Client>) => void;
  deleteClient: (id: number) => void;
  addEquipment: (clientId: number, equipment: Omit<Equipment, 'id'>) => void;
  updateEquipment: (clientId: number, equipmentId: string, updates: Partial<Equipment>) => void;
  deleteEquipment: (clientId: number, equipmentId: string) => void;
}

const initialClients: Client[] = [
  { id: 1,
    name: 'Hôpital HIAOBO',
    address: 'PK10, Libreville',
    phone: '',
    email: 'g.bouroubou@hotmail.fr',
    status: 'active',
    equipment: [
      {
        id: 'eq-1',
        name: 'IRM',
        brand: 'Siemens',
        model: 'MAGNETOM Altea',
        serialNumber: 'MAG-001',
        status: 'functional',
        lastMaintenance: '2024-02-15',
        nextMaintenance: '2024-05-15'
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    installations: 0,
    lastService: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Clinique du Parc',
    address: '456 Avenue des Champs-Élysées, 75008 Paris',
    phone: '+33 1 98 76 54 32',
    email: 'info@clinique-parc.fr',
    status: 'active',
    equipment: [
      {
        id: 'eq-2',
        name: 'Scanner',
        brand: 'GE Healthcare',
        model: 'Revolution CT',
        serialNumber: 'REV-001',
        status: 'warning',
        lastMaintenance: '2024-01-15',
        nextMaintenance: '2024-04-15',
        notes: 'Calibration nécessaire'
      }
    ],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    installations: 0,
    lastService: '2024-01-02T00:00:00Z'
  }
];

export const useClientStore = create<ClientState>()(
  persist(
    (set) => ({
      clients: initialClients,

      addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!client.name || !client.address || !client.email) {
          console.error('Invalid client data');
          return;
        }
        set((state) => {
          const now = new Date().toISOString();
          const newClient = {
            ...client,
            id: Math.max(0, ...state.clients.map((c) => c.id)) + 1,
            createdAt: now,
            updatedAt: now
          };
          return { clients: [...state.clients, newClient] };
        });
      },

      updateClient: (id: number, updates: Partial<Client>) => set((state) => {
        const clientExists = state.clients.some((client) => client.id === id);
        if (!clientExists) {
          console.error('Client not found');
          return state;
        }
        return {
          clients: state.clients.map((client) =>
            client.id === id
              ? { ...client, ...updates, updatedAt: new Date().toISOString() }
              : client
          )
        };
      }),

      deleteClient: (id: number) => set((state) => {
        const clientExists = state.clients.some((client) => client.id === id);
        if (!clientExists) {
          console.error('Client not found');
          return state;
        }
        return {
          clients: state.clients.filter((client) => client.id !== id)
        };
      }),

      addEquipment: (clientId: number, equipment: Omit<Equipment, 'id'>) => {
        if (!equipment.name || !equipment.status) {
          console.error('Invalid equipment data');
          return;
        }
        set((state) => {
          const clientExists = state.clients.some((client) => client.id === clientId);
          if (!clientExists) {
            console.error('Client not found');
            return state;
          }
          return {
            clients: state.clients.map((client) =>
              client.id === clientId
                ? {
                    ...client,
                    equipment: [
                      ...client.equipment,
                      {
                        ...equipment,
                        id: `eq-${Math.random().toString(36).substr(2, 9)}`
                      }
                    ],
                    updatedAt: new Date().toISOString()
                  }
                : client
            )
          };
        });
      },

      updateEquipment: (clientId: number, equipmentId: string, updates: Partial<Equipment>) => set((state) => {
        const client = state.clients.find((client) => client.id === clientId);
        if (!client) {
          console.error('Client not found');
          return state;
        }
        const equipmentExists = client.equipment.some((eq) => eq.id === equipmentId);
        if (!equipmentExists) {
          console.error('Equipment not found');
          return state;
        }
        return {
          clients: state.clients.map((client) =>
            client.id === clientId
              ? {
                  ...client,
                  equipment: client.equipment.map((eq) =>
                    eq.id === equipmentId
                      ? { ...eq, ...updates }
                      : eq
                  ),
                  updatedAt: new Date().toISOString()
                }
              : client
          )
        };
      }),

      deleteEquipment: (clientId: number, equipmentId: string) => set((state) => {
        const client = state.clients.find((client) => client.id === clientId);
        if (!client) {
          console.error('Client not found');
          return state;
        }
        const equipmentExists = client.equipment.some((eq) => eq.id === equipmentId);
        if (!equipmentExists) {
          console.error('Equipment not found');
          return state;
        }
        return {
          clients: state.clients.map((client) =>
            client.id === clientId
              ? {
                  ...client,
                  equipment: client.equipment.filter((eq) => eq.id !== equipmentId),
                  updatedAt: new Date().toISOString()
                }
              : client
          )
        };
      })
    }),
    {
      name: 'client-storage',
      version: 1,
    }
  )
);
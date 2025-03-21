import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Equipment, MaintenanceContract, MaintenanceHistory } from '../types/equipment';
import { addDays, isAfter, isBefore, addMonths } from 'date-fns';

interface EquipmentState {
  equipment: Equipment[];
  addEquipment: (equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  addMaintenanceHistory: (equipmentId: string, history: Omit<MaintenanceHistory, 'id'>) => void;
  updateMaintenanceContract: (equipmentId: string, contract: MaintenanceContract) => void;
  getEquipmentAlerts: () => {
    equipmentId: string;
    type: 'preventive' | 'urgent';
    message: string;
    dueDate: string;
  }[];
}

export const useEquipmentStore = create<EquipmentState>()(
  persist(
    (set, get) => ({
      equipment: [],

      addEquipment: (equipmentData) => {
        const now = new Date().toISOString();
        const newEquipment: Equipment = {
          ...equipmentData,
          id: `EQ-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now,
          maintenanceHistory: []
        };

        set((state) => ({
          equipment: [...state.equipment, newEquipment]
        }));
      },

      updateEquipment: (id, updates) => {
        set((state) => ({
          equipment: state.equipment.map((eq) =>
            eq.id === id
              ? { ...eq, ...updates, updatedAt: new Date().toISOString() }
              : eq
          )
        }));
      },

      deleteEquipment: (id) => {
        set((state) => ({
          equipment: state.equipment.filter((eq) => eq.id !== id)
        }));
      },

      addMaintenanceHistory: (equipmentId, history) => {
        const now = new Date().toISOString();
        const newHistory: MaintenanceHistory = {
          ...history,
          id: `MH-${Math.random().toString(36).substr(2, 9)}`
        };

        set((state) => ({
          equipment: state.equipment.map((eq) =>
            eq.id === equipmentId
              ? {
                  ...eq,
                  maintenanceHistory: [...eq.maintenanceHistory, newHistory],
                  updatedAt: now,
                  nextPreventiveMaintenance: history.nextMaintenanceDate
                }
              : eq
          )
        }));
      },

      updateMaintenanceContract: (equipmentId, contract) => {
        set((state) => ({
          equipment: state.equipment.map((eq) =>
            eq.id === equipmentId
              ? {
                  ...eq,
                  maintenanceContract: contract,
                  updatedAt: new Date().toISOString()
                }
              : eq
          )
        }));
      },

      getEquipmentAlerts: () => {
        const alerts: ReturnType<EquipmentState['getEquipmentAlerts']> = [];
        const now = new Date();
        const thirtyDaysFromNow = addDays(now, 30);

        get().equipment.forEach((eq) => {
          // Alerte maintenance préventive
          if (eq.nextPreventiveMaintenance) {
            const maintenanceDate = new Date(eq.nextPreventiveMaintenance);
            if (isBefore(maintenanceDate, thirtyDaysFromNow)) {
              alerts.push({
                equipmentId: eq.id,
                type: 'preventive',
                message: `Maintenance préventive requise pour ${eq.name}`,
                dueDate: eq.nextPreventiveMaintenance
              });
            }
          }

          // Alerte contrat de maintenance
          if (eq.maintenanceContract) {
            const contractEnd = new Date(eq.maintenanceContract.endDate);
            if (isBefore(contractEnd, thirtyDaysFromNow)) {
              alerts.push({
                equipmentId: eq.id,
                type: 'urgent',
                message: `Contrat de maintenance expirant pour ${eq.name}`,
                dueDate: eq.maintenanceContract.endDate
              });
            }
          }

          // Alerte équipement non fonctionnel
          if (eq.status === 'non_functional') {
            alerts.push({
              equipmentId: eq.id,
              type: 'urgent',
              message: `${eq.name} nécessite une intervention urgente`,
              dueDate: new Date().toISOString()
            });
          }
        });

        return alerts.sort((a, b) => 
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );
      }
    }),
    {
      name: 'equipment-storage',
      version: 1
    }
  )
);
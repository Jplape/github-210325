import { Intervention } from '../models/intervention.js';
import { NotFoundError } from '../utils/errors.js';

export class InterventionService {
  static async getAllInterventions() {
    return await Intervention.find().populate('team client');
  }

  static async getInterventionById(id: string) {
    const intervention = await Intervention.findById(id).populate('team client');
    if (!intervention) throw new NotFoundError('Intervention not found');
    return intervention;
  }

  static async createIntervention(data: any) {
    return await Intervention.create(data);
  }

  static async updateIntervention(id: string, data: any) {
    const intervention = await Intervention.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    }).populate('team client');
    
    if (!intervention) throw new NotFoundError('Intervention not found');
    return intervention;
  }

  static async deleteIntervention(id: string) {
    const intervention = await Intervention.findByIdAndDelete(id);
    if (!intervention) throw new NotFoundError('Intervention not found');
    return intervention;
  }
}
import { Equipment } from '../models/equipment';

export class EquipmentService {
  async create(equipmentData: any) {
    const equipment = new Equipment(equipmentData);
    return await equipment.save();
  }

  async findById(id: string) {
    return await Equipment.findById(id).exec();
  }

  async update(id: string, updateData: any) {
    return await Equipment.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).exec();
  }

  async delete(id: string) {
    return await Equipment.findByIdAndDelete(id).exec();
  }

  async findAll() {
    return await Equipment.find().exec();
  }
}
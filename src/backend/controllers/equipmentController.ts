import { Request, Response } from 'express';
import { EquipmentService } from '../services';
import { equipmentValidator } from '../validators/equipmentValidator';
import { ApiError } from '../utils/errors';

export class EquipmentController {
  private service = new EquipmentService();

  async createEquipment(req: Request, res: Response) {
    try {
      const validatedData = equipmentValidator.validateCreate(req.body);
      const equipment = await this.service.create(validatedData);
      res.status(201).json(equipment);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getEquipment(req: Request, res: Response) {
    try {
      const equipment = await this.service.findById(req.params.id);
      if (!equipment) {
        throw new ApiError(404, 'Equipment not found');
      }
      res.json(equipment);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async updateEquipment(req: Request, res: Response) {
    try {
      const validatedData = equipmentValidator.validateUpdate(req.body);
      const equipment = await this.service.update(req.params.id, validatedData);
      res.json(equipment);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async deleteEquipment(req: Request, res: Response) {
    try {
      await this.service.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async listEquipment(_req: Request, res: Response) {
    try {
      const equipment = await this.service.findAll();
      res.json(equipment);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
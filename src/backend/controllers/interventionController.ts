import { Request, Response } from 'express';
import { InterventionService } from '../services/interventionService.js';
import { validateIntervention } from '../validators/interventionValidator.js';
import { BadRequestError } from '../utils/errors.js';

export class InterventionController {
  static async getInterventions(_req: Request, res: Response) {
    const interventions = await InterventionService.getAllInterventions();
    res.json(interventions);
  }

  static async getIntervention(req: Request, res: Response) {
    const intervention = await InterventionService.getInterventionById(req.params.id);
    res.json(intervention);
  }

  static async createIntervention(req: Request, res: Response) {
    const { error } = validateIntervention(req.body);
    if (error) throw new BadRequestError(error.details[0].message);

    const intervention = await InterventionService.createIntervention(req.body);
    res.status(201).json(intervention);
  }

  static async updateIntervention(req: Request, res: Response) {
    const { error } = validateIntervention(req.body);
    if (error) throw new BadRequestError(error.details[0].message);

    const intervention = await InterventionService.updateIntervention(req.params.id, req.body);
    res.json(intervention);
  }

  static async deleteIntervention(req: Request, res: Response) {
    await InterventionService.deleteIntervention(req.params.id);
    res.status(204).send();
  }
}
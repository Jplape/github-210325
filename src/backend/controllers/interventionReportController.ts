import { Request, Response } from 'express';
import { InterventionReportService } from '../services';
import { interventionReportValidator } from '../validators/interventionReportValidator';
import { ApiError } from '../utils/errors';

export class InterventionReportController {
  private service = new InterventionReportService();

  async createReport(req: Request, res: Response) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Unauthorized');
      }
      
      const validatedData = interventionReportValidator.validateCreate(req.body);
      const report = await this.service.create(validatedData);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getReport(req: Request, res: Response) {
    try {
      const report = await this.service.findById(req.params.id);
      if (!report) {
        throw new ApiError(404, 'Report not found');
      }
      res.json(report);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async updateReport(req: Request, res: Response) {
    try {
      const validatedData = interventionReportValidator.validateUpdate(req.body);
      const report = await this.service.update(req.params.id, validatedData);
      res.json(report);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async deleteReport(req: Request, res: Response) {
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

  async listReports(_req: Request, res: Response) {
    try {
      const reports = await this.service.findAll();
      res.json(reports);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async validateReport(req: Request, res: Response) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Unauthorized');
      }

      const report = await this.service.validateReport(
        req.params.id,
        req.user.id,
        req.body.status,
        req.body.notes
      );
      res.json(report);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
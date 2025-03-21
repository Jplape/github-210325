import { ApiError } from '../utils/errors';
import Joi from 'joi';

const reportSchema = Joi.object({
  interventionId: Joi.string().required(),
  technicianId: Joi.string().required(),
  clientId: Joi.string().required(),
  equipmentId: Joi.string().required(),
  description: Joi.string().required(),
  actionsTaken: Joi.array().items(Joi.string()).required(),
  recommendations: Joi.array().items(Joi.string()).required(),
  status: Joi.string().valid('draft', 'submitted', 'approved', 'rejected').required()
});

export const interventionReportValidator = {
  validateCreate: (data: any) => {
    const { error, value } = reportSchema.validate(data);
    if (error) {
      throw new ApiError(400, error.details[0].message);
    }
    return value;
  },

  validateUpdate: (data: any) => {
    const updateSchema = reportSchema.fork(
      ['interventionId', 'technicianId', 'clientId', 'equipmentId', 
       'description', 'actionsTaken', 'recommendations', 'status'],
      (schema) => schema.optional()
    );
    
    const { error, value } = updateSchema.validate(data);
    if (error) {
      throw new ApiError(400, error.details[0].message);
    }
    return value;
  }
};
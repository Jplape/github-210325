import { ApiError } from '../utils/errors';
import Joi from 'joi';

const equipmentSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  serialNumber: Joi.string().required(),
  installationDate: Joi.date().required(),
  clientId: Joi.string().required()
});

export const equipmentValidator = {
  validateCreate: (data: any) => {
    const { error, value } = equipmentSchema.validate(data);
    if (error) {
      throw new ApiError(400, error.details[0].message);
    }
    return value;
  },

  validateUpdate: (data: any) => {
    const updateSchema = equipmentSchema.fork(
      ['name', 'type', 'serialNumber', 'installationDate', 'clientId'],
      (schema) => schema.optional()
    );
    
    const { error, value } = updateSchema.validate(data);
    if (error) {
      throw new ApiError(400, error.details[0].message);
    }
    return value;
  }
};
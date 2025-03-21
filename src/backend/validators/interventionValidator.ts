import Joi from 'joi';

export const validateIntervention = (data: any) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    status: Joi.string().valid('pending', 'in_progress', 'completed'),
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')),
    team: Joi.array().items(Joi.string()),
    client: Joi.string().required()
  });

  return schema.validate(data);
};
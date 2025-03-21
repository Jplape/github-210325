import { Schema, model } from 'mongoose';

const interventionSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  team: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  client: { type: Schema.Types.ObjectId, ref: 'Client', required: true }
}, { timestamps: true });

export const Intervention = model('Intervention', interventionSchema);
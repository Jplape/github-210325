import { Schema, model } from 'mongoose';

const interventionSchema = new Schema({
  client_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Client', 
    required: true 
  },
  start_time: { type: Date, required: true },
  end_time: { type: Date },
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'cancelled'],
    default: 'planned'
  },
  notes: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

interventionSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

export const Intervention = model('Intervention', interventionSchema);
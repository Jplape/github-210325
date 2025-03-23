import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
  serial_number: { type: String, required: true, unique: true },
  model: { type: String, required: true },
  installation_date: { type: Date, required: true },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

equipmentSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

equipmentSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

export const Equipment = mongoose.model('Equipment', equipmentSchema);
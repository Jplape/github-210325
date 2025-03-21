import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  serialNumber: { type: String, required: true, unique: true },
  purchaseDate: Date,
  warrantyExpiration: Date,
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  location: String,
  maintenanceHistory: [{
    date: Date,
    description: String,
    technician: String
  }]
}, { timestamps: true });

equipmentSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

export const Equipment = mongoose.model('Equipment', equipmentSchema);
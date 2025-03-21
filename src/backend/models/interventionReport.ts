import mongoose, { Document, ObjectId } from 'mongoose';

export interface IInterventionReport extends Document {
  interventionId: ObjectId;
  technicianId: ObjectId;
  clientId: ObjectId;
  equipmentId: ObjectId;
  description: string;
  actionsTaken: string[];
  recommendations: string[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdBy: ObjectId;
  validatedBy?: ObjectId;
  validationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const interventionReportSchema = new mongoose.Schema<IInterventionReport>({
  interventionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  technicianId: { type: mongoose.Schema.Types.ObjectId, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, required: true },
  equipmentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  description: { type: String, required: true },
  actionsTaken: { type: [String], required: true },
  recommendations: { type: [String], required: true },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
  validatedBy: { type: mongoose.Schema.Types.ObjectId },
  validationNotes: { type: String },
}, {
  timestamps: true
});

export const InterventionReport = mongoose.model<IInterventionReport>(
  'InterventionReport',
  interventionReportSchema
);
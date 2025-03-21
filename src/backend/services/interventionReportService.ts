  import { InterventionReport } from '../models/interventionReport';
import { ApiError } from '../utils/errors';
import { ObjectId } from 'mongodb';

export class InterventionReportService {
  async create(reportData: any) {
    const report = new InterventionReport(reportData);
    return await report.save();
  }

  async findById(id: string) {
    return await InterventionReport.findById(id).exec();
  }

  async update(id: string, updateData: any) {
    return await InterventionReport.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).exec();
  }

  async delete(id: string) {
    return await InterventionReport.findByIdAndDelete(id).exec();
  }

  async findAll() {
    return await InterventionReport.find().exec();
  }

  async validateReport(
    reportId: string,
    validatorId: string,
    status: string,
    notes: string
  ) {
    const report = await InterventionReport.findByIdAndUpdate(
      reportId,
      {
        $set: {
          status,
          validationDate: new Date(),
          validatorId: new ObjectId(validatorId),
          validationNotes: notes
        }
      },
      { new: true }
    ).exec();

    if (!report) {
      throw new ApiError(404, 'Report not found');
    }

    return report;
  }
}
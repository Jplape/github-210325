import express from 'express';
import { InterventionReportController } from '../controllers/interventionReportController';
import { authenticate } from '../middlewares/authenticate';

const router = express.Router();
const controller = new InterventionReportController();

router.post('/', authenticate, controller.createReport);
router.get('/', controller.listReports);
router.get('/:id', controller.getReport);
router.put('/:id', authenticate, controller.updateReport);
router.delete('/:id', authenticate, controller.deleteReport);
router.post('/:id/validate', authenticate, controller.validateReport);

export default router;
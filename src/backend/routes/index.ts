import express from 'express';
import interventionRoutes from './interventionRoutes';
import equipmentRoutes from './equipmentRoutes';

const router = express.Router();

router.use('/interventions', interventionRoutes);
router.use('/equipment', equipmentRoutes);

export default router;
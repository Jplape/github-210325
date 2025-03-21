import express from 'express';
import { InterventionController } from '../controllers/interventionController.js';

const router = express.Router();

// CRUD routes
router.get('/', InterventionController.getInterventions);
router.get('/:id', InterventionController.getIntervention);
router.post('/', InterventionController.createIntervention);
router.put('/:id', InterventionController.updateIntervention);
router.delete('/:id', InterventionController.deleteIntervention);

export default router;
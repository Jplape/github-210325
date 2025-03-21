import express from 'express';
import { EquipmentController } from '../controllers/equipmentController';
import { authenticate } from '../middlewares/authenticate';

const router = express.Router();
const controller = new EquipmentController();

router.post('/', authenticate, controller.createEquipment);
router.get('/', controller.listEquipment);
router.get('/:id', controller.getEquipment);
router.put('/:id', authenticate, controller.updateEquipment);
router.delete('/:id', authenticate, controller.deleteEquipment);

export default router;
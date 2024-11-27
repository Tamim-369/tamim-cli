import express from 'express';
import { RandomController } from './random.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { RandomValidation } from './random.validation';

const router = express.Router();

router.post(
  '/create',
  // change the role according to your preferences
  // auth(USER_ROLES.ADMIN),
  validateRequest(RandomValidation.createRandomZodSchema),
  RandomController.createRandom
);
router.get('/', RandomController.getAllRandoms);
router.get('/:id', RandomController.getRandomById);
router.patch(
  '/:id',
  // change the role according to your preferences
  // auth(USER_ROLES.ADMIN),
  validateRequest(RandomValidation.updateRandomZodSchema),
  RandomController.updateRandom
);
router.delete('/:id', auth(USER_ROLES.ADMIN), RandomController.deleteRandom);

export const RandomRoutes = router;

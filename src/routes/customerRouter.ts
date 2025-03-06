import express from 'express';
import * as customerController from '../controllers/customerController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { uploadImage } from '../middlewares/uploadMiddleware';

const router = express.Router();

router
  .route('/profile')
  .all(authenticateToken)
  .patch(
    customerController.patchCustomerProfileController
  );
router
  .route('/info')
  .all(authenticateToken)
  .patch(customerController.patchCustomerInfoController);
router
  .route('/me')
  .all(authenticateToken)
  .get(customerController.getCustomerController);
export default router;

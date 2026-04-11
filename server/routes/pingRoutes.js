import express from 'express';
import { pingAll } from '../controllers/pingController.js';

const router = express.Router();

router.post('/', pingAll);

export default router;

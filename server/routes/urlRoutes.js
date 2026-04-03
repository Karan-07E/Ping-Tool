import express from 'express';
import { addUrl, getUrls, deleteUrl } from '../controllers/urlController.js';

const router = express.Router();

router.post('/', addUrl);
router.get('/', getUrls);
router.delete('/:id', deleteUrl);

export default router;

import express from 'express';
import {
  addUrl,
  getUrls,
  deleteUrl,
  getUrlHistory,
} from '../controllers/urlController.js';

const router = express.Router();

router.post('/', addUrl);
router.get('/', getUrls);
router.delete('/:id', deleteUrl);
router.get('/:id/history', getUrlHistory);

export default router;

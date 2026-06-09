import { Router } from 'express';
import { handleSendMessage, handleGetHistory } from '../controllers/chat.controller';

const router = Router();

// POST /chat/message
router.post('/message', handleSendMessage);

// GET /chat/history/:sessionId
router.get('/history/:sessionId', handleGetHistory);

export default router;

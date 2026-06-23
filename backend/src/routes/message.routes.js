import { Router } from 'express';
import { sendMessage, getMessages } from '../controllers/message.controller.js';

const router = Router({ mergeParams: true });

router.route('/').get(getMessages).post(sendMessage);

export default router;
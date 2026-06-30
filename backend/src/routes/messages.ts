import express, { Response } from 'express';
import Message from '../models/Message';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const otherUserId = req.query.userId as string;

    if (!otherUserId) {
      res.status(400).json({ error: 'Missing userId parameter' });
      return;
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 }); // Oldest to newest

    res.json({ messages });
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      res.status(400).json({ error: 'receiverId and content are required' });
      return;
    }

    const newMessage = await Message.create({
      senderId: userId,
      receiverId,
      content,
    });

    res.status(201).json({ message: newMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

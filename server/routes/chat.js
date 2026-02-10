import express from 'express';
import prisma from '../db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/chat/conversations - Отримати всі розмови поточного користувача
router.get('/conversations', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.uid;

        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { mentor_id: userId },
                    { student_id: userId }
                ]
            },
            include: {
                messages: {
                    orderBy: { created_at: 'desc' },
                    take: 1
                },
                _count: {
                    select: {
                        messages: {
                            where: {
                                sender_id: { not: userId },
                                is_read: false
                            }
                        }
                    }
                }
            },
            orderBy: { updated_at: 'desc' }
        });

        // Мапимо лічильник у простіше поле
        const formatted = conversations.map(c => ({
            ...c,
            unreadCount: c._count.messages
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// PATCH /api/chat/read/:conversationId - Позначити повідомлення як прочитані
router.patch('/read/:conversationId', authMiddleware, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.uid;

        await prisma.message.updateMany({
            where: {
                conversation_id: parseInt(conversationId),
                sender_id: { not: userId },
                is_read: false
            },
            data: { is_read: true }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
});

// GET /api/chat/messages/:conversationId - Отримати повідомлення для розмови
router.get('/messages/:conversationId', authMiddleware, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.uid;

        // Перевірка, чи користувач є учасником цієї розмови
        const conversation = await prisma.conversation.findUnique({
            where: { id: parseInt(conversationId) }
        });

        if (!conversation || (conversation.mentor_id !== userId && conversation.student_id !== userId)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const messages = await prisma.message.findMany({
            where: { conversation_id: parseInt(conversationId) },
            orderBy: { created_at: 'asc' }
        });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// POST /api/chat/messages - Надіслати нове повідомлення
router.post('/messages', authMiddleware, async (req, res) => {
    try {
        const { conversation_id, text } = req.body;
        const userId = req.user.uid;

        if (!conversation_id || !text) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verify user is part of this conversation
        const conversation = await prisma.conversation.findUnique({
            where: { id: parseInt(conversation_id) }
        });

        if (!conversation || (conversation.mentor_id !== userId && conversation.student_id !== userId)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const newMessage = await prisma.message.create({
            data: {
                conversation_id: parseInt(conversation_id),
                sender_id: userId,
                text: text
            }
        });

        // Оновлення updated_at у розмові
        await prisma.conversation.update({
            where: { id: parseInt(conversation_id) },
            data: { updated_at: new Date() }
        });

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// POST /api/chat/conversations - Почати або знайти розмову
router.post('/conversations', authMiddleware, async (req, res) => {
    try {
        const { mentor_id, student_id } = req.body;
        const userId = req.user.uid;

        if (!mentor_id || !student_id) {
            return res.status(400).json({ error: 'Missing participant IDs' });
        }

        // Перевірка, чи поточний користувач є одним з учасників
        if (userId !== mentor_id && userId !== student_id) {
            return res.status(403).json({ error: 'Illegal conversation creation' });
        }

        // Знайти існуючу або створити нову
        const conversation = await prisma.conversation.upsert({
            where: {
                mentor_id_student_id: {
                    mentor_id,
                    student_id
                }
            },
            update: {}, // No changes if exists
            create: {
                mentor_id,
                student_id
            }
        });

        res.status(200).json(conversation);
    } catch (error) {
        console.error('Error starting conversation:', error);
        res.status(500).json({ error: 'Failed to start conversation' });
    }
});

export default router;

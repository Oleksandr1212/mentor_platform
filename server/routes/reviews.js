import express from 'express';
import prisma from '../db.js';

const router = express.Router();

// GET /api/reviews/:mentorId (Отримати відгуки)
router.get('/:mentorId', async (req, res) => {
    try {
        const { mentorId } = req.params;
        const reviews = await prisma.review.findMany({
            where: { mentor_id: mentorId },
            orderBy: { created_at: 'desc' }
        });
        res.json(reviews);
    } catch (error) {
        console.error('Fetch Reviews Error:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// POST /api/reviews (Створити відгук)
router.post('/', async (req, res) => {
    try {
        const { mentor_id, author_id, author_name, rating, text } = req.body;

        if (!mentor_id || !author_name || !rating) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newReview = await prisma.review.create({
            data: {
                mentor_id,
                author_id,
                author_name,
                rating: parseInt(rating),
                text
            }
        });

        res.status(201).json(newReview);
    } catch (error) {
        console.error('Add Review Error:', error);
        res.status(500).json({ error: 'Failed to add review' });
    }
});

export default router;

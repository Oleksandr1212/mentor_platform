import express from 'express';
import prisma from '../db.js';

const router = express.Router();

/**
 * GET /api/availability
 * Params: timeMin, timeMax, mentorId
 * Returns: Array of busy intervals { start, end }
 */
router.get('/', async (req, res) => {
    try {
        const { timeMin, timeMax, mentorId } = req.query;

        if (!timeMin || !timeMax) {
            return res.status(400).json({ error: 'Missing timeMin or timeMax parameters' });
        }

        // Конвертація рядків у об'єкти Date для порівняння
        const start = new Date(timeMin);
        const end = new Date(timeMax);

        // Створення фільтрів запиту (використовуючи snake_case, як визначено в схемі)
        const whereClause = {
            start_time: { lt: end }, 
            end_time: { gt: start }, 
            status: { notIn: ['cancelled', 'rejected'] } 
        };

        // Якщо вказано mentorId, фільтруємо за ментором. 
        if (mentorId) {
            whereClause.mentor_id = mentorId;
        }

        const bookings = await prisma.booking.findMany({
            where: whereClause,
            select: {
                start_time: true,
                end_time: true
            }
        });

        // Мапимо у формат { start, end }, необхідний для фронтенду
        const busySlots = bookings.map(b => ({
            start: b.start_time,
            end: b.end_time
        }));

        res.json({
            message: 'Availability fetched successfully',
            data: busySlots
        });
    } catch (error) {
        console.error('Availability Error:', error);
        res.status(500).json({
            error: 'Failed to fetch availability',
            details: error.message
        });
    }
});

export default router;

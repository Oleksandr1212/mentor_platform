import express from 'express';
import { createCalendarEvent } from '../services/googleCalendar.js';
import prisma from '../db.js';

const router = express.Router();

// POST /api/bookings (Створення бронювання)
router.post('/', async (req, res) => {
    try {
        const { mentor_id, student_id, student_name, summary, description, startTime, endTime, duration_hours } = req.body;

        if (!mentor_id || !student_id || !startTime || !endTime) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Розрахунок часу завершення на основі тривалості (якщо вказана)
        const durationHours = duration_hours || 1;
        const calculatedEndTime = endTime || new Date(new Date(startTime).getTime() + durationHours * 60 * 60 * 1000).toISOString();

        // Збереження в PostgreSQL зі статусом pending (поки без події в календарі)
        const newBooking = await prisma.booking.create({
            data: {
                mentor_id,
                student_id,
                student_name,
                start_time: new Date(startTime),
                end_time: new Date(calculatedEndTime),
                duration_hours: durationHours,
                summary,
                description,
                status: 'pending'
            }
        });

        res.status(201).json({
            message: 'Booking request created successfully',
            booking: newBooking
        });
    } catch (error) {
        console.error('=== Booking Error ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Request body:', req.body);
        res.status(500).json({
            error: 'Failed to create booking',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// PATCH /api/bookings/:id/approve - Ментор підтверджує бронювання
router.patch('/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;

        // Спочатку отримуємо повні деталі бронювання
        const booking = await prisma.booking.findUnique({
            where: { id: parseInt(id) }
        });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({ error: 'Booking is not pending' });
        }

        // Генерація посилання на Jitsi Meet
        const safeName = booking.student_name ? booking.student_name.replace(/\s+/g, '') : 'Student';
        const uniqueRoomId = `Mentorship-${safeName}-${Date.now().toString().slice(-6)}`;
        const meetLink = `https://meet.jit.si/${uniqueRoomId}`;

        // Створення події в Google Calendar
        try {
            await createCalendarEvent({
                summary: booking.summary || 'Mentorship Session',
                description: `${booking.description || `Session with ${booking.student_name}`}\n\nJoin meeting: ${meetLink}`,
                startTime: booking.start_time.toISOString(),
                endTime: booking.end_time.toISOString(),
            });
        } catch (calError) {
            console.warn('Calendar event creation failed:', calError.message);
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: parseInt(id) },
            data: {
                status: 'approved',
                meet_link: meetLink,
                mentor_response_at: new Date()
            }
        });

        res.json({
            message: 'Booking approved successfully',
            meetLink: updatedBooking.meet_link,
            booking: updatedBooking
        });
    } catch (error) {
        console.error('Approve booking error:', error);
        res.status(500).json({
            error: 'Failed to approve booking',
            details: error.message
        });
    }
});

// PATCH /api/bookings/:id/reject - Ментор відхиляє бронювання
router.patch('/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const booking = await prisma.booking.findUnique({
            where: { id: parseInt(id) }
        });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({ error: 'Booking is not pending' });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: parseInt(id) },
            data: {
                status: 'rejected',
                rejection_reason: reason || 'No reason provided',
                mentor_response_at: new Date()
            }
        });

        res.json({
            message: 'Booking rejected successfully',
            booking: updatedBooking
        });
    } catch (error) {
        console.error('Reject booking error:', error);
        res.status(500).json({
            error: 'Failed to reject booking',
            details: error.message
        });
    }
});

// PATCH /api/bookings/:id/cancel - Користувач скасовує бронювання
router.patch('/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await prisma.booking.findUnique({
            where: { id: parseInt(id) }
        });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Дозволяємо скасування, якщо статус pending або approved
        if (!['pending', 'approved'].includes(booking.status)) {
            return res.status(400).json({ error: 'Booking cannot be cancelled' });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: parseInt(id) },
            data: {
                status: 'cancelled',
                mentor_response_at: new Date()
            }
        });

        res.json({
            message: 'Booking cancelled successfully',
            booking: updatedBooking
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            error: 'Failed to cancel booking',
            details: error.message
        });
    }
});

// GET /api/bookings/mentor/:mentorId - Отримати всі бронювання для ментора
router.get('/mentor/:mentorId', async (req, res) => {
    try {
        const { mentorId } = req.params;
        const { status } = req.query; // Optional filter by status

        const where = { mentor_id: mentorId };
        if (status) {
            where.status = status;
        }

        const bookings = await prisma.booking.findMany({
            where,
            orderBy: { created_at: 'desc' }
        });

        res.json(bookings);
    } catch (error) {
        console.error('Get mentor bookings error:', error);
        res.status(500).json({
            error: 'Failed to fetch bookings',
            details: error.message
        });
    }
});

// GET /api/bookings/student/:studentId - Отримати всі бронювання для студента
router.get('/student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;

        const bookings = await prisma.booking.findMany({
            where: { student_id: studentId },
            orderBy: { created_at: 'desc' }
        });

        res.json(bookings);
    } catch (error) {
        console.error('Get student bookings error:', error);
        res.status(500).json({
            error: 'Failed to fetch bookings',
            details: error.message
        });
    }
});

export default router;

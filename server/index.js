import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Базовий тестовий маршрут
app.get('/', (req, res) => {
    res.send('Backend Server is Running!');
});

import bookingsRouter from './routes/bookings.js';
import availabilityRouter from './routes/availability.js';
import reviewsRouter from './routes/reviews.js';
import chatRouter from './routes/chat.js';
import './services/firebaseAdmin.js'; // Ініціалізація firebase-admin

// ...

app.use('/api/bookings', bookingsRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/chat', chatRouter);

// API маршрути будуть додані тут
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

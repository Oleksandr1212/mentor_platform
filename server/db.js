import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Перевірка з'єднання при запуску
prisma.$connect()
    .then(() => {
        console.log('✅ Prisma connected to PostgreSQL successfully');
    })
    .catch(err => {
        console.error('❌ Prisma Connection Error:', err.message);
        console.log('💡 Підказка: Перевірте чи вірний DATABASE_URL у файлі .env та чи запущена база.');
    });

export default prisma;

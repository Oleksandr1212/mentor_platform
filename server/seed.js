import admin from './services/firebaseAdmin.js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Re-initialize with proper credentials if available in .env
if (process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_CLIENT_EMAIL) {
    if (admin.apps.length) {
        await Promise.all(admin.apps.map(app => app.delete()));
    }
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID || 'mentor-2a62e',
            clientEmail: process.env.GOOGLE_CLIENT_EMAIL.replace(/"/g, '').trim(),
            privateKey: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '').trim(),
        })
    });
}

const db = admin.firestore();
const auth = admin.auth();

const mentors = [
    {
        email: 'mentor_alex@test.com',
        password: 'password123',
        name: 'Олександр Технічний',
        role: 'mentor',
        specialization: 'Frontend',
        roleTitle: 'Frontend Developer',
        bio: 'Досвідчений розробник на React та Vue. Допоможу з архітектурою та сучасним JS.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        experience: '5 років у Big Tech',
        languages: ['Українська', 'English']
    },
    {
        email: 'mentor_olena@test.com',
        password: 'password123',
        name: 'Олена Дизайнова',
        role: 'mentor',
        specialization: 'Design',
        roleTitle: 'Senior UI/UX Designer',
        bio: 'Створюю інтерфейси, які люблять люди. Навчу бачити деталі та працювати у Figma.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olena',
        experience: '7 років у продуктовому дизайні',
        languages: ['Українська', 'Polski']
    }
];

const students = [
    {
        email: 'student_ivan@test.com',
        password: 'password123',
        name: 'Іван Завзятий',
        role: 'student',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan'
    }
];

async function seed() {
    console.log('🚀 Починаємо заповнення бази даних...');

    for (const userData of [...mentors, ...students]) {
        try {
            console.log(`👤 Створення користувача: ${userData.email}`);
            
            // 1. Створення в Firebase Auth
            let userRecord;
            try {
                userRecord = await auth.getUserByEmail(userData.email);
                console.log(`ℹ️ Користувач ${userData.email} вже існує, оновлюємо дані.`);
            } catch (error) {
                if (error.code === 'auth/user-not-found') {
                    userRecord = await auth.createUser({
                        email: userData.email,
                        password: userData.password,
                        displayName: userData.name,
                        photoURL: userData.avatar
                    });
                } else {
                    throw error;
                }
            }

            // 2. Збереження у Firestore
            const { password, ...firestoreData } = userData;
            await db.collection('users').doc(userRecord.uid).set({
                uid: userRecord.uid,
                createdAt: new Date().toISOString(),
                ...firestoreData
            }, { merge: true });

            console.log(`✅ Користувач ${userData.name} успішно доданий/оновлений.`);

        } catch (error) {
            console.error(`❌ Помилка при створенні ${userData.email}:`, error.message);
        }
    }

    console.log('✨ Заповнення завершено!');
    process.exit(0);
}

seed().catch(err => {
    console.error('💥 Критична помилка:', err);
    process.exit(1);
});

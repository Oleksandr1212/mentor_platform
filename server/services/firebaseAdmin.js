import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Для локальної розробки ми можемо ініціалізувати лише ID проекту
// якщо нам не потрібно виконувати адміністративні завдання, які вимагають облікового запису служби.
// verifyIdToken зазвичай працює, якщо встановлено ID проекту.
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'mentor-2a62e'
    });
}

export default admin;

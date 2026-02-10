/**
 * bookingStore.js
 * Сервіс для управління бронюваннями за допомогою Firebase Firestore.
 */

import { db, auth } from '../lib/firebase';
import { notificationStore } from './notificationStore';
import API_URL from './config';
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    onSnapshot,
    orderBy,
    Timestamp,
    doc,
    updateDoc,
    getDoc
} from 'firebase/firestore';

export const bookingStore = {
    /**
     * Підписується на оновлення бронювань у реальному часі для конкретного користувача.
     * @param {string} userId - UID поточного користувача.
     * @param {string} role - 'student' або 'mentor'.
     * @param {function} callback - Функція, яка викликається з оновленими бронюваннями.
     * @returns {function} Функція відписки.
     */
    subscribeToBookings: (userId, role, callback) => {
        if (!userId) return () => { };

        const fieldToQuery = role === 'mentor' ? 'mentorId' : 'studentId';
        const q = query(
            collection(db, 'bookings'),
            where(fieldToQuery, '==', userId),
            orderBy('startTime', 'desc') // Вимагає індексу Firestore, використовуйте простіший запит, якщо не вдається
        );

        // Запасний запит, якщо індекс відсутній (часто трапляється в dev)
        // Ми можемо сортувати на стороні клієнта, якщо потрібно, але спробуємо спочатку чистий запит.
        // Наразі залишимо просто, щоб уникнути помилок індексу відразу:
        const simpleQ = query(
            collection(db, 'bookings'),
            where(fieldToQuery, '==', userId)
        );

        return onSnapshot(simpleQ, (snapshot) => {
            const bookings = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Допоміжна функція для форматування дати для UI, якщо потрібно, зазвичай краще робити в компоненті
                date: new Date(doc.data().startTime).toLocaleDateString(),
                time: new Date(doc.data().startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));

            // сортування на стороні клієнта, щоб уникнути проблем із затримкою створення індексу
            bookings.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

            callback(bookings);
        }, (error) => {
            console.error("Booking subscription error:", error);
        });
    },

    /**
     * Зберігає нове бронювання через API (для календаря), потім зберігає у Firestore.
     */
    addBooking: async (bookingData, userRawData) => {
        try {
            const durationHours = bookingData.duration_hours || 1;
            const startTime = (bookingData.date && bookingData.time)
                ? new Date(`${bookingData.date}T${bookingData.time}`).toISOString()
                : new Date().toISOString();
            const endTime = (bookingData.date && bookingData.time)
                ? new Date(new Date(`${bookingData.date}T${bookingData.time}`).getTime() + durationHours * 60 * 60 * 1000).toISOString()
                : new Date(Date.now() + durationHours * 3600000).toISOString();

            console.log('Sending booking request:', {
                mentor_id: bookingData.mentor.id,
                student_id: userRawData?.uid || auth.currentUser?.uid,
                startTime,
                endTime
            });

            // 1. Створення запиту на бронювання через Backend API (статус pending)
            const response = await fetch(`${API_URL}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mentor_id: bookingData.mentor.id,
                    student_id: userRawData?.uid || auth.currentUser?.uid,
                    student_name: userRawData?.name || auth.currentUser?.displayName || 'Student',
                    summary: bookingData.message || 'Mentorship Session',
                    description: `Booking with ${bookingData.mentor.name}`,
                    startTime,
                    endTime,
                    duration_hours: durationHours
                }),
            });

            if (!response.ok) throw new Error('Failed to create booking');

            const apiResult = await response.json();

            // 2. Також синхронізуємо Firestore для оновлень дашборду в реальному часі
            const docRef = await addDoc(collection(db, 'bookings'), {
                studentId: auth.currentUser?.uid,
                studentName: userRawData?.name || auth.currentUser?.displayName || 'Student',
                studentAvatar: userRawData?.avatar || auth.currentUser?.photoURL,

                mentorId: bookingData.mentor.id,
                mentorName: bookingData.mentor.name,
                mentorRole: bookingData.mentor.role,
                mentorAvatar: bookingData.mentor.avatar,

                startTime,
                duration_hours: durationHours,
                format: bookingData.format || 'video',
                message: bookingData.message || '',
                status: 'pending', // Змінено з 'confirmed'
                meetLink: null, // Буде додано після підтвердження
                createdAt: new Date().toISOString(),
                postgresId: apiResult.booking.id // Посилання на запис Postgres
            });

            // 3. Створення сповіщення для ментора
            await notificationStore.addNotification({
                recipientId: bookingData.mentor.id,
                senderId: auth.currentUser?.uid,
                type: 'session',
                title: 'Нове бронювання',
                message: `${userRawData?.name || 'Студент'} забронював сесію на ${new Date(startTime).toLocaleDateString()} о ${new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
                bookingId: docRef.id,
                isRead: false
            });

            return {
                id: docRef.id,
                ...apiResult
            };
        } catch (error) {
            console.error('Booking creation error:', error);
            throw error;
        }
    },

    fetchAvailability: async (date, mentorId) => {
        // ... API виконує те саме, або перенесіть на чистий фронтенд, якщо б ми використовували доступність Firestore
        try {
            const timeMin = new Date(date);
            timeMin.setHours(0, 0, 0, 0);
            const timeMax = new Date(date);
            timeMax.setHours(23, 59, 59, 999);

            let url = `${API_URL}/api/availability?timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}`;
            if (mentorId) {
                url += `&mentorId=${mentorId}`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch availability');
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Availability Error:', error);
            return [];
        }
    },

    /**
     * Підтвердити бронювання (лише ментор)
     */
    approveBooking: async (firestoreId, postgresId) => {
        try {
            if (!postgresId) throw new Error('Missing PostgreSQL ID for booking confirmation');

            const response = await fetch(`${API_URL}/api/bookings/${postgresId}/approve`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error('Failed to approve booking');
            const result = await response.json();

            // Оновлення Firestore для синхронізації
            const bookingRef = doc(db, 'bookings', firestoreId);
            const bookingSnap = await getDoc(bookingRef);
            const bookingData = bookingSnap.data();

            await updateDoc(bookingRef, {
                status: 'approved',
                meetLink: result.meetLink || null,
                mentor_response_at: new Date().toISOString()
            });

            // Сповіщення студента
            await notificationStore.addNotification({
                recipientId: bookingData.studentId,
                senderId: auth.currentUser?.uid,
                type: 'session',
                title: 'Бронювання підтверджено',
                message: `Ментор ${bookingData.mentorName} підтвердив вашу сесію!`,
                bookingId: firestoreId,
                isRead: false
            });

            return result;
        } catch (error) {
            console.error('Approve booking error:', error);
            throw error;
        }
    },

    /**
     * Відхилити бронювання (лише ментор)
     */
    rejectBooking: async (firestoreId, postgresId, reason) => {
        try {
            if (!postgresId) throw new Error('Missing PostgreSQL ID for booking rejection');

            const response = await fetch(`${API_URL}/api/bookings/${postgresId}/reject`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });

            if (!response.ok) throw new Error('Failed to reject booking');
            const result = await response.json();

            // Оновлення Firestore для синхронізації
            const bookingRef = doc(db, 'bookings', firestoreId);
            const bookingSnap = await getDoc(bookingRef);
            const bookingData = bookingSnap.data();

            await updateDoc(bookingRef, {
                status: 'rejected',
                rejection_reason: reason || 'No reason provided',
                mentor_response_at: new Date().toISOString()
            });

            // Сповіщення студента
            await notificationStore.addNotification({
                recipientId: bookingData.studentId,
                senderId: auth.currentUser?.uid,
                type: 'session',
                title: 'Бронювання відхилено',
                message: `Ментор ${bookingData.mentorName} відхилив вашу сесію. Причина: ${reason || 'не вказана'}.`,
                bookingId: firestoreId,
                isRead: false
            });

            return result;
        } catch (error) {
            console.error('Reject booking error:', error);
            throw error;
        }
    },

    /**
     * Скасувати бронювання (студент або ментор)
     */
    cancelBooking: async (firestoreId, postgresId) => {
        try {
            if (!postgresId) throw new Error('Missing PostgreSQL ID for booking cancellation');

            const response = await fetch(`${API_URL}/api/bookings/${postgresId}/cancel`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error('Failed to cancel booking');
            const result = await response.json();

            // Оновлення Firestore для синхронізації
            const bookingRef = doc(db, 'bookings', firestoreId);
            const bookingSnap = await getDoc(bookingRef);
            const bookingData = bookingSnap.data();

            await updateDoc(bookingRef, {
                status: 'cancelled',
                mentor_response_at: new Date().toISOString()
            });

            // Сповіщення іншої сторони
            const isStudent = auth.currentUser?.uid === bookingData.studentId;
            const recipientId = isStudent ? bookingData.mentorId : bookingData.studentId;
            const senderName = isStudent ? (bookingData.studentName || 'Студент') : (bookingData.mentorName || 'Ментор');

            await notificationStore.addNotification({
                recipientId,
                senderId: auth.currentUser?.uid,
                type: 'session',
                title: 'Бронювання скасовано',
                message: `${senderName} скасував заплановану сесію.`,
                bookingId: firestoreId,
                isRead: false
            });

            return result;
        } catch (error) {
            console.error('Cancel booking error:', error);
            throw error;
        }
    },

    /**
     * Отримати одне бронювання за ID
     */
    getBookingById: async (bookingId) => {
        try {
            if (!bookingId) return null;
            const docRef = doc(db, 'bookings', bookingId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    date: new Date(data.startTime).toLocaleDateString(),
                    time: new Date(data.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    duration: `${data.duration_hours || 1} год`
                };
            }
            return null;
        } catch (error) {
            console.error("Error getting booking:", error);
            return null;
        }
    },

    /**
     * Отримати всі бронювання для ментора
     */
    getBookingsByMentor: async (mentorId, status = null) => {
        try {
            const url = status
                ? `${API_URL}/api/bookings/mentor/${mentorId}?status=${status}`
                : `${API_URL}/api/bookings/mentor/${mentorId}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch mentor bookings');
            return await response.json();
        } catch (error) {
            console.error('Get mentor bookings error:', error);
            return [];
        }
    },

    /**
     * Отримати всі бронювання для студента
     */
    getBookingsByStudent: async (studentId) => {
        try {
            const response = await fetch(`${API_URL}/api/bookings/student/${studentId}`);
            if (!response.ok) throw new Error('Failed to fetch student bookings');
            return await response.json();
        } catch (error) {
            console.error('Get student bookings error:', error);
            return [];
        }
    }
};

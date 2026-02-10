/**
 * notificationStore.js
 * Сервіс для управління сповіщеннями за допомогою Firebase Firestore.
 */

import { db } from '../lib/firebase';
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    orderBy,
    doc,
    updateDoc,
    deleteDoc,
    writeBatch,
    getDocs
} from 'firebase/firestore';

export const notificationStore = {
    /**
     * Підписується на оновлення сповіщень у реальному часі для конкретного користувача.
     * @param {string} userId - UID поточного користувача.
     * @param {function} callback - Функція, яка викликається з оновленими сповіщеннями.
     * @returns {function} Функція відписки.
     */
    subscribeToNotifications: (userId, callback) => {
        if (!userId) return () => { };

        let unsubscribeCurrent = null;

        const startSubscription = (useOrder) => {
            const q = useOrder
                ? query(collection(db, 'notifications'), where('recipientId', '==', userId), orderBy('createdAt', 'desc'))
                : query(collection(db, 'notifications'), where('recipientId', '==', userId));

            unsubscribeCurrent = onSnapshot(q, (snapshot) => {
                const notifications = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                if (!useOrder) {
                    // Ручне сортування на стороні клієнта як запасний варіант
                    notifications.sort((a, b) => {
                        const dateA = a.createdAt ? new Date(a.createdAt) : 0;
                        const dateB = b.createdAt ? new Date(b.createdAt) : 0;
                        return dateB - dateA;
                    });
                }
                callback(notifications);
            }, (error) => {
                if (useOrder) {
                    console.warn("Notification subscription (ordered) failed, falling back to unordered:", error.message);
                    if (unsubscribeCurrent) unsubscribeCurrent();
                    startSubscription(false);
                } else {
                    console.error("Critical notification error:", error);
                }
            });
        };

        startSubscription(true);

        return () => {
            if (unsubscribeCurrent) unsubscribeCurrent();
        };
    },

    /**
     * Додає нове сповіщення у Firestore.
     */
    addNotification: async (notification) => {
        try {
            await addDoc(collection(db, 'notifications'), {
                ...notification,
                isRead: false,
                createdAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error adding notification:", error);
        }
    },

    /**
     * Позначає сповіщення як прочитане.
     */
    markAsRead: async (notificationId) => {
        try {
            const docRef = doc(db, 'notifications', notificationId);
            await updateDoc(docRef, { isRead: true });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    },

    /**
     * Позначає всі сповіщення для користувача як прочитані.
     */
    markAllAsRead: async (userId) => {
        try {
            const q = query(
                collection(db, 'notifications'),
                where('recipientId', '==', userId),
                where('isRead', '==', false)
            );
            const snapshot = await getDocs(q);
            const batch = writeBatch(db);
            snapshot.docs.forEach((doc) => {
                batch.update(doc.ref, { isRead: true });
            });
            await batch.commit();
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    },

    /**
     * Видаляє сповіщення.
     */
    deleteNotification: async (notificationId) => {
        try {
            const docRef = doc(db, 'notifications', notificationId);
            await deleteDoc(docRef);
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    }
};

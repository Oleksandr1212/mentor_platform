import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { notificationStore } from '../services/notificationStore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const signup = async (email, password, name, role, additionalData = {}) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = result.user;

        // Оновлення відображуваного імені
        await updateProfile(newUser, { displayName: name });

        // Збереження додаткових даних користувача (роль + додаткові поля) у Firestore
        await setDoc(doc(db, 'users', newUser.uid), {
            uid: newUser.uid,
            name: name,
            email: email,
            role: role,
            avatar: additionalData.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
            createdAt: new Date().toISOString(),
            ...additionalData // Поширення додаткових полів, таких як спеціалізація, біографія тощо
        });

        // Оновлення Auth Profile photoURL за замовчуванням
        if (!newUser.photoURL) {
            await updateProfile(newUser, {
                photoURL: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
            });
        }

        // Встановлення початкового стану вручну, щоб уникнути очікування
        setUser(newUser);
        setUserData({ role, name, email, ...additionalData });

        // Додавання вітального сповіщення
        await notificationStore.addNotification({
            recipientId: newUser.uid,
            senderId: 'system',
            type: 'system',
            title: 'Вітаємо у MentorLink! 👋',
            message: `Раді вас бачити, ${name || 'Користувач'}. Тепер ви можете повноцінно користуватися платформою.`,
            isRead: false
        });

        return newUser;
    };

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    const updateUserData = async (newData) => {
        if (!user) {
            console.error("Update failed: No authenticated user found.");
            return;
        }

        try {
            console.log("Updating profile for UID:", user.uid, newData);

            // 1. Підготовка даних для Firestore - уникаємо включення великого надлишкового стану, якщо це можливо
            // Але якщо аватар є, ми його залишаємо. Переконуємося, що не поширюємо null.
            const baseData = userData || {};
            const docData = {
                ...baseData,
                ...newData,
                updatedAt: new Date().toISOString()
            };

            // 2. Оновлення Firestore
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, docData, { merge: true });
            console.log("Firestore update success");

            // 3. Оновлення Firebase Auth Profile, якщо ім'я або аватар змінилися
            // Це добре для частин програми, які використовують user.displayName/photoURL
            if (newData.name || newData.avatar) {
                try {
                    await updateProfile(user, {
                        displayName: newData.name || user.displayName,
                        photoURL: newData.avatar || user.photoURL
                    });
                    console.log("Auth profile update success");
                } catch (authError) {
                    console.warn("Auth profile sync failed (non-critical):", authError);
                }
            }

            // 4. Оновлення локального стану
            setUserData(docData);
            return true;
        } catch (error) {
            console.error("Critical error in updateUserData:", error);
            // Повторне викидання помилки, щоб компонент UI міг її показати
            throw error;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            try {
                setUser(currentUser);
                if (currentUser && currentUser.uid) {
                    // Отримання даних користувача з Firestore з додатковою безпекою
                    try {
                        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                        if (userDoc.exists()) {
                            setUserData(userDoc.data());
                        } else {
                            // Запасний варіант для користувачів без документа Firestore
                            setUserData({
                                uid: currentUser.uid,
                                name: currentUser.displayName || 'Користувач',
                                email: currentUser.email,
                                role: 'student'
                            });
                        }
                    } catch (docError) {
                        console.warn("Could not fetch user profile from Firestore:", docError);
                    }
                } else {
                    setUserData(null);
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
                // Опціонально обробляємо стан помилки тут
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const value = {
        user,
        userData,
        signup,
        login,
        logout,
        updateUserData
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white' }}>
                    Loading...
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

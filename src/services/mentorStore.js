import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

class MentorStore {
    _mapMentorData(id, data, studentsMap = null) {
        // Обробка мов (може бути рядок "Ukr, Eng" або масив ["Ukr", "Eng"])
        let languages = data.languages || ['Українська'];
        if (typeof languages === 'string') {
            languages = languages.split(',').map(l => l.trim());
        }

        const studentsCount = studentsMap && studentsMap.has(id)
            ? studentsMap.get(id).size
            : (data.studentsCount || 0);

        // Маппінг навичок: підтримка нових об'єктів {name, level} або застарілих рядків
        let skills = data.skills || [];
        if (data.specialization && skills.length === 0) {
            skills = data.specialization.split(',').map(s => ({ name: s.trim(), level: 'Advanced' }));
        }
        // Переконатися, що всі навички є об'єктами
        skills = skills.map(s => typeof s === 'string' ? { name: s, level: 'Advanced' } : s);

        return {
            id,
            ...data,
            name: data.name || 'Анонімний Ментор',
            role: data.roleTitle || 'Ментор',
            specialization: data.specialization || '',
            company: data.company || 'Експерт',
            experience: data.experience || 'Досвідчений фахівець',
            experienceYears: data.experienceYears || 0,
            location: data.location || 'Україна',
            about: data.about || 'Інформація незабаром з\'явиться.',
            rating: data.rating || 5.0,
            reviewsCount: data.reviewsCount || 0,
            languages: languages,
            skills: skills,
            price: data.price || 0,
            students: studentsCount,
            avatar: data.avatar || ''
        };
    }

    async getMentors() {
        try {
            const q = query(
                collection(db, 'users'),
                where('role', '==', 'mentor')
            );
            const querySnapshot = await getDocs(q);
            const bookingsSnapshot = await getDocs(collection(db, 'bookings'));

            const mentorStudentsMap = new Map();
            bookingsSnapshot.docs.forEach(doc => {
                const booking = doc.data();
                if (booking.mentorId && booking.studentId) {
                    if (!mentorStudentsMap.has(booking.mentorId)) {
                        mentorStudentsMap.set(booking.mentorId, new Set());
                    }
                    mentorStudentsMap.get(booking.mentorId).add(booking.studentId);
                }
            });

            return querySnapshot.docs.map(doc => this._mapMentorData(doc.id, doc.data(), mentorStudentsMap));
        } catch (error) {
            console.error("Error fetching mentors:", error);
            return [];
        }
    }

    async getMentorById(id) {
        try {
            const docRef = doc(db, 'users', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().role === 'mentor') {
                const q = query(collection(db, 'bookings'), where('mentorId', '==', id));
                const bookingsSnap = await getDocs(q);
                const uniqueStudents = new Set(bookingsSnap.docs.map(d => d.data().studentId));

                // Створення тимчасової мапи для повторного використання логіки маппінгу
                const tempMap = new Map([[id, uniqueStudents]]);
                return this._mapMentorData(docSnap.id, docSnap.data(), tempMap);
            }
            return null;
        } catch (error) {
            console.error("Error fetching mentor by ID:", error);
            return null;
        }
    }
}

export const mentorStore = new MentorStore();

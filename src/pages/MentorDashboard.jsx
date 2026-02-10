import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Layout, Users, Calendar, Settings, LogOut,
    Wallet, Clock, Star, CheckCircle, XCircle, ChevronDown, Check
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import IconBox from '../components/ui/IconBox';
import { bookingStore } from '../services/bookingStore';
import { reviewStore } from '../services/reviewStore';
import StatCard from '../components/ui/StatCard';
import SectionHeader from '../components/ui/SectionHeader';
import './MentorDashboard.css';


import { useAuth } from '../context/AuthContext';

const MentorDashboard = () => {
    const { logout, user, userData, updateUserData } = useAuth();
    const fileInputRef = React.useRef(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
    const skillsContainerRef = React.useRef(null);
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        name: userData?.name || 'Ментор',
        role: userData?.roleTitle || 'Senior Frontend Dev',
        avatar: userData?.avatar || user?.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        specialization: userData?.specialization || '',
        experience: userData?.experience || '',
        about: userData?.about || '',
        price: userData?.price || '1200',
        experienceYears: userData?.experienceYears || '0',
        languages: userData?.languages || 'Українська',
        company: userData?.company || '',
        location: userData?.location || '',
        studentsCount: userData?.studentsCount || '0'
    });

    // Оновлення профілю при завантаженні userData
    useEffect(() => {
        if (userData) {
            setProfile(prev => ({
                ...prev,
                name: userData.name || prev.name,
                role: userData.roleTitle || prev.role,
                avatar: userData.avatar || prev.avatar,
                specialization: userData.specialization || prev.specialization,
                experience: userData.experience || prev.experience,
                about: userData.about || prev.about,
                price: userData.price || prev.price,
                experienceYears: userData.experienceYears || prev.experienceYears,
                languages: userData.languages || prev.languages,
                company: userData.company || prev.company,
                location: userData.location || prev.location,
                studentsCount: userData.studentsCount || prev.studentsCount
            }));
        }
    }, [userData]);

    // Обробка кліку поза межами випадаючих списків навичок
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (skillsContainerRef.current && !skillsContainerRef.current.contains(event.target)) {
                setOpenDropdownIndex(null);
            }
        };

        if (openDropdownIndex !== null) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdownIndex]);

    const [isSaving, setIsSaving] = useState(false);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Перевірка розміру (макс 700КБ для безпеки Base64)
            if (file.size > 700 * 1024) {
                alert('Фото занадто велике. Будь ласка, оберіть файл менше 700КБ.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = async (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        try {
            const updatedData = {
                name: profile.name,
                roleTitle: profile.role,
                price: parseInt(profile.price) || 0,
                experience: profile.experience,
                experienceYears: parseInt(profile.experienceYears) || 0,
                about: profile.about,
                avatar: profile.avatar || '',
                languages: profile.languages,
                company: profile.company,
                location: profile.location,
                skills: profile.skills || []
            };

            await updateUserData(updatedData);
            alert('Профіль ментора успішно оновлено!');
        } catch (error) {
            console.error('Failed to update mentor profile:', error);
            if (error.code === 'permission-denied') {
                alert('Помилка доступу: Перевірте налаштування бази даних Firestore (Rules).');
            } else if (error.message?.includes('too large')) {
                alert('Помилка: Дані занадто великі. Спробуйте інше фото.');
            } else {
                alert('Помилка оновлення профілю: ' + (error.message || 'невідома помилка'));
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // Підписка на оновлення Firestore для МЕНТОРА
        const unsubscribe = bookingStore.subscribeToBookings(user.uid, 'mentor', (data) => {
            setBookings(data);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const [mentorStats, setMentorStats] = useState({
        rating: 0,
        reviewsCount: 0
    });

    useEffect(() => {
        if (!user?.uid) return;

        const fetchStats = async () => {
            const fetchedRating = await reviewStore.getAverageRating(user.uid);
            const fetchedCount = await reviewStore.getReviewCount(user.uid);

            setMentorStats({
                rating: fetchedRating,
                reviewsCount: fetchedCount
            });
        };
        fetchStats();
    }, [user?.uid]);

    // Фільтрація активних бронювань (підтверджених/затверджених) для статистики та майбутніх сесій
    const confirmedBookings = bookings.filter(b => b.status === 'approved' || b.status === 'confirmed');

    // Отримання списку унікальних студентів з усіх бронювань
    const studentsMap = new Map();
    bookings.forEach(b => {
        // відфільтрувати недійсні ID студентів, якщо такі є
        if (b.studentId) {
            if (!studentsMap.has(b.studentId)) {
                studentsMap.set(b.studentId, {
                    id: b.studentId,
                    name: b.studentName || 'Студент',
                    avatar: b.studentAvatar,
                    sessions: 0
                });
            }
            // Враховувати лише активні сесії (підтверджені/затверджені)
            if (b.status === 'approved' || b.status === 'confirmed') {
                studentsMap.get(b.studentId).sessions += 1;
            }
        }
    });
    const studentsList = Array.from(studentsMap.values()).filter(s => s.sessions > 0);
    const uniqueStudents = studentsList.length;

    // Знайти найближчу майбутню сесію
    const now = new Date();
    const upcomingSessions = confirmedBookings
        .filter(b => new Date(b.startTime) > now)
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    const latestBooking = upcomingSessions[0] || null;

    // Розрахунок статистики
    const totalHours = confirmedBookings.reduce((sum, b) => sum + (Number(b.duration_hours) || 1), 0);
    const hourlyRate = Number(profile.price) || 1200;

    const stats = [
        { label: 'Заробіток (місяць)', value: `${(totalHours * hourlyRate).toLocaleString()} ₴`, icon: Wallet, color: 'green' },
        { label: 'Годин викладання', value: totalHours.toString(), icon: Clock, color: 'blue' },
        { label: 'Активні студенти', value: uniqueStudents.toString(), icon: Users, color: 'purple' },
        { label: `Рейтинг (${mentorStats.reviewsCount} відгуків)`, value: mentorStats.rating.toString(), icon: Star, color: 'yellow' },
    ];

    // Надати порожній масив за замовчуванням, якщо бронювання невизначені (хоча useState за замовчуванням [])
    const safeBookings = bookings || [];

    const pendingBookings = safeBookings.filter(b => b.status === 'pending');
    const activeBookings = safeBookings.filter(b => b.status === 'approved' || b.status === 'confirmed');

    const handleApprove = async (firestoreId, postgresId) => {
        try {
            await bookingStore.approveBooking(firestoreId, postgresId);
            // Оптимістичне оновлення або очікування підписки
            alert('Бронювання підтверджено!');
        } catch (error) {
            console.error('Error approving:', error);
            alert('Помилка підтвердження: ' + error.message);
        }
    };

    const handleReject = async (firestoreId, postgresId) => {
        const reason = prompt('Вкажіть причину відмови:');
        if (reason === null) return; // Cancelled

        try {
            await bookingStore.rejectBooking(firestoreId, postgresId, reason);
            alert('Бронювання відхилено.');
        } catch (error) {
            console.error('Error rejecting:', error);
            alert('Помилка відхилення: ' + error.message);
        }
    };

    const getTabTitle = () => {
        switch (activeTab) {
            case 'overview': return `Вітаємо назад, ${profile.name.split(' ')[0]}! 👋`;
            case 'students': return 'Мої студенти';
            case 'schedule': return 'Мій розклад викладання';
            case 'settings': return 'Налаштування профілю ментора';
            default: return 'Кабінет ментора';
        }
    };

    return (
        <div className="dashboard-container fade-in">
            {/* Sidebar */}
            <aside className="dashboard-sidebar glass">
                <div className="sidebar-header">
                    <div className="user-profile-summary">
                        <Avatar src={profile.avatar} size="xlarge" borderColor="primary" />
                        <div className="user-info">
                            <span className="user-name">{profile.name}</span>
                            <span className="user-status">{profile.role}</span>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <Layout size={20} /> Огляд
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
                        onClick={() => setActiveTab('students')}
                    >
                        <Users size={20} /> Мої студенти
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`}
                        onClick={() => setActiveTab('schedule')}
                    >
                        <Calendar size={20} /> Розклад
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <Settings size={20} /> Налаштування
                    </button>
                </nav>

                <button className="nav-item logout" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Вийти</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                <header className="dashboard-header">
                    <h2 className="header-title">{getTabTitle()}</h2>
                    <div className="header-actions">
                        {/* Notifications Bell removed per request */}
                    </div>
                </header>

                <div className="dashboard-content">
                    {activeTab === 'overview' && (
                        <div className="overview-tab animate-in">


                            <div className="stats-grid">
                                {stats.map((stat, index) => (
                                    <StatCard
                                        key={index}
                                        label={stat.label}
                                        value={stat.value}
                                        icon={stat.icon}
                                        color={stat.color}
                                    />
                                ))}
                            </div>

                            <div className="content-grid-2-1">
                                {/* Requests Section */}
                                <div className="requests-section">
                                    <SectionHeader
                                        title="Нові запити"
                                        actionLabel="Всі запити"
                                    />
                                    <div className="requests-list">
                                        {pendingBookings.length > 0 ? pendingBookings.map(req => (
                                            <Card key={req.id} variant="glass" className="request-card">
                                                <div className="request-info">
                                                    <Avatar src={req.studentAvatar} size="medium" />
                                                    <div>
                                                        <h4 className="font-bold">{req.studentName}</h4>
                                                        <p className="text-sm text-secondary">{req.summary || 'Менторська сесія'}</p>
                                                        <div className="flex gap-2 text-xs text-accent">
                                                            <span>{new Date(req.startTime).toLocaleDateString()}</span>
                                                            <span>{new Date(req.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            <span>({req.duration_hours || 1} год)</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="request-actions">
                                                    <Button
                                                        variant="ghost"
                                                        size="small"
                                                        className="btn-icon-only text-green"
                                                        onClick={() => handleApprove(req.id, req.postgresId)}
                                                    >
                                                        <CheckCircle size={20} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="small"
                                                        className="btn-icon-only text-red"
                                                        onClick={() => handleReject(req.id, req.postgresId)}
                                                    >
                                                        <XCircle size={20} />
                                                    </Button>
                                                </div>
                                            </Card>
                                        )) : (
                                            <div className="empty-requests">
                                                Нових запитів немає
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Upcoming Session */}
                                <div className="upcoming-section">
                                    <div className="section-header">
                                        <h3>Найближча сесія</h3>
                                        <Button variant="ghost" size="small" onClick={() => setActiveTab('schedule')}>Всі сесії</Button>
                                    </div>
                                    {latestBooking ? (
                                        <Card variant="glass" className="upcoming-card card-hover">
                                            <div className="session-time">
                                                <span className="time-badge">
                                                    {new Date(latestBooking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="date-badge">
                                                    {new Date(latestBooking.startTime).toLocaleDateString([], { month: 'long', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="session-details">
                                                <h4>{latestBooking.message || 'Менторська сесія'}</h4>
                                                <div className="mentor-mini-profile">
                                                    <Avatar src={latestBooking.studentAvatar} size="small" />
                                                    <div>
                                                        <span className="name">{latestBooking.studentName || 'Студент'}</span>
                                                        <span className="role">Студент</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {latestBooking.meetLink ? (
                                                <Button
                                                    variant="glow"
                                                    className="join-btn"
                                                    onClick={() => window.open(latestBooking.meetLink, '_blank')}
                                                >
                                                    Приєднатися до зустрічі
                                                </Button>
                                            ) : (
                                                <Button variant="glow" className="join-btn" onClick={() => navigate(`/session/${latestBooking.id}`)}>
                                                    Почати
                                                </Button>
                                            )}
                                        </Card>
                                    ) : (
                                        <Card variant="glass" className="no-bookings-card">
                                            <p>У вас поки немає запланованих сесій.</p>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'students' && (
                        <div className="students-tab animate-in">
                            <div className="students-grid">
                                {studentsList.length > 0 ? (
                                    studentsList.map((student) => (
                                        <Card key={student.id} variant="glass" className="student-card card-hover">
                                            <div className="student-card-content">
                                                <Avatar src={student.avatar} size="large" />
                                                <div className="student-info">
                                                    <h3>{student.name}</h3>
                                                    <p className="status">Активний студент</p>
                                                    <div className="stats-mini">
                                                        <span><strong>{student.sessions}</strong> сесій</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="student-card-actions">
                                                <Button variant="ghost" size="small" fullWidth>Чат</Button>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="empty-state glass pd-large text-center">
                                        <Users size={48} className="opacity-20 mb-2" />
                                        <p>У вас поки немає активних студентів.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="settings-tab animate-in">
                            <Card variant="glass" className="pd-large">
                                <form className="settings-form" onSubmit={handleSaveChanges}>
                                    <div className="form-section">
                                        <div className="avatar-edit mb-4">
                                            <Avatar src={profile.avatar} size="xlarge" />
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handlePhotoChange}
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="small"
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                Змінити фото
                                            </Button>
                                        </div>
                                        <div className="grid-2 gap-4">
                                            <div className="form-group">
                                                <label>Повне ім'я</label>
                                                <input
                                                    type="text"
                                                    value={profile.name}
                                                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                                                    className="glass-input"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Професійна роль</label>
                                                <input
                                                    type="text"
                                                    value={profile.role}
                                                    onChange={e => setProfile({ ...profile, role: e.target.value })}
                                                    className="glass-input"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group full-width mb-4">
                                                <label className="flex-between">
                                                    Навички та рівень
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="small"
                                                        onClick={() => {
                                                            const currentSkills = profile.skills || [];
                                                            setProfile({
                                                                ...profile,
                                                                skills: [...currentSkills, { name: '', level: 'Advanced' }]
                                                            });
                                                        }}
                                                    >
                                                        + Додати навичку
                                                    </Button>
                                                </label>
                                                <div className="skills-edit-container mt-2" ref={skillsContainerRef}>
                                                    {(profile.skills || []).map((skill, idx) => (
                                                        <div key={idx} className="skill-edit-row mb-3">
                                                            <div className="skill-input-group">
                                                                <input
                                                                    type="text"
                                                                    value={skill.name}
                                                                    onChange={e => {
                                                                        const newSkills = [...profile.skills];
                                                                        newSkills[idx].name = e.target.value;
                                                                        setProfile({ ...profile, skills: newSkills });
                                                                    }}
                                                                    className="glass-input"
                                                                    placeholder="Назва навички (React)"
                                                                />
                                                            </div>
                                                            <div className="level-select-group">
                                                                <div className="custom-level-dropdown">
                                                                    <button
                                                                        type="button"
                                                                        className={`level-dropdown-trigger ${openDropdownIndex === idx ? 'active' : ''}`}
                                                                        onClick={() => setOpenDropdownIndex(openDropdownIndex === idx ? null : idx)}
                                                                    >
                                                                        <span>{skill.level}</span>
                                                                        <ChevronDown size={16} className={openDropdownIndex === idx ? 'rotate' : ''} />
                                                                    </button>

                                                                    {openDropdownIndex === idx && (
                                                                        <div className="level-dropdown-menu">
                                                                            {['Intermediate', 'Advanced', 'Expert'].map(level => (
                                                                                <div
                                                                                    key={level}
                                                                                    className={`level-dropdown-item ${skill.level === level ? 'active' : ''}`}
                                                                                    onClick={() => {
                                                                                        const newSkills = [...profile.skills];
                                                                                        newSkills[idx].level = level;
                                                                                        setProfile({ ...profile, skills: newSkills });
                                                                                        setOpenDropdownIndex(null);
                                                                                    }}
                                                                                >
                                                                                    {level}
                                                                                    {skill.level === level && <Check size={14} />}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="remove-skill-btn"
                                                                onClick={() => {
                                                                    const newSkills = profile.skills.filter((_, i) => i !== idx);
                                                                    setProfile({ ...profile, skills: newSkills });
                                                                }}
                                                            >
                                                                &times;
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {(!profile.skills || profile.skills.length === 0) && (
                                                        <div className="empty-skills-message">
                                                            Навички ще не додані.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Компанія</label>
                                                <input
                                                    type="text"
                                                    value={profile.company}
                                                    onChange={e => setProfile({ ...profile, company: e.target.value })}
                                                    className="glass-input"
                                                    placeholder="Напр. DataSolutions"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Локація</label>
                                                <input
                                                    type="text"
                                                    value={profile.location}
                                                    onChange={e => setProfile({ ...profile, location: e.target.value })}
                                                    className="glass-input"
                                                    placeholder="Напр. Одеса, Україна"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Років досвіду (цифрою)</label>
                                                <input
                                                    type="number"
                                                    value={profile.experienceYears}
                                                    onChange={e => setProfile({ ...profile, experienceYears: e.target.value })}
                                                    className="glass-input"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Мови спілкування</label>
                                                <input
                                                    type="text"
                                                    value={profile.languages}
                                                    onChange={e => setProfile({ ...profile, languages: e.target.value })}
                                                    className="glass-input"
                                                    placeholder="Українська, Англійська"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Ціна за сесію (грн)</label>
                                                <input
                                                    type="number"
                                                    value={profile.price}
                                                    onChange={e => setProfile({ ...profile, price: e.target.value })}
                                                    className="glass-input"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group mt-4">
                                            <label>Про мене (коротко про навчання)</label>
                                            <textarea
                                                value={profile.about}
                                                onChange={e => setProfile({ ...profile, about: e.target.value })}
                                                className="glass-input"
                                                rows="2"
                                                placeholder="Напр. Навчаю практичному застосуванню Python..."
                                            ></textarea>
                                        </div>
                                        <div className="form-group mt-4">
                                            <label>Детальний досвід (про професійний шлях)</label>
                                            <textarea
                                                value={profile.experience}
                                                onChange={e => setProfile({ ...profile, experience: e.target.value })}
                                                className="glass-input"
                                                rows="4"
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="form-actions mt-6">
                                        <Button variant="glow" type="submit" disabled={isSaving}>
                                            {isSaving ? 'Збереження...' : 'Зберегти зміни'}
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div className="schedule-tab animate-in">
                            <div className="schedule-list">
                                {activeBookings.length > 0 ? activeBookings.map((booking) => (
                                    <Card key={booking.id} variant="glass" className="schedule-item-card mb-4">
                                        <div className="schedule-time-col">
                                            <span className="date">{new Date(booking.startTime).toLocaleDateString([], { month: 'long', day: 'numeric' })}</span>
                                            <span className="time">
                                                {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {' - '}
                                                {new Date(new Date(booking.startTime).getTime() + (booking.duration_hours || 1) * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="schedule-info-col">
                                            <div className="user-mini">
                                                <Avatar src={booking.studentAvatar} size="small" />
                                                <span>{booking.studentName || 'Студент'}</span>
                                            </div>
                                            <h4>{booking.message || 'Консультація'}</h4>
                                            {booking.meetLink && (
                                                <a
                                                    href={booking.meetLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="meet-link-inline"
                                                    style={{ fontSize: '0.875rem', color: 'var(--color-primary)', marginTop: '0.5rem', display: 'inline-block' }}
                                                >
                                                    🎥 Google Meet
                                                </a>
                                            )}
                                        </div>
                                        <div className="schedule-actions-col">
                                            <Badge variant={booking.format === 'video' ? 'primary' : 'glass'}>
                                                {booking.format === 'video' ? 'Відео' : 'Чат'}
                                            </Badge>
                                            <Button
                                                variant="glow"
                                                size="small"
                                                onClick={() => navigate(`/session/${booking.id}`)}
                                            >
                                                Деталі
                                            </Button>
                                        </div>
                                    </Card>
                                )) : (
                                    <div className="empty-state glass pd-large">
                                        <Calendar size={48} className="opacity-20 mb-2" />
                                        <p>Студенти ще не забронювали час з вами. Перевірте профіль!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {!['overview', 'schedule', 'students', 'settings'].includes(activeTab) && (
                        <div className="placeholder-tab glass">
                            <h3>Цей розділ ще в розробці</h3>
                            <p>Ми працюємо над тим, щоб зробити його ідеальним для вас.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MentorDashboard;

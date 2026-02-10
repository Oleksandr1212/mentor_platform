import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Layout, BookOpen, Clock, Calendar, Settings, LogOut,
    ChevronRight, MoreVertical, Star, Shield
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import IconBox from '../components/ui/IconBox';
import { bookingStore } from '../services/bookingStore';
import { mentorStore } from '../services/mentorStore';
import StatCard from '../components/ui/StatCard';
import SectionHeader from '../components/ui/SectionHeader';
import './StudentDashboard.css';

import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
    const { logout, user, userData, updateUserData } = useAuth();
    const fileInputRef = React.useRef(null);
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        name: userData?.name || 'Студент',
        role: 'Student',
        avatar: userData?.avatar || user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        email: userData?.email || user?.email || '',
        bio: userData?.bio || 'Додайте інформацію про себе...'
    });

    // Оновлення профілю при завантаженні userData
    useEffect(() => {
        if (userData) {
            setProfile(prev => ({
                ...prev,
                name: userData.name || prev.name,
                email: userData.email || prev.email,
                avatar: userData.avatar || prev.avatar,
                bio: userData.bio || prev.bio
            }));
        }
    }, [userData]);

    const [isSaving, setIsSaving] = useState(false);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Перевірка розміру (Base64 ~33% більше, тому 700КБ файл ~930КБ рядок)
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
            await updateUserData({
                name: profile.name,
                bio: profile.bio || '',
                avatar: profile.avatar || ''
            });
            alert('Профіль успішно оновлено!');
        } catch (error) {
            console.error('Failed to update profile:', error);
            if (error.code === 'permission-denied') {
                alert('Помилка доступу: Перевірте налаштування бази даних Firestore (Rules).');
            } else if (error.message?.includes('too large')) {
                alert('Помилка: Дані занадто великі для збереження. Спробуйте інше фото.');
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

        // Підписка на оновлення Firestore
        const unsubscribe = bookingStore.subscribeToBookings(user.uid, 'student', (data) => {
            setBookings(data);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Показувати лише майбутні підтверджені бронювання як "останні"
    const latestBooking = bookings
        .filter(b => b.status === 'approved' || b.status === 'confirmed')
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0] || null;

    // Допоміжна функція розрахунку годин (лише підтверджені/затверджені)
    const hoursLearned = bookings
        .filter(b => b.status === 'approved' || b.status === 'confirmed')
        .reduce((acc, b) => acc + (b.duration_hours || 1), 0);

    // Статистика
    const stats = [
        { label: 'Годин навчання', value: hoursLearned.toString(), icon: Clock, color: 'blue' },
        { label: 'Завершено сесій', value: bookings.length.toString(), icon: BookOpen, color: 'purple' },
    ];

    const [recommendedMentors, setRecommendedMentors] = useState([]);

    useEffect(() => {
        const fetchRecommended = async () => {
            try {
                const all = await mentorStore.getMentors();
                // Перемішати або просто взяти перші 3 на даний момент
                setRecommendedMentors(all.slice(0, 3));
            } catch (error) {
                console.error("Error fetching recommended mentors:", error);
            }
        };
        fetchRecommended();
    }, []);

    const getTabTitle = () => {
        switch (activeTab) {
            case 'overview': {
                const nameToUse = userData?.name || profile.name || 'Студент';
                const firstName = nameToUse.split(' ')[0];
                return `Вітаємо назад, ${firstName}! 👋`;
            }
            case 'mentors': return 'Мої ментори';
            case 'schedule': return 'Мій розклад занять';
            case 'settings': return 'Налаштування профілю';
            default: return 'Особистий кабінет';
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
                            <span className="user-name">{userData?.name || profile.name}</span>
                            <span className="user-status">Студент</span>
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
                        className={`nav-item ${activeTab === 'mentors' ? 'active' : ''}`}
                        onClick={() => setActiveTab('mentors')}
                    >
                        <BookOpen size={20} /> Мої ментори
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
                        {/* Дії видалено за запитом, залишено місце для майбутніх специфічних dash-actions */}
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
                                {/* Upcoming Session */}
                                <div className="upcoming-section">
                                    <SectionHeader
                                        title="Найближча сесія"
                                        actionLabel="Всі сесії"
                                        onAction={() => setActiveTab('schedule')}
                                    />
                                    {latestBooking ? (
                                        <Card variant="glass" className="upcoming-card card-hover">
                                            <div className="session-time">
                                                <span className="time-badge">{latestBooking.duration}</span>
                                                <span className="date-badge">{latestBooking.date}, {latestBooking.time}</span>
                                            </div>
                                            <div className="session-details">
                                                <h4>{latestBooking.message || 'Тема сесії: Консультація'}</h4>
                                                <div className="mentor-mini-profile">
                                                    <Avatar src={latestBooking.mentor?.avatar || latestBooking.mentorAvatar} size="small" />
                                                    <div>
                                                        <span className="name">{latestBooking.mentor?.name || latestBooking.mentorName}</span>
                                                        <span className="role">{latestBooking.mentor?.role || latestBooking.mentorRole}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="glow" className="join-btn" onClick={() => navigate(`/session/${latestBooking.id}`)}>
                                                Приєднатися
                                            </Button>
                                        </Card>
                                    ) : (
                                        <Card variant="glass" className="no-bookings-card">
                                            <p>У вас поки немає запланованих сесій.</p>
                                            <Button variant="outline" size="small" onClick={() => navigate('/mentors')} className="mt-2">
                                                Знайти ментора
                                            </Button>
                                        </Card>
                                    )}
                                </div>

                                {/* Recommended Mentors */}
                                <div className="recommended-section">
                                    <div className="section-header">
                                        <h3>Рекомендовані ментори</h3>
                                    </div>
                                    <div className="recommended-list">
                                        {recommendedMentors.map(mentor => (
                                            <Card
                                                key={mentor.id}
                                                variant="glass"
                                                className="mini-mentor-card card-hover cursor-pointer"
                                                onClick={() => navigate(`/mentor/${mentor.id}`)}
                                            >
                                                <Avatar src={mentor.avatar} size="medium" />
                                                <div className="mini-card-info">
                                                    <h4>{mentor.name}</h4>
                                                    <p>{mentor.role} at {mentor.company}</p>
                                                    <div className="mini-rating">
                                                        <Star size={12} fill="#fbbf24" color="#fbbf24" />
                                                        <span>{mentor.rating}</span>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="small" className="icon-only-btn" onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/mentor/${mentor.id}`);
                                                }}>
                                                    <ChevronRight size={16} />
                                                </Button>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'mentors' && (
                        <div className="mentors-tab animate-in">
                            <div className="mentors-grid">
                                {bookings.length > 0 ? (
                                    // Унікальні ментори з бронювань
                                    Array.from(new Set(bookings.map(b => b.mentor?.id || b.mentorId))).map(mentorId => {
                                        const booking = bookings.find(b => (b.mentor?.id || b.mentorId) === mentorId);
                                        const mentor = booking.mentor || {
                                            id: booking.mentorId,
                                            name: booking.mentorName,
                                            role: booking.mentorRole,
                                            avatar: booking.mentorAvatar
                                        };
                                        return (
                                            <Card key={mentorId} variant="glass" className="mentor-card-full card-hover">
                                                <div className="mentor-card-main">
                                                    <Avatar src={mentor.avatar} size="large" />
                                                    <div className="mentor-info">
                                                        <h3>{mentor.name}</h3>
                                                        <p className="role">{mentor.role}</p>
                                                        <div className="rating">
                                                            <Star size={16} fill="#fbbf24" color="#fbbf24" />
                                                            <span>5.0</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mentor-card-footer">
                                                    <Button variant="glow" size="small" fullWidth onClick={() => navigate(`/mentor/${mentorId}`)}>
                                                        Профіль
                                                    </Button>
                                                </div>
                                            </Card>
                                        );
                                    })
                                ) : (
                                    <div className="empty-state glass pd-large text-center">
                                        <BookOpen size={48} className="opacity-20 mb-2" />
                                        <p>Ви ще не займалися з менторами.</p>
                                        <Button variant="outline" className="mt-4" onClick={() => navigate('/mentors')}>
                                            Знайти ментора
                                        </Button>
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
                                                <label>Email</label>
                                                <input
                                                    type="email"
                                                    value={profile.email}
                                                    disabled
                                                    className="glass-input opacity-50"
                                                    title="Email не можна змінити"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group mt-4">
                                            <label>Про себе</label>
                                            <textarea
                                                value={profile.bio}
                                                onChange={e => setProfile({ ...profile, bio: e.target.value })}
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
                            <div className="schedule-groups">
                                {/* Група: Підтверджені/Майбутні */}
                                <section className="schedule-section">
                                    <h3 className="section-subtitle">Підтверджені сесії</h3>
                                    {bookings.filter(b => b.status === 'approved' || b.status === 'confirmed').length > 0 ? (
                                        bookings.filter(b => b.status === 'approved' || b.status === 'confirmed').map((booking) => (
                                            <Card key={booking.id} variant="glass" className="schedule-item-card approved mb-4">
                                                <div className="schedule-time-col">
                                                    <span className="date">{booking.date}</span>
                                                    <span className="time">{booking.time}</span>
                                                </div>
                                                <div className="schedule-info-col">
                                                    <div className="user-mini">
                                                        <Avatar src={booking.mentor?.avatar || booking.mentorAvatar} size="small" />
                                                        <span>{booking.mentor?.name || booking.mentorName}</span>
                                                    </div>
                                                    <h4>{booking.message || 'Консультація'}</h4>
                                                </div>
                                                <div className="schedule-actions-col">
                                                    <Badge variant="primary">Підтверджено</Badge>
                                                    {booking.meetLink && (
                                                        <Button
                                                            variant="glow"
                                                            size="small"
                                                            onClick={() => window.open(booking.meetLink, '_blank')}
                                                        >
                                                            Приєднатися
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="small" onClick={() => navigate(`/session/${booking.id}`)}>Деталі</Button>
                                                </div>
                                            </Card>
                                        ))
                                    ) : <p className="empty-text">У вас немає підтверджених сесій.</p>}
                                </section>

                                {/* Група: Очікують */}
                                <section className="schedule-section mt-6">
                                    <h3 className="section-subtitle">Очікують підтвердження</h3>
                                    {bookings.filter(b => b.status === 'pending').length > 0 ? (
                                        bookings.filter(b => b.status === 'pending').map((booking) => (
                                            <Card key={booking.id} variant="glass" className="schedule-item-card pending mb-4">
                                                <div className="schedule-time-col">
                                                    <span className="date">{booking.date}</span>
                                                    <span className="time">{booking.time}</span>
                                                </div>
                                                <div className="schedule-info-col">
                                                    <div className="user-mini">
                                                        <Avatar src={booking.mentor?.avatar || booking.mentorAvatar} size="small" />
                                                        <span>{booking.mentor?.name || booking.mentorName}</span>
                                                    </div>
                                                    <h4>{booking.message || 'Консультація'}</h4>
                                                </div>
                                                <div className="schedule-actions-col">
                                                    <Badge variant="glass">В очікуванні</Badge>
                                                    <Button variant="ghost" size="small" onClick={() => navigate(`/session/${booking.id}`)}>Деталі</Button>
                                                </div>
                                            </Card>
                                        ))
                                    ) : <p className="empty-text">Немає запитів в очікуванні.</p>}
                                </section>

                                {/* Група: Відхилені */}
                                <section className="schedule-section mt-6">
                                    <h3 className="section-subtitle">Відхилені / Скасовані</h3>
                                    {bookings.filter(b => b.status === 'rejected' || b.status === 'cancelled').length > 0 ? (
                                        bookings.filter(b => b.status === 'rejected' || b.status === 'cancelled').map((booking) => (
                                            <Card key={booking.id} variant="glass" className="schedule-item-card rejected mb-4">
                                                <div className="schedule-time-col">
                                                    <span className="date">{booking.date}</span>
                                                    <span className="time">{booking.time}</span>
                                                </div>
                                                <div className="schedule-info-col">
                                                    <div className="user-mini">
                                                        <Avatar src={booking.mentor?.avatar || booking.mentorAvatar} size="small" />
                                                        <span>{booking.mentor?.name || booking.mentorName}</span>
                                                    </div>
                                                    <h4>{booking.message || 'Консультація'}</h4>
                                                    {booking.rejection_reason && (
                                                        <p className="rejection-reason">Причина: {booking.rejection_reason}</p>
                                                    )}
                                                </div>
                                                <div className="schedule-actions-col">
                                                    <Badge variant="outline">{booking.status === 'rejected' ? 'Відхилено' : 'Скасовано'}</Badge>
                                                    <Button variant="ghost" size="small" onClick={() => navigate(`/session/${booking.id}`)}>Деталі</Button>
                                                </div>
                                            </Card>
                                        ))
                                    ) : null}
                                </section>
                            </div>
                        </div>
                    )}

                    {!['overview', 'schedule', 'mentors', 'settings'].includes(activeTab) && (
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

export default StudentDashboard;

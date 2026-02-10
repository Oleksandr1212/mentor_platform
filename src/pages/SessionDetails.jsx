import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar, Clock, Video, MessageSquare, ArrowLeft,
    MoreVertical, ExternalLink, AlertCircle
} from 'lucide-react';
import { bookingStore } from '../services/bookingStore';
import { useAuth } from '../context/AuthContext';
import { messageStore } from '../services/messageStore';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import './SessionDetails.css';

const SessionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const data = await bookingStore.getBookingById(id);
                console.log('Booking details loaded:', data);
                setBooking(data);
            } catch (error) {
                console.error("Failed to fetch booking details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [id]);

    if (loading) return (
        <div className="loading-state container">
            <div className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>Завантаження деталей...</div>
        </div>
    );

    if (!booking) {
        return (
            <div className="error-state container">
                <Card variant="glass" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px' }}>
                    <AlertCircle size={48} color="var(--error)" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ marginBottom: '1rem' }}>Зустріч не знайдена</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>ID: {id}</p>
                    <Button variant="glow" onClick={() => navigate('/dashboard')}>
                        Повернутися до дашборду
                    </Button>
                </Card>
            </div>
        );
    }

    const handleCancel = async () => {
        if (window.confirm('Ви впевнені, що хочете скасувати цю зустріч?')) {
            try {
                console.log('Attempting to cancel booking:', id, booking.postgresId);
                // Переконатися, що postgresId доступний, інакше сповістити користувача
                if (!booking.postgresId) {
                    alert('Помилка: відсутній системний ID бронювання. Спробуйте створити нове бронювання.');
                    return;
                }

                await bookingStore.cancelBooking(id, booking.postgresId);
                // Перенаправити на dashboard/schedule після успішного скасування
                navigate('/dashboard');
            } catch (error) {
                console.error('Cancel failed:', error);
                alert(`Не вдалося скасувати зустріч: ${error.message}`);
            }
        }
    };

    const { date, time, duration, format, message, status } = booking;

    const mentor = {
        name: booking.mentorName,
        avatar: booking.mentorAvatar,
        role: booking.mentorRole
    };

    const student = {
        name: booking.studentName,
        avatar: booking.studentAvatar
    };

    return (
        <div className="session-details-page container fade-in">
            <header className="details-header" style={{ marginBottom: '2rem' }}>
                <Button variant="ghost" onClick={() => navigate(-1)} className="back-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={20} /> Назад
                </Button>
                <div className="header-actions">
                    <Button variant="ghost" className="icon-btn">
                        <MoreVertical size={20} />
                    </Button>
                </div>
            </header>

            <div className="details-grid">
                <div className="details-main">
                    <Card variant="glass" style={{ padding: '2.5rem' }}>
                        <div className="status-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <Badge variant={status === 'confirmed' || status === 'approved' ? 'primary' : status === 'cancelled' ? 'glass' : 'glass'}>
                                {status === 'confirmed' || status === 'approved' ? 'Підтверджено' : status === 'cancelled' ? 'Скасовано' : status === 'rejected' ? 'Відхилено' : 'В очікуванні'}
                            </Badge>
                            <span className="session-id" style={{ opacity: 0.5, fontFamily: 'monospace' }}>ID: #{id?.toString().slice(-6)}</span>
                        </div>

                        <h1 className="session-title" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1 }}>
                            {message || 'Консультація з розробки'}
                        </h1>

                        <div className="participants-row" style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', marginBottom: '2rem' }}>
                            <div className="participant" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Avatar src={mentor?.avatar} size="medium" />
                                <div className="info" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span className="label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Ментор</span>
                                    <span className="name" style={{ fontWeight: 600, fontSize: '1.1rem' }}>{mentor?.name || 'Ментор'}</span>
                                </div>
                            </div>
                            <div className="v-divider" style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }}></div>
                            <div className="participant" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Avatar src={student.avatar} size="medium" />
                                <div className="info" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span className="label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Студент</span>
                                    <span className="name" style={{ fontWeight: 600, fontSize: '1.1rem' }}>{student.name}</span>
                                </div>
                            </div>
                        </div>

                        <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div className="info-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem' }}>
                                <Calendar size={20} color="var(--primary)" />
                                <div>
                                    <span className="label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Дата</span>
                                    <span className="value" style={{ fontWeight: 600 }}>{date}</span>
                                </div>
                            </div>
                            <div className="info-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem' }}>
                                <Clock size={20} color="var(--primary)" />
                                <div>
                                    <span className="label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Час</span>
                                    <span className="value" style={{ fontWeight: 600 }}>{time} ({duration})</span>
                                </div>
                            </div>
                            <div className="info-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem' }}>
                                {format === 'video' ? <Video size={20} color="var(--primary)" /> : <MessageSquare size={20} color="var(--primary)" />}
                                <div>
                                    <span className="label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Формат</span>
                                    <span className="value" style={{ fontWeight: 600 }}>{format === 'video' ? 'Відеодзвінок' : 'Текстовий чат'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="message-section glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
                            <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Мета зустрічі</h4>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{message || 'Обговорення загальних питань розробки, кар\'єрного росту та технічного стеку.'}</p>
                        </div>
                    </Card>
                </div>

                <div className="details-sidebar">
                    <Card variant="glass" style={{ padding: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Дії</h3>
                        <div className="action-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {format === 'video' && (
                                <Button
                                    variant="glow"
                                    style={{ width: '100%' }}
                                    onClick={() => {
                                        if (booking.meetLink) {
                                            window.open(booking.meetLink, '_blank');
                                        } else {
                                            alert('Посилання ще не згенеровано');
                                        }
                                    }}
                                >
                                    <Video size={18} style={{ marginRight: '8px' }} /> Приєднатися до зустрічі
                                </Button>
                            )}

                            <Button
                                variant={format === 'video' ? 'outline' : 'glow'}
                                style={{ width: '100%' }}
                                onClick={async () => {
                                    if (user) {
                                        try {
                                            const token = await user.getIdToken();
                                            const conv = await messageStore.findOrCreateConversation(booking.mentorId, booking.studentId, token);
                                            navigate('/messages', { state: { conversationId: conv.id } });
                                        } catch (error) {
                                            console.error("Failed to open chat:", error);
                                            alert("Не вдалося відкрити чат");
                                        }
                                    } else {
                                        navigate('/login');
                                    }
                                }}
                            >
                                <MessageSquare size={18} style={{ marginRight: '8px' }} /> Відкрити чат
                            </Button>

                            {status !== 'cancelled' && status !== 'rejected' && (
                                <>
                                    <div className="divider" style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1rem 0' }}></div>
                                    <Button
                                        variant="ghost"
                                        style={{ width: '100%', color: 'var(--error)' }}
                                        onClick={handleCancel}
                                    >
                                        Скасувати зустріч
                                    </Button>
                                </>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SessionDetails;

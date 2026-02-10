import React, { useState, useEffect, useRef } from 'react';
import {
    X, Calendar, Clock, CheckCircle, ChevronLeft, ChevronRight,
    Video, MessageSquare, LayoutGrid, List, ArrowLeft, ArrowRight, LogIn, ExternalLink
} from 'lucide-react';
import { bookingStore } from '../services/bookingStore';
import Button from './ui/Button';
import Avatar from './ui/Avatar';
import Card from './ui/Card';
import './BookingModal.css';
import { useAuth } from '../context/AuthContext';

const BookingModal = ({ isOpen, onClose, mentor }) => {
    const { userData } = useAuth();
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [duration, setDuration] = useState(1); // Тривалість у годинах
    const [viewMode, setViewMode] = useState('grid');
    const [format, setFormat] = useState('video');
    const [message, setMessage] = useState('');
    const [busySlots, setBusySlots] = useState([]);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);
    const modalRef = useRef(null);

    // Прокрутка вгору при показі успішного виду
    useEffect(() => {
        if (isSuccess && modalRef.current) {
            modalRef.current.scrollTo(0, 0);
        }
    }, [isSuccess]);

    // Динамічна логіка дат
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const monthNames = [
        "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
        "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
    ];

    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    // Налаштування для початку з понеділка (0=Нд, 1=Пн... -> 0=Пн, 6=Нд)
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const days = Array.from({ length: getDaysInMonth(currentMonth, currentYear) }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: startOffset }, (_, i) => i);

    const isToday = (day) => {
        const today = new Date();
        return today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    };

    const isPast = (day) => {
        const d = new Date(currentYear, currentMonth, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d < today;
    };

    // Отримання доступності при зміні дати
    useEffect(() => {
        if (selectedDate && isAuthorized) {
            setIsLoadingAvailability(true);
            const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${selectedDate.toString().padStart(2, '0')}`;
            bookingStore.fetchAvailability(dateStr, mentor.id)
                .then(busy => setBusySlots(busy))
                .catch(console.error)
                .finally(() => setIsLoadingAvailability(false));
        }
    }, [selectedDate, isAuthorized, currentMonth, currentYear]);

    if (!isOpen) return null;

    const timeSlots = [
        '09:00', '10:00', '11:00', '13:00',
        '14:00', '15:00', '16:00', '18:00', '19:00'
    ];

    // Перевірка доступності послідовних годин
    const areConsecutiveHoursAvailable = (startTime, hours) => {
        if (!selectedDate) return false;
        const formattedDate = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${selectedDate.toString().padStart(2, '0')}`;

        for (let i = 0; i < hours; i++) {
            const slotStart = new Date(`${formattedDate}T${startTime}`).getTime() + (i * 60 * 60 * 1000);
            const slotEnd = slotStart + 60 * 60 * 1000;

            const isBusy = busySlots.some(busy => {
                const busyStart = new Date(busy.start).getTime();
                const busyEnd = new Date(busy.end).getTime();
                return (slotStart < busyEnd && slotEnd > busyStart);
            });

            if (isBusy) return false;
        }
        return true;
    };

    const isSlotBusy = (time) => {
        return !areConsecutiveHoursAvailable(time, duration);
    };

    const handleConfirm = async () => {
        const formattedDate = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${selectedDate.toString().padStart(2, '0')}`;

        const bookingData = {
            mentor: {
                id: mentor.id,
                name: mentor.name,
                role: mentor.role,
                avatar: mentor.avatar,
                price: mentor.price
            },
            date: formattedDate,
            time: selectedTime,
            duration_hours: duration,
            format: format,
            message: message,
            status: 'pending'
        };

        try {
            const result = await bookingStore.addBooking(bookingData, userData);
            setBookingResult(result);
            setIsSuccess(true);
        } catch (error) {
            console.error('Booking error:', error);
            alert('Помилка при створенні бронювання');
        }
    };

    const isStepValid = () => {
        if (step === 1) return isAuthorized && selectedDate && selectedTime;
        return true;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="booking-modal" onClick={e => e.stopPropagation()} ref={modalRef}>
                <button className="close-modal-btn" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="modal-content">
                    {isSuccess ? (
                        <div className="success-view animate-in">
                            <div className="success-icon-wrapper">
                                <Clock size={48} style={{ color: '#f59e0b' }} />
                            </div>
                            <h2>Запит надіслано!</h2>
                            <p className="success-subtitle">
                                Ваш запит на бронювання очікує підтвердження від ментора.
                                Ви отримаєте сповіщення, коли ментор прийме рішення.
                            </p>

                            <Card variant="glass" className="booking-summary-card">
                                <div className="summary-item">
                                    <Calendar size={18} />
                                    <span>{selectedDate} {monthNames[currentMonth]} {currentYear}</span>
                                </div>
                                <div className="summary-item">
                                    <Clock size={18} />
                                    <span>{selectedTime} ({duration} {duration === 1 ? 'година' : duration < 5 ? 'години' : 'годин'})</span>
                                </div>
                                <div className="summary-item">
                                    <Video size={18} />
                                    <span>Формат: {format === 'video' ? 'Відеозустріч' : 'Чат'}</span>
                                </div>
                                {mentor.price && (
                                    <div className="summary-item">
                                        <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary)' }}>
                                            Вартість: {mentor.price * duration} грн
                                        </span>
                                    </div>
                                )}
                            </Card>

                            <div style={{
                                marginTop: '0.5rem',
                                padding: '0.5rem',
                                background: 'rgba(99, 102, 241, 0.1)',
                                borderRadius: '12px',
                                border: '1px solid rgba(99, 102, 241, 0.2)'
                            }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                                    {format === 'video'
                                        ? '💡 Після підтвердження ви отримаєте посилання на відеозустріч Jitsi Meet'
                                        : '💡 Після підтвердження ментор зв\'яжеться з вами для уточнення деталей чату'}
                                </p>
                            </div>

                            <div className="success-actions">
                                <Button variant="glow" size="medium" onClick={onClose}>Зрозуміло</Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="modal-header-mentor">
                                <Avatar src={mentor.avatar} alt={mentor.name} size="large" />
                                <div className="modal-mentor-info">
                                    <p>Запис до ментора</p>
                                    <h2>{mentor.name}</h2>
                                    <p>{mentor.role}</p>
                                    <span className="price">{mentor.price} грн / год</span>
                                </div>
                            </div>

                            <div className="booking-steps">
                                {/* Крок 1: Авторизація та вибір часу */}
                                <div className="step-section">
                                    <h3 className="step-title">
                                        <span>1</span> Планування та Інтеграція
                                    </h3>

                                    <div className="auth-sync-card">
                                        <div className="auth-info">
                                            <h4>Синхронізація з Google Calendar</h4>
                                            <p>{isAuthorized ? '✓ Календар підключено' : 'Потрібна авторизація для перегляду вільних слотів'}</p>
                                        </div>
                                        <Button
                                            variant={isAuthorized ? "ghost" : "primary"}
                                            size="small"
                                            onClick={() => setIsAuthorized(!isAuthorized)} // Перемикач для демо
                                        >
                                            {isAuthorized ? 'Змінити' : <><LogIn size={16} className="mr-1" /> Увійти</>}
                                        </Button>
                                    </div>

                                    {isAuthorized && (
                                        <>
                                            <div className="calendar-container animate-in">
                                                <div className="calendar-header">
                                                    <h4>{monthNames[currentMonth]} {currentYear}</h4>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (currentMonth === 0) {
                                                                    setCurrentMonth(11);
                                                                    setCurrentYear(currentYear - 1);
                                                                } else {
                                                                    setCurrentMonth(currentMonth - 1);
                                                                }
                                                            }}
                                                        >
                                                            <ArrowLeft size={16} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (currentMonth === 11) {
                                                                    setCurrentMonth(0);
                                                                    setCurrentYear(currentYear + 1);
                                                                } else {
                                                                    setCurrentMonth(currentMonth + 1);
                                                                }
                                                            }}
                                                        >
                                                            <ArrowRight size={16} />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="calendar-grid">
                                                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map(d => (
                                                        <div key={d} className="day-label">{d}</div>
                                                    ))}
                                                    {emptyDays.map(i => (
                                                        <div key={`empty-${i}`} className="day-cell empty"></div>
                                                    ))}
                                                    {days.map(d => {
                                                        const isP = isPast(d);
                                                        const isT = isToday(d);
                                                        return (
                                                            <div
                                                                key={d}
                                                                className={`day-cell ${selectedDate === d ? 'active' : ''} ${isT ? 'today' : ''} ${isP ? 'disabled' : ''}`}
                                                                onClick={() => !isP && setSelectedDate(d)}
                                                            >
                                                                {d}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Вибір тривалості */}
                                            {selectedDate && (
                                                <div className="duration-section animate-in" style={{ marginTop: '1.5rem' }}>
                                                    <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>Тривалість сесії</h4>
                                                    <div className="duration-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                                                        {[1, 2, 3, 4].map(hours => (
                                                            <button
                                                                key={hours}
                                                                className={`duration-btn ${duration === hours ? 'active' : ''}`}
                                                                onClick={() => setDuration(hours)}
                                                                style={{
                                                                    padding: '0.75rem',
                                                                    background: duration === hours ? 'var(--primary)' : 'rgba(255, 255, 255, 0.03)',
                                                                    border: `1px solid ${duration === hours ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)'}`,
                                                                    borderRadius: '10px',
                                                                    color: 'white',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s',
                                                                    fontSize: '0.9rem',
                                                                    fontWeight: duration === hours ? '600' : '400'
                                                                }}
                                                            >
                                                                {hours} год
                                                            </button>
                                                        ))}
                                                    </div>
                                                    {mentor.price && (
                                                        <div style={{
                                                            marginTop: '1rem',
                                                            padding: '0.75rem',
                                                            background: 'rgba(99, 102, 241, 0.1)',
                                                            borderRadius: '10px',
                                                            border: '1px solid rgba(99, 102, 241, 0.2)'
                                                        }}>
                                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                                                Вартість
                                                            </div>
                                                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary)' }}>
                                                                {mentor.price} грн × {duration} год = {mentor.price * duration} грн
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {selectedDate && (
                                                <div className="time-slots-section animate-in">
                                                    <div className="time-slots-header">
                                                        <h4>Вільні слоти для {selectedDate} {monthNames[currentMonth]}</h4>
                                                        <div className="view-toggle">
                                                            <button
                                                                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                                                onClick={() => setViewMode('grid')}
                                                            >
                                                                <LayoutGrid size={14} />
                                                            </button>
                                                            <button
                                                                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                                                                onClick={() => setViewMode('list')}
                                                            >
                                                                <List size={14} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className={viewMode === 'grid' ? 'slots-grid' : 'slots-list'}>
                                                        {isLoadingAvailability ? (
                                                            <div style={{ color: 'white', padding: '1rem' }}>Перевірка...</div>
                                                        ) : (
                                                            timeSlots.map(time => {
                                                                const busy = isSlotBusy(time);
                                                                return (
                                                                    <div
                                                                        key={time}
                                                                        className={`slot-item ${selectedTime === time ? 'active' : ''} ${busy ? 'disabled' : ''}`}
                                                                        style={busy ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                                                        onClick={() => !busy && setSelectedTime(time)}
                                                                    >
                                                                        {time}
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Крок 2: Формат та відгук */}
                                {selectedTime && (
                                    <div className="step-section animate-in">
                                        <h3 className="step-title">
                                            <span>2</span> Налаштування формату
                                        </h3>

                                        <div className="format-grid">
                                            <div
                                                className={`format-option ${format === 'video' ? 'active' : ''}`}
                                                onClick={() => setFormat('video')}
                                            >
                                                <Video size={24} className="text-primary" />
                                                <div>
                                                    <strong>Відеодзвінок</strong>
                                                    <p className="text-xs text-secondary">Jitsi Meet (у браузері)</p>
                                                </div>
                                            </div>
                                            <div
                                                className={`format-option ${format === 'chat' ? 'active' : ''}`}
                                                onClick={() => setFormat('chat')}
                                            >
                                                <MessageSquare size={24} className="text-primary" />
                                                <div>
                                                    <strong>Текстовий чат</strong>
                                                    <p className="text-xs text-secondary">Telegram / Slack</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="feedback-section mt-4">
                                            <label className="text-sm font-medium mb-2 block">
                                                Ваші цілі та очікування (опціонально)
                                            </label>
                                            <textarea
                                                className="msg-input"
                                                rows="3"
                                                placeholder="Опишіть, що ви хочете обговорити..."
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Футер */}
                            <div className="modal-footer">
                                <Button variant="ghost" onClick={onClose}>Скасувати</Button>
                                <Button
                                    variant="glow"
                                    disabled={!selectedDate || !selectedTime || !isAuthorized}
                                    onClick={handleConfirm}
                                >
                                    Підтвердити бронювання
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingModal;

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Check } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { bookingStore } from '../../services/bookingStore';
import './BookingModal.css';

const BookingModal = ({ mentor, onClose, onSuccess }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [message, setMessage] = useState('');
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [busySlots, setBusySlots] = useState([]);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

    // Генерувати доступні часові слоти (09:00 - 18:00)
    const timeSlots = Array.from({ length: 9 }, (_, i) => {
        const hour = i + 9;
        return `${hour.toString().padStart(2, '0')}:00`;
    });

    useEffect(() => {
        if (selectedDate) {
            setIsLoadingAvailability(true);
            bookingStore.fetchAvailability(selectedDate)
                .then(busy => {
                    setBusySlots(busy);
                })
                .catch(console.error)
                .finally(() => setIsLoadingAvailability(false));
        }
    }, [selectedDate]);

    const isSlotBusy = (time) => {
        if (!selectedDate) return false;
        const slotStart = new Date(`${selectedDate}T${time}`).getTime();
        const slotEnd = slotStart + 60 * 60 * 1000; // тривалість 1 година

        return busySlots.some(busy => {
            const busyStart = new Date(busy.start).getTime();
            const busyEnd = new Date(busy.end).getTime();
            // Перевірити перекриття в діапазоні
            return (slotStart < busyEnd && slotEnd > busyStart);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await bookingStore.addBooking({
                mentor: mentor,
                date: selectedDate,
                time: selectedTime,
                message: message,
                duration: '1 година',
                format: 'video'
            });
            setStep(3); // Крок успіху
            if (onSuccess) onSuccess();
            setTimeout(onClose, 2000);
        } catch (error) {
            alert('Помилка при створенні бронювання');
            setIsSubmitting(false);
        }
    };

    if (!mentor) return null;

    return (
        <div className="modal-overlay fade-in">
            <div className="modal-content glass-effect">
                <button className="modal-close" onClick={onClose}><X size={24} /></button>

                {step === 1 && (
                    <div className="booking-step">
                        <h2>Запис до {mentor.name}</h2>
                        <div className="form-group">
                            <label><Calendar size={16} /> Оберіть дату</label>
                            <input
                                type="date"
                                className="glass-input"
                                min={new Date().toISOString().split('T')[0]}
                                value={selectedDate}
                                onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    setSelectedTime('');
                                }}
                            />
                        </div>

                        {selectedDate && (
                            <div className="form-group">
                                <label><Clock size={16} /> Оберіть час</label>
                                {isLoadingAvailability ? (
                                    <div className="loading-spinner">Перевірка доступності...</div>
                                ) : (
                                    <div className="time-slots-grid">
                                        {timeSlots.map(time => {
                                            const busy = isSlotBusy(time);
                                            return (
                                                <button
                                                    key={time}
                                                    type="button"
                                                    disabled={busy}
                                                    className={`time-slot ${selectedTime === time ? 'selected' : ''} ${busy ? 'busy' : ''}`}
                                                    onClick={() => setSelectedTime(time)}
                                                >
                                                    {time}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="modal-actions">
                            <Button variant="ghost" onClick={onClose}>Скасувати</Button>
                            <Button
                                variant="primary"
                                disabled={!selectedDate || !selectedTime}
                                onClick={() => setStep(2)}
                            >
                                Далі
                            </Button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="booking-step slide-in">
                        <h2>Деталі зустрічі</h2>
                        <p><strong>Дата:</strong> {selectedDate}, {selectedTime}</p>

                        <div className="form-group">
                            <label>Повідомлення для ментора</label>
                            <textarea
                                className="glass-input"
                                rows="3"
                                placeholder="Коротко опишіть тему зустрічі..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="modal-actions">
                            <Button variant="ghost" onClick={() => setStep(1)}>Назад</Button>
                            <Button
                                variant="glow"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Бронювання...' : 'Підтвердити'}
                            </Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="booking-step success-step text-center">
                        <div className="success-icon"><Check size={48} /></div>
                        <h2>Успішно!</h2>
                        <p>Зустріч заплановано. Ви знайдете деталі у вашому кабінеті.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingModal;

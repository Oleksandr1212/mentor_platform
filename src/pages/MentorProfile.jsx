import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Star, MapPin, Globe, Clock, Calendar, ShieldCheck,
    MessageSquare, ChevronLeft, Award, BookOpen, Layers
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import { mentorStore } from '../services/mentorStore';
import { reviewStore } from '../services/reviewStore';
import { useAuth } from '../context/AuthContext';
import { messageStore } from '../services/messageStore';
import BookingModal from '../components/BookingModal';
import './MentorProfile.css';

const MentorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('about');
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [mentor, setMentor] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [newReviewText, setNewReviewText] = useState('');
    const [newRating, setNewRating] = useState(5);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    React.useEffect(() => {
        const fetchMentorAndReviews = async () => {
            const mentorData = await mentorStore.getMentorById(id);
            if (mentorData) {
                // Переконатися, що використовуємо найсвіжіші відгуки з PostgreSQL
                const mentorReviews = await reviewStore.getReviewsForMentor(id);
                const avgRating = await reviewStore.getAverageRating(id);
                const revCount = await reviewStore.getReviewCount(id);

                setMentor({
                    ...mentorData,
                    rating: avgRating,
                    reviewsCount: revCount
                });
                setReviews(mentorReviews);
            }
        };
        fetchMentorAndReviews();
    }, [id]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!newReviewText.trim()) return;

        setIsSubmittingReview(true);
        try {
            await reviewStore.addReview({
                mentorId: id,
                author: user?.name || 'Анонім',
                authorId: user?.id,
                rating: newRating,
                text: newReviewText
            });

            // Оновлення даних з джерела істини
            const mentorReviews = await reviewStore.getReviewsForMentor(id);
            const avgRating = await reviewStore.getAverageRating(id);
            const revCount = await reviewStore.getReviewCount(id);

            setReviews(mentorReviews);
            setMentor(prev => ({
                ...prev,
                rating: avgRating,
                reviewsCount: revCount
            }));

            setNewReviewText('');
            setNewRating(5);
        } catch (error) {
            console.error('Submit review error:', error);
            alert('Не вдалося відправити відгук. Спробуйте пізніше.');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (!mentor) {
        return <div className="container mt-large text-center">Ментор не знайдений або завантажується...</div>;
    }

    return (
        <div className="mentor-profile-page fade-in">
            <div className="profile-background-blobs">
                <div className="blob-1"></div>
                <div className="blob-2"></div>
            </div>

            <div className="container relative-z">

                {/* Навігація назад */}
                <div className="back-nav-wrapper">
                    <Button to="/" variant="ghost" size="small" className="back-link">
                        <ChevronLeft size={20} /> Назад до пошуку
                    </Button>
                </div>

                <div className="profile-layout">
                    {/* Основна інформація */}
                    <div className="profile-main">
                        {/* Картка заголовка */}
                        <Card variant="glass" className="profile-header-card" padding="none">
                            <div className="profile-cover"></div>
                            <div className="profile-header-content">
                                <div className="avatar-wrapper">
                                    <Avatar src={mentor.avatar} alt={mentor.name} className="profile-avatar" size="xlarge" />
                                    <div className="verified-badge-icon" title="Verified Mentor">
                                        <ShieldCheck size={20} />
                                    </div>
                                </div>

                                <div className="header-info">
                                    <div className="header-top-row">
                                        <div>
                                            <h1 className="profile-name">{mentor.name}</h1>
                                            <p className="profile-role">{mentor.role} at {mentor.company}</p>
                                        </div>
                                        <div className="rating-box">
                                            <Star size={20} className="star-icon-fill" />
                                            <span className="rating-val">{mentor.rating}</span>
                                            <span className="rating-count">({mentor.reviewsCount} відгуків)</span>
                                        </div>
                                    </div>

                                    <div className="header-meta-row">
                                        <Badge variant="glass" className="meta-pill">
                                            <MapPin size={16} /> {mentor.location}
                                        </Badge>
                                        <Badge variant="glass" className="meta-pill">
                                            <Globe size={16} /> {mentor.languages.join(', ')}
                                        </Badge>
                                        <Badge variant="glass" className="meta-pill">
                                            <Clock size={16} /> {mentor.experience} досвіду
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Навігація по табах */}
                        <div className="profile-tabs">
                            <button
                                className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
                                onClick={() => setActiveTab('about')}
                            >
                                Про ментора
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                                onClick={() => setActiveTab('reviews')}
                            >
                                Відгуки ({mentor.reviewsCount})
                            </button>
                        </div>

                        {/* Вміст табу */}
                        <Card variant="glass-dark" className="tab-content" padding="medium">
                            {activeTab === 'about' && (
                                <div className="about-section">
                                    <h3 className="section-heading">Про себе</h3>
                                    <div className="bio-text">
                                        {mentor.about.split('\n').map((paragraph, idx) => (
                                            <p key={idx}>{paragraph}</p>
                                        ))}
                                    </div>

                                    <h3 className="section-heading mt-large">Навички</h3>
                                    <div className="skills-grid">
                                        {mentor.skills.map(skill => {
                                            const skillName = typeof skill === 'string' ? skill : skill.name;
                                            const skillLevel = typeof skill === 'string' ? 'Advanced' : skill.level;

                                            // Визначити, скільки поділок заповнити
                                            let filledBars = 2; // За замовчуванням Advanced
                                            if (skillLevel === 'Expert') filledBars = 3;
                                            if (skillLevel === 'Intermediate') filledBars = 1;

                                            return (
                                                <div key={skillName} className="skill-card-v2">
                                                    <span className="skill-label">{skillName}</span>
                                                    <div className="skill-progress-bars">
                                                        {[1, 2, 3].map((bar) => (
                                                            <div
                                                                key={bar}
                                                                className={`progress-bar-segment ${bar <= filledBars ? 'active' : ''}`}
                                                            ></div>
                                                        ))}
                                                    </div>
                                                    <span className="skill-level-hint">{skillLevel}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <h3 className="section-heading mt-large">Що ви отримаєте</h3>
                                    <div className="benefits-grid">
                                        <div className="benefit-item">
                                            <div className="benefit-icon"><BookOpen size={24} /></div>
                                            <div>
                                                <h4>Персональний план</h4>
                                                <p>Навчання підлаштоване під ваші цілі</p>
                                            </div>
                                        </div>
                                        <div className="benefit-item">
                                            <div className="benefit-icon"><Layers size={24} /></div>
                                            <div>
                                                <h4>Code Review</h4>
                                                <p>Детальний розбір вашого коду</p>
                                            </div>
                                        </div>
                                        <div className="benefit-item">
                                            <div className="benefit-icon"><Award size={24} /></div>
                                            <div>
                                                <h4>Кар'єрні поради</h4>
                                                <p>Підготовка до співбесід та резюме</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="reviews-section">
                                    <div className="reviews-header-layout">
                                        <div className="big-rating-summary">
                                            <span className="val">{mentor.rating}</span>
                                            <div className="stars">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={20} className={`star ${i < Math.floor(mentor.rating) ? 'filled' : ''}`} />
                                                ))}
                                            </div>
                                            <span className="total-review-count">{mentor.reviewsCount} відгуків</span>
                                        </div>

                                        {/* Форма відгуку (для авторизованих користувачів) */}
                                        {user && (
                                            <Card variant="glass" className="add-review-card" padding="large">
                                                <h4 className="form-title">Залишити відгук</h4>
                                                <form onSubmit={handleReviewSubmit} className="add-review-form">
                                                    <div className="form-top-row">
                                                        <div className="rating-select">
                                                            <span>Ваша оцінка:</span>
                                                            <div className="star-inputs">
                                                                {[1, 2, 3, 4, 5].map(star => (
                                                                    <Star
                                                                        key={star}
                                                                        size={24}
                                                                        className={`star-input ${star <= newRating ? 'filled' : ''}`}
                                                                        onClick={() => setNewRating(star)}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="submit"
                                                            variant="primary"
                                                            size="medium"
                                                            disabled={isSubmittingReview}
                                                        >
                                                            {isSubmittingReview ? 'Надсилання...' : 'Опублікувати'}
                                                        </Button>
                                                    </div>
                                                    <textarea
                                                        placeholder="Розкажіть про свій досвід навчання з цим ментором..."
                                                        value={newReviewText}
                                                        onChange={(e) => setNewReviewText(e.target.value)}
                                                        required
                                                    ></textarea>
                                                </form>
                                            </Card>
                                        )}
                                    </div>

                                    <div className="reviews-list-header">
                                        <h3>Всі відгуки</h3>
                                    </div>

                                    <div className="reviews-list">
                                        {reviews.length > 0 ? (
                                            reviews.map(review => (
                                                <Card key={review.id} variant="glass" className="review-item" padding="medium">
                                                    <div className="review-header">
                                                        <span className="review-author">{review.author}</span>
                                                        <span className="review-date">{review.date}</span>
                                                    </div>
                                                    <div className="review-rating">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} className={i < review.rating ? 'filled' : 'empty'} />
                                                        ))}
                                                    </div>
                                                    <p className="review-text">{review.text}</p>
                                                </Card>
                                            ))
                                        ) : (
                                            <p className="no-reviews text-center mt-large">Поки що немає відгуків. Будьте першим!</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Сайдбар бронювання */}
                    <aside className="profile-sidebar">
                        <Card variant="glass" className="booking-card" padding="large">
                            <div className="price-header">
                                <span className="price-tag">{mentor.price} грн</span>
                                <span className="price-sub">за годину</span>
                            </div>

                            <div className="booking-info">
                                <div className="info-row">
                                    <Calendar size={18} />
                                    <span>Найближчий слот: <strong>Сьогодні, 19:00</strong></span>
                                </div>
                                <div className="info-row">
                                    <Clock size={18} />
                                    <span>Тривалість: <strong>60 хв</strong></span>
                                </div>
                            </div>

                            <div className="action-buttons-col">
                                <Button
                                    variant="glow"
                                    size="large"
                                    className="w-full"
                                    onClick={() => {
                                        if (user) {
                                            setIsBookingModalOpen(true);
                                        } else {
                                            navigate('/login', { state: { from: `/mentor/${mentor.id}` } });
                                        }
                                    }}
                                >
                                    Записатись на заняття
                                </Button>
                                <Button
                                    variant="outline"
                                    size="medium"
                                    className="w-full"
                                    onClick={async () => {
                                        if (user) {
                                            try {
                                                const token = await user.getIdToken();
                                                const conv = await messageStore.findOrCreateConversation(mentor.id, user.uid, token);
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
                                    <MessageSquare size={18} /> Написати повідомлення
                                </Button>
                            </div>

                            <div className="guarantee-text">
                                <ShieldCheck size={14} />
                                <span>100% гарантія повернення коштів, якщо заняття не відбудеться</span>
                            </div>
                        </Card>
                    </aside>
                </div>
            </div>

            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                mentor={mentor}
            />
        </div>
    );
};

export default MentorProfile;

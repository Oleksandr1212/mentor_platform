import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Star, Clock, BookOpen, ChevronRight,
    ShieldCheck, Globe, Briefcase, ChevronDown, Filter, X, Check, Users
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import { mentorStore } from '../services/mentorStore';
import { reviewStore } from '../services/reviewStore';
import BookingModal from '../components/BookingModal';
import './FindMentorPage.css';

const FindMentorPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Автоматичний показ фільтрів на десктопі
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 1024) setShowFilters(true);
            else setShowFilters(false);
        };

        // Початкова перевірка
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Стан фільтрів
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceRange, setPriceRange] = useState(3000);
    const [minRating, setMinRating] = useState(0);
    const [selectedLanguages, setSelectedLanguages] = useState([]);

    const handleCardClick = (id) => {
        navigate(`/mentor/${id}`);
    };

    const handleButtonClick = (e, id) => {
        e.stopPropagation();
        navigate(`/mentor/${id}`);
    };

    const [selectedMentorForBooking, setSelectedMentorForBooking] = useState(null);

    const handleBookClick = (e, mentor) => {
        e.stopPropagation();
        setSelectedMentorForBooking(mentor);
    };


    const [allMentors, setAllMentors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMentors = async () => {
            setIsLoading(true);
            try {
                const mentors = await mentorStore.getMentors();

                // Отримання живих рейтингів з PostgreSQL для кожного ментора
                const mentorsWithLiveStats = await Promise.all(
                    mentors.map(async (mentor) => {
                        const rating = await reviewStore.getAverageRating(mentor.id);
                        const reviewsCount = await reviewStore.getReviewCount(mentor.id);
                        return { ...mentor, rating, reviewsCount };
                    })
                );

                setAllMentors(mentorsWithLiveStats);
            } catch (error) {
                console.error("Failed to load mentors:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMentors();
    }, []);

    const categories = [
        { id: 'frontend', label: 'Frontend' },
        { id: 'backend', label: 'Backend' },
        { id: 'design', label: 'UI/UX Дизайн' },
        { id: 'qa', label: 'Тестування (QA)' },
        { id: 'pm', label: 'Менеджмент' }
    ];

    const toggleCategory = (id) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const toggleLanguage = (lang) => {
        setSelectedLanguages(prev =>
            prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
        );
    };

    const [sortBy, setSortBy] = useState('rating');
    const [isSortOpen, setIsSortOpen] = useState(false);

    const sortOptions = [
        { value: 'rating', label: 'За рейтингом' },
        { value: 'price-low', label: 'Ціна: від найнижчої' },
        { value: 'price-high', label: 'Ціна: від найвищої' },
        { value: 'experience', label: 'За досвідом' }
    ];

    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsSortOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredMentors = allMentors.filter(mentor => {
        // Фільтр пошуку
        const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mentor.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mentor.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

        // Фільтр категорій (на основі мапінгу спеціалізацій)
        const mentorSpec = mentor.role.toLowerCase();
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.some(cat =>
            mentorSpec.includes(cat.toLowerCase()) || (cat === 'design' && mentorSpec.includes('designer'))
        );

        // Фільтр ціни
        const matchesPrice = mentor.price <= priceRange;

        // Фільтр рейтингу
        const matchesRating = mentor.rating >= minRating;

        // Фільтр мови
        const matchesLanguage = selectedLanguages.length === 0 || selectedLanguages.some(lang =>
            mentor.languages.includes(lang)
        );

        return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesLanguage;
    });

    const sortedMentors = [...filteredMentors].sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating || b.reviewsCount - a.reviewsCount;
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
        return 0;
    });

    return (
        <div className="home-page fade-in">
            {/* Модальне вікно бронювання */}
            {selectedMentorForBooking && (
                <BookingModal
                    mentor={selectedMentorForBooking}
                    onClose={() => setSelectedMentorForBooking(null)}
                    onSuccess={() => {
                        // Опціонально: оновити дані або показати сповіщення
                    }}
                />
            )}

            {/* Секція "Герой" */}
            <section className="fm-hero">
                <div className="container">
                    <div className="fm-hero-content">
                        <h1 className="fm-hero-title">
                            Знайди свого ідеального <span className="text-gradient">Ментора</span>
                        </h1>
                        <p className="fm-hero-subtitle">
                            Отримуй персональні знання від експертів у своїй галузі.
                            Розвивайся швидше разом з MentorPlatform.
                        </p>
                    </div>
                </div>
                <div className="hero-background-blobs">
                    <div className="blob-1"></div>
                    <div className="blob-2"></div>
                </div>
            </section>

            <section className="main-platform-section">
                <div className="container platform-layout">
                    {/* Сайдбар фільтрів */}
                    <aside className={`filters-sidebar ${showFilters ? 'active' : ''}`}>
                        <Card variant="glass" className="filters-card-content" padding="small">
                            <div className="sidebar-header">
                                <h3>Фільтри</h3>
                                <button className="mobile-only-close" onClick={() => setShowFilters(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">НАПРЯМОК</label>
                                <div className="category-list">
                                    {categories.map(cat => (
                                        <div key={cat.id} className="checkbox-item" onClick={() => toggleCategory(cat.id)}>
                                            <input
                                                type="checkbox"
                                                id={cat.id}
                                                checked={selectedCategories.includes(cat.id)}
                                                onChange={() => { }} // Контролюється через onClick на батьківському елементі для кращого UX
                                            />
                                            <label htmlFor={cat.id}>{cat.label}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">ЦІНА: {priceRange} ГРН</label>
                                <div className="price-slider-container">
                                    <input
                                        type="range"
                                        min="200"
                                        max="3000"
                                        step="100"
                                        className="slider"
                                        value={priceRange}
                                        onChange={(e) => setPriceRange(parseInt(e.target.value))}
                                    />
                                    <div className="price-labels">
                                        <span>200</span>
                                        <span>3000</span>
                                    </div>
                                </div>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">РЕЙТИНГ</label>
                                {[4.5, 4.0, 0].map(rating => (
                                    <div key={rating} className="radio-item" onClick={() => setMinRating(rating)}>
                                        <input
                                            type="radio"
                                            name="rating"
                                            id={`r-${rating}`}
                                            checked={minRating === rating}
                                            onChange={() => { }}
                                        />
                                        <label htmlFor={`r-${rating}`}>
                                            {rating === 0 ? 'Будь-який' : `${rating}+ зірок`}
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">ДОСТУПНІСТЬ</label>
                                {['Сьогодні', 'Цей тиждень'].map(time => (
                                    <div key={time} className="radio-item">
                                        <input type="radio" name="availability" id={time} />
                                        <label htmlFor={time}>{time}</label>
                                    </div>
                                ))}
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">МОВИ СПІЛКУВАННЯ</label>
                                {['Українська', 'Англійська', 'Німецька', 'Польська'].map(lang => (
                                    <div key={lang} className="checkbox-item" onClick={() => toggleLanguage(lang)}>
                                        <input
                                            type="checkbox"
                                            id={lang}
                                            checked={selectedLanguages.includes(lang)}
                                            onChange={() => { }}
                                        />
                                        <label htmlFor={lang}>{lang}</label>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </aside>
                    {/* Оверлей для мобільних */}
                    <div className={`filters-sidebar-overlay ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(false)}></div>

                    {/* Область основного контенту */}
                    <div className="mentors-content">
                        <Card variant="glass" className="search-bar-top" padding="small">
                            <Search className="search-icon" size={20} />
                            <input
                                type="text"
                                placeholder="Пошук за темою, технологією або ім'ям..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Button variant="outline" size="small" className="mobile-filter-trigger" onClick={() => setShowFilters(!showFilters)}>
                                <Filter size={18} /> Фільтри
                            </Button>
                        </Card>

                        <div className="results-info">
                            <span>Знайдено {sortedMentors.length} менторів</span>
                            <div className="sort-container" ref={dropdownRef}>
                                <span>Сортувати:</span>
                                <div className="custom-dropdown">
                                    <button
                                        className="dropdown-trigger"
                                        onClick={() => setIsSortOpen(!isSortOpen)}
                                    >
                                        <b>{sortOptions.find(opt => opt.value === sortBy)?.label}</b>
                                        <ChevronDown size={14} className={isSortOpen ? 'rotate' : ''} />
                                    </button>

                                    {isSortOpen && (
                                        <div className="dropdown-menu glass-effect">
                                            {sortOptions.map(option => (
                                                <div
                                                    key={option.value}
                                                    className={`dropdown-item ${sortBy === option.value ? 'active' : ''}`}
                                                    onClick={() => {
                                                        setSortBy(option.value);
                                                        setIsSortOpen(false);
                                                    }}
                                                >
                                                    {option.label}
                                                    {sortBy === option.value && <Check size={14} />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mentors-list">
                            {isLoading ? (
                                <div className="loading-state text-center pd-large">
                                    <div className="spinner mb-2"></div>
                                    <p>Завантаження менторів...</p>
                                </div>
                            ) : sortedMentors.length > 0 ? sortedMentors.map(mentor => (
                                <Card
                                    key={mentor.id}
                                    variant="glass"
                                    className="mentor-card-wide card-hover cursor-pointer"
                                    onClick={() => handleCardClick(mentor.id)}
                                    padding="medium"
                                >
                                    <div className="card-main">
                                        <div className="mentor-avatar-container">
                                            <Avatar src={mentor.avatar} size="xlarge" className="mentor-avatar" />
                                            {mentor.isTop && (
                                                <Badge variant="glass" className="top-mentor-badge">
                                                    <ShieldCheck size={12} /> Top Mentor
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="mentor-details-primary">
                                            <div className="name-row">
                                                <h3>{mentor.name}</h3>
                                                <Badge variant="glass" className="rating-tag">
                                                    <Star size={14} className="star-icon-fill" />
                                                    <b>{mentor.rating}</b>
                                                    <span>({mentor.reviewsCount} відгуків)</span>
                                                </Badge>
                                            </div>

                                            <p className="mentor-role">
                                                {mentor.role}{mentor.company && ` в ${mentor.company}`}
                                            </p>
                                            <p className="mentor-about-text">{mentor.about}</p>

                                            <div className="skills-tags">
                                                {mentor.skills.map(skill => {
                                                    const sName = typeof skill === 'string' ? skill : skill.name;
                                                    return (
                                                        <Badge key={sName} variant="outline" className="skill-tag">{sName}</Badge>
                                                    );
                                                })}
                                            </div>

                                            <div className="mentor-meta">
                                                <div className="meta-item">
                                                    <Briefcase size={14} /> <span>Досвід (в роках): {mentor.experienceYears} </span>
                                                </div>
                                                <div className="meta-item">
                                                    <Globe size={14} /> <span>Мови: {mentor.languages.join(', ')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-actions">
                                        <div className="price-info">
                                            <span className="price-label">Вартість</span>
                                            <span className="price-value">{mentor.price} грн</span>
                                            <span className="price-unit">за годину</span>
                                        </div>
                                        <div className="action-buttons">
                                            <Button variant="primary" size="small" onClick={(e) => handleBookClick(e, mentor)} className="w-full">
                                                Записатись
                                            </Button>
                                            <Button variant="secondary" size="small" onClick={(e) => handleButtonClick(e, mentor.id)} className="w-full">
                                                Профіль
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            )) : (
                                <Card variant="glass" className="pd-large text-center w-full">
                                    <Search size={48} className="opacity-20 mb-4 mx-auto" />
                                    <h3>Нікого не знайдено</h3>
                                    <p>Спробуйте змінити фільтри або запит пошуку.</p>
                                    <Button variant="outline" className="mt-4" onClick={() => {
                                        setSearchQuery('');
                                        setSelectedCategories([]);
                                        setPriceRange(3000);
                                        setMinRating(0);
                                        setSelectedLanguages([]);
                                    }}>
                                        Скинути всі фільтри
                                    </Button>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FindMentorPage;

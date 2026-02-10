import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Briefcase, Award, CheckCircle, Target, ChevronDown, Check } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

import './BecomeMentorPage.css';

const BecomeMentorPage = ({ onRegister }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        specialization: '',
        experience: ''
    });
    const [isSuccess, setIsSuccess] = useState(false);
    const [isSpecDropdownOpen, setIsSpecDropdownOpen] = useState(false);
    const specDropdownRef = useRef(null);

    const { signup } = useAuth();

    // ... існуючі обробники ...

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(false); // Скинути, якщо залишилося true

        const specToRole = {
            'frontend': 'Frontend Developer',
            'backend': 'Backend Developer',
            'design': 'UI/UX Designer',
            'qa': 'QA Engineer',
            'pm': 'Product Manager'
        };

        const roleTitle = specToRole[formData.specialization] || 'Professional Mentor';
        setIsLoading(true);

        try {
            // Реєстрація користувача з роллю 'mentor' та всіма даними форми
            await signup(formData.email, formData.password, formData.name, 'mentor', {
                specialization: formData.specialization,
                roleTitle: roleTitle,
                experience: formData.experience,
                skills: [], // Керується в налаштуваннях
                bio: '',
                price: '0'
            });



            setIsLoading(false);
            setIsSuccess(true);
        } catch (error) {
            console.error('Registration error:', error);
            setIsLoading(false);
            alert('Сталася помилка при реєстрації: ' + error.message);
        }
    };

    // Додавання спостерігача анімації прокрутки
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    // Слухач кліку поза елементом для випадаючого списку
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (specDropdownRef.current && !specDropdownRef.current.contains(event.target)) {
                setIsSpecDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="become-mentor-page fade-in">
            <div className="container">
                <div className="registration-wrapper">
                    {!isSuccess ? (
                        <>
                            <div className="registration-header animate-on-scroll fade-up">
                                <h1 className="page-title text-center">
                                    Стань частиною <span className="text-gradient">MentorPlatform</span>
                                </h1>
                                <p className="page-subtitle text-center">
                                    Заповни анкету, щоб почати ділитися своїм досвідом та заробляти.
                                </p>
                            </div>

                            <Card variant="glass" className="registration-card animate-on-scroll fade-up delay-100">
                                <form onSubmit={handleSubmit} className="registration-form">
                                    <div className="form-group">
                                        <label>Ваше Ім'я</label>
                                        <div className="input-wrapper">
                                            <User size={18} className="input-icon" />
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="Олександр Петренко"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Email адресу</label>
                                        <div className="input-wrapper">
                                            <Mail size={18} className="input-icon" />
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="alex@example.com"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Пароль</label>
                                        <div className="input-wrapper">
                                            <Lock size={18} className="input-icon" />
                                            <input
                                                type="password"
                                                name="password"
                                                placeholder="••••••••"
                                                required
                                                minLength={6}
                                                value={formData.password}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>



                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Спеціалізація</label>
                                            <div className="spec-dropdown-wrapper" ref={specDropdownRef}>
                                                <button
                                                    type="button"
                                                    className="spec-dropdown-trigger"
                                                    onClick={() => setIsSpecDropdownOpen(!isSpecDropdownOpen)}
                                                >
                                                    <div className="trigger-content">
                                                        <Briefcase size={18} className="trigger-icon" />
                                                        <span className={formData.specialization ? '' : 'placeholder'}>
                                                            {formData.specialization
                                                                ? {
                                                                    'frontend': 'Frontend Development',
                                                                    'backend': 'Backend Development',
                                                                    'design': 'UI/UX Design',
                                                                    'qa': 'QA Engineering',
                                                                    'pm': 'Project Management'
                                                                }[formData.specialization]
                                                                : 'Оберіть напрямок'
                                                            }
                                                        </span>
                                                    </div>
                                                    <ChevronDown size={16} className={isSpecDropdownOpen ? 'rotate' : ''} />
                                                </button>

                                                {isSpecDropdownOpen && (
                                                    <div className="spec-dropdown-menu">
                                                        {[
                                                            { value: 'frontend', label: 'Frontend Development' },
                                                            { value: 'backend', label: 'Backend Development' },
                                                            { value: 'design', label: 'UI/UX Design' },
                                                            { value: 'qa', label: 'QA Engineering' },
                                                            { value: 'pm', label: 'Project Management' }
                                                        ].map(option => (
                                                            <div
                                                                key={option.value}
                                                                className={`spec-dropdown-item ${formData.specialization === option.value ? 'active' : ''}`}
                                                                onClick={() => {
                                                                    setFormData({ ...formData, specialization: option.value });
                                                                    setIsSpecDropdownOpen(false);
                                                                }}
                                                            >
                                                                {option.label}
                                                                {formData.specialization === option.value && <Check size={14} />}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Досвід (років)</label>
                                            <div className="input-wrapper">
                                                <Award size={18} className="input-icon" />
                                                <input
                                                    type="number"
                                                    name="experience"
                                                    min="0"
                                                    placeholder="3"
                                                    required
                                                    value={formData.experience}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-note">
                                        <CheckCircle size={16} className="text-green mr-1" />
                                        Ваш акаунт буде активовано миттєво після реєстрації.
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="glow"
                                        size="large"
                                        className={`w-100 mt-4 ${isLoading ? 'loading' : ''}`}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Реєстрація...' : 'Зареєструватися як Ментор'}
                                    </Button>
                                </form>
                            </Card>
                        </>
                    ) : (
                        <div className="success-view animate-in zoom-in">
                            <div className="success-icon-wrapper">
                                <CheckCircle size={80} color="var(--success)" />
                            </div>
                            <h1 className="success-title">Ласкаво просимо, {formData.name.split(' ')[0]}! 🎉</h1>
                            <p className="success-message">
                                Ваш акаунт ментора активовано. Ви можете увійти, використовуючи свій email <strong>{formData.email}</strong>.
                            </p>
                            <div className="success-info glass">
                                <p>Ваша спеціалізація: <strong>{formData.specialization.toUpperCase()}</strong></p>
                                <p>Зараз ви можете зайти в кабінет, налаштувати свій профіль та почати приймати бронювання.</p>
                            </div>
                            <div className="success-actions">
                                <Button variant="glow" onClick={() => navigate('/dashboard')} size="large">
                                    Перейти до кабінету
                                </Button>
                                <Button variant="ghost" onClick={() => navigate('/')}>
                                    На головну
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BecomeMentorPage;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { Mail, Lock, User, Briefcase, GraduationCap, ArrowRight, CheckCircle } from 'lucide-react';
import './LoginPage.css'; // Повторне використання стилів входу

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('student'); // 'student' або 'mentor'
    const [specialization, setSpecialization] = useState('Frontend');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Паролі не співпадають');
        }

        if (password.length < 6) {
            return setError('Пароль повинен містити мінімум 6 символів');
        }

        try {
            setError('');
            setIsLoading(true);

            const specToRole = {
                'Frontend': 'Frontend Developer',
                'Backend': 'Backend Developer',
                'Design': 'UI/UX Designer',
                'QA': 'QA Engineer'
            };
            const roleTitle = specToRole[specialization] || specialization;

            await signup(email, password, name, role, {
                specialization,
                roleTitle: role === 'mentor' ? roleTitle : ''
            });
            setShowSuccess(true);
        } catch (err) {
            console.error(err);
            setError('Не вдалося створити акаунт: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="login-page">
                <div className="login-container">
                    <div className="success-content">
                        <div className="success-icon-wrapper">
                            <div className="success-icon-bg">
                                <CheckCircle size={48} color="#22c55e" />
                            </div>
                        </div>
                        <h2>Ласкаво просимо, {name}! 👋</h2>
                        <p className="success-message">
                            Ваш акаунт {role === 'mentor' ? 'ментора' : 'студента'} активовано.
                            Ви можете увійти до системи, використовуючи <strong>{email}</strong>.
                        </p>

                        <div className="profile-hint-card">
                            <p className="hint-title">Ваша спеціалізація: <strong>{specialization.toUpperCase()}</strong></p>
                            <p className="hint-text">
                                Зараз ви можете зайти в кабінет, <strong>налаштувати свій профіль</strong> та почати приймати бронювання.
                                <br />
                                <span className="text-accent">Порада: заповніть досвід та мови в налаштуваннях, щоб студенти швидше вас знайшли!</span>
                            </p>
                        </div>

                        <div className="success-actions">
                            <Button
                                variant="glow"
                                fullWidth
                                onClick={() => navigate(role === 'mentor' ? '/mentor-dashboard' : '/dashboard')}
                            >
                                Перейти до кабінету
                            </Button>
                            <Button
                                variant="ghost"
                                fullWidth
                                onClick={() => navigate('/')}
                            >
                                На головну
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <h1>Створити акаунт</h1>
                    <p>Приєднуйтесь до нашої спільноти</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                    <div className="form-group">
                        <label>Хто ви?</label>
                        <div className="role-selector" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <div
                                className={`role-card ${role === 'student' ? 'active' : ''}`}
                                onClick={() => setRole('student')}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    border: `1px solid ${role === 'student' ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    background: role === 'student' ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                                }}
                            >
                                <GraduationCap size={24} style={{ margin: '0 auto 0.5rem', color: role === 'student' ? 'var(--primary)' : 'var(--text-secondary)' }} />
                                <span style={{ display: 'block', fontSize: '0.9rem' }}>Студент</span>
                            </div>
                            <div
                                className={`role-card ${role === 'mentor' ? 'active' : ''}`}
                                onClick={() => setRole('mentor')}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    border: `1px solid ${role === 'mentor' ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    background: role === 'mentor' ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                                }}
                            >
                                <Briefcase size={24} style={{ margin: '0 auto 0.5rem', color: role === 'mentor' ? 'var(--primary)' : 'var(--text-secondary)' }} />
                                <span style={{ display: 'block', fontSize: '0.9rem' }}>Ментор</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-wrapper">
                            <User size={20} />
                            <input
                                type="text"
                                placeholder="Ваше ім'я"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-wrapper">
                            <Mail size={20} />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-wrapper">
                            <Lock size={20} />
                            <input
                                type="password"
                                placeholder="Пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-wrapper">
                            <Lock size={20} />
                            <input
                                type="password"
                                placeholder="Підтвердіть пароль"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <Button variant="glow" fullWidth type="submit" disabled={isLoading}>
                        {isLoading ? 'Реєстрація...' : 'Зареєструватися'} <ArrowRight size={18} className="ml-2" />
                    </Button>
                </form>

                <div className="login-footer">
                    <p>Вже маєте акаунт? <Link to="/login" className="link">Увійти</Link></p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;

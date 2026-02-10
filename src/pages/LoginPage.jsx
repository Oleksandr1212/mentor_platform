import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import './LoginPage.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError('Невірний email або пароль');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page fade-in">
            <div className="container">
                <div className="login-wrapper">
                    <div className="login-header">
                        <h1 className="page-title text-center">
                            Вхід у <span className="text-gradient">MentorPlatform</span>
                        </h1>
                        <p className="page-subtitle text-center">
                            Введіть свої дані для доступу до кабінету
                        </p>
                    </div>

                    <Card variant="glass" className="login-card">
                        <form onSubmit={handleSubmit} className="login-form">
                            {error && <div className="error-badge" style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#ef4444',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                textAlign: 'center',
                                fontSize: '0.9rem'
                            }}>{error}</div>}

                            <div className="form-group">
                                <div className="label-row">
                                    <label>Email адресу</label>
                                </div>
                                <div className="input-wrapper">
                                    <Mail size={18} className="input-icon" />
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="label-row">
                                    <label>Пароль</label>
                                </div>
                                <div className="input-wrapper">
                                    <Lock size={18} className="input-icon" />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="glow"
                                size="large"
                                className={`w-100 mt-2 ${isLoading ? 'loading' : ''}`}
                                disabled={isLoading}
                            >
                                <LogIn size={18} className="mr-2" />
                                {isLoading ? 'Вхід...' : 'Увійти'}
                            </Button>

                            <div className="login-footer">
                                <div className="register-links">
                                    <div className="register-group">
                                        <span>Немає акаунту?</span>
                                        <Link to="/register" className="register-link">
                                            Створити акаунт <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

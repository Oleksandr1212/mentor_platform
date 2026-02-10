import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import './BecomeMentorPage.css';

const RegisterStudentPage = ({ onRegister }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const { signup } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await signup(formData.email, formData.password, formData.name, 'student');
            navigate('/dashboard');
        } catch (error) {
            console.error('Registration error:', error);
            alert('Помилка реєстрації: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div className="become-mentor-page fade-in"> {/* Повторне використання класу для розмітки */}
            <div className="container">
                <div className="registration-wrapper">
                    <div className="registration-header">
                        <h1 className="page-title text-center">
                            Почни свій шлях до <span className="text-gradient">успіху</span>
                        </h1>
                        <p className="page-subtitle text-center">
                            Створи акаунт студента, щоб знаходити менторів та планувати заняття.
                        </p>
                    </div>

                    <Card variant="glass" className="registration-card">
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
                                        placeholder="your@email.com"
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

                            <Button
                                type="submit"
                                variant="glow"
                                size="large"
                                className={`w-100 mt-4 ${isLoading ? 'loading' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Реєстрація...' : 'Зареєструватися'}
                            </Button>

                            <div className="login-footer text-center mt-4">
                                <span className="text-secondary">Вже маєте акаунт? </span>
                                <Link to="/login" className="register-link">
                                    Увійти <ArrowRight size={14} />
                                </Link>
                            </div>
                        </form>
                    </Card>

                    <div className="text-center mt-4 animate-on-scroll fade-up delay-200">
                        <Link to="/become-mentor" className="text-secondary text-sm hover-primary transition">
                            Хочете стати ментором? Перейдіть сюди
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterStudentPage;

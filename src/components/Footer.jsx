import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer shadow-lg">
            <div className="container footer-content">
                <div className="footer-brand">
                    <div className="logo logo-footer">
                        <span className="text-gradient">Mentor</span>Platform
                    </div>
                    <p className="footer-desc">
                        Найкраще місце для пошуку наставників та розвитку ваших навичок.
                    </p>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-value">1000+</span>
                            <span className="stat-label">Менторів</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">50K+</span>
                            <span className="stat-label">Учнів</span>
                        </div>
                    </div>
                </div>

                <div className="footer-links">
                    <h4>Платформа</h4>
                    <ul>
                        <li><a href="/mentors">Пошук менторів</a></li>
                        <li><a href="/become-mentor">Стати ментором</a></li>
                    </ul>
                </div>

                <div className="footer-links">
                    <h4>Компанія</h4>
                    <ul>
                        <li><a href="/about">Про нас</a></li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <div className="container">
                    <p>&copy; 2025 MentorPlatform. Всі права захищені.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

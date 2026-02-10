import React, { useEffect } from 'react';
import { ArrowRight, Star, Shield, Zap, Users, Target } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import IconBox from '../components/ui/IconBox';
import Avatar from '../components/ui/Avatar';
import './LandingPage.css';

const LandingPage = () => {

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

    return (
        <div className="landing-page">
            <div className="landing-background-blobs">
                <div className="blob blob-hero-1"></div>
                <div className="blob blob-hero-2"></div>
                <div className="blob blob-hero-3"></div>
            </div>

            {/* Секція "Герой" */}
            <section className="hero-section">
                <div className="hero-content container">
                    <div className="hero-text-wrapper animate-on-scroll fade-up">
                        <Badge variant="glass" hasDot className="badge-glass">
                            #1 Платформа для навчання
                        </Badge>
                        <h1 className="hero-title">
                            Розкрий свій <span className="gradient-text-animated">потенціал</span> з кращими менторами
                        </h1>
                        <p className="hero-subtitle">
                            Знайди експерта, який допоможе тобі досягти професійних цілей.
                            Персоналізоване навчання, реальний досвід та кар'єрний ріст.
                        </p>

                        <div className="hero-cta-group">
                            <Button to="/mentors" variant="glow" size="medium">
                                Зайти ментора <ArrowRight size={20} />
                            </Button>
                            <Button
                                onClick={() => {
                                    const element = document.getElementById('how-it-works');
                                    if (element) {
                                        const yOffset = -300;
                                        const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
                                        window.scrollTo({ top: y, behavior: 'smooth' });
                                    }
                                }}
                                variant="glass"
                                size="medium"
                            >
                                Як це працює
                            </Button>
                        </div>

                        <div className="hero-stats glass animate-on-scroll fade-up delay-100">
                            <div className="stat-item">
                                <span className="stat-number">500+</span>
                                <span className="stat-label">Менторів</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <span className="stat-number">10k+</span>
                                <span className="stat-label">Студентів</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <span className="stat-number">4.9</span>
                                <span className="stat-label">Рейтинг</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-visual animate-on-scroll fade-left delay-200">
                        <Card variant="glass" className="visual-card main-card">
                            <div className="card-header">
                                <div className="avatar-group">
                                    <Avatar src="https://i.pravatar.cc/100?img=33" size="medium" borderColor="default" className="avatar-1" />
                                    <Avatar src="https://i.pravatar.cc/100?img=47" size="medium" borderColor="default" className="avatar-2" style={{ marginLeft: '-10px' }} />
                                    <Avatar src="https://i.pravatar.cc/100?img=12" size="medium" borderColor="default" className="avatar-3" style={{ marginLeft: '-10px' }} />
                                </div>
                                <div className="card-status">
                                    <span className="status-dot"></span>
                                    Online
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="mock-chat-interface">
                                    <div className="chat-bubble received">
                                        Привіт!👋 Я переглянув твій останній проєкт. Структура компонентів чудова!
                                    </div>
                                    <div className="chat-bubble sent">
                                        Дякую! А як щодо оптимізації ре-рендерів у головному списку?
                                    </div>
                                    <div className="chat-bubble received">
                                        Давай обговоримо це на дзвінку. Я маю кілька ідей з useMemo.
                                    </div>
                                </div>
                                <div className="mock-call-action">
                                    <div className="call-info">
                                        <div className="pulse-dot"></div>
                                        Live Session • 15:30
                                    </div>
                                    <div className="btn-icon-small">
                                        <Zap size={16} color="#fff" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                        <Card variant="glass" className="visual-card floating-card-1">
                            <Star className="icon-gold" size={24} />
                            <div>
                                <span className="bold">4.9/5</span>
                                <span className="small">Середній рейтинг</span>
                            </div>
                        </Card>
                        <Card variant="glass" className="visual-card floating-card-2">
                            <Shield className="icon-blue" size={24} />
                            <div>
                                <span className="bold">Перевірені </span>
                                <span className="small">Експерти</span>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Секція "Особливості" */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title center animate-on-scroll fade-up">Чому обирають нас?</h2>
                    <div className="features-grid">
                        <Card variant="glass" className="feature-card card-hover animate-on-scroll fade-up delay-100">
                            <IconBox color="purple" size="medium">
                                <Target size={32} />
                            </IconBox>
                            <h3>Персональний підхід</h3>
                            <p>Кожен ментор створює індивідуальний план розвитку, враховуючи на ваші цілі та поточний рівень.</p>
                        </Card>
                        <Card variant="glass" className="feature-card card-hover animate-on-scroll fade-up delay-200">
                            <IconBox color="blue" size="medium">
                                <Users size={32} />
                            </IconBox>
                            <h3>Спільнота експертів</h3>
                            <p>Доступ до найкращих спеціалістів з провідних компаній, готових ділитися реальним досвідом.</p>
                        </Card>
                        <Card variant="glass" className="feature-card card-hover animate-on-scroll fade-up delay-300">
                            <IconBox color="pink" size="medium">
                                <Zap size={32} />
                            </IconBox>
                            <h3>Швидкий ріст</h3>
                            <p>Ефективне навчання на практиці допомагає досягати кар'єрних цілей в рази швидше.</p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Секція "Як це працює" */}
            <section className="how-it-works-section" id="how-it-works">
                <div className="container">
                    <h2 className="section-title center animate-on-scroll fade-up">Як це працює</h2>
                    <div className="steps-container">
                        <div className="step-item animate-on-scroll fade-right">
                            <div className="step-number">01</div>
                            <div className="step-content">
                                <h3>Оберіть ментора</h3>
                                <p>Використовуйте фільтри щоб знайти ідеального кандидата за навичками та ціною.</p>
                            </div>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step-item animate-on-scroll fade-right delay-100">
                            <div className="step-number">02</div>
                            <div className="step-content">
                                <h3>Забронюйте час</h3>
                                <p>Оберіть зручний час у календарі ментора та розкажіть про свої очікування.</p>
                            </div>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step-item animate-on-scroll fade-right delay-200">
                            <div className="step-number">03</div>
                            <div className="step-content">
                                <h3>Розвивайтесь</h3>
                                <p>Отримуйте знання, фідбек та підтримку для досягнення ваших цілей.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Секція "Стати Ментором" (Нова) */}
            <section className="become-mentor-section">
                <div className="container">
                    <Card variant="glass" className="mentor-promo-box animate-on-scroll fade-up">
                        <div className="mentor-promo-content relative-z">
                            <h2 className="cta-title text-left">Маєш досвід? <br />Стань <span className="gradient-text-animated">ментором</span></h2>
                            <p className="cta-description text-left mb-4">
                                Ділись знаннями, впливай на майбутнє індустрії та отримуй додатковий дохід.
                                Ми беремо на себе маркетинг та організацію процесів.
                            </p>
                            <ul className="mentor-benefits-list">
                                <li><div className="check-icon"><div className="dot"></div></div> Гнучкий графік</li>
                                <li><div className="check-icon"><div className="dot"></div></div> Стабільний потік студентів</li>
                                <li><div className="check-icon"><div className="dot"></div></div> Зручна платформа для занять</li>
                            </ul>
                            <Button to="/become-mentor" variant="glow" size="medium" className="mt-4">
                                Подати заявку
                            </Button>
                        </div>
                        <div className="mentor-promo-visual relative-z">
                            <div className="visual-circle-gradient"></div>
                            <div className="glass-card-mockup">
                                <div className="mockup-header">
                                    <div className="mockup-avatar"></div>
                                    <div>
                                        <div className="mockup-line w-20"></div>
                                        <div className="mockup-line w-10"></div>
                                    </div>
                                </div>
                                <div className="mockup-income">
                                    <span>Дохід за місяць</span>
                                    <h3>$2,450</h3>
                                </div>
                            </div>

                            {/* Плаваючі елементи для секції ментора */}
                            <div className="cta-floating-element float-1" style={{ top: '-20px', left: '-20px' }}>
                                <Badge variant="glass" className="cta-badge">
                                    <Users size={14} className="mr-1" /> 50+ Студентів
                                </Badge>
                            </div>
                            <div className="cta-floating-element float-2" style={{ bottom: '-30px', right: '-10px' }}>
                                <Badge variant="glass" className="cta-badge">
                                    <Shield size={14} className="mr-1 text-green" /> Verified
                                </Badge>
                            </div>
                        </div>

                        {/* Декоративний фон */}
                        <div className="cta-decoration circle-1" style={{ left: 'auto', right: '-10%', top: '-20%' }}></div>
                        <div className="cta-decoration circle-2" style={{ right: 'auto', left: '-10%', bottom: '-20%' }}></div>
                        <div className="cta-grid-overlay"></div>
                    </Card>
                </div>
            </section>

            {/* Секція заклику до дії (CTA) */}
            <section className="cta-section">
                <div className="container">
                    <Card variant="glass" className="cta-box animate-on-scroll zoom-in">
                        <div className="cta-content relative-z">
                            <h2 className="cta-title">
                                Готові почати свій <span className="gradient-text-animated">шлях?</span>
                            </h2>
                            <p className="cta-description">
                                Приєднуйтесь до тисяч студентів, які вже змінили свою кар'єру.
                                <br />Зробіть перший крок до омріяної роботи вже сьогодні.
                            </p>
                            <Button to="/mentors" variant="glow" size="large" className="cta-button">
                                Знайти ментора зараз <ArrowRight className="ml-2" />
                            </Button>
                        </div>

                        {/* Декоративні фонові елементи */}
                        <div className="cta-decoration circle-1"></div>
                        <div className="cta-decoration circle-2"></div>
                        <div className="cta-grid-overlay"></div>

                        {/* Плаваючі елементи (Нові) */}
                        <div className="cta-floating-element float-1 animate-on-scroll fade-right delay-200">
                            <Badge variant="glass" className="cta-badge">
                                <Users size={14} className="mr-1" /> 500+ Менторів
                            </Badge>
                        </div>
                        <div className="cta-floating-element float-2 animate-on-scroll fade-left delay-300">
                            <Badge variant="glass" className="cta-badge">
                                <Star size={14} className="mr-1 text-yellow" /> 4.9 Рейтинг
                            </Badge>
                        </div>
                        <div className="cta-floating-element float-3 animate-on-scroll zoom-in delay-100">
                            <div className="mini-code-card glass">
                                <div className="dot-row">
                                    <span className="dot-r red"></span>
                                    <span className="dot-r yellow"></span>
                                    <span className="dot-r green"></span>
                                </div>
                                <div className="code-lines">
                                    <div className="line w-80"></div>
                                    <div className="line w-60"></div>
                                    <div className="line w-40"></div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;

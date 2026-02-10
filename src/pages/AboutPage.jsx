import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Users, Zap, Shield, Heart, Award, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import IconBox from '../components/ui/IconBox';
import Avatar from '../components/ui/Avatar';
import './AboutPage.css';

const AboutPage = () => {
    const navigate = useNavigate();

    // Спостерігач анімації прокрутки
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

    const values = [
        {
            icon: <Shield size={24} />,
            title: "Довіра та безпека",
            description: "Ми ретельно перевіряємо кожного ментора, щоб забезпечити найвищу якість навчання та безпеку для студентів.",
            color: "purple"
        },
        {
            icon: <Zap size={24} />,
            title: "Ефективність",
            description: "Наша платформа фокусується на швидкому результаті та практичних навичках, які реально потрібні на ринку.",
            color: "blue"
        },
        {
            icon: <Heart size={24} />,
            title: "Підтримка",
            description: "Ми віримо, що навчання — це шлях, який легше долати разом. Ком'юніті та підтримка — наша основа.",
            color: "pink"
        },
        {
            icon: <Award size={24} />,
            title: "Якість",
            description: "Тільки найкращі експерти з реальним досвідом у своїх індустріях стають частиною нашої спільноти.",
            color: "purple"
        }
    ];

    const team = [
        {
            name: "Олександр Коваленко",
            role: "Founder & CEO",
            image: "https://i.pravatar.cc/150?img=33"
        },
        {
            name: "Марія Соловей",
            role: "Head of Mentorship",
            image: "https://i.pravatar.cc/150?img=47"
        },
        {
            name: "Андрій Мороз",
            role: "CTO",
            image: "https://i.pravatar.cc/150?img=12"
        },
        {
            name: "Олена Кравчук",
            role: "Community Manager",
            image: "https://i.pravatar.cc/150?img=44"
        }
    ];

    const stats = [
        { label: "Активних менторів", value: "500+" },
        { label: "Студентів нашої платформи", value: "10,000+" },
        { label: "Успішних занять", value: "50,000+" },
        { label: "Задоволених користувачів", value: "98%" }
    ];

    return (
        <div className="about-page">
            {/* Фонові плями */}
            <div className="about-blobs">
                <div className="blob-about-1"></div>
                <div className="blob-about-2"></div>
            </div>

            <div className="container relative-z">
                {/* Секція "Герой" */}
                <section className="about-hero animate-on-scroll fade-up">
                    <h1 className="hero-title text-center">
                        Ми будуємо майбутнє <br />
                        <span className="text-gradient">освіти та менторства</span>
                    </h1>
                    <p className="hero-subtitle text-center mx-auto">
                        Наша мета — зробити знання доступними, а шлях до успіху — прозорим та ефективним для кожного.
                    </p>
                </section>

                {/* Секція місії */}
                <section className="about-mission animate-on-scroll fade-up delay-100">
                    <Card variant="glass" className="mission-card">
                        <div className="mission-content">
                            <div className="mission-tag">
                                <Target size={16} className="mr-2" />
                                Наша Місія
                            </div>
                            <h3>З'єднуємо таланти з досвідом</h3>
                            <p>
                                MentorPlatform народилася з ідеї, що кожна людина має потенціал, який можна розкрити набагато швидше за допомогою правильного наставника. Ми створюємо екосистему, де знання передаються від практиків до мрійників, перетворюючи їх на нових професіоналів.
                            </p>
                        </div>
                        <div className="mission-visual">
                            <Users size={80} className="mission-icon" />
                        </div>
                    </Card>
                </section>

                {/* Секція цінностей */}
                <section className="about-values">
                    <h2 className="section-title text-center animate-on-scroll fade-up">Наші цінності</h2>
                    <div className="values-grid">
                        {values.map((v, i) => (
                            <Card key={i} variant="glass" className={`value-card animate-on-scroll fade-up delay-${(i + 1) * 100}`}>
                                <IconBox color={v.color} className="mb-4">
                                    {v.icon}
                                </IconBox>
                                <h4>{v.title}</h4>
                                <p>{v.description}</p>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Секція статистики */}
                <section className="about-stats-strip animate-on-scroll zoom-in">
                    <div className="stats-container glass">
                        {stats.map((s, i) => (
                            <div key={i} className="stat-block">
                                <div className="stat-val">{s.value}</div>
                                <div className="stat-lab">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Секція команди */}
                <section className="about-team">
                    <h2 className="section-title text-center animate-on-scroll fade-up">Команда проекту</h2>
                    <div className="team-grid">
                        {team.map((m, i) => (
                            <div key={i} className={`team-card animate-on-scroll fade-up delay-${(i + 1) * 100}`}>
                                <div className="team-avatar-wrapper">
                                    <Avatar src={m.image} size="xlarge" className="team-avatar" />
                                    <div className="team-role-tag">{m.role}</div>
                                </div>
                                <h4 className="text-center">{m.name}</h4>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Секція історії */}
                <section className="about-story animate-on-scroll fade-up">
                    <div className="story-box glass">
                        <div className="story-text">
                            <h2>Наша історія</h2>
                            <p>
                                Все почалося у 2023 році, коли група розробників та освітян зрозуміла, наскільки важко знайти якісного ментора без зайвого шуму та складних процесів. Ми хотіли створити місце, де фокус буде лише на навчанні та прогресі.
                            </p>
                            <p>
                                Сьогодні MentorPlatform — це тисячі людей, які щодня діляться досвідом та стають кращими версіями себе.
                            </p>
                            <Button
                                variant="glow"
                                size="large"
                                className="mt-4"
                                onClick={() => navigate('/register-student')}
                            >
                                Приєднатися до нас <ArrowRight size={18} className="ml-2" />
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AboutPage;

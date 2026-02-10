import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell, Calendar, MessageSquare, Shield,
    Trash2, CheckCircle, Clock, Filter, Search
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { notificationStore } from '../services/notificationStore';
import './Notifications.css';

const formatTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now - past;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 60) return `${diffInMins} хв тому`;
    if (diffInHours < 24) return `${diffInHours} год тому`;
    return `${diffInDays} дн тому`;
};

const getNotifIcon = (type) => {
    switch (type) {
        case 'session': return <Calendar size={20} />;
        case 'message': return <MessageSquare size={20} />;
        case 'system': return <Shield size={20} />;
        default: return <Clock size={20} />;
    }
};

const Notifications = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (!user) return;

        const unsubscribe = notificationStore.subscribeToNotifications(user.uid, (data) => {
            setNotifications(data);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const markAllRead = async () => {
        if (!user) return;
        await notificationStore.markAllAsRead(user.uid);
    };

    const deleteNotification = async (id) => {
        await notificationStore.deleteNotification(id);
    };

    const markSingleRead = async (id) => {
        await notificationStore.markAsRead(id);
    };

    const filtered = notifications.filter(n => {
        if (activeTab === 'all') return true;
        return n.type === activeTab;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="notifications-page container fade-in">
            <header className="page-header mb-4">
                <div className="title-section">
                    <h1 className="page-title">Сповіщення</h1>
                    <p className="subtitle">Керуйте вашими активностями та оновленнями</p>
                </div>
                <div className="header-actions">
                    <Button variant="ghost" size="small" onClick={markAllRead} disabled={unreadCount === 0}>
                        <CheckCircle size={16} className="mr-2" /> Позначити як прочитані
                    </Button>
                </div>
            </header>

            <div className="notifications-layout">
                {/* Сайдбар фільтрів */}
                <aside className="filters-sidebar">
                    <Card variant="glass" className="filter-card">
                        <div className="search-box mb-4">
                            <Search size={16} className="search-icon" />
                            <input type="text" placeholder="Пошук сповіщень..." />
                        </div>

                        <div className="filter-nav">
                            <button
                                className={`filter-item ${activeTab === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveTab('all')}
                            >
                                <Bell size={18} />
                                <span>Всі</span>
                                {unreadCount > 0 && <span className="count">{unreadCount}</span>}
                            </button>
                            <button
                                className={`filter-item ${activeTab === 'session' ? 'active' : ''}`}
                                onClick={() => setActiveTab('session')}
                            >
                                <Calendar size={18} />
                                <span>Сесії</span>
                            </button>
                            <button
                                className={`filter-item ${activeTab === 'message' ? 'active' : ''}`}
                                onClick={() => setActiveTab('message')}
                            >
                                <MessageSquare size={18} />
                                <span>Повідомлення</span>
                            </button>
                            <button
                                className={`filter-item ${activeTab === 'system' ? 'active' : ''}`}
                                onClick={() => setActiveTab('system')}
                            >
                                <Shield size={18} />
                                <span>Системні</span>
                            </button>
                        </div>
                    </Card>
                </aside>

                {/* Основний вміст */}
                <main className="notifications-list">
                    {filtered.length > 0 ? (
                        filtered.map(notif => (
                            <Card
                                key={notif.id}
                                variant="glass"
                                className={`notif-card ${!notif.isRead ? 'unread' : ''}`}
                                onClick={() => {
                                    if (!notif.isRead) markSingleRead(notif.id);
                                    if (notif.type === 'message') navigate('/messages');
                                }}
                            >
                                <div className={`notif-icon ${notif.type}`}>
                                    {getNotifIcon(notif.type)}
                                </div>
                                <div className="notif-content">
                                    <div className="notif-header">
                                        <h4>{notif.title}</h4>
                                        <span className="time">{formatTimeAgo(notif.createdAt)}</span>
                                    </div>
                                    <p className="notif-msg">{notif.message}</p>
                                    <div className="notif-actions">
                                        <Badge variant={notif.type === 'session' ? 'primary' : 'glass'}>
                                            {notif.type.toUpperCase()}
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="small"
                                            className="delete-btn"
                                            onClick={() => deleteNotification(notif.id)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <Card variant="glass" className="empty-notif text-center">
                            <div className="empty-icon">
                                <Bell size={48} />
                            </div>
                            <h3>Поки що немає сповіщень</h3>
                            <p>Ми повідомимо вас, коли з'явиться щось нове.</p>
                        </Card>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Notifications;

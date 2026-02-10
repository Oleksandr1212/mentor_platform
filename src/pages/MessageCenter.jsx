import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Info, Send,
    ChevronLeft, Check, CheckCheck, Clock, MessageSquare
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { messageStore } from '../services/messageStore';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import './MessageCenter.css';

const MessageCenter = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [selectedChatId, setSelectedChatId] = useState(location.state?.conversationId || null);
    const [messageText, setMessageText] = useState('');
    const [isMobileListVisible, setIsMobileListVisible] = useState(!location.state?.conversationId);
    const [chats, setChats] = useState([]);
    const [currentMessages, setCurrentMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Початкове завантаження чатів
    useEffect(() => {
        const fetchChats = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const token = await user.getIdToken();
                const rawConversations = await messageStore.getChats(token);

                // Отримання метаданих (ім'я, аватар) для кожного учасника з Firestore
                const enrichedChats = await Promise.all(rawConversations.map(async (conv) => {
                    const otherUserId = conv.mentor_id === user.uid ? conv.student_id : conv.mentor_id;

                    // Отримання з Firestore
                    let name = 'Користувач';
                    let avatar = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
                    let otherUserRole = 'student';

                    try {
                        const userDoc = await getDoc(doc(db, 'users', otherUserId));
                        if (userDoc.exists()) {
                            const data = userDoc.data();
                            name = data.name || name;
                            avatar = data.avatar || avatar;
                            otherUserRole = data.role || 'student';
                        }
                    } catch (err) {
                        console.warn(`Could not fetch profile for ${otherUserId}:`, err);
                    }

                    const lastMsg = conv.messages && conv.messages[0];

                    return {
                        id: conv.id,
                        name,
                        avatar,
                        role: otherUserRole,
                        lastMessage: lastMsg ? lastMsg.text : 'Немає повідомлень',
                        time: lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                        unread: conv.unreadCount || 0,
                        otherUserId
                    };
                }));

                setChats(enrichedChats);

                // Автовибір першого чату, якщо жоден не обрано
                if (enrichedChats.length > 0 && !selectedChatId) {
                    setSelectedChatId(enrichedChats[0].id);
                }
            } catch (error) {
                console.error("Failed to load chats:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChats();
    }, [user]);

    // Періодичне отримання повідомлень та прев'ю чатів
    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const token = await user.getIdToken();

                // 1. Отримання та оновлення повідомлень для обраного чату
                if (selectedChatId) {
                    const loadedMessages = await messageStore.getMessages(selectedChatId, token);
                    const formattedMessages = loadedMessages.map(msg => ({
                        id: msg.id,
                        sender: msg.sender_id === user.uid ? 'me' : 'them',
                        text: msg.text,
                        time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        status: msg.is_read ? 'read' : 'sent'
                    }));
                    setCurrentMessages(formattedMessages);

                    // Позначити як прочитані, якщо є непрочитані від них
                    const hasUnread = loadedMessages.some(m => !m.is_read && m.sender_id !== user.uid);
                    if (hasUnread) {
                        try {
                            await messageStore.markAsRead(selectedChatId, token);
                        } catch (e) {
                            console.warn("Could not mark as read:", e);
                        }
                    }
                }

                // 2. Отримання та оновлення прев'ю чатів (сайдбар)
                const rawConversations = await messageStore.getChats(token);
                // Використовуємо функціональне оновлення для чатів, щоб уникнути мерехтіння/зайвих залежностей
                setChats(prevChats => {
                    const updatedPreviews = rawConversations.map(conv => {
                        const lastMsg = conv.messages && conv.messages[0];
                        const existingChat = prevChats.find(pc => pc.id === conv.id);

                        return {
                            ...existingChat,
                            id: conv.id,
                            lastMessage: lastMsg ? lastMsg.text : 'Немає повідомлень',
                            time: lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                            // Якщо це новий чат або ім'я/аватар відсутні, вони будуть заповнені початковим завантаженням або наступними оновленнями
                            name: existingChat?.name || 'Користувач',
                            avatar: existingChat?.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
                            unread: conv.unreadCount || 0,
                            role: existingChat?.role || 'student',
                            otherUserId: existingChat?.otherUserId || (conv.mentor_id === user.uid ? conv.student_id : conv.mentor_id)
                        };
                    });
                    return updatedPreviews;
                });

            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 3000); // Опитування кожні 3 секунди
        return () => clearInterval(interval);
    }, [selectedChatId, user]);

    // Прокрутка вниз при зміні повідомлень
    useEffect(() => {
        scrollToBottom("smooth");
    }, [currentMessages]);

    const scrollToBottom = (behavior = "auto") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    // Підготовка інформації про поточний чат зі списку
    const currentChat = chats.find(c => c.id === selectedChatId);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (messageText.trim() && user) {
            try {
                const token = await user.getIdToken();
                const newMessage = await messageStore.addMessage(selectedChatId, messageText, token);

                // Оптимістичне оновлення UI
                const formattedMsg = {
                    id: newMessage.id,
                    sender: 'me',
                    text: messageText,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: 'sent'
                };
                setCurrentMessages([...currentMessages, formattedMsg]);
                setMessageText('');

                // Оптимістичне оновлення прев'ю в сайдбарі
                setChats(prevChats => {
                    const chatIdx = prevChats.findIndex(c => c.id === selectedChatId);
                    if (chatIdx === -1) return prevChats;

                    const updatedChat = {
                        ...prevChats[chatIdx],
                        lastMessage: messageText,
                        time: formattedMsg.time
                    };

                    const rest = prevChats.filter(c => c.id !== selectedChatId);
                    return [updatedChat, ...rest]; // Перемістити нагору
                });
            } catch (error) {
                console.error("Failed to send message:", error);
            }
        }
    };

    const toggleChat = (id) => {
        setSelectedChatId(id);
        setIsMobileListVisible(false);
    };

    return (
        <div className="message-center-page fade-in">
            <div className="container message-container-wrapper">
                <Card variant="glass" className="message-card">
                    {/* Сайдбар / Список чатів */}
                    <div className={`chats-list-sidebar ${!isMobileListVisible ? 'mobile-hidden' : ''}`}>
                        <div className="sidebar-header">
                            <h2>Повідомлення</h2>
                        </div>

                        <div className="chats-scroll-area">
                            {chats.map(chat => (
                                <div
                                    key={chat.id}
                                    className={`chat-item ${selectedChatId === chat.id ? 'active' : ''} ${chat.unread > 0 ? 'unread' : ''}`}
                                    onClick={() => toggleChat(chat.id)}
                                >
                                    <div className="avatar-wrapper">
                                        <Avatar src={chat.avatar} size="medium" />
                                        {chat.unread > 0 && <span className="unread-dot-indicator"></span>}
                                    </div>
                                    <div className="chat-info">
                                        <div className="chat-header">
                                            <span className="chat-name">{chat.name}</span>
                                            <span className="chat-time">{chat.time}</span>
                                        </div>
                                        <div className="chat-preview">
                                            <p className="last-message">{chat.lastMessage}</p>
                                            {chat.unread > 0 && <span className="sidebar-unread-badge">{chat.unread}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Вікно чату */}
                    <div className={`chat-window ${isMobileListVisible ? 'mobile-hidden' : ''}`}>
                        {currentChat ? (
                            <>
                                <header className="chat-window-header">
                                    <button className="back-btn" onClick={() => setIsMobileListVisible(true)}>
                                        <ChevronLeft size={24} />
                                    </button>
                                    <div className="header-user-info">
                                        <Avatar src={currentChat.avatar} size="small" />
                                        <div>
                                            <h4>{currentChat.name}</h4>
                                        </div>
                                    </div>
                                    <div className="header-actions">
                                        {currentChat.role === 'mentor' && (
                                            <Link
                                                to={`/mentor/${currentChat.otherUserId}`}
                                                className="icon-btn"
                                                title="Подивитися профіль ментора"
                                            >
                                                <Info size={20} />
                                            </Link>
                                        )}
                                    </div>
                                </header>

                                <div className="messages-area">
                                    <div className="date-divider">
                                        <span>Сьогодні</span>
                                    </div>
                                    {currentMessages.map(msg => (
                                        <div key={msg.id} className={`message-bubble-wrapper ${msg.sender}`}>
                                            <div className="message-bubble">
                                                <p>{msg.text}</p>
                                                <div className="message-meta">
                                                    <span className="time">{msg.time}</span>
                                                    {msg.sender === 'me' && (
                                                        <span className="status">
                                                            {msg.status === 'read' ? <CheckCheck size={14} className="text-secondary" /> : <Check size={14} />}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                <footer className="message-input-footer">
                                    <form className="message-form" onSubmit={handleSendMessage}>
                                        <input
                                            type="text"
                                            placeholder="Напишіть повідомлення..."
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                        />
                                        <button type="submit" className="send-btn" disabled={!messageText.trim()}>
                                            <Send size={20} />
                                        </button>
                                    </form>
                                </footer>
                            </>
                        ) : (
                            <div className="no-chat-selected">
                                <div className="no-chat-content">
                                    <MessageSquare size={64} className="text-secondary opacity-20" />
                                    <h3>Оберіть чат, щоб почати спілкування</h3>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default MessageCenter;

import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, User, Menu, LogOut } from 'lucide-react';
import { notificationStore } from '../services/notificationStore';
import { messageStore } from '../services/messageStore';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Button from './ui/Button';
import './Navbar.css';

const Navbar = ({ user, authUser, onLogout }) => {
  const navigate = useNavigate();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastMessagesRef = useRef({}); // Відстеження ID останнього повідомлення для виявлення НОВИХ повідомлень

  const isLoggedIn = !!authUser;
  const userRole = user?.role || 'student';

  // Підписка на сповіщення в реальному часі
  useEffect(() => {
    if (!authUser?.uid) return;

    const unsubscribe = notificationStore.subscribeToNotifications(authUser.uid, (notifications) => {
      const unread = notifications.filter(n => !n.isRead).length;
      setUnreadNotifications(unread);
    });

    return () => unsubscribe();
  }, [authUser]);

  // Опитування повідомлень (червона крапка + сповіщення "Нове повідомлення")
  useEffect(() => {
    if (!authUser?.uid) return;

    const checkMessages = async () => {
      try {
        const token = await authUser.getIdToken();
        const rawConversations = await messageStore.getChats(token);

        let totalUnread = 0;
        let newMessageFound = false;
        let lastSenderId = '';

        for (const conv of rawConversations) {
          totalUnread += conv.unreadCount || 0;

          const lastMsg = conv.messages[0];
          if (lastMsg && lastMsg.sender_id !== authUser.uid) {
            const lastKnownId = lastMessagesRef.current[conv.id];

            // Якщо ми маємо новий ID повідомлення, який ми раніше не бачили
            if (lastKnownId && lastKnownId !== lastMsg.id) {
              newMessageFound = true;
              lastSenderId = lastMsg.sender_id;
            }
            lastMessagesRef.current[conv.id] = lastMsg.id;
          }
        }

        setUnreadMessages(totalUnread);

        if (newMessageFound && lastSenderId) {
          try {
            const userDoc = await getDoc(doc(db, 'users', lastSenderId));
            const name = userDoc.exists() ? userDoc.data().name : 'Користувач';

            // Створити реальне сповіщення в Firestore
            await notificationStore.addNotification({
              recipientId: authUser.uid,
              senderId: lastSenderId,
              type: 'message',
              title: 'Нове повідомлення',
              message: `${name} надіслав вам повідомлення`,
              link: '/messages' // Опціонально: допомога з перенаправленням
            });

            // Опціонально: Ви можете показати тост або щось менш нав'язливе, ніж alert()
            // але користувач спеціально просив, щоб це потрапляло в розділ сповіщень.
            console.log("New message notification created for", name);
          } catch (e) {
            console.warn("Could not fetch sender name or create notification:", e);
          }
        }

      } catch (error) {
        console.warn("Could not check messages for navbar:", error);
      }
    };

    checkMessages();
    const interval = setInterval(checkMessages, 5000); // Перевірка кожні 5 с
    return () => clearInterval(interval);
  }, [authUser]);

  const handleLogout = async () => {
    try {
      if (onLogout) await onLogout();
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="navbar glass">
      <div className="container navbar-content">
        <Link to="/" className="logo" onClick={closeMobileMenu}>
          <span className="text-gradient">Mentor</span>Platform
        </Link>

        {/* Посилання для десктопу */}
        <div className="nav-links">
          <NavLink to="/mentors">Знайти ментора</NavLink>
          {isLoggedIn && (
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
              Мій кабінет
            </NavLink>
          )}
          {!isLoggedIn && (
            <NavLink to="/become-mentor">Стати ментором</NavLink>
          )}
          <NavLink to="/about">Про нас</NavLink>
        </div>

        {/* Оверлей мобільного меню */}
        <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={closeMobileMenu}>
          <div className="mobile-menu-content" onClick={e => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <span className="text-gradient font-bold text-xl">Меню</span>
              <button className="close-menu-btn" onClick={closeMobileMenu}>
                <MessageSquare size={0} /> {/* Розпірка */}
                &times;
              </button>
            </div>
            <div className="mobile-nav-links">
              <NavLink to="/mentors" onClick={closeMobileMenu}>Знайти ментора</NavLink>
              {isLoggedIn ? (
                <NavLink to="/dashboard" onClick={closeMobileMenu}>Мій кабінет</NavLink>
              ) : (
                <NavLink to="/become-mentor" onClick={closeMobileMenu}>Стати ментором</NavLink>
              )}
              <NavLink to="/about" onClick={closeMobileMenu}>Про нас</NavLink>

              {!isLoggedIn && (
                <div className="mobile-auth-actions">
                  <Link to="/login" onClick={closeMobileMenu}>
                    <Button variant="ghost" fullWidth>Увійти</Button>
                  </Link>
                  <Link to="/register" onClick={closeMobileMenu}>
                    <Button variant="primary" fullWidth>Почати</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="nav-actions">
          {!isLoggedIn ? (
            <div className="auth-actions">
              <Link to="/login">
                <Button variant="ghost" size="small">Увійти</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="small">Почати</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Відновлення чатів та сповіщень */}
              <Link to="/messages" className="icon-btn" title="Повідомлення">
                <div className="icon-wrapper">
                  <MessageSquare size={20} />
                  {unreadMessages > 0 && <span className="badge">{unreadMessages}</span>}
                </div>
              </Link>
              <Link to="/notifications" className="icon-btn" title="Сповіщення">
                <div className="icon-wrapper">
                  <Bell size={20} />
                  {unreadNotifications > 0 && <span className="badge">{unreadNotifications}</span>}
                </div>
              </Link>

              <Link to="/dashboard" className="icon-btn profile-link" title={`Мій профіль: ${user?.name || ''}`}>
                <User size={20} />
                {user?.name && <span className="user-name-nav">{user.name.split(' ')[0]}</span>}
              </Link>

              <button className="icon-btn logout-btn" title="Вийти" onClick={handleLogout}>
                <LogOut size={20} />
              </button>
            </>
          )}
          <button className="menu-btn" onClick={toggleMobileMenu}>
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import LandingPage from './pages/LandingPage';
import FindMentorPage from './pages/FindMentorPage';
import MentorProfile from './pages/MentorProfile';
import StudentDashboard from './pages/StudentDashboard';
import MentorDashboard from './pages/MentorDashboard';
import BecomeMentorPage from './pages/BecomeMentorPage';
import RegisterStudentPage from './pages/RegisterStudentPage'; // Restored import
import LoginPage from './pages/LoginPage';
import MessageCenter from './pages/MessageCenter';
import AboutPage from './pages/AboutPage';
import SessionDetails from './pages/SessionDetails';
import Notifications from './pages/Notifications';

// Сторінки-заглушки (будуть реалізовані пізніше)
const HowItWorks = () => <div className="page-content container"><h1>Як це працює</h1></div>;
const Settings = () => <div className="page-content container"><h1>Налаштування</h1></div>;

// Допоміжний компонент для прокрутки вгору при зміні маршруту
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function AppContent() {
  const location = useLocation();
  const isMessagesPage = location.pathname === '/messages';
  const { user: authUser, userData, logout } = useAuth();

  return (
    <div className="app">
      <Navbar user={userData} authUser={authUser} onLogout={logout} />
      <main className={`main-content ${isMessagesPage ? 'full-height' : ''}`}>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* Відновлені окремі потоки реєстрації */}
          <Route path="/register" element={<RegisterStudentPage />} />
          <Route path="/register-student" element={<Navigate to="/register" replace />} />

          <Route path="/mentors" element={<FindMentorPage />} />
          <Route path="/mentor/:id" element={<MentorProfile />} />

          {/* Захищені маршрути студента */}
          <Route element={<PrivateRoute allowedRoles={['student']} />}>
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/dashboard" element={<Navigate to="/student-dashboard" replace />} />
          </Route>

          {/* Захищені маршрути ментора */}
          <Route element={<PrivateRoute allowedRoles={['mentor']} />}>
            <Route path="/mentor-dashboard" element={<MentorDashboard />} />
          </Route>

          {/* Загальні захищені маршрути */}
          <Route element={<PrivateRoute />}>
            <Route path="/messages" element={<MessageCenter />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/session/:id" element={<SessionDetails />} />
          </Route>

          <Route
            path="/become-mentor"
            element={<BecomeMentorPage />}
          />

          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
      {!isMessagesPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TasksView from './components/TasksView';
import CalendarView from './components/CalendarView';
import AccountSettings from './components/AccountSettings';
import Login from './components/Login';
import Register from './components/Register';
import StatsPage from './components/StatsPage';
import { folderAPI } from './api';
import './styles/App.css';
import checklistIcon from './components/checklist.png';
import calendarIcon from './components/calendar.png';
import settingsIcon from './components/setting.png';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [currentView, setCurrentView] = useState('tasks');
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateToViewInCalendar, setDateToViewInCalendar] = useState(null); // New state
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true; // Default to dark theme
  });
  const [showQuote, setShowQuote] = useState(false);
  const [currentQuote, setCurrentQuote] = useState({ text: '', author: '' });
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const motivationalQuotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
    { text: "Success is not how high you have climbed, but how you make a positive difference to the world.", author: "Roy T. Bennett" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
    { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
    { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
    { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.", author: "Roy T. Bennett" },
    { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
    { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
    { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
    { text: "Act as if what you do makes a difference. It does.", author: "William James" },
    { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      loadFolders();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Apply theme to body
    document.body.className = isDarkTheme ? 'dark-theme' : 'light-theme';
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const response = await folderAPI.getFolders();
      setFolders(response.data);
      if (response.data.length > 0 && !selectedFolder) {
        setSelectedFolder(response.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentView('tasks');
    loadFolders();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentView('login');
    setFolders([]);
    setSelectedFolder(null);
    setDateToViewInCalendar(null); // Reset date on logout
  };

  const handleViewDateInCalendar = (date) => {
    setDateToViewInCalendar(new Date(date));
    setCurrentView('calendar');
  };

  const handleTaskClickInCalendar = (folderId) => {
    setSelectedFolder(folderId);
    setCurrentView('tasks');
  };

  const handleFireClick = () => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setCurrentQuote(motivationalQuotes[randomIndex]);
    setShowQuote(true);
  };

  const closeQuoteModal = () => {
    setShowQuote(false);
  };

  if (!isAuthenticated) {
    return (
      <>
        {currentView === 'login' ? (
          <Login 
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setCurrentView('register')}
          />
        ) : (
          <Register
            onRegisterSuccess={() => {
              handleLoginSuccess();
              setCurrentView('tasks');
            }}
            onSwitchToLogin={() => setCurrentView('login')}
          />
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            cursor: 'pointer',
            color: '#667eea',
            textDecoration: 'underline',
            fontSize: '14px',
          }}
          onClick={() => setCurrentView(currentView === 'login' ? 'register' : 'login')}
        >
          {currentView === 'login'
            ? "Don't have an account? Register"
            : 'Already have an account? Login'}
        </div>
      </>
    );
  }

  return (
    <div className="container">
      <Sidebar
        folders={folders}
        selectedFolder={selectedFolder}
        onSelectFolder={setSelectedFolder}
        onRefresh={loadFolders}
        onNavigate={setCurrentView}
      />

      <div className="main-content">
        <div className="header">
          <div className="header-title">
            {currentView === 'tasks' ? (
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={checklistIcon}
                  alt="Tasks"
                  style={{ width: '24px', height: '24px', marginRight: '8px' }}
                />
                My Tasks
              </span>
            ) : currentView === 'calendar' ? (
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={calendarIcon}
                  alt="Calendar"
                  style={{ width: '24px', height: '24px', marginRight: '8px' }}
                />
                Calendar
              </span>
            ) : (
              <div>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src={settingsIcon}
                    alt="Account Settings"
                    style={{
                      width: '24px',
                      height: '24px',
                      marginRight: '8px',
                    }}
                  />
                  Account Settings
                </span>
                <div className="header-welcome-message">
                  Welcome, <strong>{user.username}</strong>
                </div>
              </div>
            )}
          </div>
          <div className="header-actions">
            <button
              className="fire-btn"
              onClick={handleFireClick}
              title="Get Motivated!"
            >
              <div className="fire-icon">
                🔥
              </div>
            </button>
            <button
              className="theme-toggle-btn"
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              title={isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <div className={`theme-icon ${isDarkTheme ? 'dark' : 'light'}`}>
                {isDarkTheme ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                )}
              </div>
            </button>
            <button
              className={`tab-btn ${currentView === 'tasks' ? 'active' : ''}`}
              onClick={() => setCurrentView('tasks')}
            >
              Tasks
            </button>
            <button
              className={`tab-btn ${currentView === 'calendar' ? 'active' : ''}`}
              onClick={() => setCurrentView('calendar')}
            >
              Calendar
            </button>
            <button
              className={`tab-btn ${currentView === 'stats' ? 'active' : ''}`}
              onClick={() => setCurrentView('stats')}
            >
              Stats
            </button>
            <button
              className={`tab-btn ${currentView === 'account' ? 'active' : ''}`}
              onClick={() => setCurrentView('account')}
            >
              Account
            </button>
          </div>
        </div>

        <div className="content-area">
          {currentView === 'tasks' && (
            <TasksView
              selectedFolder={selectedFolder}
              folders={folders}
              onViewDateInCalendar={handleViewDateInCalendar}
            />
          )}
          {currentView === 'calendar' && (
            <CalendarView 
              initialDate={dateToViewInCalendar} 
              onTaskClick={handleTaskClickInCalendar}
            />
          )}
          {currentView === 'stats' && (
            <StatsPage />
          )}
          {currentView === 'account' && (
            <AccountSettings onLogout={handleLogout} />
          )}
        </div>
      </div>

      {/* Motivational Quote Modal */}
      {showQuote && (
        <div className="quote-modal-overlay" onClick={closeQuoteModal}>
          <div className="quote-modal" onClick={(e) => e.stopPropagation()}>
            <button className="quote-close-btn" onClick={closeQuoteModal}>
              ×
            </button>
            <div className="quote-content">
              <div className="quote-icon">🔥</div>
              <p className="quote-text">"{currentQuote.text}"</p>
              <p className="quote-author">— {currentQuote.author}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

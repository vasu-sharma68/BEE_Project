import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TasksView from './components/TasksView';
import CalendarView from './components/CalendarView';
import AccountSettings from './components/AccountSettings';
import Login from './components/Login';
import Register from './components/Register';
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
  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    if (isAuthenticated) {
      loadFolders();
    }
  }, [isAuthenticated]);

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
            <CalendarView initialDate={dateToViewInCalendar} />
          )}
          {currentView === 'account' && (
            <AccountSettings onLogout={handleLogout} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

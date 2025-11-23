import React, { useState, useEffect, useRef } from 'react';
import { taskAPI } from '../api';
import TaskForm from './TaskForm';
import TaskCard from './TaskCard';
import '../styles/App.css';
import emptyBoxIcon from './empty-box.png';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

function TasksView({ selectedFolder, folders, onViewDateInCalendar }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterPriority, setFilterPriority] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // New state for status filtering
  const socketRef = useRef(null);

  // Get current folder data
  const currentFolder = folders?.find(f => f._id === selectedFolder);

  useEffect(() => {
    if (selectedFolder) {
      loadTasks();
    }
  }, [selectedFolder]);

  useEffect(() => {
    if (!selectedFolder) return;
    // Connect to socket.io
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL);
    }
    const socket = socketRef.current;
    socket.emit('joinFolder', selectedFolder);
    socket.on('taskUpdated', (data) => {
      // Reload tasks on any update
      loadTasks();
    });
    return () => {
      socket.emit('leaveFolder', selectedFolder);
      socket.off('taskUpdated');
    };
    // eslint-disable-next-line
  }, [selectedFolder]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await taskAPI.getTasks(selectedFolder);
      setTasks(response.data);
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await taskAPI.createTask(
        taskData.title,
        taskData.description,
        selectedFolder,
        taskData.priority,
        taskData.dueDate
      );
      setShowForm(false);
      loadTasks();
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      await taskAPI.updateTask(taskId, taskData);
      setEditingTask(null);
      loadTasks();
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskAPI.deleteTask(taskId);
        loadTasks();
      } catch (err) {
        setError('Failed to delete task');
      }
    }
  };

  const handleToggleComplete = async (taskId, completed) => {
    try {
      await taskAPI.updateTask(taskId, { completed });
      loadTasks();
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const filteredTasks = tasks.filter((task) => {
    // Filter by priority
    if (filterPriority !== 'all' && task.priority !== filterPriority) {
      return false;
    }
    
    // Filter by status
    if (statusFilter === 'pending' && task.completed) {
      return false;
    }
    if (statusFilter === 'completed' && !task.completed) {
      return false;
    }
    
    return true;
  });

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  const handleStatusFilterClick = (filter) => {
    setStatusFilter(filter);
  };

  if (!selectedFolder) {
    return (
      <div className="empty-state">
        <img src={emptyBoxIcon} alt="No folder selected" className="empty-state-icon-img" />
        <h2>Select a Folder</h2>
        <p>Choose a folder from the sidebar to see its tasks.</p>
      </div>
    );
  }

  return (
    <div>
      {error && <div className="error-message">{error}</div>}

      {/* Dashboard Stats Cards */}
      <div className="dashboard-stats">
        <div 
          className={`stat-card pending ${statusFilter === 'pending' ? 'active' : ''}`}
          onClick={() => handleStatusFilterClick('pending')}
        >
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-number">{pendingTasks}</div>
            <div className="stat-label">Pending Tasks</div>
          </div>
        </div>

        <div 
          className={`stat-card completed ${statusFilter === 'completed' ? 'active' : ''}`}
          onClick={() => handleStatusFilterClick('completed')}
        >
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{completedTasks}</div>
            <div className="stat-label">Completed Tasks</div>
          </div>
        </div>

        <div 
          className={`stat-card total ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleStatusFilterClick('all')}
        >
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-number">{totalTasks}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>
      </div>

      {/* Active Filter Indicator */}
      {statusFilter !== 'all' && (
        <div className="active-filter-badge">
          <span>
            Showing: <strong>{statusFilter === 'pending' ? 'Pending' : 'Completed'} Tasks</strong>
          </span>
          <button 
            className="clear-filter-btn" 
            onClick={() => setStatusFilter('all')}
            title="Clear filter"
          >
            ✕
          </button>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="priority-filter-select"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingTask(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Cancel' : '+ New Task'}
        </button>
      </div>

      {showForm && (
        <div className="task-form-container">
          <TaskForm
            folderId={selectedFolder}
            onSubmit={handleCreateTask}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editingTask && (
        <div className="task-form-container">
          <h3>Edit Task</h3>
          <TaskForm
            folderId={selectedFolder}
            initialTask={editingTask}
            onSubmit={(data) => handleUpdateTask(editingTask._id, data)}
            onCancel={() => setEditingTask(null)}
          />
        </div>
      )}

      {loading ? (
        <div className="empty-state">
          <div className="spinner"></div>
          <p>Loading tasks...</p>
        </div>
      ) : filteredTasks.length > 0 ? (
        <div>
          {filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onUpdate={(data) => handleUpdateTask(task._id, data)}
              onDelete={handleDeleteTask}
              onToggleComplete={handleToggleComplete}
              onViewDateInCalendar={onViewDateInCalendar} /* Pass the new prop */
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <img src={emptyBoxIcon} alt="No tasks" className="empty-state-icon-img" />
          <h2>No Tasks Yet</h2>
          <p>Click "Add New Task" to get started.</p>
        </div>
      )}
      
      {currentFolder && currentFolder.sharedWith && currentFolder.sharedWith.length > 0 && (
        <div style={{
          marginbottom: '-30px',
          paddingTop: '15px',
          borderTop: '1px solid #ecf0f1',
          fontSize: '12px',
          color: '#95a5a6'
        }}>
          <strong>Shared with:</strong> {currentFolder.sharedWith.map(share => share.userId?.username || 'User').join(', ')}
        </div>
      )}
    </div>
  );
}

export default TasksView;

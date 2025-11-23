import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { taskAPI } from '../api';
import 'react-calendar/dist/Calendar.css';
import '../styles/App.css';

function CalendarView({ initialDate, onTaskClick }) {
  const [selectedDate, setSelectedDate] = useState(initialDate ? new Date(initialDate) : new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [initialDate]); // Re-run loadTasks if initialDate changes

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(new Date(initialDate));
    }
  }, [initialDate]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getTasks();
      setTasks(response.data);
    } catch (err) {
      console.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task) => {
    if (onTaskClick && task.folderId) {
      onTaskClick(task.folderId);
    }
  };

  const getTasksForDate = (date) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      return (
        format(new Date(task.dueDate), 'yyyy-MM-dd') ===
        format(date, 'yyyy-MM-dd')
      );
    });
  };

  const selectedDateTasks = getTasksForDate(selectedDate);

  const tileContent = ({ date }) => {
    const tasksOnDate = getTasksForDate(date);
    if (tasksOnDate.length > 0) {
      return (
        <div style={{ marginTop: '5px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '6px',
              height: '6px',
              backgroundColor: '#3498db',
              borderRadius: '50%',
            }}
          ></span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="calendar-view-container">
      <div className="calendar-widget">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          activeStartDate={selectedDate}
          tileContent={tileContent}
        />
      </div>

      <div className="tasks-on-day-display">
        <h3 className="tasks-on-day-header">
          Scheduled for: {format(selectedDate, 'MMMM d, yyyy')}
        </h3>
        <div className="tasks-on-day-list">
          {selectedDateTasks.length > 0 ? (
            selectedDateTasks.map((task) => (
              <div 
                key={task._id} 
                className={`task-card-small ${task.priority}`}
                onClick={() => handleTaskClick(task)}
                style={{ cursor: 'pointer', position: 'relative' }}
                title="Click to view in folder"
              >
                <div className="task-card-small-title">
                  {task.title}
                  <span style={{ 
                    marginLeft: '8px', 
                    fontSize: '12px', 
                    opacity: 0.6,
                    transition: 'opacity 0.3s ease'
                  }}>
                    📁
                  </span>
                </div>
                <span className={`priority-badge priority-${task.priority}`}>
                  {task.priority}
                </span>
              </div>
            ))
          ) : (
            <p className="no-tasks-message">
              No tasks scheduled for this day.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CalendarView;

# Task Manager Application

A full-featured task management application with authentication, folder organization, priority levels, and calendar view.

## Features

- **User Authentication**: Register and login with secure password hashing
- **Task Management**: Create, read, update, and delete tasks
- **Folder Organization**: Create custom folders to organize tasks (Family, Dog, Office, etc.)
- **Priority Levels**: Assign priorities (Low, Medium, High) with color coding
- **Due Dates**: Set due dates for tasks
- **Calendar View**: Visual calendar showing tasks with due dates
- **Pinned Folders**: Pin important folders to the top of the sidebar
- **Account Management**: Update profile and delete account
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
taskmanager/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Task.js
│   │   └── Folder.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   └── folderController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   └── folders.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Sidebar.js
    │   │   ├── TasksView.js
    │   │   ├── TaskForm.js
    │   │   ├── TaskCard.js
    │   │   ├── CalendarView.js
    │   │   └── AccountSettings.js
    │   ├── styles/
    │   │   └── App.css
    │   ├── App.js
    │   ├── index.js
    │   ├── api.js
    │   └── index.html
    ├── package.json
    └── public/
        └── index.html
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud instance like MongoDB Atlas)

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will open at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `DELETE /api/auth/account` - Delete user account

### Tasks
- `POST /api/tasks` - Create a task
- `GET /api/tasks` - Get all tasks (with optional folderId query)
- `GET /api/tasks/:id` - Get a single task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Folders
- `POST /api/folders` - Create a folder
- `GET /api/folders` - Get all folders
- `GET /api/folders/:id` - Get a single folder
- `PUT /api/folders/:id` - Update a folder
- `DELETE /api/folders/:id` - Delete a folder

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Create Folders**: Click "New Folder" in the sidebar to create custom folders
3. **Pin Folders**: Click the pin icon to pin high-priority folders to the top
4. **Add Tasks**: Select a folder and click "New Task" to create tasks
5. **Set Priority**: Assign Low, Medium, or High priority to tasks
6. **Set Due Dates**: Add due dates to tasks for scheduling
7. **View Calendar**: Click "Calendar" tab to see tasks organized by date
8. **Complete Tasks**: Check the checkbox to mark tasks as complete
9. **Manage Account**: Click "Account" tab to update profile or delete account

## Color Coding

- **Low Priority**: Green (#2ecc71)
- **Medium Priority**: Orange (#f39c12)
- **High Priority**: Red (#e74c3c)

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected API routes
- User isolation (users only see their own data)

## Future Enhancements

- Task sharing and collaboration
- Recurring tasks
- Task reminders and notifications
- Export tasks to CSV/PDF
- Dark mode
- Mobile app
- Task attachments
- Task comments

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check MongoDB URI in .env file
- For MongoDB Atlas, whitelist your IP address

### CORS Errors
- Make sure backend is running on port 5000
- Check CORS configuration in server.js

### Frontend Can't Connect to Backend
- Verify backend is running
- Check proxy setting in frontend/package.json
- Ensure correct API URLs in api.js

## License

MIT License

## Support

For issues or questions, please create an issue in the repository.

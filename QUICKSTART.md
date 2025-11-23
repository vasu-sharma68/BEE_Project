# Quick Start Guide

## Installation & Running the Application

### Step 1: Install MongoDB
Download and install MongoDB from https://www.mongodb.com/try/download/community

### Step 2: Backend Setup

1. Open PowerShell and navigate to the backend folder:
```powershell
cd c:\Users\vasu sharma\Desktop\taskmanager\backend
npm install
```

2. Start the backend server:
```powershell
npm run dev
```

You should see: "Server running on port 5000"

### Step 3: Frontend Setup (in a new PowerShell terminal)

1. Navigate to the frontend folder:
```powershell
cd c:\Users\vasu sharma\Desktop\taskmanager\frontend
npm install
```

2. Start the frontend server:
```powershell
npm start
```

React will automatically open in your browser at http://localhost:3000

## Using the Application

### First Time Setup
1. Click "Register here" to create a new account
2. Fill in username, email, and password
3. Click "Register"

### Creating Tasks
1. In the sidebar, click "+ New Folder" to create a folder (e.g., "Family", "Dog", "Office")
2. Click on a folder to select it
3. Click "+ New Task" in the main area
4. Fill in:
   - Task Title
   - Description (optional)
   - Priority (Low/Medium/High)
   - Due Date (optional)
5. Click "Create Task"

### Managing Folders
- **Pin a folder**: Click the 📌 icon to pin important folders to the top
- **Edit a folder**: Click the ✏️ icon to rename
- **Delete a folder**: Click the 🗑️ icon (will delete all tasks in it)

### Managing Tasks
- **Complete a task**: Check the checkbox
- **Edit a task**: Click "Edit" button
- **Delete a task**: Click "Delete" button
- **Filter by priority**: Use the dropdown in the tasks area

### Calendar View
- Click "Calendar" tab to see all tasks with due dates
- Click on a date to see tasks scheduled for that day
- Tasks with due dates show a blue dot on the calendar

### Account Management
- Click "Account" tab to:
  - Update username or email
  - Delete your account (warning: this is permanent)

## Features Summary

✅ User authentication (Register/Login)
✅ Create, update, delete tasks (CRUD operations)
✅ Add due dates to tasks
✅ Set priority levels (Low/Medium/High) with color coding
✅ Organize tasks into custom folders
✅ Pin important folders to top of sidebar
✅ Calendar view showing due dates
✅ Account management (update/delete profile)
✅ Responsive design for mobile and desktop

## Troubleshooting

### Backend won't connect to MongoDB
- Make sure MongoDB service is running
- Check .env file has correct MONGODB_URI
- For MongoDB Atlas cloud, ensure IP is whitelisted

### Frontend shows "Cannot reach backend"
- Make sure backend is running on port 5000
- Check that you didn't change the proxy in frontend/package.json
- Clear browser cache and refresh

### Tasks not showing up
- Make sure you selected a folder first
- Check that tasks are assigned to that folder
- Try refreshing the page

### Port already in use
If port 5000 or 3000 is already in use:
- Change PORT in backend/.env to another port (e.g., 5001)
- Change proxy in frontend/package.json to match new port
- Change React port by adding to frontend/.env: REACT_APP_PORT=3001

## Next Steps

1. Start both servers
2. Create an account
3. Create some folders
4. Add tasks with due dates
5. Explore the calendar view
6. Pin your favorite folders

Enjoy managing your tasks! 📋✨

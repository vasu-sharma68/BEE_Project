const Task = require('../models/Task');
const Folder = require('../models/Folder');

// Helper to format date as YYYY-MM-DD
const formatDate = (d) => {
  const dt = new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Personal stats
const personalStats = async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();

    // Fetch completed tasks for user
    const completedTasks = await Task.find({ userId, completed: true }).select('createdAt updatedAt').lean();

    // Tasks completed per day (last 7 days)
    const last7 = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      return formatDate(d);
    }).reverse();

    const completedByDay = last7.map((date) => ({ date, count: 0 }));

    // Tasks completed per week (last 4 weeks) - week starting Monday
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i * 7);
      // Move to Monday
      const day = d.getDay(); // 0 (Sun) - 6
      const diffToMonday = (day + 6) % 7; // 0->6,1->0...
      d.setDate(d.getDate() - diffToMonday);
      weeks.push(formatDate(d));
    }
    const completedByWeek = weeks.map((weekStart) => ({ weekStart, count: 0 }));

    // Prepare data for most productive day (last 30 days)
    const dayCounts = {};
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 29);

    // Average completion time
    let totalCompletionMs = 0;
    let completionCountForAvg = 0;

    for (const t of completedTasks) {
      const completedDate = new Date(t.updatedAt || t.createdAt);
      const completedDateStr = formatDate(completedDate);

      // last 7 days
      const idx = completedByDay.findIndex((d) => d.date === completedDateStr);
      if (idx !== -1) completedByDay[idx].count++;

      // last 4 weeks - find the week start Monday that <= completedDate
      for (let w = 0; w < weeks.length; w++) {
        const weekStart = new Date(weeks[w]);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        if (completedDate >= weekStart && completedDate < weekEnd) {
          completedByWeek[w].count++;
          break;
        }
      }

      // last 30 days counts
      if (completedDate >= thirtyDaysAgo) {
        dayCounts[completedDateStr] = (dayCounts[completedDateStr] || 0) + 1;
      }

      // avg completion
      if (t.createdAt && t.updatedAt) {
        totalCompletionMs += (new Date(t.updatedAt) - new Date(t.createdAt));
        completionCountForAvg++;
      }
    }

    // Most productive day
    let mostProductiveDay = null;
    let mostCount = 0;
    Object.keys(dayCounts).forEach((day) => {
      if (dayCounts[day] > mostCount) {
        mostCount = dayCounts[day];
        mostProductiveDay = day;
      }
    });

    const averageCompletionTimeMs = completionCountForAvg ? Math.round(totalCompletionMs / completionCountForAvg) : 0;

    res.json({
      tasksCompletedLast7Days: completedByDay,
      tasksCompletedLast4Weeks: completedByWeek,
      averageCompletionTimeMs,
      averageCompletionTimeHuman: msToHuman(averageCompletionTimeMs),
      mostProductiveDay: mostProductiveDay ? { date: mostProductiveDay, count: mostCount } : null,
    });
  } catch (error) {
    console.error('Error computing personal stats:', error);
    res.status(500).json({ error: 'Failed to compute personal stats' });
  }
};

// Helper to turn ms to readable string
const msToHuman = (ms) => {
  if (!ms) return '0s';
  const secs = Math.round(ms / 1000);
  const hours = Math.floor(secs / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${hours}h ${mins}m ${s}s`;
};

// Folder insights
const folderInsights = async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();

    const folders = await Folder.find({ userId }).lean();

    // Include tasks due today: compare against the start of tomorrow so any task with a dueDate before tomorrow is considered overdue
    const startOfTomorrow = new Date(now);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);

    const results = await Promise.all(folders.map(async (f) => {
      const totalTasks = await Task.countDocuments({ folderId: f._id });
      const completedTasks = await Task.countDocuments({ folderId: f._id, completed: true });
      // Only consider tasks with a dueDate and that are before the start of tomorrow (i.e., due today or earlier) and not completed
      const overdueCount = await Task.countDocuments({ folderId: f._id, completed: false, dueDate: { $exists: true, $ne: null, $lt: startOfTomorrow } });
      const percentComplete = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Optionally fetch a few overdue examples for debugging
      let sampleOverdueTasks = [];
      if (process.env.DEBUG_STATS === 'true') {
        sampleOverdueTasks = await Task.find({ folderId: f._id, completed: false, dueDate: { $exists: true, $ne: null, $lt: startOfTomorrow } }).select('title dueDate completed').limit(5).lean();
        console.debug(`Folder ${f._id} (${f.name}): total=${totalTasks}, completed=${completedTasks}, overdue=${overdueCount}, now=${now.toISOString()}, startOfTomorrow=${startOfTomorrow.toISOString()}, sampleOverdueCount=${sampleOverdueTasks.length}`);
        console.debug('Sample overdue tasks:', sampleOverdueTasks);
      }

      return {
        folderId: f._id,
        name: f.name,
        totalTasks,
        completedTasks,
        percentComplete,
        overdueCount,
        sampleOverdueTasks,
      };
    }));

    res.json({ folders: results });
  } catch (error) {
    console.error('Error computing folder insights:', error);
    res.status(500).json({ error: 'Failed to compute folder insights' });
  }
};

module.exports = { personalStats, folderInsights };
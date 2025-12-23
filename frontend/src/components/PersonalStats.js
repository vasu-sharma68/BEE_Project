import React, { useEffect, useState, useMemo } from 'react';
import { statsAPI } from '../api';

const PersonalStats = ({ range = '7d' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await statsAPI.getPersonal();
        setData(res.data);
      } catch (err) {
        console.error('Failed to load personal stats', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [range]);

  const totals = useMemo(() => {
    if (!data) return { last7: 0, last4w: 0 };
    const last7 = (data.tasksCompletedLast7Days || []).reduce((s, d) => s + (d.count || 0), 0);
    const last4w = (data.tasksCompletedLast4Weeks || []).reduce((s, w) => s + (w.count || 0), 0);
    return { last7, last4w };
  }, [data]);

  const avgPerDay = useMemo(() => {
    const days = (data?.tasksCompletedLast7Days?.length) || 7;
    return Math.round(totals.last7 / days) || 0;
  }, [data, totals]);

  if (loading) return <div>Loading personal stats...</div>;
  if (!data) return <div>No stats available</div>;

  return (
    <div className="personal-stats">
      <div className="stat-card">
        <h3>Summary</h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div>
            <div className="stat-value" style={{ fontSize: 20, fontWeight: 700 }}>{totals.last7}</div>
            <div className="stat-label">Completed (7d)</div>
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: 20, fontWeight: 700 }}>{totals.last4w}</div>
            <div className="stat-label">Completed (4w)</div>
          </div>
          <div className="kpi-chip" style={{ marginLeft: 'auto' }}>
            <div style={{ fontWeight: 700 }}>{avgPerDay}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Avg/day</div>
          </div>
        </div>
      </div>

      <div className="stat-card">
        <h3>Average completion time</h3>
        <p>{data.averageCompletionTimeHuman || 'N/A'}</p>
      </div>

      <div className="stat-card">
        <h3>Most productive day</h3>
        {data.mostProductiveDay ? (
          <p>{data.mostProductiveDay.date} ({data.mostProductiveDay.count} tasks)</p>
        ) : (
          <p>No data</p>
        )}
      </div>

      <div className="stat-card">
        <h3>Daily breakdown (last 7 days)</h3>
        <ul>
          {data.tasksCompletedLast7Days.map((d) => (
            <li key={d.date}>{d.date}: <strong>{d.count}</strong></li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PersonalStats;
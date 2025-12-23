import React, { useEffect, useState } from 'react';
import { statsAPI } from '../api';

const ProgressBar = ({ percent = 0 }) => {
  const p = Math.max(0, Math.min(100, percent));
  const color = p >= 80 ? '#27ae60' : p >= 50 ? '#f39c12' : '#e74c3c';
  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${p}%`, background: color }} />
    </div>
  );
};

const FolderInsights = ({ range = '7d' }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await statsAPI.getFolders();
        setData(res.data.folders || []);
      } catch (err) {
        console.error('Failed to load folder insights', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [range]);

  if (loading) return <div>Loading folder insights...</div>;
  if (!data.length) return <div>No folder data</div>;

  return (
    <div className="folder-insights">
      {data.map((f) => (
        <div className="folder-card" key={f.folderId}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="folder-name">{f.name}</div>
            <div style={{ fontSize: 13, color: '#7f8c8d' }}>{f.overdueCount} overdue</div>
          </div>

          <div style={{ marginTop: 8 }}>
            <ProgressBar percent={f.percentComplete} />
          </div>

          <div className="folder-meta" style={{ marginTop: 8 }}>
            <div><strong>{f.percentComplete}%</strong> complete</div>
            <div style={{ color: f.percentComplete >= 80 ? '#27ae60' : f.percentComplete >= 50 ? '#f39c12' : '#e74c3c' }}>
              {f.overdueCount} overdue
            </div>
          </div>

          <div className="folder-summary" style={{ marginTop: 8 }}>
            {f.percentComplete >= 100 ? (
              <em>All tasks complete</em>
            ) : (
              <em>{f.name} folder: {f.percentComplete}% completed</em>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FolderInsights;
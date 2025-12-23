import React from 'react';
import PersonalStats from './PersonalStats';
import FolderInsights from './FolderInsights';

const StatsPage = () => {
  return (
    <div className="stats-page">
      <div className="stats-column">
        <h2>Personal Stats</h2>
        <PersonalStats />
      </div>
      <div className="stats-column">
        <h2>Folder Insights</h2>
        <FolderInsights />
      </div>
    </div>
  );
};

export default StatsPage;
import React, { useState, useEffect } from 'react';
import { folderAPI } from '../api';
import '../styles/App.css';
import thumbtacksIcon from './thumbtacks.png';
import pencilIcon from './pencil.png';
import deleteIcon from './delete.png';
import linkIcon from './link.png';
import logoIcon from './logo.png';
import unpinIcon from './unpin.png';

function Sidebar({ folders, selectedFolder, onSelectFolder, onRefresh }) {
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3498db');
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [sharingFolderId, setSharingFolderId] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [shareAccessLevel, setShareAccessLevel] = useState('view');
  const [sharedFolders, setSharedFolders] = useState([]);
  const [error, setError] = useState('');

  const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

  // Fetch shared folders on mount
  useEffect(() => {
    loadSharedFolders();
  }, []);

  const loadSharedFolders = async () => {
    try {
      const response = await folderAPI.getSharedFolders();
      setSharedFolders(response.data);
    } catch (err) {
      console.error('Error loading shared folders:', err);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      setError('Folder name is required');
      return;
    }

    // Allow creating any number of folders

    try {
      await folderAPI.createFolder(newFolderName, newFolderColor);
      setNewFolderName('');
      setNewFolderColor('#3498db');
      setShowNewFolder(false);
      setError('');
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create folder');
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (window.confirm('Are you sure you want to delete this folder and all its tasks?')) {
      try {
        await folderAPI.deleteFolder(folderId);
        onRefresh();
        if (selectedFolder === folderId) {
          onSelectFolder(null);
        }
      } catch (err) {
        setError('Failed to delete folder');
      }
    }
  };

  const handleTogglePin = async (folderId, isPinned) => {
    try {
      await folderAPI.updateFolder(folderId, { isPinned: !isPinned });
      onRefresh();
    } catch (err) {
      setError('Failed to update folder');
    }
  };

  const handleStartEdit = (folder) => {
    setEditingFolderId(folder._id);
    setEditingFolderName(folder.name);
  };

  const handleSaveEdit = async (folderId) => {
    try {
      await folderAPI.updateFolder(folderId, { name: editingFolderName });
      setEditingFolderId(null);
      onRefresh();
    } catch (err) {
      setError('Failed to update folder');
    }
  };

  const handleShareFolder = async (e) => {
    e.preventDefault();
    if (!shareEmail.trim()) {
      setError('Email is required');
      return;
    }

    try {
      await folderAPI.shareFolder(sharingFolderId, shareEmail, shareAccessLevel);
      setShareEmail('');
      setShareAccessLevel('view');
      setSharingFolderId(null);
      setError('');
      onRefresh();
      loadSharedFolders();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to share folder');
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleRemoveSharedUser = async (folderId, userId) => {
    if (window.confirm('Remove this user from the shared folder?')) {
      try {
        await folderAPI.removeSharedUser(folderId, userId);
        onRefresh();
        loadSharedFolders();
      } catch (err) {
        setError('Failed to remove user from folder');
      }
    }
  };

  const pinnedFolders = folders.filter((f) => f.isPinned);
  const regularFolders = folders.filter((f) => !f.isPinned);

  return (
    <div className="sidebar">
      {/* Icon only - visible when collapsed */}
      <div className="icon-only">
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src={logoIcon} style={{height:'30px'}} alt="Logo"></img>
        </div>
        
        {/* Pinned folders icons */}
        {pinnedFolders.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            {pinnedFolders.map((folder) => (
              <div
                key={folder._id}
                onClick={() => onSelectFolder(folder._id)}
                style={{
                  width: '30px',
                  height: '30px',
                  backgroundColor: folder.color,
                  borderRadius: '6px',
                  margin: '8px auto',
                  cursor: 'pointer',
                  border: selectedFolder === folder._id ? '3px solid white' : 'none',
                  boxShadow: selectedFolder === folder._id ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
                }}
                title={folder.name}
              />
            ))}
          </div>
        )}
        
        {/* Regular folders icons */}
        {regularFolders.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            {regularFolders.map((folder) => (
              <div
                key={folder._id}
                onClick={() => onSelectFolder(folder._id)}
                style={{
                  width: '30px',
                  height: '30px',
                  backgroundColor: folder.color,
                  borderRadius: '6px',
                  margin: '8px auto',
                  cursor: 'pointer',
                  border: selectedFolder === folder._id ? '3px solid white' : 'none',
                  boxShadow: selectedFolder === folder._id ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
                }}
                title={folder.name}
              />
            ))}
          </div>
        )}
        
        {/* Shared folders icons */}
        {sharedFolders.length > 0 && (
          <div>
            {sharedFolders.map((folder) => (
              <div
                key={folder._id}
                onClick={() => onSelectFolder(folder._id)}
                style={{
                  width: '30px',
                  height: '30px',
                  backgroundColor: folder.color,
                  borderRadius: '6px',
                  margin: '8px auto',
                  cursor: 'pointer',
                  border: selectedFolder === folder._id ? '3px solid white' : 'none',
                  boxShadow: selectedFolder === folder._id ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
                  opacity: 0.8
                }}
                title={`${folder.name} (shared by ${folder.userId.username})`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Full content - visible on hover */}
      <div className="sidebar-content">
        <div className="sidebar-header">
          <img src={logoIcon} style={{height:'20px'}} alt="Logo"></img> FOLDERS
        </div>

      <div className="folders-list">
        <h3>Pinned</h3>
        {pinnedFolders.length === 0 ? (
          <p style={{ 
            color: '#7f8c8d', 
            fontSize: '12px', 
            padding: '12px', 
            textAlign: 'center',
            backgroundColor: 'rgba(127, 140, 141, 0.1)',
            borderRadius: '6px',
            fontStyle: 'italic'
          }}>
            No pinned folders
          </p>
        ) : (
          pinnedFolders.map((folder) => (
          <div
            key={folder._id}
            className={`folder-item ${selectedFolder === folder._id ? 'active' : ''}`}
          >
            <div
              className="folder-item-name"
              onClick={() => onSelectFolder(folder._id)}
            >
              <div
                className="folder-color"
                style={{ backgroundColor: folder.color }}
              ></div>
              {editingFolderId === folder._id ? (
                <input
                  type="text"
                  value={editingFolderName}
                  onChange={(e) => setEditingFolderName(e.target.value)}
                  onBlur={() => handleSaveEdit(folder._id)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSaveEdit(folder._id);
                  }}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  style={{ flex: 1, padding: '4px', borderRadius: '3px' }}
                />
              ) : (
                <span>{folder.name}</span>
              )}
            </div>
            <div className="folder-actions">
              <button
                className="btn-icon"
                onClick={() => handleTogglePin(folder._id, folder.isPinned)}
                title="Unpin"
              >
                <img src={unpinIcon} alt="Unpin" style={{ width: '16px', height: '16px' }} />
              </button>
              <button
                className="btn-icon"
                onClick={() => handleStartEdit(folder)}
                title="Edit"
              >
                <img src={pencilIcon} alt="Edit" style={{ width: '16px', height: '16px' }} />
              </button>
              <button
                className="btn-icon"
                onClick={() => setSharingFolderId(folder._id)}
                title="Share"
                style={{ fontSize: '14px' }}
              >
                <img src={linkIcon} alt="share" style={{ width: '16px', height: '16px' }} />
              </button>
              <button
                className="btn-icon"
                onClick={() => handleDeleteFolder(folder._id)}
                title="Delete"
              >
                <img src={deleteIcon} alt="Delete" style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
          ))
        )}
      </div>

      <div className="folders-list">
        <h3>Folders</h3>
        {regularFolders.map((folder) => (
          <div
            key={folder._id}
            className={`folder-item ${selectedFolder === folder._id ? 'active' : ''}`}
          >
            <div
              className="folder-item-name"
              onClick={() => onSelectFolder(folder._id)}
            >
              <div
                className="folder-color"
                style={{ backgroundColor: folder.color }}
              ></div>
              {editingFolderId === folder._id ? (
                <input
                  type="text"
                  value={editingFolderName}
                  onChange={(e) => setEditingFolderName(e.target.value)}
                  onBlur={() => handleSaveEdit(folder._id)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSaveEdit(folder._id);
                  }}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  style={{ flex: 1, padding: '4px', borderRadius: '3px' }}
                />
              ) : (
                <span>{folder.name}</span>
              )}
            </div>
            <div className="folder-actions">
              <button
                className="btn-icon"
                onClick={() => handleTogglePin(folder._id, folder.isPinned)}
                title="Pin"
              >
                <img src={thumbtacksIcon} alt="Pin" style={{ width: '16px', height: '16px' }} />
              </button>
              <button
                className="btn-icon"
                onClick={() => handleStartEdit(folder)}
                title="Edit"
              >
                <img src={pencilIcon} alt="Edit" style={{ width: '16px', height: '16px' }} />
              </button>
              <button
                className="btn-icon"
                onClick={() => setSharingFolderId(folder._id)}
                title="Share"
                style={{ fontSize: '14px' }}
              >
                <img src={linkIcon} alt="share" style={{ width: '16px', height: '16px' }} />
              </button>
              <button
                className="btn-icon"
                onClick={() => handleDeleteFolder(folder._id)}
                title="Delete"
              >
                <img src={deleteIcon} alt="Delete" style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="folders-list">
        <h3>Shared with Me</h3>
        {sharedFolders.length === 0 ? (
          <p style={{ 
            color: '#7f8c8d', 
            fontSize: '12px', 
            padding: '12px', 
            textAlign: 'center',
            backgroundColor: 'rgba(127, 140, 141, 0.1)',
            borderRadius: '6px',
            fontStyle: 'italic'
          }}>
            No folders shared with you
          </p>
        ) : (
          sharedFolders.map((folder) => (
            <div
              key={folder._id}
              className={`folder-item ${selectedFolder === folder._id ? 'active' : ''}`}
            >
              <div
                className="folder-item-name"
                onClick={() => onSelectFolder(folder._id)}
              >
                <div
                  className="folder-color"
                  style={{ backgroundColor: folder.color }}
                ></div>
                <span>
                  {folder.name} <em style={{ fontSize: '11px', color: '#bdc3c7', fontWeight: '400' }}>by {folder.userId.username}</em>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
        {sharingFolderId && (
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <h4>Share Folder</h4>
            {error && <div className="error-message">{error}</div>}
            <input
              type="email"
              placeholder="Enter user email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              style={{ marginBottom: '12px', width: '100%' }}
            />
            <select
              value={shareAccessLevel}
              onChange={(e) => setShareAccessLevel(e.target.value)}
              style={{ marginBottom: '12px', width: '100%' }}
            >
              <option value="view">👁️ View Only</option>
              <option value="edit">✏️ Can Edit</option>
            </select>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <button
                className="btn btn-primary btn-small"
                onClick={handleShareFolder}
                style={{ flex: 1 }}
              >
                Share
              </button>
              <button
                className="btn btn-secondary btn-small"
                onClick={() => {
                  setSharingFolderId(null);
                  setShareEmail('');
                  setError('');
                }}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {showNewFolder ? (
          <div className="form-group">
            <h4>New Folder</h4>
            {error && <div className="error-message">{error}</div>}
            <input
              type="text"
              placeholder="Enter folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              style={{ marginBottom: '12px' }}
            />
            <select
              value={newFolderColor}
              onChange={(e) => setNewFolderColor(e.target.value)}
              style={{ marginBottom: '12px' }}
            >
              {colors.map((color) => (
                <option key={color} value={color}>
                  {color === '#3498db' ? '🔵 Blue' : 
                   color === '#e74c3c' ? '🔴 Red' : 
                   color === '#2ecc71' ? '🟢 Green' : 
                   color === '#f39c12' ? '🟠 Orange' : 
                   color === '#9b59b6' ? '🟣 Purple' : 
                   color === '#1abc9c' ? '🟦 Teal' : 'Color'}
                </option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <button
                className="btn btn-primary btn-small"
                onClick={handleCreateFolder}
                style={{ flex: 1 }}
              >
                Create
              </button>
              <button
                className="btn btn-secondary btn-small"
                onClick={() => {
                  setShowNewFolder(false);
                  setError('');
                }}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => setShowNewFolder(true)}
            style={{ width: '100%' }}
          >
            ➕ New Folder
          </button>
        )}
      </div>
      </div> {/* End of sidebar-content */}
      {/* no upgrade modal anymore */}
    </div>
  );
}

export default Sidebar;

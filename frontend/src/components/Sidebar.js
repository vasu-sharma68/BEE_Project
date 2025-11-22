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
      <div className="sidebar-header"> Task Manager</div>

      <div className="folders-list">
        <h3>Pinned</h3>
        {pinnedFolders.map((folder) => (
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
        ))}
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
          <p style={{ color: '#7f8c8d', fontSize: '12px' }}>No folders shared with you</p>
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
                  {folder.name} <em style={{ fontSize: '11px', color: '#95a5a6' }}>by {folder.userId.username}</em>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div>
        {sharingFolderId && (
          <div className="form-group" style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#34495e', borderRadius: '4px' }}>
            <h4 style={{ marginTop: 0 }}>Share Folder</h4>
            {error && <div className="error-message">{error}</div>}
            <input
              type="email"
              placeholder="User email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              style={{ marginBottom: '10px', width: '100%' }}
            />
            <select
              value={shareAccessLevel}
              onChange={(e) => setShareAccessLevel(e.target.value)}
              style={{ marginBottom: '10px', width: '100%' }}
            >
              <option value="view">View Only</option>
              <option value="edit">Can Edit</option>
            </select>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-primary btn-small"
                onClick={handleShareFolder}
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
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {showNewFolder ? (
          <div className="form-group">
            {error && <div className="error-message">{error}</div>}
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              style={{ marginBottom: '10px' }}
            />
            <select
              value={newFolderColor}
              onChange={(e) => setNewFolderColor(e.target.value)}
              style={{ marginBottom: '10px' }}
            >
              {colors.map((color) => (
                <option key={color} value={color}>
                  Color: {color}
                </option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-primary btn-small"
                onClick={handleCreateFolder}
              >
                Create
              </button>
              <button
                className="btn btn-secondary btn-small"
                onClick={() => {
                  setShowNewFolder(false);
                  setError('');
                }}
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
            + New Folder
          </button>
        )}
      </div>
      {/* no upgrade modal anymore */}
      
    </div>
    
  );
  
}


export default Sidebar;

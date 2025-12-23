import React, { useState, useEffect } from 'react';
import { folderAPI } from '../api';
import '../styles/App.css';
import thumbtacksIcon from './thumbtacks.png';
import pencilIcon from './pencil.png';
import deleteIcon from './delete.png';
import linkIcon from './link.png';
import logoIcon from './logo.png';
import unpinIcon from './unpin.png';

function Sidebar({ folders = [], selectedFolder, onSelectFolder, onRefresh, onNavigate }) {
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

  const colors = [
    { value: '#3498db', label: '🔵 Blue' },
    { value: '#e74c3c', label: '🔴 Red' },
    { value: '#2ecc71', label: '🟢 Green' },
    { value: '#f39c12', label: '🟠 Orange' },
    { value: '#9b59b6', label: '🟣 Purple' },
    { value: '#1abc9c', label: '🟦 Teal' }
  ];

  useEffect(() => {
    (async () => {
      try {
        const res = await folderAPI.getSharedFolders();
        setSharedFolders(res.data || []);
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  const pinnedFolders = folders.filter((f) => f.isPinned);
  const regularFolders = folders.filter((f) => !f.isPinned);

  const handleCreateFolder = async (e) => {
    e && e.preventDefault();
    if (!newFolderName.trim()) return setError('Folder name is required');
    try {
      await folderAPI.createFolder(newFolderName, newFolderColor);
      setNewFolderName('');
      setNewFolderColor('#3498db');
      setShowNewFolder(false);
      setError('');
      onRefresh && onRefresh();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create folder');
    }
  };

  const handleDeleteFolder = async (id) => {
    if (!window.confirm('Delete folder and its tasks?')) return;
    try {
      await folderAPI.deleteFolder(id);
      onRefresh && onRefresh();
    } catch (err) {
      setError('Failed to delete folder');
    }
  };

  const handleTogglePin = async (id, isPinned) => {
    try {
      await folderAPI.updateFolder(id, { isPinned: !isPinned });
      onRefresh && onRefresh();
    } catch (err) {
      setError('Failed to update folder');
    }
  };

  const startEdit = (folder) => {
    setEditingFolderId(folder._id);
    setEditingFolderName(folder.name);
  };

  const saveEdit = async (id) => {
    try {
      await folderAPI.updateFolder(id, { name: editingFolderName });
      setEditingFolderId(null);
      onRefresh && onRefresh();
    } catch (err) {
      setError('Failed to update folder');
    }
  };

  const shareFolder = async (e) => {
    e && e.preventDefault();
    if (!shareEmail.trim()) return setError('Email is required');
    try {
      await folderAPI.shareFolder(sharingFolderId, shareEmail, shareAccessLevel);
      setShareEmail('');
      setShareAccessLevel('view');
      setSharingFolderId(null);
      setError('');
      onRefresh && onRefresh();
    } catch (err) {
      setError('Failed to share folder');
    }
  };

  // Quick debug fallback to avoid blocking the dev server if needed
  if (process.env.REACT_APP_SIDEBAR_DEBUG === 'true') {
    return <div className="sidebar">Sidebar (debug)</div>;
  }

  return (
    <div className="sidebar">
      <div className="icon-only">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img src={logoIcon} alt="logo" style={{ height: 28 }} />
        </div>

        {pinnedFolders.map((f) => (
          <div
            key={f._id}
            title={f.name}
            onClick={() => onSelectFolder && onSelectFolder(f._id)}
            style={{
              width: 30,
              height: 30,
              backgroundColor: f.color,
              margin: '8px auto',
              borderRadius: 6,
              cursor: 'pointer',
              border: selectedFolder === f._id ? '2px solid white' : 'none'
            }}
          />
        ))}

        {regularFolders.map((f) => (
          <div
            key={f._id}
            title={f.name}
            onClick={() => onSelectFolder && onSelectFolder(f._id)}
            style={{
              width: 30,
              height: 30,
              backgroundColor: f.color,
              margin: '8px auto',
              borderRadius: 6,
              cursor: 'pointer',
              border: selectedFolder === f._id ? '2px solid white' : 'none'
            }}
          />
        ))}

        {sharedFolders.map((f) => (
          <div
            key={f._id}
            title={`${f.name} (by ${f.userId?.username || 'someone'})`}
            onClick={() => onSelectFolder && onSelectFolder(f._id)}
            style={{
              width: 30,
              height: 30,
              backgroundColor: f.color || '#95a5a6',
              margin: '8px auto',
              borderRadius: 6,
              cursor: 'pointer',
              opacity: 0.9
            }}
          />
        ))}
      </div>

      <div className="sidebar-content">
        <div className="sidebar-header">
          <img src={logoIcon} alt="logo" style={{ height: 18 }} /> <strong>FOLDERS</strong>
        </div>

        <div className="folders-list">
          <h3>Pinned</h3>
          {pinnedFolders.length === 0 ? (
            <p className="muted">No pinned folders</p>
          ) : (
            pinnedFolders.map((folder) => (
              <div key={folder._id} className={`folder-item ${selectedFolder === folder._id ? 'active' : ''}`}>
                <div className="folder-item-name" onClick={() => onSelectFolder && onSelectFolder(folder._id)}>
                  <div className="folder-color" style={{ backgroundColor: folder.color }} />
                  {editingFolderId === folder._id ? (
                    <input
                      value={editingFolderName}
                      onChange={(e) => setEditingFolderName(e.target.value)}
                      onBlur={() => saveEdit(folder._id)}
                      onKeyPress={(e) => e.key === 'Enter' && saveEdit(folder._id)}
                      autoFocus
                    />
                  ) : (
                    <span>{folder.name}</span>
                  )}
                </div>

                <div className="folder-actions">
                  <button className="btn-icon" onClick={() => handleTogglePin(folder._id, folder.isPinned)} title="pin/unpin">
                    <img src={unpinIcon} alt="pin" style={{ width: 16, height: 16 }} />
                  </button>
                  <button className="btn-icon" onClick={() => startEdit(folder)} title="edit">
                    <img src={pencilIcon} alt="edit" style={{ width: 16, height: 16 }} />
                  </button>
                  <button className="btn-icon" onClick={() => setSharingFolderId(folder._id)} title="share">
                    <img src={linkIcon} alt="share" style={{ width: 16, height: 16 }} />
                  </button>
                  <button className="btn-icon" onClick={() => handleDeleteFolder(folder._id)} title="delete">
                    <img src={deleteIcon} alt="delete" style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="folders-list">
          <h3>Folders</h3>
          {regularFolders.map((folder) => (
            <div key={folder._id} className={`folder-item ${selectedFolder === folder._id ? 'active' : ''}`}>
              <div className="folder-item-name" onClick={() => onSelectFolder && onSelectFolder(folder._id)}>
                <div className="folder-color" style={{ backgroundColor: folder.color }} />
                <span>{folder.name}</span>
              </div>

              <div className="folder-actions">
                <button className="btn-icon" onClick={() => handleTogglePin(folder._id, folder.isPinned)} title="pin/unpin">
                  <img src={thumbtacksIcon} alt="pin" style={{ width: 16, height: 16 }} />
                </button>
                <button className="btn-icon" onClick={() => startEdit(folder)} title="edit">
                  <img src={pencilIcon} alt="edit" style={{ width: 16, height: 16 }} />
                </button>
                <button className="btn-icon" onClick={() => setSharingFolderId(folder._id)} title="share">
                  <img src={linkIcon} alt="share" style={{ width: 16, height: 16 }} />
                </button>
                <button className="btn-icon" onClick={() => handleDeleteFolder(folder._id)} title="delete">
                  <img src={deleteIcon} alt="delete" style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="folders-list">
          <h3>Shared with Me</h3>
          {sharedFolders.length === 0 ? (
            <p className="muted">No folders shared with you</p>
          ) : (
            sharedFolders.map((folder) => (
              <div key={folder._id} className={`folder-item ${selectedFolder === folder._id ? 'active' : ''}`}>
                <div className="folder-item-name" onClick={() => onSelectFolder && onSelectFolder(folder._id)}>
                  <div className="folder-color" style={{ backgroundColor: folder.color || '#95a5a6' }} />
                  <span>{folder.name} <em style={{ fontSize: 11, color: '#bdc3c7' }}>by {folder.userId?.username || 'someone'}</em></span>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: 'auto' }}>
          {sharingFolderId && (
            <div className="form-group">
              <h4>Share Folder</h4>
              {error && <div className="error-message">{error}</div>}
              <input value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} placeholder="user@example.com" />
              <select value={shareAccessLevel} onChange={(e) => setShareAccessLevel(e.target.value)}>
                <option value="view">👁️ View only</option>
                <option value="edit">✏️ Can edit</option>
              </select>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-small" onClick={shareFolder}>Share</button>
                <button className="btn btn-secondary btn-small" onClick={() => setSharingFolderId(null)}>Cancel</button>
              </div>
            </div>
          )}

          {showNewFolder ? (
            <div className="form-group">
              <h4>New Folder</h4>
              {error && <div className="error-message">{error}</div>}
              <input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Folder name" />
              <select value={newFolderColor} onChange={(e) => setNewFolderColor(e.target.value)}>
                {colors.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
              </select>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-small" onClick={handleCreateFolder}>Create</button>
                <button className="btn btn-secondary btn-small" onClick={() => setShowNewFolder(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowNewFolder(true)} style={{ width: '100%' }}>➕ New Folder</button>
          )}

          <div style={{ marginTop: 12 }}>
            <button className="btn btn-secondary" onClick={() => onNavigate && onNavigate('stats')} style={{ width: '100%' }}>📊 Stats</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

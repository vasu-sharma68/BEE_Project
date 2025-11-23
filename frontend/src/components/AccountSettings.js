import React, { useState } from 'react';
import { authAPI } from '../api';
import '../styles/App.css';

function AccountSettings({ onLogout }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [username, setUsername] = useState(user.username || '');
  const [email, setEmail] = useState(user.email || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(username, email);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setError('');
    setLoading(true);

    try {
      await authAPI.deleteAccount();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      onLogout();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-settings-container">
      <h2>Account Settings</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleUpdateProfile} style={{ marginBottom: '30px' }}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </form>

      <div className="danger-zone">
        <div className="danger-zone-content">
          {!showDeleteConfirm ? (
            <>
              <button className="btn btn-secondary" onClick={onLogout}>
                Logout
              </button>
              <button
                className="btn btn-danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Account
              </button>
            </>
          ) : (
            <div
              style={{
                backgroundColor: '#fadbd8',
                padding: '15px',
                borderRadius: '6px',
                border: '1px solid #e74c3c',
              }}
            >
              <p style={{ marginBottom: '15px', fontWeight: 'bold' }}>
                ⚠️ Are you sure? This will delete your account and all your tasks permanently.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteAccount}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Yes, Delete My Account'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AccountSettings;

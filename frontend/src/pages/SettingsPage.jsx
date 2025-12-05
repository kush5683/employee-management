import { useState } from 'react';
import { apiClient } from '../services/apiClient.js';
import './SettingsPage.css';

export default function SettingsPage() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  function handlePasswordChange(event) {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    if (passwordSubmitting) return;
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords must match.');
      return;
    }
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      setPasswordSubmitting(true);
      await apiClient.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordSuccess('Password updated successfully.');
    } catch (err) {
      setPasswordError(err?.message || 'Unable to update password.');
    } finally {
      setPasswordSubmitting(false);
    }
  }

  return (
    <div className="page-wrap settings-page">
      <header className="hero">
        <h1>Settings</h1>
        <p>Update your personal preferences and account security.</p>
      </header>

      <section className="settings-card">
        <h2>Change Password</h2>
        <p>Use a strong password and rotate it regularly to protect your account.</p>
        <form className="settings-password-form" onSubmit={handlePasswordSubmit}>
          <label>
            <span>Current Password</span>
            <input
              type="password"
              name="currentPassword"
              className="input"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </label>
          <label>
            <span>New Password</span>
            <input
              type="password"
              name="newPassword"
              className="input"
              value={passwordForm.newPassword}
              minLength={8}
              onChange={handlePasswordChange}
              required
            />
          </label>
          <label>
            <span>Confirm New Password</span>
            <input
              type="password"
              name="confirmPassword"
              className="input"
              value={passwordForm.confirmPassword}
              minLength={8}
              onChange={handlePasswordChange}
              required
            />
          </label>

          {passwordError ? <p className="settings-error">{passwordError}</p> : null}
          {passwordSuccess ? <p className="settings-success">{passwordSuccess}</p> : null}

          <button type="submit" className="button button--primary" disabled={passwordSubmitting}>
            {passwordSubmitting ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </section>
    </div>
  );
}

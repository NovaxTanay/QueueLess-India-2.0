// ============================================
// Settings — Service details & account
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@backend/context/AuthContext';
import { updateService } from '@backend/services/service.service';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import './Settings.css';

const CATEGORIES = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'bank', label: 'Bank' },
  { value: 'government', label: 'Government Office' },
  { value: 'temple', label: 'Temple' },
  { value: 'service-center', label: 'Service Center' },
];

const Settings = () => {
  const { user, activeService, activeServiceId, logout } = useAuth();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '',
    category: '',
    location: '',
    address: '',
    contact: '',
    capacityPerHour: 20,
    avgServiceTime: 5,
    openTime: '09:00',
    closeTime: '18:00',
  });

  // Populate form when activeService changes
  useEffect(() => {
    if (activeService) {
      setForm({
        name: activeService.name || '',
        category: activeService.category || '',
        location: activeService.location || '',
        address: activeService.address || '',
        contact: activeService.contact || '',
        capacityPerHour: activeService.capacityPerHour || 20,
        avgServiceTime: activeService.avgServiceTime || 5,
        openTime: activeService.operatingHours?.open || '09:00',
        closeTime: activeService.operatingHours?.close || '18:00',
      });
      setSuccess('');
    }
  }, [activeService]);

  const updateField = (field, value) => {
    if (field === 'contact') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess('');
  };

  const handleSave = async () => {
    if (!activeServiceId) return;
    if (form.contact && !/^[6-9]\d{9}$/.test(form.contact)) {
      alert('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    setSaving(true);
    setSuccess('');
    try {
      await updateService(activeServiceId, {
        name: form.name,
        category: form.category,
        location: form.location,
        address: form.address,
        contact: form.contact,
        capacityPerHour: Number(form.capacityPerHour),
        avgServiceTime: Number(form.avgServiceTime),
        operatingHours: {
          open: form.openTime,
          close: form.closeTime,
        },
      });
      setSuccess('Settings saved successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  if (!activeService) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <Topbar />
        <main className="page-content">
          <div className="loading-container">
            <p>No service selected. Please create or select a service.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <Topbar />

      <main className="page-content">
        <div className="settings-page fade-in">
          <h1>Settings</h1>
          <p className="settings-subtitle">Manage your service and account settings</p>

          {success && <div className="success-message">{success}</div>}

          {/* Service Details */}
          <div className="settings-section card">
            <div className="settings-section-header">
              <h2>Service Details</h2>
              <button
                className={`btn btn-primary ${saving ? 'btn-loading' : ''}`}
                onClick={handleSave}
                disabled={saving}
              >
                {saving && <span className="btn-spinner" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <div className="settings-fields">
              <div className="settings-row">
                <div className="auth-field">
                  <label htmlFor="set-name">Service Name</label>
                  <input
                    id="set-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor="set-category">Category</label>
                  <select
                    id="set-category"
                    value={form.category}
                    onChange={(e) => updateField('category', e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="settings-row">
                <div className="auth-field">
                  <label htmlFor="set-location">Location</label>
                  <input
                    id="set-location"
                    type="text"
                    value={form.location}
                    onChange={(e) => updateField('location', e.target.value)}
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor="set-contact">Contact</label>
                  <div className="input-phone-group">
                    <span className="input-phone-prefix">+91</span>
                    <input
                      id="set-contact"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      pattern="[6-9][0-9]{9}"
                      value={form.contact}
                      onChange={(e) => updateField('contact', e.target.value)}
                    />
                  </div>
                  {form.contact && form.contact.length !== 10 && (
                    <span className="field-hint">Enter 10-digit Indian mobile number</span>
                  )}
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="set-address">Full Address</label>
                <input
                  id="set-address"
                  type="text"
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                />
              </div>

              <div className="settings-row">
                <div className="auth-field">
                  <label htmlFor="set-capacity">Capacity / Hour</label>
                  <input
                    id="set-capacity"
                    type="number"
                    min="1"
                    value={form.capacityPerHour}
                    onChange={(e) => updateField('capacityPerHour', e.target.value)}
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor="set-avgtime">Avg Service Time (min)</label>
                  <input
                    id="set-avgtime"
                    type="number"
                    min="1"
                    value={form.avgServiceTime}
                    onChange={(e) => updateField('avgServiceTime', e.target.value)}
                  />
                </div>
              </div>

              <div className="settings-row">
                <div className="auth-field">
                  <label htmlFor="set-open">Opening Time</label>
                  <input
                    id="set-open"
                    type="time"
                    value={form.openTime}
                    onChange={(e) => updateField('openTime', e.target.value)}
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor="set-close">Closing Time</label>
                  <input
                    id="set-close"
                    type="time"
                    value={form.closeTime}
                    onChange={(e) => updateField('closeTime', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="settings-section card">
            <h2>Account</h2>
            <div className="settings-account">
              <div className="settings-account-row">
                <span className="settings-account-label">Name</span>
                <span className="settings-account-value">{user?.name || '—'}</span>
              </div>
              <div className="settings-account-row">
                <span className="settings-account-label">Email</span>
                <span className="settings-account-value">{user?.email || '—'}</span>
              </div>
              <div className="settings-account-row">
                <span className="settings-account-label">Role</span>
                <span className="settings-account-value settings-role-badge">Admin</span>
              </div>
            </div>
            <button className="btn btn-danger" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;

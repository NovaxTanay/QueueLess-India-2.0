// ============================================
// My Services — View, edit, delete admin services
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@backend/context/AuthContext';
import { updateService, deleteService } from '@backend/services/service.service';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import './MyServices.css';

const CATEGORIES = [
  { value: 'hospital', label: 'Hospital', icon: '🏥' },
  { value: 'bank', label: 'Bank', icon: '🏦' },
  { value: 'government', label: 'Government Office', icon: '🏛️' },
  { value: 'temple', label: 'Temple', icon: '🛕' },
  { value: 'service-center', label: 'Service Center', icon: '🔧' },
  { value: 'education', label: 'Education', icon: '🎓' },
];

const getCategoryIcon = (category) => {
  const found = CATEGORIES.find((c) => c.value === category);
  return found?.icon || '📋';
};

const getCategoryLabel = (category) => {
  const found = CATEGORIES.find((c) => c.value === category);
  return found?.label || category || '—';
};

const MyServices = () => {
  const navigate = useNavigate();
  const { adminServices, activeServiceId, switchService, refreshAdminServices } = useAuth();

  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Start editing a service
  const handleStartEdit = (svc) => {
    setEditingId(svc.id);
    setDeletingId(null);
    setEditForm({
      name: svc.name || '',
      category: svc.category || '',
      location: svc.location || '',
      contact: svc.contact || '',
      capacityPerHour: svc.capacityPerHour || 20,
      avgServiceTime: svc.avgServiceTime || 5,
      openTime: svc.operatingHours?.open || '09:00',
      closeTime: svc.operatingHours?.close || '18:00',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditField = (field, value) => {
    if (field === 'contact') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async (serviceId) => {
    setSaving(true);
    if (editForm.contact && !/^[6-9]\d{9}$/.test(editForm.contact)) {
      alert('Please enter a valid 10-digit Indian mobile number.');
      setSaving(false);
      return;
    }
    try {
      await updateService(serviceId, {
        name: editForm.name,
        category: editForm.category,
        location: editForm.location,
        contact: editForm.contact,
        capacityPerHour: Number(editForm.capacityPerHour),
        avgServiceTime: Number(editForm.avgServiceTime),
        operatingHours: {
          open: editForm.openTime,
          close: editForm.closeTime,
        },
      });
      await refreshAdminServices();
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete flow
  const handleStartDelete = (serviceId) => {
    setDeletingId(serviceId);
    setEditingId(null);
  };

  const handleCancelDelete = () => {
    setDeletingId(null);
  };

  const handleConfirmDelete = async (serviceId) => {
    try {
      await deleteService(serviceId);
      setDeletingId(null);
      await refreshAdminServices();

      // If no services remain, redirect to onboarding
      // (refreshAdminServices handles switching active)
      if (adminServices.length <= 1) {
        navigate('/onboarding');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Empty state
  if (!adminServices || adminServices.length === 0) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <Topbar />
        <main className="page-content">
          <div className="ms-empty fade-in">
            <span className="ms-empty-icon">🏢</span>
            <h2>No services registered yet</h2>
            <p>Create your first service to start managing queues.</p>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/onboarding')}
            >
              + Create Your First Service
            </button>
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
        <div className="ms-page fade-in">
          <div className="ms-header">
            <div className="ms-header-left">
              <h1>My Services</h1>
              <p>Manage all your registered services</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/onboarding')}
            >
              + Add New Service
            </button>
          </div>

          <div className="ms-grid">
            {adminServices.map((svc) => {
              const isEditing = editingId === svc.id;
              const isDeleting = deletingId === svc.id;
              const isActive = svc.id === activeServiceId;

              return (
                <div
                  key={svc.id}
                  className={`ms-card card ${isEditing ? 'ms-card--editing' : ''} ${isDeleting ? 'ms-card--deleting' : ''}`}
                >
                  {/* ─── View Mode ─── */}
                  {!isEditing && !isDeleting && (
                    <>
                      <div className="ms-card-top">
                        <span className="ms-card-icon">{getCategoryIcon(svc.category)}</span>
                        {isActive && <span className="ms-card-active-badge">Active</span>}
                      </div>
                      <h3 className="ms-card-name">{svc.name}</h3>
                      <div className="ms-card-detail">
                        <span className="ms-card-label">Category</span>
                        <span className="ms-card-value">{getCategoryLabel(svc.category)}</span>
                      </div>
                      <div className="ms-card-detail">
                        <span className="ms-card-label">Location</span>
                        <span className="ms-card-value">{svc.location || '—'}</span>
                      </div>
                      <div className="ms-card-detail">
                        <span className="ms-card-label">Contact</span>
                        <span className="ms-card-value">{svc.contact ? `+91 ${svc.contact}` : '—'}</span>
                      </div>
                      <div className="ms-card-detail">
                        <span className="ms-card-label">Capacity/hr</span>
                        <span className="ms-card-value">{svc.capacityPerHour || '—'}</span>
                      </div>
                      <div className="ms-card-detail">
                        <span className="ms-card-label">Hours</span>
                        <span className="ms-card-value">
                          {svc.operatingHours?.open || '09:00'} — {svc.operatingHours?.close || '18:00'}
                        </span>
                      </div>
                      <div className="ms-card-actions">
                        {!isActive && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => switchService(svc.id)}
                          >
                            Switch To
                          </button>
                        )}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleStartEdit(svc)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleStartDelete(svc.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </>
                  )}

                  {/* ─── Edit Mode ─── */}
                  {isEditing && (
                    <div className="ms-card-edit">
                      <h3 className="ms-card-edit-title">Edit Service</h3>
                      <div className="auth-field">
                        <label>Service Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => handleEditField('name', e.target.value)}
                        />
                      </div>
                      <div className="auth-field">
                        <label>Category</label>
                        <select
                          value={editForm.category}
                          onChange={(e) => handleEditField('category', e.target.value)}
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.icon} {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="auth-field">
                        <label>Location</label>
                        <input
                          type="text"
                          value={editForm.location}
                          onChange={(e) => handleEditField('location', e.target.value)}
                        />
                      </div>
                      <div className="auth-field">
                        <label>Contact</label>
                        <div className="input-phone-group">
                          <span className="input-phone-prefix">+91</span>
                          <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            pattern="[6-9][0-9]{9}"
                            value={editForm.contact}
                            onChange={(e) => handleEditField('contact', e.target.value)}
                          />
                        </div>
                        {editForm.contact && editForm.contact.length !== 10 && (
                          <span className="field-hint">Enter 10-digit Indian mobile number</span>
                        )}
                      </div>
                      <div className="ms-card-edit-row">
                        <div className="auth-field">
                          <label>Capacity/hr</label>
                          <input
                            type="number"
                            min="1"
                            value={editForm.capacityPerHour}
                            onChange={(e) => handleEditField('capacityPerHour', e.target.value)}
                          />
                        </div>
                        <div className="auth-field">
                          <label>Avg Time (min)</label>
                          <input
                            type="number"
                            min="1"
                            value={editForm.avgServiceTime}
                            onChange={(e) => handleEditField('avgServiceTime', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="ms-card-edit-row">
                        <div className="auth-field">
                          <label>Open</label>
                          <input
                            type="time"
                            value={editForm.openTime}
                            onChange={(e) => handleEditField('openTime', e.target.value)}
                          />
                        </div>
                        <div className="auth-field">
                          <label>Close</label>
                          <input
                            type="time"
                            value={editForm.closeTime}
                            onChange={(e) => handleEditField('closeTime', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="ms-card-edit-actions">
                        <button
                          className={`btn btn-primary ${saving ? 'btn-loading' : ''}`}
                          onClick={() => handleSaveEdit(svc.id)}
                          disabled={saving}
                        >
                          {saving && <span className="btn-spinner" />}
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={handleCancelEdit}
                          disabled={saving}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ─── Delete Confirmation ─── */}
                  {isDeleting && (
                    <div className="ms-card-delete">
                      <span className="ms-card-delete-icon">⚠️</span>
                      <h3 className="ms-card-delete-title">Delete Service?</h3>
                      <p className="ms-card-delete-msg">
                        Are you sure you want to delete <strong>{svc.name}</strong>?
                        This cannot be undone.
                      </p>
                      <div className="ms-card-delete-actions">
                        <button
                          className="btn btn-danger"
                          onClick={() => handleConfirmDelete(svc.id)}
                        >
                          🗑️ Confirm Delete
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={handleCancelDelete}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyServices;

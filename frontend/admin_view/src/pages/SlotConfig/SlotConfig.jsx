// ============================================
// Slot Config — Manage time slots
// ============================================

import { useState, useEffect } from 'react';
import { useAuth } from '@backend/context/AuthContext';
import { updateService } from '@backend/services/service.service';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import SlotRow from '../../components/SlotRow/SlotRow';
import './SlotConfig.css';

const SlotConfig = () => {
  const { user, activeService, activeServiceId } = useAuth();
  const [slots, setSlots] = useState([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  // New slot form
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:00');
  const [newCapacity, setNewCapacity] = useState(20);

  // Populate slots when activeService changes
  useEffect(() => {
    if (activeService) {
      setSlots(activeService.slots || []);
      setSuccess('');
    }
  }, [activeService]);

  const handleAddSlot = () => {
    if (!newStartTime || !newEndTime) return;
    const newSlot = {
      startTime: newStartTime,
      endTime: newEndTime,
      capacity: Number(newCapacity),
      booked: 0,
      active: true,
    };
    setSlots([...slots, newSlot]);
    setSuccess('');
  };

  const handleToggle = (index) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], active: !updated[index].active };
    setSlots(updated);
    setSuccess('');
  };

  const handleDelete = (index) => {
    const updated = slots.filter((_, i) => i !== index);
    setSlots(updated);
    setSuccess('');
  };

  const handleSaveAll = async () => {
    if (!activeServiceId) return;
    setSaving(true);
    setSuccess('');
    try {
      await updateService(activeServiceId, { slots });
      setSuccess('Slots saved successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
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
        <div className="slot-page fade-in">
          <div className="slot-header">
            <div>
              <h1>Slot Configuration</h1>
              <p className="slot-subtitle">Manage your service time slots</p>
            </div>
            <button
              className={`btn btn-primary ${saving ? 'btn-loading' : ''}`}
              onClick={handleSaveAll}
              disabled={saving}
            >
              {saving && <span className="btn-spinner" />}
              {saving ? 'Saving...' : 'Save All'}
            </button>
          </div>

          {success && <div className="success-message">{success}</div>}

          {/* Add new slot */}
          <div className="slot-add card">
            <h3>Add New Slot</h3>
            <div className="slot-add-form">
              <div className="auth-field">
                <label htmlFor="slot-start">Start Time</label>
                <input
                  id="slot-start"
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                />
              </div>
              <div className="auth-field">
                <label htmlFor="slot-end">End Time</label>
                <input
                  id="slot-end"
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                />
              </div>
              <div className="auth-field">
                <label htmlFor="slot-capacity">Capacity</label>
                <input
                  id="slot-capacity"
                  type="number"
                  min="1"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                />
              </div>
              <button className="btn btn-primary slot-add-btn" onClick={handleAddSlot}>
                + Add Slot
              </button>
            </div>
          </div>

          {/* Existing Slots */}
          <div className="slot-list">
            {slots.length === 0 ? (
              <div className="slot-empty card">
                <span className="slot-empty-icon">🕐</span>
                <p>No slots configured yet. Add your first slot above.</p>
              </div>
            ) : (
              slots.map((slot, i) => (
                <SlotRow
                  key={i}
                  slot={slot}
                  index={i}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SlotConfig;

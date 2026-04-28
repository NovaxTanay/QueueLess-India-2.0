// ============================================
// SlotRow — Single slot entry with controls
// ============================================

import './SlotRow.css';

const SlotRow = ({ slot, index, onToggle, onDelete }) => {
  return (
    <div className={`slot-row ${!slot.active ? 'slot-row-disabled' : ''}`}>
      <div className="slot-row-info">
        <span className="slot-row-index">#{index + 1}</span>
        <span className="slot-row-time">
          {slot.startTime} — {slot.endTime}
        </span>
      </div>
      <div className="slot-row-meta">
        <span className="slot-row-capacity">
          Capacity: <strong>{slot.capacity}</strong>
        </span>
        <span className="slot-row-booked">
          Booked: <strong>{slot.booked || 0}</strong>
        </span>
      </div>
      <div className="slot-row-actions">
        <label className="slot-toggle">
          <input
            type="checkbox"
            checked={slot.active !== false}
            onChange={() => onToggle(index)}
          />
          <span className="slot-toggle-slider" />
        </label>
        <button className="slot-delete-btn" onClick={() => onDelete(index)}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default SlotRow;

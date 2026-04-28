import './SlotSelector.css';

const SlotSelector = ({
  dates,
  selectedDate,
  onDateSelect,
  slots,
  selectedSlot,
  onSlotSelect,
}) => {
  return (
    <div className="slot-selector">
      {/* Date Picker */}
      <div className="slot-dates">
        {dates.map((date) => (
          <div
            key={date.value}
            className={`slot-date-item ${selectedDate === date.value ? 'active' : ''}`}
            onClick={() => onDateSelect(date.value)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onDateSelect(date.value)}
          >
            <span className="slot-date-day">{date.dayName}</span>
            <span className="slot-date-num">{date.dayNum}</span>
            <span className="slot-date-month">{date.month}</span>
          </div>
        ))}
      </div>

      {/* Time Slots */}
      <div>
        <p className="slot-times-label">Available Time Slots</p>
        <div className="slot-times-grid" style={{ marginTop: 'var(--space-sm)' }}>
          {slots.length === 0 && (
            <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-lg)' }}>
              No slots available for this date
            </p>
          )}
          {slots.map((slot) => (
            <div
              key={slot.id}
              className={`slot-time-item ${
                !slot.available ? 'unavailable' : ''
              } ${selectedSlot?.id === slot.id ? 'active' : ''}`}
              onClick={() => slot.available && onSlotSelect(slot)}
              role="button"
              tabIndex={slot.available ? 0 : -1}
              onKeyDown={(e) => e.key === 'Enter' && slot.available && onSlotSelect(slot)}
            >
              {slot.time}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SlotSelector;

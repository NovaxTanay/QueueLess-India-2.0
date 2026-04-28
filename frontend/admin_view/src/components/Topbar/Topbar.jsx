// ============================================
// Topbar — Service switcher, admin name, date
// ============================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@backend/context/AuthContext';
import { getTodayFormatted } from '../../utils/helpers';
import './Topbar.css';

const CATEGORY_ICONS = {
  hospital: '🏥',
  bank: '🏦',
  government: '🏛️',
  temple: '🛕',
  'service-center': '🔧',
};

const Topbar = () => {
  const { user, adminServices, activeService, switchService } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (serviceId) => {
    switchService(serviceId);
    setDropdownOpen(false);
  };

  const handleAddNew = () => {
    setDropdownOpen(false);
    navigate('/onboarding');
  };

  const icon = CATEGORY_ICONS[activeService?.category] || '📋';
  const hasMultiple = adminServices.length > 1;

  return (
    <header className="topbar">
      <div className="topbar-left" ref={dropdownRef}>
        <button
          className={`topbar-service-btn ${hasMultiple ? 'topbar-service-btn--switchable' : ''}`}
          onClick={() => hasMultiple && setDropdownOpen((prev) => !prev)}
          type="button"
        >
          <span className="topbar-service-icon">{icon}</span>
          <span className="topbar-service-name">
            {activeService?.name || 'QueueLess Admin'}
          </span>
          {hasMultiple && (
            <span className={`topbar-chevron ${dropdownOpen ? 'topbar-chevron--open' : ''}`}>
              ▼
            </span>
          )}
        </button>

        {dropdownOpen && (
          <div className="topbar-dropdown">
            {adminServices.map((svc) => (
              <button
                key={svc.id}
                className={`topbar-dropdown-item ${svc.id === activeService?.id ? 'topbar-dropdown-item--active' : ''}`}
                onClick={() => handleSelect(svc.id)}
                type="button"
              >
                <span className="topbar-dropdown-icon">
                  {CATEGORY_ICONS[svc.category] || '📋'}
                </span>
                <span className="topbar-dropdown-label">{svc.name}</span>
                {svc.id === activeService?.id && (
                  <span className="topbar-dropdown-check">✓</span>
                )}
              </button>
            ))}
            <button
              className="topbar-dropdown-add"
              onClick={handleAddNew}
              type="button"
            >
              + Add New Service
            </button>
          </div>
        )}
      </div>

      <div className="topbar-right">
        <span className="topbar-date">{getTodayFormatted()}</span>
        <div className="topbar-divider" />
        <div className="topbar-user">
          <div className="topbar-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <span className="topbar-username">{user?.name || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

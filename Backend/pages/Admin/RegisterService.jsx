// ============================================
// Register Service — Admin onboarding
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createService } from '../../services/service.service';
import { updateUserServiceIds } from '../../services/auth.service';
import Button from '../../components/Button/Button';
import './Admin.css';

const CATEGORIES = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'bank', label: 'Bank' },
  { value: 'government', label: 'Government Office' },
  { value: 'temple', label: 'Temple / Shrine' },
  { value: 'service-center', label: 'Service Center' },
  { value: 'education', label: 'Education' },
];

const RegisterService = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('hospital');
  const [location, setLocation] = useState('');
  const [capacityPerHour, setCapacityPerHour] = useState(20);
  const [avgServiceTime, setAvgServiceTime] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const service = await createService(
        { name, category, location, capacityPerHour: Number(capacityPerHour), avgServiceTime: Number(avgServiceTime) },
        user.uid
      );

      // Link service to admin's user doc
      await updateUserServiceIds(user.uid, service.id);

      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-register-form">
          <h1>Register Your Service</h1>
          <p>Set up your service to start managing queues and generating QR codes.</p>

          <form className="admin-form-fields" onSubmit={handleSubmit}>
            {error && <div className="checkin-error">{error}</div>}

            <div className="auth-field">
              <label htmlFor="reg-name">Service Name</label>
              <input
                id="reg-name"
                type="text"
                placeholder="e.g. Apollo Hospital - Saket"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="reg-category">Category</label>
              <select
                id="reg-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="filter-bar-select"
                style={{ width: '100%' }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="auth-field">
              <label htmlFor="reg-location">Location</label>
              <input
                id="reg-location"
                type="text"
                placeholder="e.g. Delhi"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="reg-capacity">Capacity per Hour</label>
              <input
                id="reg-capacity"
                type="number"
                min="1"
                max="200"
                value={capacityPerHour}
                onChange={(e) => setCapacityPerHour(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="reg-avg-time">Avg Service Time (minutes)</label>
              <input
                id="reg-avg-time"
                type="number"
                min="1"
                max="120"
                value={avgServiceTime}
                onChange={(e) => setAvgServiceTime(e.target.value)}
                required
              />
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">
              Register Service
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterService;

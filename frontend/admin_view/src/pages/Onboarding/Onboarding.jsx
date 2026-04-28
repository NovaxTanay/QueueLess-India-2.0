// ============================================
// Onboarding — 4-step service setup wizard
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@backend/context/AuthContext';
import { createService } from '@backend/services/service.service';
import { updateUserServiceIds } from '@backend/services/auth.service';
import StepIndicator from '../../components/StepIndicator/StepIndicator';
import './Onboarding.css';

const STEPS = ['Basic Info', 'Service Type', 'Configuration', 'Review'];

const CATEGORIES = [
  { value: 'hospital', label: 'Hospital', icon: '🏥' },
  { value: 'bank', label: 'Bank', icon: '🏦' },
  { value: 'government', label: 'Government Office', icon: '🏛️' },
  { value: 'temple', label: 'Temple', icon: '🛕' },
  { value: 'service-center', label: 'Service Center', icon: '🔧' },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, refreshAdminServices } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: user?.email || '',
    category: '',
    location: '',
    address: '',
    capacityPerHour: 20,
    avgServiceTime: 5,
    openTime: '09:00',
    closeTime: '18:00',
  });

  const updateField = (field, value) => {
    if (field === 'contact') {
      // Strip non-digits and cap at 10 for Indian numbers
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && /^[6-9]\d{9}$/.test(formData.contact);
      case 2:
        return formData.category;
      case 3:
        return formData.location && formData.address;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    setError('');
    setLoading(true);

    try {
      const serviceData = {
        name: formData.name,
        category: formData.category,
        location: formData.location,
        address: formData.address,
        contact: formData.contact,
        capacityPerHour: Number(formData.capacityPerHour),
        avgServiceTime: Number(formData.avgServiceTime),
        operatingHours: {
          open: formData.openTime,
          close: formData.closeTime,
        },
        slots: [],
      };

      const service = await createService(serviceData, user.uid);
      await updateUserServiceIds(user.uid, service.id);
      await refreshAdminServices();

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-container fade-in">
        <div className="onboarding-header">
          <div className="auth-logo-icon">Q</div>
          <h1>Set Up Your Service</h1>
          <p>Complete these steps to start managing your queues</p>
        </div>

        <StepIndicator steps={STEPS} currentStep={step} />

        <div className="onboarding-card">
          {error && <div className="error-message">{error}</div>}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="onboarding-step">
              <h2>Basic Information</h2>
              <p className="onboarding-step-desc">Tell us about your service</p>
              <div className="onboarding-fields">
                <div className="auth-field">
                  <label htmlFor="ob-name">Service Name</label>
                  <input
                    id="ob-name"
                    type="text"
                    placeholder="e.g. Apollo Hospital - Saket"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    required
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor="ob-contact">Contact Number</label>
                  <div className="input-phone-group">
                    <span className="input-phone-prefix">+91</span>
                    <input
                      id="ob-contact"
                      type="tel"
                      inputMode="numeric"
                      placeholder="98765 43210"
                      maxLength={10}
                      pattern="[6-9][0-9]{9}"
                      value={formData.contact}
                      onChange={(e) => updateField('contact', e.target.value)}
                      required
                    />
                  </div>
                  {formData.contact && formData.contact.length !== 10 && (
                    <span className="field-hint">Enter 10-digit Indian mobile number</span>
                  )}
                </div>
                <div className="auth-field">
                  <label htmlFor="ob-email">Email</label>
                  <input
                    id="ob-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    disabled
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Category */}
          {step === 2 && (
            <div className="onboarding-step">
              <h2>Service Type</h2>
              <p className="onboarding-step-desc">What type of service do you offer?</p>
              <div className="onboarding-categories">
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.value}
                    className={`onboarding-category-card ${formData.category === cat.value ? 'onboarding-category-selected' : ''}`}
                    onClick={() => updateField('category', cat.value)}
                  >
                    <span className="onboarding-category-icon">{cat.icon}</span>
                    <span className="onboarding-category-label">{cat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Configuration */}
          {step === 3 && (
            <div className="onboarding-step">
              <h2>Configuration</h2>
              <p className="onboarding-step-desc">Set up your service details</p>
              <div className="onboarding-fields">
                <div className="auth-field">
                  <label htmlFor="ob-location">City / Location</label>
                  <input
                    id="ob-location"
                    type="text"
                    placeholder="e.g. New Delhi"
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    required
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor="ob-address">Full Address</label>
                  <input
                    id="ob-address"
                    type="text"
                    placeholder="e.g. 123 Main Street, Saket"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    required
                  />
                </div>
                <div className="onboarding-fields-row">
                  <div className="auth-field">
                    <label htmlFor="ob-capacity">Capacity / Hour</label>
                    <input
                      id="ob-capacity"
                      type="number"
                      min="1"
                      max="200"
                      value={formData.capacityPerHour}
                      onChange={(e) => updateField('capacityPerHour', e.target.value)}
                    />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="ob-avg">Avg Service Time (min)</label>
                    <input
                      id="ob-avg"
                      type="number"
                      min="1"
                      max="120"
                      value={formData.avgServiceTime}
                      onChange={(e) => updateField('avgServiceTime', e.target.value)}
                    />
                  </div>
                </div>
                <div className="onboarding-fields-row">
                  <div className="auth-field">
                    <label htmlFor="ob-open">Opening Time</label>
                    <input
                      id="ob-open"
                      type="time"
                      value={formData.openTime}
                      onChange={(e) => updateField('openTime', e.target.value)}
                    />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="ob-close">Closing Time</label>
                    <input
                      id="ob-close"
                      type="time"
                      value={formData.closeTime}
                      onChange={(e) => updateField('closeTime', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="onboarding-step">
              <h2>Review & Complete</h2>
              <p className="onboarding-step-desc">Verify your service details</p>
              <div className="onboarding-review">
                <div className="onboarding-review-row">
                  <span className="onboarding-review-label">Service Name</span>
                  <span className="onboarding-review-value">{formData.name}</span>
                </div>
                <div className="onboarding-review-row">
                  <span className="onboarding-review-label">Contact</span>
                  <span className="onboarding-review-value">+91 {formData.contact}</span>
                </div>
                <div className="onboarding-review-row">
                  <span className="onboarding-review-label">Category</span>
                  <span className="onboarding-review-value">
                    {CATEGORIES.find((c) => c.value === formData.category)?.icon}{' '}
                    {CATEGORIES.find((c) => c.value === formData.category)?.label}
                  </span>
                </div>
                <div className="onboarding-review-row">
                  <span className="onboarding-review-label">Location</span>
                  <span className="onboarding-review-value">{formData.location}</span>
                </div>
                <div className="onboarding-review-row">
                  <span className="onboarding-review-label">Address</span>
                  <span className="onboarding-review-value">{formData.address}</span>
                </div>
                <div className="onboarding-review-row">
                  <span className="onboarding-review-label">Capacity/Hour</span>
                  <span className="onboarding-review-value">{formData.capacityPerHour}</span>
                </div>
                <div className="onboarding-review-row">
                  <span className="onboarding-review-label">Avg Service Time</span>
                  <span className="onboarding-review-value">{formData.avgServiceTime} min</span>
                </div>
                <div className="onboarding-review-row">
                  <span className="onboarding-review-label">Operating Hours</span>
                  <span className="onboarding-review-value">{formData.openTime} — {formData.closeTime}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="onboarding-actions">
            {step > 1 && (
              <button className="btn btn-secondary" onClick={handleBack}>
                Back
              </button>
            )}
            <div className="onboarding-actions-spacer" />
            {step < 4 ? (
              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Continue
              </button>
            ) : (
              <button
                className={`btn btn-primary btn-lg ${loading ? 'btn-loading' : ''}`}
                onClick={handleComplete}
                disabled={loading}
              >
                {loading && <span className="btn-spinner" />}
                {loading ? 'Setting up...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

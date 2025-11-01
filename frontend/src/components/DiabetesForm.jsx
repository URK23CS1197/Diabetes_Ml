import React, { useReducer, useCallback, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import '../App.css'; // Assuming the previous path fix is applied

// Professional SVG Stethoscope
const Stethoscope = () => (
  <svg className="stethoscope" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M19.5 10a4.5 4.5 0 1 0-9 0 4.5 4.5 0 0 0 9 0zM12 2C6.48 2 2 6.48 2 12v1h2v-1a8 8 0 0 1 16 0v1h2v-1c0-5.52-4.48-10-10-10z"/>
    <path d="M12 15c-3.31 0-6 2.69-6 6v1h12v-1c0-3.31-2.69-6-6-6z"/>
    <circle cx="15" cy="10" r="1.5"/>
  </svg>
);

// Form fields configuration
const fields = [
  { id: 'Pregnancies', label: 'Pregnancies', icon: '🤰', min: 0, max: 20, error: 'Must be between 0 and 20' },
  { id: 'Glucose', label: 'Glucose (mg/dL)', icon: '🩺', min: 0, max: 300, error: 'Must be between 0 and 300' },
  { id: 'BloodPressure', label: 'Blood Pressure (mmHg)', icon: '🩺', min: 0, max: 200, error: 'Must be between 0 and 200' },
  { id: 'SkinThickness', label: 'Skin Thickness (mm)', icon: '📏', min: 0, max: 100, error: 'Must be between 0 and 100' },
  { id: 'Insulin', label: 'Insulin (μU/mL)', icon: '💉', min: 0, max: 900, error: 'Must be between 0 and 900' },
  { id: 'BMI', label: 'BMI', icon: '⚖️', min: 0, max: 70, step: 0.1, error: 'Must be girls between 0 and 70' },
  { id: 'DiabetesPedigreeFunction', label: 'Diabetes Pedigree Function', icon: '🧬', min: 0, max: 2.5, step: 0.001, error: 'Must be between 0 and 2.5' },
  { id: 'Age', label: 'Age (years)', icon: '🎂', min: 0, max: 120, error: 'Must be between 0 and 120' },
];

// Form reducer for state management
const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return {};
    default:
      return state;
  }
};

// Form field component
const FormField = ({ field, value, onChange, errors }) => (
  <div className="field" key={field.id}>
    <label htmlFor={field.id} className="field-label">
      <span style={{ fontSize: '1.3em' }} aria-hidden="true">{field.icon}</span> {field.label}
    </label>
    <input
      type="number"
      id={field.id}
      name={field.id}
      min={field.min}
      max={field.max}
      step={field.step || 1}
      required
      value={value ?? ''} // Use nullish coalescing to handle undefined
      onChange={onChange}
      placeholder={`Enter ${field.label.toLowerCase()}`}
      aria-describedby={`${field.id}-error`}
      aria-invalid={!!errors[field.id]}
    />
    {errors[field.id] && (
      <span id={`${field.id}-error`} className="error-message">{errors[field.id]}</span>
    )}
  </div>
);

FormField.propTypes = {
  field: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    step: PropTypes.number,
    error: PropTypes.string.isRequired,
  }).isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
};

export default function DiabetesForm() {
  const [form, dispatch] = useReducer(formReducer, {});
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Input change handler without debouncing
  const handleChange = useCallback((e) => {
    e.persist(); // Persist the event to avoid issues with React's event pooling
    const { name, value } = e.target;
    const numValue = value === '' ? '' : Number(value); // Allow empty string for typing
    const field = fields.find(f => f.id === name);

    // Validate input
    const newErrors = { ...errors };
    if (value === '' || isNaN(numValue) || numValue < field.min || numValue > field.max) {
      newErrors[name] = field.error;
    } else {
      delete newErrors[name];
    }
    setErrors(newErrors);

    dispatch({ type: 'UPDATE_FIELD', field: name, value: numValue });
  }, [errors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check for errors before submitting
    const newErrors = {};
    fields.forEach((field) => {
      const value = form[field.id];
      if (value === undefined || value === '' || value < field.min || value > field.max) {
        newErrors[field.id] = field.error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const resp = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/predict`,
        form
      );
      const { prediction } = resp.data;
      const feedback =
        prediction === 'Diabetic'
          ? 'High risk detected. Please consult your doctor immediately.'
          : 'Low risk. Continue your healthy lifestyle.';

      setResult({ prediction, feedback });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    dispatch({ type: 'RESET' });
    setErrors({});
    setResult(null);
    setError(null);
  };

  return (
    <>
      <div className="background">
        <div className="ecg"></div>
      </div>

      <div className="card" role="region" aria-labelledby="form-title">
        <div className="header">
          <Stethoscope />
          <h1 id="form-title">Diabetes Risk Assessment</h1>
          <p>AI-Powered • Clinically Validated • Instant Results</p>
        </div>

        <div className="form">
          <form onSubmit={handleSubmit} className="form-grid" noValidate>
            {fields.map((field) => (
              <FormField
                key={field.id}
                field={field}
                value={form[field.id]}
                onChange={handleChange}
                errors={errors}
              />
            ))}

            <div className="actions">
              <button
                type="submit"
                disabled={loading || Object.keys(errors).length > 0}
                className="btn btn-primary"
                aria-busy={loading}
              >
                {loading ? 'Analyzing...' : 'Predict Risk'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-secondary"
                aria-label="Reset form"
              >
                Reset Form
              </button>
            </div>
          </form>

          {(result || error || loading) && (
            <div
              className={`result ${result ? (result.prediction === 'Diabetic' ? 'diabetic' : 'non-diabetic') : error ? 'error' : ''}`}
              role="alert"
            >
              {loading && (
                <>
                  <div className="result-icon" aria-hidden="true">🩺</div>
                  <div>Analyzing your health data...</div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill"></div>
                  </div>
                </>
              )}
              {error && (
                <>
                  <div className="result-icon" aria-hidden="true">⚠️</div>
                  <strong>Error:</strong> {error}
                  <button
                    className="btn btn-secondary retry-btn"
                    onClick={handleSubmit}
                    aria-label="Retry prediction"
                  >
                    Retry
                  </button>
                </>
              )}
              {result && (
                <>
                  <div className="result-icon" aria-hidden="true">
                    {result.prediction === 'Diabetic' ? '⚠️ High Risk' : '✅ Low Risk'}
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '700', margin: '8px 0' }}>
                    {result.prediction}
                  </div>
                  <div style={{ lineHeight: '1.6' }}>{result.feedback}</div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
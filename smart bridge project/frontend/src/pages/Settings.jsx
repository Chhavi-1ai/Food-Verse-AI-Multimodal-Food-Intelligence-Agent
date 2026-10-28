import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Key,
  Save,
  CheckCircle2,
  Sparkles,
  Info,
  Clock,
} from 'lucide-react';
import { api } from '../services/api';
import DisclaimerBanner from '../components/DisclaimerBanner';
import LoadingSpinner from '../components/LoadingSpinner';

const ALLERGEN_LIST = [
  'peanuts',
  'tree nuts',
  'dairy',
  'gluten',
  'shellfish',
  'eggs',
  'soy',
  'fish',
  'sesame',
];

export default function Settings() {
  const { onToast } = useOutletContext() || {};

  const [profile, setProfile] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dietaryPref, setDietaryPref] = useState('omnivore');
  const [allergies, setAllergies] = useState([]);
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [proteinTarget, setProteinTarget] = useState(75);
  const [carbTarget, setCarbTarget] = useState(250);
  const [fatTarget, setFatTarget] = useState(65);
  const [cookingTime, setCookingTime] = useState(30);

  useEffect(() => {
    loadSettingsData();
  }, []);

  const loadSettingsData = async () => {
    try {
      setLoading(true);
      const [prof, hlth] = await Promise.all([api.getProfile(), api.getHealth()]);
      setProfile(prof);
      setHealth(hlth);

      setName(prof.name || '');
      setEmail(prof.email || '');
      setDietaryPref(prof.dietary_preference || 'omnivore');
      setAllergies(prof.allergies || []);
      setCalorieTarget(prof.calorie_target || 2000);
      setProteinTarget(prof.protein_target_g || 75);
      setCarbTarget(prof.carb_target_g || 250);
      setFatTarget(prof.fat_target_g || 65);
      setCookingTime(prof.cooking_time_preference_mins || 30);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAllergen = (alg) => {
    setAllergies((prev) =>
      prev.includes(alg) ? prev.filter((a) => a !== alg) : [...prev, alg]
    );
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await api.updateProfile({
        name,
        email,
        dietary_preference: dietaryPref,
        allergies,
        calorie_target: Number(calorieTarget),
        protein_target_g: Number(proteinTarget),
        carb_target_g: Number(carbTarget),
        fat_target_g: Number(fatTarget),
        cooking_time_preference_mins: Number(cookingTime),
      });
      setProfile(updated);
      onToast?.('User profile and dietary preferences saved successfully!', 'success');
    } catch (err) {
      onToast?.(`Save failed: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading profile preferences & configuration..." />;
  }

  const isAiActive = health?.ai_configured;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
          Profile & System Settings
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
          Configure dietary guardrails, target macronutrients, and inspect multimodal AI runtime status.
        </p>
      </div>

      {/* Multimodal AI Runtime Status Banner */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${isAiActive ? '#86efac' : '#e2e8f0'}`,
          boxShadow: '0 2px 12px -2px rgba(22, 101, 52, 0.05)',
          marginBottom: '28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Sparkles size={20} style={{ color: isAiActive ? '#16a34a' : '#64748b' }} />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
            AI Engine Integration Status
          </h3>
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: isAiActive ? '#dcfce7' : '#f1f5f9',
              color: isAiActive ? '#15803d' : '#475569',
            }}
          >
            {isAiActive ? 'ONLINE - Gemini Vision' : 'LOCAL - OpenCV Heuristic Engine'}
          </span>
        </div>

        <p style={{ margin: '0 0 14px 0', fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
          {isAiActive
            ? 'Your application is connected to Google Gemini Multimodal Vision API. High-resolution multimodal inferences are enabled for food detection, freshness audits, and hygiene observations.'
            : 'No external Gemini API key is currently configured. The system is operating seamlessly with the built-in deterministic OpenCV image processing and USDA nutritional heuristic fallback engine.'}
        </p>

        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px 16px',
            fontSize: '0.82rem',
            color: '#334155',
          }}
        >
          <strong>To configure real Gemini AI inference:</strong> Add your Google AI API key to the{' '}
          <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>.env</code> file:
          <pre style={{ margin: '6px 0 0 0', color: '#166534', fontFamily: 'monospace' }}>
            GEMINI_API_KEY=your_api_key_here
          </pre>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile}>
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px -2px rgba(22, 101, 52, 0.06)',
            marginBottom: '28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <User size={20} style={{ color: '#166534' }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
              Personal & Dietary Profile
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Full Name:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Email Address:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Primary Dietary Pattern:
              </label>
              <select
                value={dietaryPref}
                onChange={(e) => setDietaryPref(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              >
                <option value="omnivore">Omnivore (Balanced Diet)</option>
                <option value="vegetarian">Vegetarian (Plant-Forward)</option>
                <option value="vegan">Vegan (Strictly Plant-Based)</option>
                <option value="pescatarian">Pescatarian (Fish & Seafood)</option>
                <option value="keto">Keto (High Fat, Low Carb)</option>
                <option value="paleo">Paleo (Whole Foods)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Preferred Max Cooking Time (mins):
              </label>
              <input
                type="number"
                min="10"
                max="180"
                step="5"
                value={cookingTime}
                onChange={(e) => setCookingTime(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          {/* Strict Allergens */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              Declared Food Allergies (Strict Exclusion Guardrails):
            </label>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: '#64748b' }}>
              Selected allergens will be automatically and strictly excluded from all recommended recipes and generated meal plans.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {ALLERGEN_LIST.map((alg) => {
                const isSelected = allergies.includes(alg);
                return (
                  <button
                    type="button"
                    key={alg}
                    onClick={() => toggleAllergen(alg)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '999px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: `1.5px solid ${isSelected ? '#ef4444' : '#cbd5e1'}`,
                      backgroundColor: isSelected ? '#fee2e2' : '#ffffff',
                      color: isSelected ? '#b91c1c' : '#475569',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isSelected ? '✓ ' : '+ '} {alg.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nutrition Targets */}
          <div>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              Daily Nutritional Goals:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>
                  Calorie Target (kcal)
                </label>
                <input
                  type="number"
                  min="1000"
                  max="5000"
                  step="50"
                  value={calorieTarget}
                  onChange={(e) => setCalorieTarget(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>
                  Protein Target (grams)
                </label>
                <input
                  type="number"
                  min="20"
                  max="350"
                  value={proteinTarget}
                  onChange={(e) => setProteinTarget(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>
                  Carb Target (grams)
                </label>
                <input
                  type="number"
                  min="20"
                  max="600"
                  value={carbTarget}
                  onChange={(e) => setCarbTarget(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>
                  Fat Target (grams)
                </label>
                <input
                  type="number"
                  min="15"
                  max="200"
                  value={fatTarget}
                  onChange={(e) => setFatTarget(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                backgroundColor: '#166534',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(22, 101, 52, 0.25)',
              }}
            >
              <Save size={18} />
              <span>{saving ? 'Saving Preferences...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </form>

      <DisclaimerBanner type="info" title="Privacy & Data Protection Notice">
        Your dietary preferences, allergy disclosures, and nutritional goals are saved locally to your database. No personal credentials or API secrets are ever exposed to the client or external services.
      </DisclaimerBanner>
    </div>
  );
}


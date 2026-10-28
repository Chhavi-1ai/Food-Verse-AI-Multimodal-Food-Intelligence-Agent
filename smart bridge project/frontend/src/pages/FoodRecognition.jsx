import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Camera,
  Save,
  RotateCcw,
  Sliders,
  CheckCircle,
  AlertCircle,
  History,
  Trash2,
  Edit2,
  Sparkles,
} from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import { MacroDoughnutChart } from '../components/NutritionChart';
import DisclaimerBanner from '../components/DisclaimerBanner';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';
import { formatDate } from '../utils/formatters';

export default function FoodRecognition() {
  const { onToast } = useOutletContext() || {};

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Portion & edit state
  const [portionGrams, setPortionGrams] = useState(150);
  const [isEditingName, setIsEditingName] = useState(false);
  const [foodNameInput, setFoodNameInput] = useState('');
  const [recalculating, setRecalculating] = useState(false);
  const [saving, setSaving] = useState(false);

  // History state
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await api.getFoodHistory(15);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load food history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleImageSelected = (file) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setAnalysisResult(null);
  };

  const handleAnalyzeFood = async () => {
    if (!selectedFile) {
      onToast?.('Please select or upload a food image first.', 'warning');
      return;
    }

    try {
      setAnalyzing(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const result = await api.analyzeFoodImage(formData);
      setAnalysisResult(result);
      setPortionGrams(result.portion_grams || 150);
      setFoodNameInput(result.food_name || '');
      onToast?.(`Detected: ${result.food_name} (${Math.round(result.confidence * 100)}% confidence)`, 'success');
    } catch (err) {
      onToast?.(`Analysis failed: ${err.message}`, 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRecalculatePortion = async (newGrams, newName = null) => {
    const name = newName || foodNameInput || analysisResult.food_name;
    try {
      setRecalculating(true);
      const updated = await api.recalculateNutrition({
        food_name: name,
        portion_grams: Number(newGrams),
        portion_unit: 'grams',
      });

      setAnalysisResult((prev) => ({
        ...prev,
        food_name: name,
        portion_grams: Number(newGrams),
        estimated_calories: updated.estimated_calories,
        protein_g: updated.protein_g,
        carbs_g: updated.carbs_g,
        fat_g: updated.fat_g,
        fiber_g: updated.fiber_g,
        sugar_g: updated.sugar_g,
        sodium_mg: updated.sodium_mg,
        is_user_corrected: name !== prev.original_detected_name,
      }));
    } catch (err) {
      onToast?.(`Recalculation error: ${err.message}`, 'error');
    } finally {
      setRecalculating(false);
    }
  };

  const handleSaveAnalysis = async () => {
    if (!analysisResult) return;

    try {
      setSaving(true);
      const payload = {
        food_name: analysisResult.food_name,
        original_detected_name: analysisResult.original_detected_name,
        image_filename: analysisResult.image_filename,
        confidence: analysisResult.confidence,
        portion_grams: analysisResult.portion_grams,
        portion_unit: analysisResult.portion_unit,
        portion_description: `${analysisResult.portion_grams}g portion`,
        estimated_calories: analysisResult.estimated_calories,
        protein_g: analysisResult.protein_g,
        carbs_g: analysisResult.carbs_g,
        fat_g: analysisResult.fat_g,
        fiber_g: analysisResult.fiber_g,
        sugar_g: analysisResult.sugar_g,
        sodium_mg: analysisResult.sodium_mg,
        is_user_corrected: analysisResult.is_user_corrected,
        ai_provider_used: analysisResult.ai_provider_used,
        detected_items: analysisResult.detected_items || [],
      };

      await api.saveFoodAnalysis(payload);
      onToast?.('Analysis and nutrition record saved successfully!', 'success');
      loadHistory();
    } catch (err) {
      onToast?.(`Failed to save: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHistoryItem = async (id, e) => {
    e.stopPropagation();
    try {
      await api.deleteFoodAnalysis(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
      onToast?.('Analysis record deleted', 'info');
    } catch (err) {
      onToast?.(`Delete failed: ${err.message}`, 'error');
    }
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
          Food Recognition & Nutrition Module
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
          Upload any meal or food image for instant computer vision classification, portion estimation, and macro breakdowns.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '28px', marginBottom: '32px' }}>
        {/* Left Column: Image Upload & Controls */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px -2px rgba(22, 101, 52, 0.06)',
          }}
        >
          <ImageUploader
            label="Upload Food Image (JPEG, PNG, WebP)"
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            onImageSelected={handleImageSelected}
            onClear={handleClearImage}
          />

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              onClick={handleAnalyzeFood}
              disabled={!selectedFile || analyzing}
              style={{
                flex: 1,
                backgroundColor: !selectedFile || analyzing ? '#94a3b8' : '#166534',
                color: '#ffffff',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: !selectedFile || analyzing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(22, 101, 52, 0.2)',
                transition: 'background 0.2s',
              }}
            >
              <Camera size={19} />
              <span>{analyzing ? 'Analyzing Image...' : 'Analyze Food'}</span>
            </button>
            {analysisResult && (
              <button
                onClick={handleSaveAnalysis}
                disabled={saving}
                style={{
                  backgroundColor: '#22c55e',
                  color: '#052e16',
                  border: 'none',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                }}
              >
                <Save size={18} />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
            )}
          </div>

          {analyzing && <LoadingSpinner message="Detecting food items & calculating nutrition..." />}

          {/* Transparent AI disclaimer */}
          <DisclaimerBanner type="info" title="Caloric & Portion Estimation Disclaimer">
            Nutrition values and portion sizes are calculated approximations derived from computer vision analysis and calibrated USDA food composition data. Laboratory biochemical assays may vary.
          </DisclaimerBanner>
        </div>

        {/* Right Column: Detected Results & Interactive Nutrition */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px -2px rgba(22, 101, 52, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {analysisResult ? (
            <div>
              {/* Header result with food correction */}
              <div
                style={{
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '16px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: '#15803d',
                      backgroundColor: '#dcfce7',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    Confidence: {Math.round(analysisResult.confidence * 100)}% ({analysisResult.ai_provider_used})
                  </span>

                  {isEditingName ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <input
                        type="text"
                        value={foodNameInput}
                        onChange={(e) => setFoodNameInput(e.target.value)}
                        style={{
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '2px solid #16a34a',
                          outline: 'none',
                        }}
                      />
                      <button
                        onClick={() => {
                          setIsEditingName(false);
                          handleRecalculatePortion(portionGrams, foodNameInput);
                        }}
                        style={{
                          backgroundColor: '#166534',
                          color: '#fff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                      <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        {analysisResult.food_name}
                      </h2>
                      <button
                        onClick={() => setIsEditingName(true)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                        title="Correct food name"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  )}

                  {analysisResult.is_user_corrected && (
                    <span style={{ fontSize: '0.78rem', color: '#b45309', display: 'block', marginTop: '4px' }}>
                      User adjusted from: <em>{analysisResult.original_detected_name}</em>
                    </span>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#166534', lineHeight: 1 }}>
                    {Math.round(analysisResult.estimated_calories)}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase' }}>
                    Est. Calories
                  </span>
                </div>
              </div>

              {/* Portion Slider Control */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}>
                    Adjust Portion Size:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number"
                      min="10"
                      max="1500"
                      step="10"
                      value={portionGrams}
                      onChange={(e) => {
                        const val = Math.max(10, Number(e.target.value));
                        setPortionGrams(val);
                        handleRecalculatePortion(val);
                      }}
                      style={{
                        width: '70px',
                        textAlign: 'right',
                        padding: '4px 8px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                      }}
                    />
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>grams</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="25"
                  max="800"
                  step="25"
                  value={portionGrams}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setPortionGrams(val);
                    handleRecalculatePortion(val);
                  }}
                  style={{ width: '100%', accentColor: '#16a34a', cursor: 'pointer' }}
                />
              </div>

              {/* Macronutrient Cards & Doughnut */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#eff6ff', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>PROTEIN</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e40af' }}>{analysisResult.protein_g}g</div>
                </div>
                <div style={{ backgroundColor: '#fef3c7', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>CARBS</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#92400e' }}>{analysisResult.carbs_g}g</div>
                </div>
                <div style={{ backgroundColor: '#fee2e2', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>FAT</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#991b1b' }}>{analysisResult.fat_g}g</div>
                </div>
                <div style={{ backgroundColor: '#ecfdf5', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>FIBER</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#065f46' }}>{analysisResult.fiber_g}g</div>
                </div>
              </div>

              {/* Chart */}
              <MacroDoughnutChart
                protein={analysisResult.protein_g}
                carbs={analysisResult.carbs_g}
                fat={analysisResult.fat_g}
                fiber={analysisResult.fiber_g}
              />
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '60px 20px',
                textAlign: 'center',
                color: '#94a3b8',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '999px',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  color: '#64748b',
                }}
              >
                <Camera size={32} />
              </div>
              <h3 style={{ margin: '0 0 6px 0', color: '#334155' }}>No Image Analyzed Yet</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', maxWidth: '300px' }}>
                Upload or drop a food image on the left and click "Analyze Food" to view real-time nutritional metrics.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Analysis History Section */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 12px -2px rgba(22, 101, 52, 0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={20} style={{ color: '#166534' }} />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              Previous Food Analyses History
            </h3>
          </div>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            {history.length} saved entries
          </span>
        </div>

        {history.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', margin: '30px 0', fontSize: '0.9rem' }}>
            No saved analyses in database yet.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 10px' }}>Food Name</th>
                  <th style={{ padding: '12px 10px' }}>Portion</th>
                  <th style={{ padding: '12px 10px' }}>Calories</th>
                  <th style={{ padding: '12px 10px' }}>P / C / F</th>
                  <th style={{ padding: '12px 10px' }}>Confidence</th>
                  <th style={{ padding: '12px 10px' }}>Date</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr
                    key={row.id}
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                    onClick={() => {
                      setAnalysisResult(row);
                      setPortionGrams(row.portion_grams);
                      setFoodNameInput(row.food_name);
                      if (row.image_url) setPreviewUrl(`http://localhost:8000${row.image_url}`);
                    }}
                    className="history-table-row"
                  >
                    <td style={{ padding: '12px 10px', fontWeight: 600, color: '#1e293b' }}>
                      {row.food_name}
                      {row.is_user_corrected && (
                        <span style={{ fontSize: '0.7rem', color: '#b45309', marginLeft: '6px' }}>(Edited)</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 10px', color: '#475569' }}>{row.portion_grams}g</td>
                    <td style={{ padding: '12px 10px', fontWeight: 700, color: '#15803d' }}>
                      {Math.round(row.estimated_calories)} kcal
                    </td>
                    <td style={{ padding: '12px 10px', color: '#64748b' }}>
                      {row.protein_g}g / {row.carbs_g}g / {row.fat_g}g
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span
                        style={{
                          backgroundColor: '#f0fdf4',
                          color: '#15803d',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {Math.round(row.confidence * 100)}%
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', color: '#64748b' }}>{formatDate(row.created_at)}</td>
                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                      <button
                        onClick={(e) => handleDeleteHistoryItem(row.id, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                        title="Delete record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


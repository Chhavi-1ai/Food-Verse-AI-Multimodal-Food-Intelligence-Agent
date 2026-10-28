import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Sparkles,
  ShieldAlert,
  Info,
  CheckCircle2,
  AlertTriangle,
  History,
  Archive,
  Thermometer,
} from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import DisclaimerBanner from '../components/DisclaimerBanner';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';
import { formatDate, getFreshnessBadge } from '../utils/formatters';

export default function FreshnessDetection() {
  const { onToast } = useOutletContext() || {};

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await api.getFreshnessHistory(15);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load freshness history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleImageSelected = (file) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
  };

  const handleAnalyzeFreshness = async () => {
    if (!selectedFile) {
      onToast?.('Please upload a produce or food image first.', 'warning');
      return;
    }

    try {
      setAnalyzing(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('save_to_history', 'true');

      const data = await api.analyzeFreshness(formData);
      setResult(data);
      onToast?.(`Status: ${data.visual_status}`, 'success');
      loadHistory();
    } catch (err) {
      onToast?.(`Freshness audit failed: ${err.message}`, 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const badge = result ? getFreshnessBadge(result.visual_status) : null;

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
          Food Freshness & Spoilage Detection
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
          Computer vision evaluation of optical discoloration, surface breakdown, and deterioration patterns.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '28px', marginBottom: '32px' }}>
        {/* Upload Column */}
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
            label="Upload Produce or Food Image for Freshness Scan"
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            onImageSelected={handleImageSelected}
            onClear={handleClearImage}
          />

          <button
            onClick={handleAnalyzeFreshness}
            disabled={!selectedFile || analyzing}
            style={{
              width: '100%',
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
              marginTop: '16px',
            }}
          >
            <Sparkles size={19} />
            <span>{analyzing ? 'Scanning Visual Surface Indicators...' : 'Analyze Freshness'}</span>
          </button>

          {analyzing && <LoadingSpinner message="Inspecting surface discoloration & blemish metrics..." />}

          {/* Mandatory Microbiological Safety Disclaimer */}
          <DisclaimerBanner type="danger" title="CRITICAL FOOD SAFETY LIMITATION">
            Visual inspection evaluates physical appearance only. An image CANNOT detect invisible microbiological contamination, bacterial toxins (e.g. Salmonella, Listeria, E. coli), or verify safe temperature history. Never consume food that has an off odor, slimy texture, or questionable provenance, even if it looks fresh.
          </DisclaimerBanner>
        </div>

        {/* Results Column */}
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
          {result ? (
            <div>
              {/* Header Status */}
              <div
                style={{
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '16px',
                  marginBottom: '18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {result.food_category}
                  </span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 0 0' }}>
                    {result.item_name}
                  </h2>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      backgroundColor: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`,
                      padding: '6px 14px',
                      borderRadius: '999px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      display: 'inline-block',
                    }}
                  >
                    {badge.label}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Confidence: {Math.round(result.confidence * 100)}%
                  </div>
                </div>
              </div>

              {/* Visual Indicators Explanation */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '18px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.92rem', color: '#1e293b' }}>
                  Optical Evaluation Findings:
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                  {result.explanation}
                </p>

                {result.detected_visual_characteristics?.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                      Observed Surface Characteristics:
                    </span>
                    <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px', fontSize: '0.84rem', color: '#475569' }}>
                      {result.detected_visual_characteristics.map((char, i) => (
                        <li key={i}>{char}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Storage Recommendations */}
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#15803d' }}>
                  <Thermometer size={18} />
                  <strong style={{ fontSize: '0.9rem' }}>Curated Storage Recommendations</strong>
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#166534', lineHeight: 1.5 }}>
                  {result.storage_recommendations?.map((tip, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{tip}</li>
                  ))}
                </ul>
              </div>
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
                <Sparkles size={32} />
              </div>
              <h3 style={{ margin: '0 0 6px 0', color: '#334155' }}>Ready to Scan Produce</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', maxWidth: '300px' }}>
                Upload an image of fruit, vegetable, or produce on the left to evaluate visual quality and storage guidance.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* History Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 12px -2px rgba(22, 101, 52, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <History size={20} style={{ color: '#166534' }} />
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
            Produce Freshness Assessment History
          </h3>
        </div>

        {history.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', margin: '30px 0', fontSize: '0.9rem' }}>
            No previous freshness assessments logged yet.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 10px' }}>Item Name</th>
                  <th style={{ padding: '12px 10px' }}>Category</th>
                  <th style={{ padding: '12px 10px' }}>Visual Status</th>
                  <th style={{ padding: '12px 10px' }}>Confidence</th>
                  <th style={{ padding: '12px 10px' }}>Findings Summary</th>
                  <th style={{ padding: '12px 10px' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => {
                  const b = getFreshnessBadge(row.visual_status);
                  return (
                    <tr
                      key={row.id}
                      style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                      onClick={() => setResult(row)}
                      className="history-table-row"
                    >
                      <td style={{ padding: '12px 10px', fontWeight: 600, color: '#1e293b' }}>
                        {row.item_name}
                      </td>
                      <td style={{ padding: '12px 10px', color: '#64748b' }}>{row.food_category}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <span
                          style={{
                            backgroundColor: b.bg,
                            color: b.color,
                            border: `1px solid ${b.border}`,
                            padding: '3px 9px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {b.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', color: '#475569' }}>
                        {Math.round(row.confidence * 100)}%
                      </td>
                      <td style={{ padding: '12px 10px', color: '#475569', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {row.explanation}
                      </td>
                      <td style={{ padding: '12px 10px', color: '#64748b' }}>
                        {formatDate(row.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


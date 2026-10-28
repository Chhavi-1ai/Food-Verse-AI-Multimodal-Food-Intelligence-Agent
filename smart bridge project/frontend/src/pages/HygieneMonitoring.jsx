import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  ClipboardList,
  Save,
  Clock,
  HelpCircle,
} from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import DisclaimerBanner from '../components/DisclaimerBanner';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';
import { formatDate, getHygieneBadge } from '../utils/formatters';

const DEFAULT_CHECKLIST_TEMPLATE = [
  {
    item_key: 'prep_clean',
    category: 'Sanitation',
    title: 'Preparation surface cleanliness',
    description: 'Workstations, cutting boards, and stainless counters free of debris and sanitized.',
    status: 'Passed',
    notes: '',
  },
  {
    item_key: 'storage_org',
    category: 'Storage',
    title: 'Food storage organization',
    description: 'Dry and cold storage arranged with FIFO dating, covered containers 6" above floor.',
    status: 'Passed',
    notes: '',
  },
  {
    item_key: 'raw_rte_sep',
    category: 'Cross-Contamination',
    title: 'Separation of raw and ready-to-eat foods',
    description: 'Raw meats/poultry stored below ready-to-eat produce; dedicated colored boards used.',
    status: 'Passed',
    notes: '',
  },
  {
    item_key: 'waste_accum',
    category: 'Waste Management',
    title: 'Visible waste accumulation',
    description: 'Trash cans lined, foot-pedal covered, and emptied before reaching brim capacity.',
    status: 'Passed',
    notes: '',
  },
  {
    item_key: 'handwash',
    category: 'Personnel Hygiene',
    title: 'Handwashing facilities operational',
    description: 'Dedicated sink unobstructed, warm water (>=38°C), soap dispenser, and disposable towels stocked.',
    status: 'Passed',
    notes: '',
  },
  {
    item_key: 'clean_schedule',
    category: 'Documentation',
    title: 'Cleaning schedule completion',
    description: 'Daily and weekly deep-clean log sheets signed off by shift manager.',
    status: 'Passed',
    notes: '',
  },
  {
    item_key: 'temp_logs',
    category: 'HACCP / Temperature',
    title: 'Temperature log completion',
    description: 'Walk-ins (<4°C), freezers (<-18°C), and hot holding (>=60°C) logged every 4 hours.',
    status: 'Passed',
    notes: '',
  },
  {
    item_key: 'pest_control',
    category: 'Pest Management',
    title: 'Pest-control inspection records',
    description: 'Vendor log and pest-exclusion sweeps up to date with zero visible activity.',
    status: 'Passed',
    notes: '',
  },
];

export default function HygieneMonitoring() {
  const { onToast } = useOutletContext() || {};

  const [activeTab, setActiveTab] = useState('inspection'); // 'inspection' or 'scanner'
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST_TEMPLATE);
  const [facilityName, setFacilityName] = useState('Main Kitchen Workstation');
  const [inspectorName, setInspectorName] = useState('Lead Hygiene Auditor');
  const [saving, setSaving] = useState(false);

  // Image scanner state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // History & summary state
  const [inspections, setInspections] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadInspectionsAndSummary();
  }, []);

  const loadInspectionsAndSummary = async () => {
    try {
      setLoadingHistory(true);
      const [list, sum] = await Promise.all([
        api.getHygieneInspections(10),
        api.getHygieneSummary(),
      ]);
      setInspections(list);
      setSummary(sum);
    } catch (err) {
      console.error('Failed to load hygiene records:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleStatusChange = (index, newStatus) => {
    setChecklist((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status: newStatus };
      return updated;
    });
  };

  const handleNotesChange = (index, notes) => {
    setChecklist((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], notes };
      return updated;
    });
  };

  const handleSaveInspection = async () => {
    try {
      setSaving(true);
      const payload = {
        facility_name: facilityName,
        inspector_name: inspectorName,
        inspection_type: scanResult ? 'Hybrid Inspection' : 'Manual Checklist',
        image_filename: scanResult?.image_filename || null,
        checklist_items: checklist,
      };

      const res = await api.createHygieneInspection(payload);
      onToast?.(`Hygiene inspection saved! Score: ${res.overall_score}% (${res.status})`, 'success');
      loadInspectionsAndSummary();
    } catch (err) {
      onToast?.(`Failed to save inspection: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleScanKitchenImage = async () => {
    if (!selectedFile) {
      onToast?.('Please upload a kitchen area image.', 'warning');
      return;
    }

    try {
      setScanning(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const data = await api.analyzeKitchenImage(formData);
      setScanResult(data);
      onToast?.(`CV Scan Complete. Score: ${data.overall_score}%`, 'success');

      // If CV detects clutter or residue, mark surface checklist item
      if (data.status !== 'Passed') {
        setChecklist((prev) =>
          prev.map((item) =>
            item.item_key === 'prep_clean'
              ? { ...item, status: 'Needs Attention', notes: data.unresolved_observations?.[0] || 'Flagged by CV Scan' }
              : item
          )
        );
      }
    } catch (err) {
      onToast?.(`Kitchen scan failed: ${err.message}`, 'error');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
          Restaurant Hygiene & Kitchen Safety
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
          Configurable 8-point food safety inspection checklist paired with computer vision surface cleanliness scans.
        </p>
      </div>

      {/* Summary KPI Strip */}
      {summary && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Total Audits</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{summary.total_inspections}</div>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8rem', color: '#15803d', textTransform: 'uppercase', fontWeight: 600 }}>Passed Rate</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#15803d', marginTop: '4px' }}>
              {summary.total_inspections > 0 ? Math.round((summary.passed_inspections / summary.total_inspections) * 100) : 100}%
            </div>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8rem', color: '#b45309', textTransform: 'uppercase', fontWeight: 600 }}>Needs Attention</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#b45309', marginTop: '4px' }}>{summary.needs_attention_count}</div>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8rem', color: '#2563eb', textTransform: 'uppercase', fontWeight: 600 }}>Avg Hygiene Score</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e40af', marginTop: '4px' }}>{summary.average_hygiene_score}%</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px' }}>
        <button
          onClick={() => setActiveTab('inspection')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 16px',
            fontSize: '0.95rem',
            fontWeight: activeTab === 'inspection' ? 700 : 500,
            color: activeTab === 'inspection' ? '#166534' : '#64748b',
            borderBottom: activeTab === 'inspection' ? '3px solid #166534' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ClipboardList size={18} />
          <span>8-Point Inspection Checklist</span>
        </button>
        <button
          onClick={() => setActiveTab('scanner')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 16px',
            fontSize: '0.95rem',
            fontWeight: activeTab === 'scanner' ? 700 : 500,
            color: activeTab === 'scanner' ? '#166534' : '#64748b',
            borderBottom: activeTab === 'scanner' ? '3px solid #166534' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Camera size={18} />
          <span>CV Kitchen Area Scanner</span>
        </button>
      </div>

      {activeTab === 'inspection' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '28px' }}>
          {/* Left: Checklist Form */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px -2px rgba(22, 101, 52, 0.06)',
            }}
          >
            {/* Facility & Inspector Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Facility / Station:
                </label>
                <input
                  type="text"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Auditor Name:
                </label>
                <input
                  type="text"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                  }}
                />
              </div>
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
              Sanitation Checkpoints
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {checklist.map((item, index) => (
                <div
                  key={item.item_key}
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px',
                    padding: '14px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 600, textTransform: 'uppercase' }}>
                        {item.category}
                      </span>
                      <h4 style={{ margin: '2px 0 4px 0', fontSize: '0.92rem', color: '#1e293b' }}>
                        {item.title}
                      </h4>
                    </div>
                  </div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '0.82rem', color: '#64748b' }}>
                    {item.description}
                  </p>

                  {/* Radio buttons */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                    {['Passed', 'Needs Attention', 'Not Inspected'].map((stat) => (
                      <label
                        key={stat}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.82rem',
                          fontWeight: item.status === stat ? 600 : 400,
                          color:
                            stat === 'Passed'
                              ? '#15803d'
                              : stat === 'Needs Attention'
                              ? '#b45309'
                              : '#64748b',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="radio"
                          name={`item_${item.item_key}`}
                          checked={item.status === stat}
                          onChange={() => handleStatusChange(index, stat)}
                          style={{ accentColor: '#16a34a' }}
                        />
                        <span>{stat}</span>
                      </label>
                    ))}
                  </div>

                  {item.status === 'Needs Attention' && (
                    <input
                      type="text"
                      placeholder="Add corrective note or reason..."
                      value={item.notes}
                      onChange={(e) => handleNotesChange(index, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #fde68a',
                        backgroundColor: '#fffbeb',
                        fontSize: '0.82rem',
                        color: '#92400e',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveInspection}
              disabled={saving}
              style={{
                width: '100%',
                backgroundColor: '#166534',
                color: '#ffffff',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(22, 101, 52, 0.2)',
                marginTop: '20px',
              }}
            >
              <Save size={18} />
              <span>{saving ? 'Saving Inspection...' : 'Submit & Save Inspection Record'}</span>
            </button>
          </div>

          {/* Right: History & Unresolved Issues */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Unresolved Issues Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px -2px rgba(22, 101, 52, 0.06)',
              }}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
                Open Hygiene Observations & Corrective Actions
              </h3>

              {summary?.recent_unresolved_issues?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: '#15803d' }}>
                  <CheckCircle2 size={32} style={{ margin: '0 auto 8px auto' }} />
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>
                    No critical hygiene deficiencies currently open!
                  </p>
                </div>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.86rem', color: '#334155', lineHeight: 1.6 }}>
                  {summary?.recent_unresolved_issues?.map((issue, i) => (
                    <li key={i} style={{ marginBottom: '6px' }}>
                      <strong style={{ color: '#b91c1c' }}>Action Required:</strong> {issue}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Previous Inspections History */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px -2px rgba(22, 101, 52, 0.06)',
                flex: 1,
              }}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
                Recent Inspection Audits
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {inspections.map((insp) => {
                  const badge = getHygieneBadge(insp.status, insp.overall_score);
                  return (
                    <div
                      key={insp.id}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}>
                          {insp.facility_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {insp.inspector_name} • {formatDate(insp.created_at)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                            padding: '3px 9px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {badge.label} ({insp.overall_score}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scanner' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '28px' }}>
          {/* Scanner Upload */}
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
              label="Upload Kitchen Workstation / Prep Area Photo"
              selectedFile={selectedFile}
              previewUrl={previewUrl}
              onImageSelected={(f) => {
                setSelectedFile(f);
                setPreviewUrl(URL.createObjectURL(f));
                setScanResult(null);
              }}
              onClear={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
                setScanResult(null);
              }}
            />

            <button
              onClick={handleScanKitchenImage}
              disabled={!selectedFile || scanning}
              style={{
                width: '100%',
                backgroundColor: !selectedFile || scanning ? '#94a3b8' : '#166534',
                color: '#ffffff',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: !selectedFile || scanning ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(22, 101, 52, 0.2)',
                marginTop: '16px',
              }}
            >
              <Camera size={19} />
              <span>{scanning ? 'Analyzing Surface Cleanliness...' : 'Run Computer Vision Scan'}</span>
            </button>

            {scanning && <LoadingSpinner message="Evaluating edge clutter & surface spot metrics..." />}
          </div>

          {/* Scanner Results */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px -2px rgba(22, 101, 52, 0.06)',
            }}
          >
            {scanResult ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                    CV Scan Observations
                  </h3>
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '999px',
                      backgroundColor: scanResult.status === 'Passed' ? '#dcfce7' : '#fee2e2',
                      color: scanResult.status === 'Passed' ? '#15803d' : '#b91c1c',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                    }}
                  >
                    Score: {scanResult.overall_score}% ({scanResult.status})
                  </span>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.88rem', color: '#1e293b' }}>
                    Detected Visual Indicators:
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
                    {scanResult.detected_observations?.map((obs, i) => (
                      <li key={i}>{obs}</li>
                    ))}
                  </ul>
                </div>

                {scanResult.corrective_actions?.length > 0 && (
                  <div
                    style={{
                      backgroundColor: '#fffbeb',
                      borderRadius: '10px',
                      padding: '14px',
                      border: '1px solid #fde68a',
                    }}
                  >
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '0.88rem', color: '#92400e' }}>
                      Recommended Corrective Actions:
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.82rem', color: '#b45309' }}>
                      {scanResult.corrective_actions.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                <Camera size={36} style={{ margin: '0 auto 12px auto' }} />
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Upload kitchen image to scan for visible surface clutter and residue.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mandatory Statutory Health Disclaimer */}
      <DisclaimerBanner type="warning" title="STATUTORY FOOD HYGIENE DISCLAIMER">
        Computer vision inspection evaluates visible surface clutter and physical cleanliness only. It cannot verify microbiological sanitation, pathogen eradication, chemical sanitizer concentration (ppm), or internal holding temperatures. It does not replace statutory local Health Department food safety inspections.
      </DisclaimerBanner>
    </div>
  );
}


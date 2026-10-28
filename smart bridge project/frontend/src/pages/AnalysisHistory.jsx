import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  History,
  Camera,
  Sparkles,
  ShieldCheck,
  Trash2,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, getFreshnessBadge, getHygieneBadge } from '../utils/formatters';

export default function AnalysisHistory() {
  const { onToast } = useOutletContext() || {};

  const [activeTab, setActiveTab] = useState('food'); // 'food', 'freshness', 'hygiene'
  const [foodHistory, setFoodHistory] = useState([]);
  const [freshnessHistory, setFreshnessHistory] = useState([]);
  const [hygieneHistory, setHygieneHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllHistory();
  }, []);

  const loadAllHistory = async () => {
    try {
      setLoading(true);
      const [f, fr, h] = await Promise.all([
        api.getFoodHistory(50),
        api.getFreshnessHistory(50),
        api.getHygieneInspections(50),
      ]);
      setFoodHistory(f);
      setFreshnessHistory(fr);
      setHygieneHistory(h);
    } catch (err) {
      console.error('Failed to load history logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFood = async (id) => {
    try {
      await api.deleteFoodAnalysis(id);
      setFoodHistory((prev) => prev.filter((item) => item.id !== id));
      onToast?.('Food scan deleted', 'info');
    } catch (err) {
      onToast?.(`Delete failed: ${err.message}`, 'error');
    }
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
          Multimodal Analysis Archive
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
          Historical repository of food recognition scans, produce freshness evaluations, and kitchen safety audits.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0' }}>
        <button
          onClick={() => setActiveTab('food')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 18px',
            fontSize: '0.95rem',
            fontWeight: activeTab === 'food' ? 700 : 500,
            color: activeTab === 'food' ? '#166534' : '#64748b',
            borderBottom: activeTab === 'food' ? '3px solid #166534' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Camera size={18} />
          <span>Food Scans ({foodHistory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('freshness')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 18px',
            fontSize: '0.95rem',
            fontWeight: activeTab === 'freshness' ? 700 : 500,
            color: activeTab === 'freshness' ? '#166534' : '#64748b',
            borderBottom: activeTab === 'freshness' ? '3px solid #166534' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Sparkles size={18} />
          <span>Produce Freshness ({freshnessHistory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('hygiene')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 18px',
            fontSize: '0.95rem',
            fontWeight: activeTab === 'hygiene' ? 700 : 500,
            color: activeTab === 'hygiene' ? '#166534' : '#64748b',
            borderBottom: activeTab === 'hygiene' ? '3px solid #166534' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShieldCheck size={18} />
          <span>Hygiene Inspections ({hygieneHistory.length})</span>
        </button>
      </div>

      {/* Main Content Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 12px -2px rgba(22, 101, 52, 0.05)',
        }}
      >
        {loading ? (
          <LoadingSpinner message="Loading historical logs..." />
        ) : activeTab === 'food' ? (
          foodHistory.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', margin: '40px 0' }}>No food analyses logged yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 10px' }}>Food Dish</th>
                    <th style={{ padding: '12px 10px' }}>Portion</th>
                    <th style={{ padding: '12px 10px' }}>Calories</th>
                    <th style={{ padding: '12px 10px' }}>P / C / F</th>
                    <th style={{ padding: '12px 10px' }}>AI Engine</th>
                    <th style={{ padding: '12px 10px' }}>Date</th>
                    <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {foodHistory.map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 600, color: '#1e293b' }}>
                        {row.food_name}
                      </td>
                      <td style={{ padding: '12px 10px', color: '#475569' }}>{row.portion_grams}g</td>
                      <td style={{ padding: '12px 10px', fontWeight: 700, color: '#166534' }}>
                        {Math.round(row.estimated_calories)} kcal
                      </td>
                      <td style={{ padding: '12px 10px', color: '#64748b' }}>
                        {row.protein_g}g / {row.carbs_g}g / {row.fat_g}g
                      </td>
                      <td style={{ padding: '12px 10px', fontSize: '0.78rem', color: '#64748b' }}>
                        {row.ai_provider_used}
                      </td>
                      <td style={{ padding: '12px 10px', color: '#64748b' }}>{formatDate(row.created_at)}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteFood(row.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : activeTab === 'freshness' ? (
          freshnessHistory.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', margin: '40px 0' }}>No produce freshness assessments logged.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 10px' }}>Item</th>
                    <th style={{ padding: '12px 10px' }}>Category</th>
                    <th style={{ padding: '12px 10px' }}>Status Classification</th>
                    <th style={{ padding: '12px 10px' }}>Confidence</th>
                    <th style={{ padding: '12px 10px' }}>Findings Explanation</th>
                    <th style={{ padding: '12px 10px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {freshnessHistory.map((row) => {
                    const b = getFreshnessBadge(row.visual_status);
                    return (
                      <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 10px', fontWeight: 600, color: '#1e293b' }}>{row.item_name}</td>
                        <td style={{ padding: '12px 10px', color: '#64748b' }}>{row.food_category}</td>
                        <td style={{ padding: '12px 10px' }}>
                          <span
                            style={{
                              backgroundColor: b.bg,
                              color: b.color,
                              border: `1px solid ${b.border}`,
                              padding: '3px 8px',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            {b.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 10px', color: '#475569' }}>{Math.round(row.confidence * 100)}%</td>
                        <td style={{ padding: '12px 10px', color: '#475569', maxWidth: '300px' }}>{row.explanation}</td>
                        <td style={{ padding: '12px 10px', color: '#64748b' }}>{formatDate(row.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          hygieneHistory.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', margin: '40px 0' }}>No hygiene audits logged yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 10px' }}>Facility / Station</th>
                    <th style={{ padding: '12px 10px' }}>Auditor</th>
                    <th style={{ padding: '12px 10px' }}>Audit Type</th>
                    <th style={{ padding: '12px 10px' }}>Compliance Score</th>
                    <th style={{ padding: '12px 10px' }}>Status</th>
                    <th style={{ padding: '12px 10px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {hygieneHistory.map((row) => {
                    const b = getHygieneBadge(row.status, row.overall_score);
                    return (
                      <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 10px', fontWeight: 600, color: '#1e293b' }}>{row.facility_name}</td>
                        <td style={{ padding: '12px 10px', color: '#475569' }}>{row.inspector_name}</td>
                        <td style={{ padding: '12px 10px', color: '#64748b' }}>{row.inspection_type}</td>
                        <td style={{ padding: '12px 10px', fontWeight: 700, color: '#166534' }}>{row.overall_score}%</td>
                        <td style={{ padding: '12px 10px' }}>
                          <span
                            style={{
                              backgroundColor: b.bg,
                              color: b.color,
                              border: `1px solid ${b.border}`,
                              padding: '3px 8px',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            {b.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 10px', color: '#64748b' }}>{formatDate(row.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}


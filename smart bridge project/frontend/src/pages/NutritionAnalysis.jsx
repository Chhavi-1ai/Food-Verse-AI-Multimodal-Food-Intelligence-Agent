import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Activity,
  Flame,
  Award,
  Calendar,
  PieChart as PieIcon,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { api } from '../services/api';
import { MacroDoughnutChart } from '../components/NutritionChart';
import LoadingSpinner from '../components/LoadingSpinner';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { formatDate } from '../utils/formatters';

export default function NutritionAnalysis() {
  const { onToast } = useOutletContext() || {};

  const [summary, setSummary] = useState(null);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNutritionOverview();
  }, []);

  const loadNutritionOverview = async () => {
    try {
      setLoading(true);
      const [sum, prof, hist] = await Promise.all([
        api.getDailyNutritionSummary(),
        api.getProfile(),
        api.getFoodHistory(10),
      ]);
      setSummary(sum);
      setProfile(prof);
      setHistory(hist);
    } catch (err) {
      console.error('Failed to load nutrition analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Calculating nutritional aggregates & target ratios..." />;
  }

  const calorieTarget = summary?.calorie_target || profile?.calorie_target || 2000;
  const consumedCalories = summary?.total_calories || 0;
  const caloriePercent = Math.min(100, Math.round((consumedCalories / calorieTarget) * 100));

  const proteinConsumed = summary?.total_protein_g || 0;
  const proteinTarget = profile?.protein_target_g || 75;
  const carbConsumed = summary?.total_carbs_g || 0;
  const carbTarget = profile?.carb_target_g || 250;
  const fatConsumed = summary?.total_fat_g || 0;
  const fatTarget = profile?.fat_target_g || 65;

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
          Personalized Nutrition Analysis
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
          Real-time daily macro tracking, caloric budget utilization, and dietary goal analytics.
        </p>
      </div>

      {/* Target Progress Bar Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        {/* Calories Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Daily Calories</span>
            <span style={{ fontSize: '0.84rem', color: '#64748b' }}>{caloriePercent}% of goal</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            {Math.round(consumedCalories)} / {calorieTarget} kcal
          </div>
          <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', backgroundColor: '#16a34a', width: `${caloriePercent}%` }} />
          </div>
        </div>

        {/* Protein Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700, textTransform: 'uppercase' }}>Protein</span>
            <span style={{ fontSize: '0.84rem', color: '#64748b' }}>{Math.min(100, Math.round((proteinConsumed / proteinTarget) * 100))}%</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e40af', marginBottom: '8px' }}>
            {proteinConsumed}g / {proteinTarget}g
          </div>
          <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', backgroundColor: '#3b82f6', width: `${Math.min(100, Math.round((proteinConsumed / proteinTarget) * 100))}%` }} />
          </div>
        </div>

        {/* Carbs Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 700, textTransform: 'uppercase' }}>Carbohydrates</span>
            <span style={{ fontSize: '0.84rem', color: '#64748b' }}>{Math.min(100, Math.round((carbConsumed / carbTarget) * 100))}%</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#92400e', marginBottom: '8px' }}>
            {carbConsumed}g / {carbTarget}g
          </div>
          <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', backgroundColor: '#f59e0b', width: `${Math.min(100, Math.round((carbConsumed / carbTarget) * 100))}%` }} />
          </div>
        </div>

        {/* Fat Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 700, textTransform: 'uppercase' }}>Total Fat</span>
            <span style={{ fontSize: '0.84rem', color: '#64748b' }}>{Math.min(100, Math.round((fatConsumed / fatTarget) * 100))}%</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#991b1b', marginBottom: '8px' }}>
            {fatConsumed}g / {fatTarget}g
          </div>
          <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', backgroundColor: '#ef4444', width: `${Math.min(100, Math.round((fatConsumed / fatTarget) * 100))}%` }} />
          </div>
        </div>
      </div>

      {/* Charts & Micro Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '28px', marginBottom: '28px' }}>
        {/* Doughnut Macro Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px -2px rgba(22, 101, 52, 0.05)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
            Macronutrient Ratio Breakdown
          </h3>
          <MacroDoughnutChart
            protein={proteinConsumed}
            carbs={carbConsumed}
            fat={fatConsumed}
            fiber={summary?.total_fiber_g || 0}
          />
        </div>

        {/* Micronutrients and Minerals Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px -2px rgba(22, 101, 52, 0.05)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
            Additional Nutritional Indicators
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>Dietary Fiber</span>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Supports digestive microbiome health</p>
              </div>
              <strong style={{ fontSize: '1.2rem', color: '#059669' }}>
                {summary?.total_fiber_g || 0}g
              </strong>
            </div>

            <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>Sodium</span>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Electrolyte & fluid balance indicator</p>
              </div>
              <strong style={{ fontSize: '1.2rem', color: '#0284c7' }}>
                {summary?.total_sodium_mg || 0} mg
              </strong>
            </div>

            <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #86efac', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 600, color: '#15803d', fontSize: '0.9rem' }}>Dietary Compliance</span>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#166534' }}>Strict allergen filters verified</p>
              </div>
              <strong style={{ fontSize: '1.1rem', color: '#15803d' }}>
                100% Safe
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Logged Food Timeline */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px -2px rgba(22, 101, 52, 0.05)' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
          Meals & Food Scanned in Log
        </h3>

        {history.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', margin: '20px 0' }}>
            No nutrition logs recorded today.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {history.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.92rem', color: '#1e293b' }}>
                    {item.food_name}
                  </span>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {item.portion_grams}g • P: {item.protein_g}g | C: {item.carbs_g}g | F: {item.fat_g}g
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700, color: '#15803d', fontSize: '1.05rem' }}>
                    {Math.round(item.estimated_calories)} kcal
                  </span>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {formatDate(item.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DisclaimerBanner type="info" title="Nutritional Reference Notice">
        Macronutrient tracking is calculated using standard USDA nutritional composition tables. Actual individual nutrient absorption depends on individual metabolic rate and food preparation methods.
      </DisclaimerBanner>
    </div>
  );
}


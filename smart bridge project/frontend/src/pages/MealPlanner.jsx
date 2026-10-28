import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  CalendarCheck,
  Sparkles,
  ShoppingCart,
  CheckCircle2,
  RefreshCw,
  Plus,
  Flame,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import DisclaimerBanner from '../components/DisclaimerBanner';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MealPlanner() {
  const navigate = useNavigate();
  const { onToast } = useOutletContext() || {};

  const [mealPlans, setMealPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Generate Modal state
  const [showGenModal, setShowGenModal] = useState(false);
  const [planType, setPlanType] = useState('weekly');
  const [planTitle, setPlanTitle] = useState('Balanced Weekly Nutrition Schedule');
  const [targetCals, setTargetCals] = useState(2000);
  const [dietaryPref, setDietaryPref] = useState('omnivore');
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [generating, setGenerating] = useState(false);

  // Replace Meal modal state
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [mealToReplace, setMealToReplace] = useState(null);
  const [selectedReplacementRecipeId, setSelectedReplacementRecipeId] = useState('');

  const ALLERGEN_OPTIONS = ['peanuts', 'tree nuts', 'dairy', 'gluten', 'shellfish', 'eggs', 'soy', 'fish'];

  useEffect(() => {
    loadPlansAndRecipes();
  }, []);

  const loadPlansAndRecipes = async () => {
    try {
      setLoading(true);
      const [plans, recs] = await Promise.all([api.getMealPlans(10), api.getRecipes()]);
      setMealPlans(plans);
      setRecipes(recs);
      if (plans.length > 0) {
        setSelectedPlan(plans[0]);
      }
    } catch (err) {
      console.error('Failed to load meal plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    try {
      setGenerating(true);
      const payload = {
        plan_type: planType,
        title: planTitle,
        target_daily_calories: targetCals,
        dietary_preference: dietaryPref,
        allergies: selectedAllergies,
      };

      const newPlan = await api.generateMealPlan(payload);
      setMealPlans((prev) => [newPlan, ...prev]);
      setSelectedPlan(newPlan);
      setShowGenModal(false);
      onToast?.('Personalized AI meal plan generated successfully!', 'success');
    } catch (err) {
      onToast?.(`Plan generation failed: ${err.message}`, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleMealComplete = async (mealId) => {
    try {
      const res = await api.toggleMealComplete(mealId);
      setSelectedPlan((prev) => ({
        ...prev,
        planned_meals: prev.planned_meals.map((m) =>
          m.id === mealId ? { ...m, is_completed: res.is_completed } : m
        ),
      }));
    } catch (err) {
      onToast?.(`Error updating meal: ${err.message}`, 'error');
    }
  };

  const handleOpenReplaceModal = (meal) => {
    setMealToReplace(meal);
    setSelectedReplacementRecipeId(recipes[0]?.id || '');
    setReplaceModalOpen(true);
  };

  const handleConfirmReplace = async () => {
    if (!mealToReplace || !selectedReplacementRecipeId) return;

    try {
      const updated = await api.replacePlannedMeal({
        meal_id: mealToReplace.id,
        new_recipe_id: Number(selectedReplacementRecipeId),
      });

      setSelectedPlan((prev) => ({
        ...prev,
        planned_meals: prev.planned_meals.map((m) =>
          m.id === mealToReplace.id ? updated : m
        ),
      }));
      setReplaceModalOpen(false);
      onToast?.('Meal replaced successfully', 'success');
    } catch (err) {
      onToast?.(`Replace meal failed: ${err.message}`, 'error');
    }
  };

  const handleGenerateShoppingList = async () => {
    if (!selectedPlan) return;
    try {
      await api.generateShoppingList(selectedPlan.id);
      onToast?.('Grocery shopping list generated from meal plan!', 'success');
      navigate('/shopping-list');
    } catch (err) {
      onToast?.(`Shopping list generation failed: ${err.message}`, 'error');
    }
  };

  // Group planned meals by day of week
  const groupedMeals = {};
  selectedPlan?.planned_meals?.forEach((m) => {
    const day = m.day_of_week || 'Today';
    if (!groupedMeals[day]) groupedMeals[day] = [];
    groupedMeals[day].push(m);
  });

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
            Personalized Meal Planner & Calendar
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
            AI-scheduled daily and weekly nutritional planning strictly aligned with dietary preferences and allergen guardrails.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowGenModal(true)}
            style={{
              backgroundColor: '#166534',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(22, 101, 52, 0.2)',
            }}
          >
            <Sparkles size={16} />
            <span>Generate New Plan</span>
          </button>
          {selectedPlan && (
            <button
              onClick={handleGenerateShoppingList}
              style={{
                backgroundColor: '#22c55e',
                color: '#052e16',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
              }}
            >
              <ShoppingCart size={16} />
              <span>Generate Grocery List</span>
            </button>
          )}
        </div>
      </div>

      {/* Plan Details Strip */}
      {selectedPlan && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '20px 24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 12px -2px rgba(22, 101, 52, 0.05)',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <span
              style={{
                backgroundColor: '#dcfce7',
                color: '#15803d',
                padding: '2px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              {selectedPlan.plan_type} PLAN
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', margin: '6px 0 4px 0' }}>
              {selectedPlan.title}
            </h2>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
              {selectedPlan.notes}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Target Daily Calories</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#166534' }}>
                {selectedPlan.target_daily_calories} kcal
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Meals Scheduled</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                {selectedPlan.planned_meals?.length || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Schedule Grid */}
      {loading ? (
        <LoadingSpinner message="Loading meal plan schedule..." />
      ) : Object.keys(groupedMeals).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <CalendarCheck size={40} style={{ color: '#94a3b8', margin: '0 auto 12px auto' }} />
          <h3 style={{ margin: '0 0 6px 0', color: '#334155' }}>No Active Meal Plan</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
            Generate a personalized daily or weekly schedule based on your nutrition profile.
          </p>
          <button
            onClick={() => setShowGenModal(true)}
            style={{
              backgroundColor: '#166534',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Generate First Plan
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
          {Object.entries(groupedMeals).map(([dayName, meals]) => {
            const dayCalories = Math.round(meals.reduce((sum, m) => sum + m.calories, 0));
            return (
              <div
                key={dayName}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  padding: '20px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #f1f5f9',
                    paddingBottom: '12px',
                    marginBottom: '14px',
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#166534' }}>
                    {dayName}
                  </h3>
                  <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#64748b' }}>
                    Total Day: {dayCalories} kcal
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                  {meals.map((meal) => (
                    <div
                      key={meal.id}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        backgroundColor: meal.is_completed ? '#f0fdf4' : '#f8fafc',
                        border: `1px solid ${meal.is_completed ? '#86efac' : '#e2e8f0'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: '#15803d',
                            textTransform: 'uppercase',
                          }}
                        >
                          {meal.meal_type}
                        </span>
                        <button
                          onClick={() => handleToggleMealComplete(meal.id)}
                          style={{
                            background: meal.is_completed ? '#16a34a' : 'transparent',
                            color: meal.is_completed ? '#ffffff' : '#94a3b8',
                            border: `1px solid ${meal.is_completed ? '#16a34a' : '#cbd5e1'}`,
                            borderRadius: '999px',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                          title={meal.is_completed ? 'Mark as pending' : 'Mark as eaten'}
                        >
                          {meal.is_completed && <Check size={14} />}
                        </button>
                      </div>

                      <div style={{ fontWeight: 600, fontSize: '0.92rem', color: meal.is_completed ? '#15803d' : '#1e293b' }}>
                        {meal.meal_name}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748b' }}>
                        <span>{Math.round(meal.calories)} kcal ({meal.servings} svg)</span>
                        <button
                          onClick={() => handleOpenReplaceModal(meal)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#16a34a',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <RefreshCw size={12} />
                          <span>Swap</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Strict Allergen & Medical Disclaimer */}
      <DisclaimerBanner type="warning" title="MEDICAL & DIETARY SAFETY NOTICE">
        Food Verse AI strictly excludes declared allergens, but cannot guarantee zero manufacturing cross-contact. Nutritional recommendations are calculated approximations and do not constitute certified clinical dietary prescriptions. Consult a licensed medical professional or registered dietitian for specialized therapeutic diets.
      </DisclaimerBanner>

      {/* Generate Plan Modal */}
      {showGenModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '28px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.3rem', color: '#0f172a' }}>
              Generate Personalized Meal Plan
            </h3>
            <p style={{ margin: '0 0 18px 0', fontSize: '0.85rem', color: '#64748b' }}>
              Configure your calorie target, plan timeframe, and strict allergen filters.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Plan Title
                </label>
                <input
                  type="text"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Plan Type
                  </label>
                  <select
                    value={planType}
                    onChange={(e) => setPlanType(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="weekly">Weekly (7 Days)</option>
                    <option value="daily">Daily Schedule</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Dietary Pattern
                  </label>
                  <select
                    value={dietaryPref}
                    onChange={(e) => setDietaryPref(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="omnivore">Omnivore / Balanced</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="keto">Keto / Low-Carb</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Target Daily Calories ({targetCals} kcal)
                </label>
                <input
                  type="range"
                  min="1200"
                  max="3500"
                  step="50"
                  value={targetCals}
                  onChange={(e) => setTargetCals(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#16a34a' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Strict Allergen Exclusions (Must Never Include):
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {ALLERGEN_OPTIONS.map((alg) => {
                    const isChecked = selectedAllergies.includes(alg);
                    return (
                      <button
                        type="button"
                        key={alg}
                        onClick={() => {
                          setSelectedAllergies((prev) =>
                            isChecked ? prev.filter((a) => a !== alg) : [...prev, alg]
                          );
                        }}
                        style={{
                          backgroundColor: isChecked ? '#fee2e2' : '#f8fafc',
                          color: isChecked ? '#b91c1c' : '#475569',
                          border: `1px solid ${isChecked ? '#fca5a5' : '#cbd5e1'}`,
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {alg}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowGenModal(false)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGeneratePlan}
                disabled={generating}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#166534',
                  color: '#fff',
                  cursor: generating ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                }}
              >
                {generating ? 'Generating AI Plan...' : 'Generate Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replace Meal Modal */}
      {replaceModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '460px',
              width: '100%',
            }}
          >
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: '#0f172a' }}>
              Swap Meal: {mealToReplace?.meal_name}
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#64748b' }}>
              Choose an alternative recipe from your catalog to replace this scheduled meal:
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Replacement Recipe:
              </label>
              <select
                value={selectedReplacementRecipeId}
                onChange={(e) => setSelectedReplacementRecipeId(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({Math.round(r.calories_per_serving)} kcal)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setReplaceModalOpen(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReplace}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#166534',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Confirm Swap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


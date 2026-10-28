const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = options.headers || {};

  // If body is not FormData, default to application/json
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // System & Health
  getHealth: () => request('/health'),
  getDashboardSummary: () => request('/dashboard-summary'),
  seedSampleData: () => request('/seed-sample-data', { method: 'POST' }),

  // Food Recognition & Nutrition
  analyzeFoodImage: (formData) =>
    request('/food/analyze', {
      method: 'POST',
      body: formData,
    }),
  recalculateNutrition: (data) =>
    request('/food/recalculate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  saveFoodAnalysis: (data) =>
    request('/food/save', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getFoodHistory: (limit = 20) => request(`/food/history?limit=${limit}`),
  getDailyNutritionSummary: (dateStr) =>
    request(`/food/daily-summary${dateStr ? `?date_str=${dateStr}` : ''}`),
  getFoodAnalysis: (id) => request(`/food/${id}`),
  deleteFoodAnalysis: (id) =>
    request(`/food/${id}`, {
      method: 'DELETE',
    }),

  // Freshness Detection
  analyzeFreshness: (formData) =>
    request('/freshness/analyze', {
      method: 'POST',
      body: formData,
    }),
  getFreshnessHistory: (limit = 20) => request(`/freshness/history?limit=${limit}`),
  getFreshnessAssessment: (id) => request(`/freshness/${id}`),

  // Hygiene Monitoring
  analyzeKitchenImage: (formData) =>
    request('/hygiene/analyze', {
      method: 'POST',
      body: formData,
    }),
  createHygieneInspection: (data) =>
    request('/hygiene/inspections', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getHygieneInspections: (limit = 20) => request(`/hygiene/inspections?limit=${limit}`),
  getHygieneSummary: () => request('/hygiene/summary'),
  getHygieneInspection: (id) => request(`/hygiene/inspections/${id}`),

  // Recipes & Cooking
  getRecipes: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/recipes${query ? `?${query}` : ''}`);
  },
  recommendRecipes: (data) =>
    request('/recipes/recommend', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getRecipe: (id, servings) =>
    request(`/recipes/${id}${servings ? `?servings=${servings}` : ''}`),
  toggleFavoriteRecipe: (id) =>
    request(`/recipes/favorites/${id}`, {
      method: 'POST',
    }),
  getFavoriteRecipes: () => request('/recipes/favorites/list'),

  // Meal Planner & Shopping
  generateMealPlan: (data) =>
    request('/meal-plans/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMealPlans: (limit = 10) => request(`/meal-plans?limit=${limit}`),
  getMealPlan: (id) => request(`/meal-plans/${id}`),
  replacePlannedMeal: (data) =>
    request('/meal-plans/replace-meal', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  toggleMealComplete: (mealId) =>
    request(`/meal-plans/meal/${mealId}/toggle-complete`, {
      method: 'PUT',
    }),

  // Shopping List
  generateShoppingList: (mealPlanId) =>
    request('/shopping-list/generate', {
      method: 'POST',
      body: JSON.stringify({ meal_plan_id: mealPlanId }),
    }),
  getShoppingList: (mealPlanId) =>
    request(`/shopping-list${mealPlanId ? `?meal_plan_id=${mealPlanId}` : ''}`),
  addShoppingItem: (data) =>
    request('/shopping-list/item', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  toggleShoppingItem: (id) =>
    request(`/shopping-list/${id}/toggle`, {
      method: 'PUT',
    }),
  deleteShoppingItem: (id) =>
    request(`/shopping-list/${id}`, {
      method: 'DELETE',
    }),

  // User Profile
  getProfile: () => request('/profile'),
  updateProfile: (data) =>
    request('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};


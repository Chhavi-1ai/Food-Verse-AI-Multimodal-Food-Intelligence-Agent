import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import FoodRecognition from './pages/FoodRecognition';
import NutritionAnalysis from './pages/NutritionAnalysis';
import FreshnessDetection from './pages/FreshnessDetection';
import HygieneMonitoring from './pages/HygieneMonitoring';
import SmartCookingAssistant from './pages/SmartCookingAssistant';
import MealPlanner from './pages/MealPlanner';
import RecipeCollection from './pages/RecipeCollection';
import ShoppingList from './pages/ShoppingList';
import AnalysisHistory from './pages/AnalysisHistory';
import Settings from './pages/Settings';
import { useToast } from './hooks/useToast';
import './App.css';

export default function App() {
  const { toasts, addToast, removeToast } = useToast();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <MainLayout
              toasts={toasts}
              onDismissToast={removeToast}
              onToast={addToast}
            />
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/food-recognition" element={<FoodRecognition />} />
          <Route path="/nutrition-analysis" element={<NutritionAnalysis />} />
          <Route path="/freshness-detection" element={<FreshnessDetection />} />
          <Route path="/hygiene-monitoring" element={<HygieneMonitoring />} />
          <Route path="/cooking-assistant" element={<SmartCookingAssistant />} />
          <Route path="/meal-planner" element={<MealPlanner />} />
          <Route path="/recipes" element={<RecipeCollection />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
          <Route path="/history" element={<AnalysisHistory />} />
          <Route path="/settings" element={<Settings />} />
          {/* Catch-all redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

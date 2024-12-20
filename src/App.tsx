// src/App.tsx
import React, { useState, Suspense } from 'react';
import { Sparkles } from 'lucide-react';
import Logo from './components/Logo';
import LoadingSpinner from './components/LoadingSpinner';
import { QuestionnaireData } from './types';
import { getRecommendations } from './utils/recommendations';

// Lazy load components
const Questionnaire = React.lazy(() => import('./components/Questionnaire'));
const Recommendations = React.lazy(() => import('./components/Recommendations'));

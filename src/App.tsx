import React, { useState, Suspense } from 'react';
import { Sparkles } from 'lucide-react';
import Logo from './components/Logo';
import LoadingSpinner from './components/LoadingSpinner';
import { QuestionnaireData } from './types';
import { getRecommendations } from './utils/recommendations';

// Lazy load components
const Questionnaire = React.lazy(() => import('./components/Questionnaire'));
const Recommendations = React.lazy(() => import('./components/Recommendations'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner />
  </div>
);

export default function App() {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [recommendations, setRecommendations] = useState<ReturnType<typeof getRecommendations> | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async (data: QuestionnaireData) => {
    try {
      setError(null);
      const recs = getRecommendations(data);
      setRecommendations(recs);
      setUserEmail(data.email);
      setUserName(data.name);
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError('Unable to generate recommendations. Please try again.');
    }
  };

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {!showQuestionnaire && !recommendations ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
          <div className="max-w-2xl mx-auto text-center">
            <Logo className="justify-center mb-8" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Find Your Perfect Business Tools
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              AI-powered recommendations that match your exact business needs in minutes.
            </p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Tool matching for your unique business</span>
            </div>
            <button
              onClick={() => setShowQuestionnaire(true)}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
            >
              Get Started
            </button>
          </div>
        </div>
      ) : (
        <div className="container mx-auto py-12">
          <Suspense fallback={<LoadingFallback />}>
            {!recommendations ? (
              <>
                <Logo className="mx-auto mb-12" />
                <Questionnaire onComplete={handleComplete} />
              </>
            ) : (
              <Recommendations 
                recommendations={recommendations} 
                userEmail={userEmail}
                userName={userName}
              />
            )}
          </Suspense>
        </div>
      )}
    </div>
  );
}

import { Recommendation } from '../../types';

interface SendRecommendationsResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function sendRecommendations(
  email: string,
  name: string,
  recommendations: Recommendation[]
): Promise<SendRecommendationsResponse> {
  if (!email || !name || !recommendations?.length) {
    return {
      success: false,
      error: 'Missing required data'
    };
  }

  try {
    const payload = {
      email,
      name,
      recommendations: recommendations.map(rec => ({
        tool: {
          name: rec.tool.name,
          description: rec.tool.description,
          category: rec.tool.category,
          website: rec.tool.website
        },
        reasons: rec.reasons
      }))
    };

    const response = await fetch('/.netlify/functions/send-recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    // First try to parse the response
    const data = await response.json().catch(() => ({ 
      success: false,
      error: `Failed to parse response` 
    }));

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Request failed with status ${response.status}`
      };
    }

    return {
      success: true,
      message: data.message || 'Recommendations sent successfully'
    };

  } catch (error) {
    console.error('Error sending recommendations:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send recommendations'
    };
  }
}

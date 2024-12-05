export interface EmailConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  user: string;
}

export interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  website: string;
  features: string[];
  pricing: string[];
}

export interface Recommendation {
  tool: Tool;
  score: number;
  reasons: string[];
}

export interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface SendRecommendationsRequest {
  email: string;
  name: string;
  recommendations: Recommendation[];
}

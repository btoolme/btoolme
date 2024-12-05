import { Handler } from '@netlify/functions';
import { EmailService } from '../../src/lib/email/service';
import { CONFIG } from '../../src/config';
import { validateQuestionnaireData } from '../../src/lib/validation';
import { logger } from '../../src/lib/logger';
import { AppError } from '../../src/lib/errors';
import type { Recommendation } from '../../src/types';

const emailService = new EmailService(CONFIG.email);

interface RequestBody {
  email: string;
  name: string;
  recommendations: Recommendation[];
}

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { 
      statusCode: 204, 
      headers 
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        success: false,
        error: 'Method not allowed' 
      })
    };
  }

  try {
    if (!event.body) {
      throw AppError.BadRequest('Missing request body');
    }

    const { email, name, recommendations } = JSON.parse(event.body) as RequestBody;

    logger.info('Processing email request', { email, name });

    // Send to both the user and our admin email
    await Promise.all([
      emailService.sendRecommendations(email, name, recommendations),
      emailService.sendRecommendations('recommendations@btoolme.com', name, recommendations)
    ]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Email sent successfully'
      })
    };
  } catch (error) {
    logger.error('Email sending failed', error);

    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal server error';

    return {
      statusCode,
      headers,
      body: JSON.stringify({
        success: false,
        error: message
      })
    };
  }
};

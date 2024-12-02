import { Handler } from '@netlify/functions';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

async function checkEmailService() {
  try {
    const accessToken = await oauth2Client.getAccessToken();
    
    if (!accessToken?.token) {
      throw new Error('Failed to obtain access token');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_FROM,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken.token
      }
    });

    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email service check failed:', error);
    return false;
  }
}

export const handler: Handler = async () => {
  try {
    // Check email service
    const emailServiceStatus = await checkEmailService();

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: emailServiceStatus ? 'healthy' : 'unhealthy',
        services: {
          email: emailServiceStatus ? 'connected' : 'error',
        },
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    };
  }
};

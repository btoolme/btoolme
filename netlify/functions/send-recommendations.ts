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

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    if (!event.body) {
      throw new Error('Missing request body');
    }

    const { email, name, recommendations } = JSON.parse(event.body);

    // Get access token
    const accessToken = await oauth2Client.getAccessToken();
    
    if (!accessToken.token) {
      throw new Error('Failed to obtain access token');
    }

    // Create transporter
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

    // Send email to recommendations@btoolme.com
    await transporter.sendMail({
      from: `"btoolme Recommendations" <${process.env.EMAIL_FROM}>`,
      to: 'recommendations@btoolme.com',
      subject: 'New User Recommendations Request',
      html: `
        <h2>New User Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        
        <h3>Recommendations:</h3>
        ${recommendations.map((rec, index) => `
          <div style="margin: 20px 0; padding: 20px; border: 1px solid #e5e7eb;">
            <h4>${index + 1}. ${rec.tool.name}</h4>
            <p>${rec.tool.description}</p>
            <p><strong>Category:</strong> ${rec.tool.category}</p>
            <h5>Reasons:</h5>
            <ul>
              ${rec.reasons.map(reason => `<li>${reason}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      `
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Data sent successfully'
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      })
    };
  }
};

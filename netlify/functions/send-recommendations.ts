import { Handler } from '@netlify/functions';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const requestSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  recommendations: z.array(z.object({
    tool: z.object({
      name: z.string(),
      description: z.string(),
      category: z.string(),
      website: z.string().url()
    }),
    reasons: z.array(z.string())
  })).min(1)
});

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

async function createTransporter() {
  try {
    console.log('Creating email transporter...');
    console.log('Using email:', process.env.EMAIL_FROM);
    
    const accessToken = await oauth2Client.getAccessToken();
    console.log('OAuth2 access token obtained');
    
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

    // Verify transporter
    await transporter.verify();
    console.log('Email transporter verified successfully');
    
    return transporter;
  } catch (error) {
    console.error('Error creating email transporter:', error);
    throw error;
  }
}

async function sendEmail(userEmail: string, userName: string, recommendations: any[]) {
  try {
    console.log('Sending email notification...');
    const transporter = await createTransporter();
    
    const toolsList = recommendations
      .map(rec => `- ${rec.tool.name} (${rec.tool.category})`)
      .join('\n');

    const mailOptions = {
      from: `"btoolme Recommendations" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_FROM,
      subject: `New Tool Recommendations Request - ${userName}`,
      text: `
New recommendations request received:

User Details:
- Name: ${userName}
- Email: ${userEmail}

Recommended Tools:
${toolsList}

Please follow up with the user to provide additional assistance.
      `,
      html: `
        <h2>New Recommendations Request</h2>
        
        <h3>User Details:</h3>
        <ul>
          <li><strong>Name:</strong> ${userName}</li>
          <li><strong>Email:</strong> ${userEmail}</li>
        </ul>

        <h3>Recommended Tools:</h3>
        <ul>
          ${recommendations.map(rec => `
            <li>
              <strong>${rec.tool.name}</strong> (${rec.tool.category})
              <br>
              ${rec.tool.description}
            </li>
          `).join('')}
        </ul>

        <p>Please follow up with the user to provide additional assistance.</p>
      `
    };

    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

export const handler: Handler = async (event) => {
  console.log('Received request:', event.httpMethod);
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle CORS preflight
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
      throw new Error('Missing request body');
    }

    console.log('Validating request data...');
    const data = JSON.parse(event.body);
    const result = requestSchema.safeParse(data);
    
    if (!result.success) {
      console.error('Validation error:', result.error.format());
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'Invalid request data',
          details: result.error.format()
        })
      };
    }

    const { email, name, recommendations } = result.data;
    console.log('Processing request for:', { email, name });

    // Send email notification
    await sendEmail(email, name, recommendations);

    console.log('Request processed successfully');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Data received and email sent successfully'
      })
    };

  } catch (error) {
    console.error('Request processing error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

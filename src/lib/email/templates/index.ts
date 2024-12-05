import { format } from 'date-fns';
import type { Recommendation } from '@/types';

export function generateEmailContent(userName: string, recommendations: Recommendation[]): {
  html: string;
  text: string;
} {
  return {
    html: generateHtml(userName, recommendations),
    text: generateText(userName, recommendations)
  };
}

function generateHtml(userName: string, recommendations: Recommendation[]): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #2563eb; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Your Business Tool Recommendations</h1>
      </div>
      
      <div style="padding: 20px;">
        <p style="font-size: 16px; color: #374151;">Hi ${userName},</p>
        
        <p style="font-size: 16px; color: #374151;">Based on your business profile, here are your personalized tool recommendations:</p>
        
        ${recommendations.map((rec, index) => `
          <div style="margin: 20px 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb;">
            <h2 style="color: #1f2937; margin-top: 0; font-size: 20px;">
              ${index + 1}. ${rec.tool.name}
            </h2>
            <p style="color: #4b5563; font-size: 16px;">${rec.tool.description}</p>
            <div style="margin: 15px 0;">
              <span style="background-color: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 9999px; font-size: 14px;">
                ${rec.tool.category}
              </span>
            </div>
            <ul style="padding-left: 20px;">
              ${rec.reasons.map(reason => `
                <li style="color: #4b5563; margin: 5px 0;">${reason}</li>
              `).join('')}
            </ul>
            <a href="${rec.tool.website}" 
               style="display: inline-block; padding: 8px 16px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 4px; margin-top: 10px;">
              Learn More
            </a>
          </div>
        `).join('')}
        
        <p style="margin-top: 30px; font-size: 16px; color: #374151;">
          Need help implementing these tools? Reply to this email and our team will be happy to assist you.
        </p>
      </div>
      
      <div style="margin-top: 40px; padding: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #6b7280; font-size: 14px;">
          Sent on ${format(new Date(), 'MMMM do, yyyy')} by btoolme
        </p>
      </div>
    </div>
  `;
}

function generateText(userName: string, recommendations: Recommendation[]): string {
  return `
Your Business Tool Recommendations

Hi ${userName},

Based on your business profile, here are your personalized tool recommendations:

${recommendations.map((rec, index) => `
${index + 1}. ${rec.tool.name}
${rec.tool.description}
Category: ${rec.tool.category}

Key Benefits:
${rec.reasons.map(reason => `- ${reason}`).join('\n')}

Learn more: ${rec.tool.website}
`).join('\n')}

Need help implementing these tools? Reply to this email and our team will be happy to assist you.

Sent on ${format(new Date(), 'MMMM do, yyyy')} by btoolme
`;
}

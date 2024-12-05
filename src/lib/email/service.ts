import { EmailConfig } from './types';
import { createTransporter } from './transporter';
import { generateEmailContent } from './templates';
import { validateEmailConfig } from './validation';
import { AppError } from '@/lib/errors';
import type { Recommendation } from '@/types';

export class EmailService {
  private config: EmailConfig;
  private transporter: any = null;

  constructor(config: EmailConfig) {
    validateEmailConfig(config);
    this.config = config;
  }

  async verifyConnection(): Promise<void> {
    try {
      const transporter = await createTransporter(this.config);
      await transporter.verify();
    } catch (error) {
      console.error('Connection verification error:', error);
      this.transporter = null;
      throw AppError.EmailError(
        'Failed to verify email connection',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  async sendRecommendations(
    email: string,
    name: string,
    recommendations: Recommendation[]
  ): Promise<void> {
    if (!email || !name || !recommendations?.length) {
      throw AppError.ValidationError('Missing required email parameters');
    }

    try {
      const transporter = await createTransporter(this.config);
      const { html, text } = generateEmailContent(name, recommendations);
      
      const info = await transporter.sendMail({
        from: `"btoolme Recommendations" <${this.config.user}>`,
        to: email,
        subject: 'Your Personalized Business Tool Recommendations',
        html,
        text
      });

      if (!info.messageId) {
        throw new Error('No message ID returned');
      }

      console.log('Email sent successfully:', info.messageId);
    } catch (error) {
      console.error('Email sending error:', error);
      this.transporter = null;
      throw AppError.EmailError(
        'Failed to send email',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }
}

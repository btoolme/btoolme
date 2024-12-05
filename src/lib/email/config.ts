import { z } from 'zod';

export const emailConfigSchema = z.object({
  clientId: z.string()
    .includes('.apps.googleusercontent.com', { message: 'Invalid Google client ID format' }),
  clientSecret: z.string().min(1, 'Client secret is required'),
  refreshToken: z.string().min(1, 'Refresh token is required'),
  user: z.string().email('Invalid email address')
});

export type EmailConfig = z.infer<typeof emailConfigSchema>;

export function validateEmailConfig(config: EmailConfig): void {
  const result = emailConfigSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Invalid email configuration: ${result.error.message}`);
  }
}

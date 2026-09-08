export interface UserProfile {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  creditsRemaining: number;
}

export const CURRENT_USER: UserProfile = {
  id: 'usr_beta_001',
  email: 'founder@dramaflow.ai',
  name: 'Beta Pioneer',
  plan: 'pro',
  creditsRemaining: 48,
};

export function getSessionUser(): UserProfile {
  return CURRENT_USER;
}

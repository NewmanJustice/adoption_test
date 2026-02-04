import { UserRole } from '../types/auth.js';

/**
 * All valid user roles in the system
 */
export const VALID_ROLES: UserRole[] = [
  'HMCTS_CASE_OFFICER',
  'JUDGE_LEGAL_ADVISER',
  'CAFCASS_OFFICER',
  'LA_SOCIAL_WORKER',
  'VAA_WORKER',
  'ADOPTER',
];

/**
 * Role to redirect URL mapping after successful login
 */
export const ROLE_REDIRECTS: Record<UserRole, string> = {
  HMCTS_CASE_OFFICER: '/dashboard',
  JUDGE_LEGAL_ADVISER: '/dashboard',
  CAFCASS_OFFICER: '/dashboard',
  LA_SOCIAL_WORKER: '/dashboard',
  VAA_WORKER: '/dashboard',
  ADOPTER: '/my-cases',
};

/**
 * Check if a string is a valid user role
 */
export function isValidRole(role: string): role is UserRole {
  return VALID_ROLES.includes(role as UserRole);
}

/**
 * Get redirect URL for a role
 */
export function getRedirectForRole(role: UserRole): string {
  return ROLE_REDIRECTS[role] || '/dashboard';
}

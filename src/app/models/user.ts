export type UserRole = 'admin' | 'supervisor' | 'surveyor';

export interface UserProfile {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  role: UserRole;
  phcId?: string; // for supervisors
  supervisorId?: string; // for surveyors
}

export interface AuthenticatedUser extends UserProfile {
  password: string;
}

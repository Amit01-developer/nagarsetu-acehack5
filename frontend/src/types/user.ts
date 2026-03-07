export interface User {
  _id: string;
  email: string;
  isEmailVerified: boolean;
  emailVerifiedAt?: string;
  role: 'citizen' | 'municipality' | 'contractor';
  profile: {
    name: string;
    phone?: string;
    avatar?: string;
  };
  citizen?: {
    totalPoints: number;
  };
  municipality?: {
    jurisdiction?: string;
    department?: string;
  };
  contractor?: {
    company?: string;
    licenseNumber?: string;
    specialization?: string[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

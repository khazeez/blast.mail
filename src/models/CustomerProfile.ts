export interface CustomerProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  segment?: string;
  consent?: boolean;
  unsubscribed?: boolean;
  createdAt: string; // ISO timestamp
  updatedAt?: string;
  customFields?: Record<string, any>;
}

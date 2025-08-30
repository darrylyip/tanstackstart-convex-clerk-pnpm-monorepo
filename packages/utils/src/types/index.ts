// Core types for multi-tenant application
export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'member' | 'viewer';

// Schedule-related types
export interface Schedule {
  id: string;
  title: string;
  description?: string;
  organizationId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  status: ScheduleStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ScheduleStatus = 'draft' | 'active' | 'completed' | 'cancelled';

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
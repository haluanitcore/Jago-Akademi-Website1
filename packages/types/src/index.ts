export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description?: string;
  price: number;
  salePrice?: number;
  status: 'draft' | 'published';
  trainerId: string;
  categoryId?: string;
  level?: string;
  thumbnailUrl?: string;
  totalDuration: number;
  totalLessons: number;
  avgRating: number;
  createdAt: string;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  description?: string;
  type: 'webinar' | 'workshop' | 'conference' | 'bootcamp';
  startAt: string;
  endAt: string;
  location?: string;
  maxParticipants?: number;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  organizerId: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface EBook {
  id: string;
  slug: string;
  title: string;
  description?: string;
  price: number;
  authorId: string;
  fileUrl?: string;
  coverUrl?: string;
  pages?: number;
  publishedAt?: string;
}

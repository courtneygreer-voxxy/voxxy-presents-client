// Bulletin Types for Voxxy Presents

export type BulletinType = 'announcement' | 'update' | 'reminder';

export interface BulletinAuthor {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Bulletin {
  id: number;
  event_id: number;
  subject: string;
  body: string;
  bulletin_type: BulletinType;
  pinned: boolean;
  view_count: number;
  read_count: number;
  read_by_current_user: boolean;
  author: BulletinAuthor;
  created_at: string;
  updated_at: string;
}

export interface CreateBulletinRequest {
  subject: string;
  body: string;
  bulletin_type?: BulletinType;
  pinned?: boolean;
}

export interface UpdateBulletinRequest {
  subject?: string;
  body?: string;
  bulletin_type?: BulletinType;
  pinned?: boolean;
}

export interface BulletinsResponse {
  bulletins: Bulletin[];
}

export interface BulletinResponse {
  bulletin: Bulletin;
}

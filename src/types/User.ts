export type User = {
  created_at: string;
  updated_at: string;
  synced?: boolean;
  cache: object | null;
  id: number;
  email: string;
  password_hash: string;
  avatar_url: string;
  roles: string[] | null;
  scopes: string[] | null;
  banned?: boolean;
  metadata: { name: string; [key: string]: unknown };
};
export type UserNotification = {
  created_at: string;
  id: number;
  is_read: boolean;
  message: string;
  synced: boolean;
  updated_at: string;
  user_id: number;
};

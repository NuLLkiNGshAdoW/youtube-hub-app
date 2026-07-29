export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  provider: string | null;
  role: 'viewer' | 'member' | 'patron' | 'moderator' | 'admin';
  points: number;
  level: number;
  last_login_at: string | null;
  created_at: string;
};

export type Achievement = {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  condition: Record<string, any>;
  is_secret: boolean;
};

export type UserAchievement = {
  user_id: string;
  achievement_id: number;
  unlocked_at: string;
  achievements?: Achievement;
};

export type FanArt = {
  id: string;
  user_id: string;
  title: string;
  file_path: string;
  status: 'pending' | 'approved' | 'rejected';
  votes_count: number;
  created_at: string;
  profiles?: Partial<Profile>;
};

export type Question = {
  id: number;
  user_id: string;
  body: string;
  status: 'pending' | 'approved' | 'answered' | 'rejected';
  upvotes: number;
  created_at: string;
  profiles?: Partial<Profile>;
};

export type BackstagePost = {
  id: number;
  title: string;
  body: string | null;
  video_url: string | null;
  min_role: 'member' | 'patron';
  published_at: string;
};

export type Event = {
  id: number;
  title: string;
  description: string | null;
  type: 'stream' | 'release' | 'community';
  starts_at: string;
  is_featured: boolean;
};
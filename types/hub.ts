import type { LucideIcon } from "lucide-react";

export type UserProfile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  provider: string | null;
  role: "viewer" | "member" | "patron" | "moderator" | "admin";
  points: number;
  level: number;
  last_login_at: string | null;
  created_at: string;
};

export type LeaderboardEntry = {
  id: string;
  username: string;
  avatar_url: string | null;
  points: number;
  level: number;
};

export type PulseItem = {
  id: string;
  type: "level_up" | "fan_art" | "join" | "comment";
  text: string;
  avatar_url: string;
  time: string;
};

export type RoadmapItem = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  progress: number;
  color: string;
};

export type MapDot = {
  id: string;
  x: number;
  y: number;
  delay: number;
};

export type StatusOption = {
  label: string;
  icon: LucideIcon;
  color: string;
};

export type YouTubeVideo = {
  id: string;
  title: string;
  thumbnail: string;
  published_at: string;
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  type: "new_video" | "stream_start" | "ama_reply" | "achievement" | string;
  read: boolean;
  user_id: string | null;
  created_at: string;
  link?: string;
};

export type PollOption = {
  id: string;
  text: string;
  votes: number;
};

export type Poll = {
  id: string;
  question: string;
  options: PollOption[];
  voted_option_id: string | null;
};

export type ScheduledStream = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
};

export type StreakInfo = {
  current_streak: number;
  max_streak: number;
  last_visit: string | null;
  claimed_today: boolean;
};

export type WeeklyChallenge = {
  id: string;
  title: string;
  description: string;
  ends_at: string;
  is_active: boolean;
};


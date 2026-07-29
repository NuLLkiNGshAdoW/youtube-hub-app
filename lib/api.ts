import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { 
  Profile, 
  Achievement, 
  FanArt, 
  Question, 
  BackstagePost, 
  Event 
} from '../types/database';

// --------------------------------------------------------------------
// AUTH & PROFILES
// --------------------------------------------------------------------

/** Вход через OAuth (Google или Discord) */
export async function signInWithOAuth(provider: 'google' | 'discord') {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(`Ошибка входа через ${provider}:`, error.message);
  }

  return { data, error };
}

/** Выход из системы */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Ошибка выхода:', error.message);
}

/** Получить текущего сессионного пользователя */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Ошибка получения сессии пользователя:', error.message);
    return null;
  }
  return user;
}

/** Получить данные профиля текущего пользователя */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Ошибка получения профиля:', error.message);
    return null;
  }
  return data;
}

// --------------------------------------------------------------------
// POINTS & GAMIFICATION
// --------------------------------------------------------------------

/**
 * Начисляет очки активности в points_log.
 * Триггер в БД автоматически пересчитает points и level в profiles.
 */
export async function logUserActivity(
  userId: string, 
  action: string, 
  points: number
): Promise<boolean> {
  const { error } = await supabase.from('points_log').insert({
    user_id: userId,
    action,
    points,
  });

  if (error) {
    console.error('Ошибка при начислении очков:', error.message);
    return false;
  }
  return true;
}

export interface UserAchievementItem extends Achievement {
  isUnlocked: boolean;
}

/** Получить список всех ачивок с отметкой, разблокированы ли они у пользователя */
export async function getUserAchievements(userId: string): Promise<UserAchievementItem[]> {
  const { data: allAchievements, error: achError } = await supabase
    .from('achievements')
    .select('*');

  if (achError) {
    console.error('Ошибка загрузки достижений:', achError.message);
    return [];
  }

  const { data: unlocked, error: unlockedError } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  if (unlockedError) {
    console.error('Ошибка загрузки разблокированных достижений:', unlockedError.message);
  }

  const unlockedIds = new Set(unlocked?.map((u) => u.achievement_id) || []);

  return (allAchievements || []).map((ach: Achievement) => ({
    ...ach,
    isUnlocked: unlockedIds.has(ach.id),
  }));
}

// --------------------------------------------------------------------
// FAN ART GALLERY
// --------------------------------------------------------------------

/** Получить список одобренных фан-артов */
export async function getApprovedFanArts(): Promise<FanArt[]> {
  const { data, error } = await supabase
    .from('fan_arts')
    .select('*, profiles!fan_arts_user_id_fkey(username, display_name, avatar_url)')
    // .eq('status', 'approved') // Раскомментируйте после включения модерации
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Ошибка загрузки фан-артов:', error.message);
    return [];
  }
  return data || [];
}

/** Загрузить новый фан-арт */
export async function createFanArt(
  userId: string, 
  title: string, 
  filePath: string
): Promise<FanArt | null> {
  const { data, error } = await supabase
    .from('fan_arts')
    .insert({
      user_id: userId,
      title,
      file_path: filePath,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Ошибка создания фан-арта:', error.message);
    return null;
  }

  // Начисляем +50 XP за публикацию арта
  await logUserActivity(userId, 'fanart_upload', 50);

  return data;
}

/** Проголосовать за фан-арт */
export async function voteForFanArt(userId: string, fanArtId: string): Promise<boolean> {
  const { error: voteError } = await supabase
    .from('fan_art_votes')
    .insert({
      user_id: userId,
      fan_art_id: fanArtId,
    });

  if (voteError) {
    console.error('Ошибка при голосовании за фан-арт:', voteError.message);
    return false;
  }

  // Обновляем счетчик голосов через RPC-функцию в Supabase
  const { error: rpcError } = await supabase.rpc('increment_fanart_votes', { art_id: fanArtId });
  if (rpcError) {
    console.error('Ошибка инкремента голосов:', rpcError.message);
  }

  await logUserActivity(userId, 'fanart_like', 5);

  return true;
}

// --------------------------------------------------------------------
// AMA (QUESTIONS)
// --------------------------------------------------------------------

/** Получить список одобренных и отвеченных вопросов */
export async function getQuestions(): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*, profiles!questions_user_id_fkey(username, display_name, avatar_url)')
    .in('status', ['approved', 'answered'])
    .order('upvotes', { ascending: false });

  if (error) {
    console.error('Ошибка при загрузке вопросов:', error.message);
    return [];
  }
  return data || [];
}

/** Отправить вопрос в AMA */
export async function askQuestion(userId: string, body: string): Promise<Question | null> {
  const { data, error } = await supabase
    .from('questions')
    .insert({
      user_id: userId,
      body,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Ошибка отправки вопроса:', error.message);
    return null;
  }

  await logUserActivity(userId, 'comment', 10);
  return data;
}

// --------------------------------------------------------------------
// EVENTS & BACKSTAGE
// --------------------------------------------------------------------

/** Получить ближайшее главное событие для обратного отсчета */
export async function getFeaturedEvent(): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_featured', true)
    .gt('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Ошибка загрузки главной трансляции/события:', error.message);
    return null;
  }
  return data;
}

/** Получить посты из секции "За кулисами" */
export async function getBackstagePosts(): Promise<BackstagePost[]> {
  const { data, error } = await supabase
    .from('backstage_posts')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Ошибка загрузки бэкстейджа:', error.message);
    return [];
  }
  return data || [];
}
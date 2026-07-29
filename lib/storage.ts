
import { supabase } from "@/lib/supabase/client";

/**
 * Загружает изображение фан-арта в бакет 'fan-arts'
 */
export async function uploadFanArtFile(userId: string, file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('fan-arts') // <-- Указали 'fan-arts' с дефисом
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Ошибка загрузки файла в Storage:', error);
    return null;
  }

  return data.path;
}

/**
 * Получает публичную URL-ссылку на загруженный фан-арт
 */
export function getFanArtPublicUrl(filePath: string): string {
  const { data } = supabase.storage.from('fan-arts').getPublicUrl(filePath); // <-- Указали 'fan-arts' с дефисом
  return data.publicUrl;
}
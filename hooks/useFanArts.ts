"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase/client";

export interface FanArtProfile {
  id: string;
  username: string;
  avatar_url?: string;
}

export interface FanArt {
  id: string;
  title: string;
  file_path: string;
  status: "pending" | "approved" | "rejected";
  votes_count: number;
  created_at: string;
  user_id: string;
  is_featured?: boolean;
  profiles?: FanArtProfile;
  user_has_voted?: boolean;
}

export type GalleryTab = "new" | "popular" | "mine" | "moderation";

export function useFanArts() {
  const { user } = useUser();

  const [artList, setArtList] = useState<FanArt[]>([]);
  const [myVoteIds, setMyVoteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [moderatingId, setModeratingId] = useState<string | null>(null);

  const [tab, setTab] = useState<GalleryTab>("new");
  const [searchQuery, setSearchQuery] = useState("");

  // --- роль админа ---
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setIsAdmin(data?.role === "admin"));
  }, [user]);

  const getImageUrl = useCallback((filePath: string) => {
    if (!filePath) return "";
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) return filePath;
    const { data } = supabase.storage.from("fan-arts").getPublicUrl(filePath);
    return data.publicUrl;
  }, []);

  // --- загрузка списка работ + голосов текущего юзера ---
  const fetchGallery = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("fan_arts")
        .select("*, profiles!fan_arts_user_id_fkey(id, username, avatar_url)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArtList((data as FanArt[]) || []);

      if (user) {
        const { data: votes } = await supabase
          .from("fan_art_votes")
          .select("fan_art_id")
          .eq("user_id", user.id);
        setMyVoteIds(new Set((votes || []).map((v) => v.fan_art_id)));
      } else {
        setMyVoteIds(new Set());
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Ошибка при получении фан-артов:", error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGallery();

    const channel = supabase
      .channel("fan_arts_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "fan_arts" }, () => fetchGallery())
      .on("postgres_changes", { event: "*", schema: "public", table: "fan_art_votes" }, () => fetchGallery())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchGallery]);

  // --- загрузка новой работы ---
  const uploadArt = async (title: string, file: File): Promise<{ error?: string }> => {
    if (!file || !title.trim()) return { error: "Заполните название и выберите файл" };

    setUploading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) return { error: "Необходимо войти в аккаунт" };

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userData.user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("fan-arts").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from("fan_arts").insert([
        {
          title: title.trim(),
          file_path: filePath,
          user_id: userData.user.id,
          status: "pending", // уходит на модерацию
        },
      ]);
      if (dbError) throw dbError;

      await fetchGallery();
      return {};
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Ошибка при загрузке:", error.message);
      return { error: error.message };
    } finally {
      setUploading(false);
    }
  };

  const toggleVote = async (artId: string) => {
  if (!user || votingId === artId) return;
  setVotingId(artId);

  const alreadyVoted = myVoteIds.has(artId);

  // оптимистично блокируем повторный клик визуально, не дожидаясь ответа сервера
  setMyVoteIds((prev) => {
    const next = new Set(prev);
    if (alreadyVoted) next.delete(artId);
    else next.add(artId);
    return next;
  });

  try {
    if (alreadyVoted) {
      const { error } = await supabase
        .from("fan_art_votes")
        .delete()
        .eq("user_id", user.id)
        .eq("fan_art_id", artId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("fan_art_votes")
        .insert([{ user_id: user.id, fan_art_id: artId }]);
      // 23505 — голос уже существует (двойной клик/гонка), это не ошибка,
      // просто игнорируем и подтягиваем реальное состояние из базы
      if (error && error.code !== "23505") throw error;
    }
    await fetchGallery(); // votes_count теперь считает триггер — просто синхронизируемся
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Ошибка голосования:", error.message);
    // откатываем оптимистичное обновление, если это была настоящая ошибка
    setMyVoteIds((prev) => {
      const next = new Set(prev);
      if (alreadyVoted) next.add(artId);
      else next.delete(artId);
      return next;
    });
  } finally {
    setVotingId(null);
  }
};

  // --- модерация: одобрить / отклонить ---
  const moderateArt = async (artId: string, status: "approved" | "rejected") => {
    if (!isAdmin || moderatingId === artId) return;
    setModeratingId(artId);
    const { error } = await supabase.from("fan_arts").update({ status }).eq("id", artId);
    if (error) console.error("Ошибка модерации:", error.message);
    await fetchGallery();
    setModeratingId(null);
  };

  // --- выбор редакции ---
  const toggleFeatured = async (art: FanArt) => {
    if (!isAdmin) return;
    const { error } = await supabase
      .from("fan_arts")
      .update({ is_featured: !art.is_featured })
      .eq("id", art.id);
    if (error) console.error("Ошибка выбора редакции:", error.message);
    await fetchGallery();
  };

  // --- видимый список (не считая модерации, которую видит только админ) ---
  const visibleArtList = useMemo(() => {
    if (isAdmin && tab === "moderation") {
      return artList.filter((a) => a.status === "pending");
    }
    // все остальные вкладки — только одобренные работы
    let list = artList.filter((a) => a.status === "approved");

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.profiles?.username || "").toLowerCase().includes(q)
      );
    }

    if (tab === "popular") {
      list = [...list].sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0));
    } else if (tab === "mine") {
      list = user ? artList.filter((a) => a.user_id === user.id) : [];
    } else {
      // new
      list = [...list].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return list;
  }, [artList, tab, searchQuery, isAdmin, user]);

  const withVoteFlag = visibleArtList.map((a) => ({ ...a, user_has_voted: myVoteIds.has(a.id) }));
  const pendingCount = artList.filter((a) => a.status === "pending").length;

  return {
    artList: withVoteFlag,
    loading,
    isAdmin,
    uploading,
    votingId,
    moderatingId,
    tab,
    setTab,
    searchQuery,
    setSearchQuery,
    pendingCount,
    getImageUrl,
    uploadArt,
    toggleVote,
    moderateArt,
    toggleFeatured,
  };
}
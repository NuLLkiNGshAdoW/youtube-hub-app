"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Plus, Trash2, Pencil, X, Check, Lock } from "lucide-react";

interface PostRow {
  id: number;
  title: string;
  body: string | null;
  video_url: string | null;
  min_role: string;
  published_at: string;
}

const empty = {
  title: "",
  body: "",
  video_url: "",
  min_role: "member",
};

export default function AdminBackstagePage() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [draft, setDraft] = useState(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("backstage_posts")
      .select("*")
      .order("published_at", { ascending: false });
    setPosts((data as PostRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setDraft(empty);
    setEditingId(null);
  };

  const startEdit = (post: PostRow) => {
    setEditingId(post.id);
    setDraft({
      title: post.title,
      body: post.body || "",
      video_url: post.video_url || "",
      min_role: post.min_role,
    });
  };

  const save = async () => {
    if (!draft.title.trim()) return;

    const payload = {
      title: draft.title.trim(),
      body: draft.body.trim() || null,
      video_url: draft.video_url.trim() || null,
      min_role: draft.min_role,
    };

    if (editingId) {
      await supabase.from("backstage_posts").update(payload).eq("id", editingId);
    } else {
      await supabase.from("backstage_posts").insert([payload]);
    }

    resetForm();
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("Удалить пост безвозвратно?")) return;
    await supabase.from("backstage_posts").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Lock className="w-6 h-6 text-[#F59E0B]" /> За кулисами
      </h1>

      <div className="rounded-xl border border-white/10 bg-[#14171F] p-4 mb-6 space-y-3">
        <h2 className="text-sm font-semibold text-[#8B93A7]">
          {editingId ? `Редактирование поста #${editingId}` : "Новый пост"}
        </h2>

        <input
          placeholder="Заголовок"
          className="w-full bg-[#0B0D12] border border-white/10 rounded-lg px-3 py-2 text-sm"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
        <textarea
          placeholder="Текст поста"
          rows={3}
          className="w-full bg-[#0B0D12] border border-white/10 rounded-lg px-3 py-2 text-sm resize-none"
          value={draft.body}
          onChange={(e) => setDraft({ ...draft, body: e.target.value })}
        />
        <input
          placeholder="URL видео (embed-ссылка, необязательно)"
          className="w-full bg-[#0B0D12] border border-white/10 rounded-lg px-3 py-2 text-sm"
          value={draft.video_url}
          onChange={(e) => setDraft({ ...draft, video_url: e.target.value })}
        />
        <select
          className="bg-[#0B0D12] border border-white/10 rounded-lg px-3 py-2 text-sm"
          value={draft.min_role}
          onChange={(e) => setDraft({ ...draft, min_role: e.target.value })}
        >
          <option value="viewer">viewer — все</option>
          <option value="member">member</option>
          <option value="vip">vip</option>
          <option value="admin">admin</option>
        </select>

        <div className="flex gap-2">
          <button
            onClick={save}
            className="flex items-center gap-2 bg-[#F59E0B] text-black rounded-lg px-4 py-2 text-sm font-semibold"
          >
            {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editingId ? "Сохранить" : "Опубликовать"}
          </button>
          {editingId && (
            <button onClick={resetForm} className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2 text-sm">
              <X className="w-4 h-4" /> Отмена
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-[#8B93A7]">Загрузка...</p>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div key={post.id} className="flex justify-between items-start rounded-lg border border-white/10 bg-[#14171F] p-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#F59E0B]">{post.min_role}</span>
                <p className="text-sm font-semibold mt-1">{post.title}</p>
                {post.body && <p className="text-xs text-[#8B93A7] mt-1 line-clamp-2">{post.body}</p>}
              </div>
              <div className="flex gap-3 shrink-0 ml-4">
                <button onClick={() => startEdit(post)} title="Редактировать">
                  <Pencil className="w-4 h-4 text-[#3B82F6]" />
                </button>
                <button onClick={() => remove(post.id)} title="Удалить">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
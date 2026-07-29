"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Trash2, Check, X, Image as ImageIcon } from "lucide-react";

interface FanArtRow {
  id: string;
  title: string;
  file_path: string;
  status: string;
  votes_count: number;
  created_at: string;
  user_id: string;
  profiles?: { username: string };
}

const STATUS_TABS = [
  { id: "all", label: "Все" },
  { id: "pending", label: "На модерации" },
  { id: "approved", label: "Одобрено" },
  { id: "rejected", label: "Отклонено" },
];

export default function AdminFanArtsPage() {
  const [items, setItems] = useState<FanArtRow[]>([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("fan_arts")
      .select("*, profiles!fan_arts_user_id_fkey(username)")
      .order("created_at", { ascending: false });
    setItems((data as FanArtRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const getImageUrl = (filePath: string) => {
    if (!filePath) return "";
    if (filePath.startsWith("http")) return filePath;
    const { data } = supabase.storage.from("fan-arts").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const setStatus = async (id: string, status: string) => {
    await supabase.from("fan_arts").update({ status }).eq("id", id);
    load();
  };

  const remove = async (id: string, filePath: string) => {
    if (!confirm("Удалить фан-арт и файл безвозвратно?")) return;
    await supabase.storage.from("fan-arts").remove([filePath]);
    await supabase.from("fan_arts").delete().eq("id", id);
    load();
  };

  const filtered = items.filter((it) => filter === "all" || it.status === filter);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ImageIcon className="w-6 h-6 text-[#7C5CFF]" /> Модерация фан-артов
      </h1>

      <div className="flex gap-2 mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === tab.id ? "bg-[#7C5CFF] text-white" : "bg-white/5 text-[#8B93A7] hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-[#8B93A7]">Загрузка...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[#8B93A7]">Нет работ в этой категории.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((art) => (
            <div key={art.id} className="rounded-xl border border-white/10 bg-[#14171F] overflow-hidden">
              <div className="aspect-square bg-black/40">
                <img
                  src={getImageUrl(art.file_path)}
                  alt={art.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/300x300/161922/FFF?text=Ошибка";
                  }}
                />
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold truncate">{art.title}</p>
                <p className="text-xs text-[#8B93A7] mb-2">
                  {art.profiles?.username || "Аноним"} · {art.votes_count} голосов
                </p>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded inline-block mb-2 ${
                    art.status === "approved"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : art.status === "rejected"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {art.status}
                </span>
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <button onClick={() => setStatus(art.id, "approved")} title="Одобрить">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </button>
                  <button onClick={() => setStatus(art.id, "rejected")} title="Отклонить">
                    <X className="w-4 h-4 text-amber-400" />
                  </button>
                  <button onClick={() => remove(art.id, art.file_path)} title="Удалить">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
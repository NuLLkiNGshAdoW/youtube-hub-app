// app/admin/hotbar/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Trash2, Plus } from "lucide-react";

interface Rec {
  id: number;
  category: string;
  title: string;
  description?: string;
  url?: string;
  image_url?: string;
  sort_order: number;
}

const empty: Omit<Rec, "id"> = {
  category: "",
  title: "",
  description: "",
  url: "",
  image_url: "",
  sort_order: 0,
};

export default function HotbarAdminPage() {
  const [items, setItems] = useState<Rec[]>([]);
  const [draft, setDraft] = useState(empty);

  const load = async () => {
    const { data } = await supabase.from("recommendations").select("*").order("sort_order");
    setItems((data as Rec[]) || []);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!draft.title.trim()) return;
    await supabase.from("recommendations").insert([draft]);
    setDraft(empty);
    load();
  };

  const remove = async (id: number) => {
    await supabase.from("recommendations").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Карточки / хотбары</h1>

      <div className="rounded-xl border border-white/10 bg-[#14171F] p-4 mb-6 grid grid-cols-2 gap-3">
        <input placeholder="Категория" className="bg-[#0B0D12] border border-white/10 rounded-lg px-3 py-2 text-sm"
          value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
        <input placeholder="Заголовок" className="bg-[#0B0D12] border border-white/10 rounded-lg px-3 py-2 text-sm"
          value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        <input placeholder="Описание" className="bg-[#0B0D12] border border-white/10 rounded-lg px-3 py-2 text-sm col-span-2"
          value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        <input placeholder="URL картинки" className="bg-[#0B0D12] border border-white/10 rounded-lg px-3 py-2 text-sm"
          value={draft.image_url} onChange={(e) => setDraft({ ...draft, image_url: e.target.value })} />
        <input placeholder="Ссылка" className="bg-[#0B0D12] border border-white/10 rounded-lg px-3 py-2 text-sm"
          value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} />
        <button onClick={add} className="col-span-2 flex items-center justify-center gap-2 bg-[#3B82F6] rounded-lg py-2 text-sm font-semibold">
          <Plus className="w-4 h-4" /> Добавить карточку
        </button>
      </div>

      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="flex justify-between items-center rounded-lg border border-white/10 bg-[#14171F] p-3">
            <div>
              <p className="text-xs text-[#3B82F6]">{it.category}</p>
              <p className="text-sm font-semibold">{it.title}</p>
            </div>
            <button onClick={() => remove(it.id)}>
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Plus, Trash2, Pencil, X, Check, Star, Calendar } from "lucide-react";

interface EventRow {
  id: number;
  title: string;
  description: string | null;
  type: string;
  starts_at: string;
  is_featured: boolean;
  is_active: boolean;
}

const empty = {
  title: "",
  description: "",
  type: "stream",
  starts_at: "",
  is_featured: false,
  is_active: true,
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [draft, setDraft] = useState(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("starts_at", { ascending: true });
    setEvents((data as EventRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setDraft(empty);
    setEditingId(null);
  };

  const startEdit = (ev: EventRow) => {
    setEditingId(ev.id);
    setDraft({
      title: ev.title,
      description: ev.description || "",
      type: ev.type,
      // datetime-local ожидает формат YYYY-MM-DDTHH:mm
      starts_at: ev.starts_at ? ev.starts_at.slice(0, 16) : "",
      is_featured: ev.is_featured,
      is_active: ev.is_active,
    });
  };

  const save = async () => {
    if (!draft.title.trim() || !draft.starts_at) return;

    const payload = {
      title: draft.title.trim(),
      description: draft.description.trim() || null,
      type: draft.type,
      starts_at: new Date(draft.starts_at).toISOString(),
      is_featured: draft.is_featured,
      is_active: draft.is_active,
    };

    if (editingId) {
      await supabase.from("events").update(payload).eq("id", editingId);
    } else {
      await supabase.from("events").insert([payload]);
    }

    resetForm();
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("Удалить событие безвозвратно?")) return;
    await supabase.from("events").delete().eq("id", id);
    load();
  };

  const toggleActive = async (ev: EventRow) => {
    await supabase.from("events").update({ is_active: !ev.is_active }).eq("id", ev.id);
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="w-6 h-6 text-[#10B981]" /> События
      </h1>

      {/* Форма создания/редактирования */}
      <div className="rounded-xl border border-white/10 bg-[#14171F] p-4 mb-6 space-y-3">
        <h2 className="text-sm font-semibold text-[#8B93A7]">
          {editingId ? `Редактирование события #${editingId}` : "Новое событие"}
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Заголовок"
            className="bg-[#0B0D12] border border-white/10 rounded-lg px-3 py-2 text-sm col-span-2"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
          <textarea
            placeholder="Описание"
            className="bg-[#0B0D12] border border-white/10 rounded-lg px-3 py-2 text-sm col-span-2 resize-none"
            rows={2}
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />
          <select
            className="bg-[#0B0D12] border border-white/10 rounded-lg px-3 py-2 text-sm"
            value={draft.type}
            onChange={(e) => setDraft({ ...draft, type: e.target.value })}
          >
            <option value="stream">Стрим</option>
            <option value="tournament">Турнир</option>
            <option value="gaming">Совместная игра</option>
            <option value="other">Другое</option>
          </select>
          <input
            type="datetime-local"
            className="bg-[#0B0D12] border border-white/10 rounded-lg px-3 py-2 text-sm"
            value={draft.starts_at}
            onChange={(e) => setDraft({ ...draft, starts_at: e.target.value })}
          />

          <label className="flex items-center gap-2 text-xs text-[#8B93A7]">
            <input
              type="checkbox"
              checked={draft.is_featured}
              onChange={(e) => setDraft({ ...draft, is_featured: e.target.checked })}
            />
            Featured (выделить событие)
          </label>
          <label className="flex items-center gap-2 text-xs text-[#8B93A7]">
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
            />
            Активно (показывать на сайте)
          </label>
        </div>

        <div className="flex gap-2">
          <button
            onClick={save}
            className="flex items-center gap-2 bg-[#10B981] text-black rounded-lg px-4 py-2 text-sm font-semibold"
          >
            {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editingId ? "Сохранить изменения" : "Добавить событие"}
          </button>
          {editingId && (
            <button
              onClick={resetForm}
              className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2 text-sm"
            >
              <X className="w-4 h-4" /> Отмена
            </button>
          )}
        </div>
      </div>

      {/* Список событий */}
      {loading ? (
        <p className="text-sm text-[#8B93A7]">Загрузка...</p>
      ) : (
        <div className="space-y-2">
          {events.map((ev) => (
            <div
              key={ev.id}
              className={`flex justify-between items-center rounded-lg border p-4 ${
                ev.is_active ? "border-white/10 bg-[#14171F]" : "border-white/5 bg-[#14171F]/40 opacity-60"
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase text-[#10B981]">{ev.type}</span>
                  {ev.is_featured && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                  {!ev.is_active && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-[#8B93A7]">неактивно</span>
                  )}
                </div>
                <p className="text-sm font-semibold">{ev.title}</p>
                <p className="text-xs text-[#8B93A7] mt-0.5">
                  {new Date(ev.starts_at).toLocaleString("ru-RU", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button onClick={() => toggleActive(ev)} title={ev.is_active ? "Скрыть" : "Показать"}>
                  <Check className={`w-4 h-4 ${ev.is_active ? "text-emerald-400" : "text-[#8B93A7]"}`} />
                </button>
                <button onClick={() => startEdit(ev)} title="Редактировать">
                  <Pencil className="w-4 h-4 text-[#3B82F6]" />
                </button>
                <button onClick={() => remove(ev.id)} title="Удалить">
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
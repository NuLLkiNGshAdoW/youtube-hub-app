// app/admin/questions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Trash2, Send, Check, X } from "lucide-react";

interface QuestionRow {
  id: number;
  body: string;
  status: string;
  upvotes: number;
  created_at: string;
  profiles?: { username: string };
  question_answers?: { id: number; body: string }[];
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [answerDrafts, setAnswerDrafts] = useState<Record<number, string>>({});
  const [timestampDrafts, setTimestampDrafts] = useState<Record<number, string>>({});

  const load = async () => {
    const { data } = await supabase
      .from("questions")
      .select("*, profiles(username), question_answers(*)")
      .order("created_at", { ascending: false });
    setQuestions((data as QuestionRow[]) || []);
  };

  useEffect(() => {
    load();

    // realtime: сразу видеть новые вопросы в модерации
    const channel = supabase
      .channel("admin-questions")
      .on("postgres_changes", { event: "*", schema: "public", table: "questions" }, load)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const setStatus = async (id: number, status: string) => {
    await supabase.from("questions").update({ status }).eq("id", id);
    load();
  };

  const deleteQuestion = async (id: number) => {
    if (!confirm("Удалить вопрос безвозвратно?")) return;
    await supabase.from("question_answers").delete().eq("question_id", id);
    await supabase.from("questions").delete().eq("id", id);
    load();
  };

  const submitAnswer = async (questionId: number) => {
    const body = answerDrafts[questionId]?.trim();
    if (!body) return;
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("question_answers").insert([{
      question_id: questionId,
      body,
      video_timestamp: timestampDrafts[questionId] || null,
      answered_by: user?.id,
    }]);

    await supabase.from("questions").update({ status: "approved" }).eq("id", questionId);
    setAnswerDrafts((prev) => ({ ...prev, [questionId]: "" }));
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Модерация вопросов</h1>
      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.id} className="rounded-xl border border-white/10 bg-[#14171F] p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-xs text-[#3B82F6] font-semibold">
                  {q.profiles?.username || "Аноним"}
                </span>
                <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-white/10">
                  {q.status}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStatus(q.id, "approved")} title="Одобрить">
                  <Check className="w-4 h-4 text-green-400" />
                </button>
                <button onClick={() => setStatus(q.id, "rejected")} title="Скрыть/отклонить">
                  <X className="w-4 h-4 text-amber-400" />
                </button>
                <button onClick={() => deleteQuestion(q.id)} title="Удалить">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
            <p className="text-sm mb-3">{q.body}</p>

            {q.question_answers?.[0] ? (
              <p className="text-xs text-[#7C5CFF] border-t border-white/5 pt-2">
                Ответ: {q.question_answers[0].body}
              </p>
            ) : (
              <div className="flex gap-2 mt-2">
                <input
                  className="flex-grow bg-[#0B0D12] border border-white/10 rounded-lg px-3 py-1.5 text-xs"
                  placeholder="Ответ автора..."
                  value={answerDrafts[q.id] || ""}
                  onChange={(e) => setAnswerDrafts((p) => ({ ...p, [q.id]: e.target.value }))}
                />
                <input
                  className="w-24 bg-[#0B0D12] border border-white/10 rounded-lg px-3 py-1.5 text-xs"
                  placeholder="12:34"
                  value={timestampDrafts[q.id] || ""}
                  onChange={(e) => setTimestampDrafts((p) => ({ ...p, [q.id]: e.target.value }))}
                />
                <button
                  onClick={() => submitAnswer(q.id)}
                  className="px-3 py-1.5 bg-[#3B82F6] rounded-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
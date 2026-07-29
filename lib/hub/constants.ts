import { MessageSquare, Gamepad2, Clapperboard, PenTool, Radio } from "lucide-react";
import type { PulseItem, RoadmapItem, MapDot, StatusOption } from "@/types/hub";

// ---------------------------------------------------------------------------
// Моковые данные (там, где явно указано — можно заменить на реальные запросы)
// ---------------------------------------------------------------------------

export const MOCK_PULSE: PulseItem[] = [
  { id: "1", type: "level_up", text: "повысил уровень до 7", avatar_url: "", time: "2 мин назад" },
  { id: "2", type: "fan_art", text: "загрузил новый фан-арт в галерею", avatar_url: "", time: "18 мин назад" },
  { id: "3", type: "join", text: "присоединился к сообществу", avatar_url: "", time: "34 мин назад" },
  { id: "4", type: "comment", text: "оставил комментарий в AMA", avatar_url: "", time: "1 ч назад" },
];

export const ROADMAP: RoadmapItem[] = [
  { id: "1", icon: Gamepad2, title: "Разработка мини-игры", description: "Прототип боевой системы для следующего девлога.", progress: 65, color: "#7C5CFF" },
  { id: "2", icon: Clapperboard, title: "Монтаж эпизода #42", description: "Черновой монтаж готов, идёт цветокоррекция.", progress: 40, color: "#3B82F6" },
  { id: "3", icon: PenTool, title: "Обновление хаба", description: "Leaderboard, Community Pulse и профили — почти готово.", progress: 85, color: "#10B981" },
];

// Статусы для "NullKinG's Status" — циклически меняются.
// ЗАМЕНИ на реальные данные (например, из отдельной таблицы status в Supabase),
// когда захочешь управлять этим не из кода, а из админки.
export const STATUSES: StatusOption[] = [
  { label: "Разработка игры", icon: Gamepad2, color: "#7C5CFF" },
  { label: "Монтаж видео", icon: Clapperboard, color: "#3B82F6" },
  { label: "Общение в Discord", icon: MessageSquare, color: "#10B981" },
  { label: "Подготовка к стриму", icon: Radio, color: "#F59E0B" },
];

// Координаты точек для Live Activity Map (% от контейнера).
// ЗАГЛУШКА: замени на реальные позиции/данные, если появится геолокация участников.
export const MAP_DOTS: MapDot[] = [
  { id: "1", x: 20, y: 30, delay: 0 },
  { id: "2", x: 35, y: 65, delay: 0.4 },
  { id: "3", x: 50, y: 25, delay: 0.8 },
  { id: "4", x: 65, y: 55, delay: 1.2 },
  { id: "5", x: 78, y: 35, delay: 1.6 },
  { id: "6", x: 15, y: 70, delay: 2.0 },
  { id: "7", x: 88, y: 65, delay: 2.4 },
];

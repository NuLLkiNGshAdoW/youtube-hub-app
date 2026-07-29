// app/admin/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface Accessibility {
  images_enabled: boolean;
  font_scale: number;
  high_contrast: boolean;
}

export default function SettingsAdminPage() {
  const [settings, setSettings] = useState<Accessibility | null>(null);

  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "accessibility").single()
      .then(({ data }) => setSettings(data?.value as Accessibility));
  }, []);

  const save = async (next: Accessibility) => {
    setSettings(next);
    await supabase.from("site_settings")
      .update({ value: next, updated_at: new Date().toISOString() })
      .eq("key", "accessibility");
  };

  if (!settings) return <p>Загрузка...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Настройки сайта</h1>
      <div className="rounded-xl border border-white/10 bg-[#14171F] p-6 space-y-4 max-w-md">
        <label className="flex justify-between items-center">
          <span>Показывать изображения</span>
          <input type="checkbox" checked={settings.images_enabled}
            onChange={(e) => save({ ...settings, images_enabled: e.target.checked })} />
        </label>
        <label className="flex justify-between items-center">
          <span>Высокий контраст</span>
          <input type="checkbox" checked={settings.high_contrast}
            onChange={(e) => save({ ...settings, high_contrast: e.target.checked })} />
        </label>
        <label className="flex flex-col gap-1">
          <span>Масштаб шрифта: {settings.font_scale}x</span>
          <input type="range" min="0.8" max="1.5" step="0.1" value={settings.font_scale}
            onChange={(e) => save({ ...settings, font_scale: parseFloat(e.target.value) })} />
        </label>
      </div>
    </div>
  );
}
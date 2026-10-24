"use client";

import { CloudLightning, CloudRain, CloudSun, Sun, ThermometerSnowflake, Users } from "lucide-react";
import { Mark } from "@/components/brand/mark";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/i18n";
import type { ScreenStrings } from "@/lib/i18n-screen";
import type { WeatherCondition } from "@/lib/types";

const WEATHER_ICON = { rain: CloudRain, storm: CloudLightning, hot: Sun, cold: ThermometerSnowflake, normal: CloudSun } satisfies Record<WeatherCondition, unknown>;

export function TopBar(props: {
  restaurant: string;
  heading: string; // "Today's prep" or "Closed today. Tomorrow's prep:"
  date: string;
  condition: WeatherCondition | null;
  tempF: number | null;
  guests: string | null;
  clock: string;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: ScreenStrings;
}) {
  const { restaurant, heading, date, condition, tempF, guests, clock, lang, setLang, t } = props;
  const Icon = condition ? WEATHER_ICON[condition] : null;
  return (
    <header className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-border px-4 py-3 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Mark size={40} />
        <div className="min-w-0">
          <p className="truncate text-base text-text-secondary">{restaurant}</p>
          <h1 className="font-display text-2xl font-700 leading-tight text-text-primary [overflow-wrap:break-word] sm:text-[28px]">
            {heading} <span className="font-500 text-text-secondary">{date}</span>
          </h1>
        </div>
      </div>

      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-lg text-text-primary">
        {Icon && tempF != null && (
          <li className="flex items-center gap-2">
            <Icon className="h-6 w-6 text-data" aria-hidden />
            <span>
              {t.weather[condition!]}, {Math.round(tempF)}°F
            </span>
          </li>
        )}
        {guests && (
          <li className="flex items-center gap-2">
            <Users className="h-6 w-6 text-data" aria-hidden />
            <span>{guests}</span>
          </li>
        )}
      </ul>

      <div className="flex items-center gap-4">
        <time className="min-w-[5ch] font-display text-3xl font-600 tabular-nums text-text-primary" suppressHydrationWarning>
          {clock}
        </time>
        <div role="group" aria-label={t.lang} className="flex rounded-md border border-border p-1">
          {(["en", "es"] as const).map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={lang === l}
              onClick={() => setLang(l)}
              className={cn(
                "min-h-[44px] cursor-pointer rounded px-3 text-base font-600 transition-colors duration-150",
                lang === l ? "bg-good text-canvas" : "text-text-secondary hover:text-text-primary"
              )}
            >
              {l === "en" ? "English" : "Español"}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

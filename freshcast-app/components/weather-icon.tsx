import { CloudLightning, CloudRain, CloudSun, Snowflake, Sun } from "lucide-react";
import { WeatherCondition } from "@/lib/types";

export function WeatherIcon({ condition, className }: { condition: WeatherCondition; className?: string }) {
  const props = { className, strokeWidth: 2 };
  if (condition === "rain") return <CloudRain {...props} />;
  if (condition === "storm") return <CloudLightning {...props} />;
  if (condition === "hot") return <Sun {...props} />;
  if (condition === "cold") return <Snowflake {...props} />;
  return <CloudSun {...props} />;
}

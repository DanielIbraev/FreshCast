// Wipes and reseeds Marco's Trattoria in Supabase with the current model.
// Owner only: needs admin-token.secret. Usage: npx tsx --tsconfig tsconfig.json scripts/reseed-marco.ts
import { readFileSync } from "fs";
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}
async function main() {
  const { setAdminToken } = await import("../lib/supabase");
  const db = await import("../lib/db");
  const { runBacktest } = await import("../lib/backtest");
  const { KITCHENS, seedTodayLogs, shapeOf } = await import("../lib/kitchens");
  const { DEMO_PROFILE } = await import("../lib/profile");
  setAdminToken(readFileSync("admin-token.secret", "utf8").trim());
  if (!(await db.verifyAdmin())) throw new Error("admin token rejected");
  const k = KITCHENS["marcos-trattoria"];
  const bt = runBacktest(k.ingredients, 12, 7, new Date(), 14, shapeOf(DEMO_PROFILE));
  await db.wipeRemote();
  const ok = await db.writeSnapshot({ ingredients: k.ingredients, logs: seedTodayLogs(DEMO_PROFILE.id), observations: bt.closeouts });
  console.log("written:", ok, "ingredients", k.ingredients.length, "nights", new Set(bt.closeouts.map((o) => o.date)).size);
}
main().catch((e) => { console.error(e.message); process.exit(1); });

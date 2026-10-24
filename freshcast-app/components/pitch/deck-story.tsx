// Slides 1-7: problem, solution, demo cue. One line + one visual per slide.
import { Crates, Podium, PrepCard, Loop } from "./visuals";
import { Mark } from "@/components/brand/mark";

export function Line({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-[68px] font-700 leading-[1.05] tracking-tight text-text-primary">{children}</h2>
      {sub && <p className="mt-5 text-[28px] leading-snug text-text-secondary">{sub}</p>}
    </div>
  );
}

export function Source({ children }: { children: React.ReactNode }) {
  return <p className="absolute bottom-0 left-0 text-base text-text-muted">{children}</p>;
}

export const S1Hook = () => (
  <div className="flex h-full flex-col justify-between">
    <Line>Who here has worked in a restaurant?</Line>
    <div className="flex items-end justify-between">
      <Crates />
      <p className="max-w-[360px] text-right text-[28px] leading-snug text-text-secondary">
        Up to <span className="font-700 text-waste">1 in 10</span> crates a restaurant buys ends up in the trash.
      </p>
    </div>
    <Source>Galley Solutions: 4–10% of food purchased by restaurants becomes waste</Source>
  </div>
);

export const S2Country = () => (
  <div className="relative flex h-full flex-col justify-between">
    <Line>If food waste were a country, it would be the 3rd biggest polluter on Earth.</Line>
    <div className="flex justify-center pb-10">
      <Podium />
    </div>
    <Source>FAO, United Nations · Food is also the #1 material in US landfills, where it rots into methane (EPA)</Source>
  </div>
);

export const S3Guess = () => (
  <div className="flex h-full flex-col justify-center">
    <p className="mb-8 text-[28px] text-text-muted">Why does it happen?</p>
    <h2 className="font-display text-[96px] font-800 leading-[1.0] tracking-tight text-text-primary">
      Every morning,
      <br />
      a cook <span className="text-waste">guesses.</span>
    </h2>
  </div>
);

export const S4Solution = ({ rows, day }: { rows: { name: string; usual: number; rec: number }[]; day: string }) => (
  <div className="flex h-full items-center justify-between gap-16">
    <div className="max-w-[640px]">
      <div className="mb-10 flex items-center gap-4">
        <Mark size={56} />
        <span className="font-display text-4xl font-700 text-text-primary">FreshCast</span>
      </div>
      <Line sub="So less food is bought, cooked, and thrown out.">FreshCast tells them how much less to prep.</Line>
    </div>
    <PrepCard rows={rows} day={day} />
  </div>
);

export const S5Loop = () => (
  <div className="flex h-full flex-col justify-center gap-16">
    <Line>
      No hardware. <span className="text-good">One minute a night.</span>
    </Line>
    <Loop />
    <p className="text-[26px] text-text-secondary">It reads the weather, reservations, and calendar. Every night it learns that kitchen a little better.</p>
  </div>
);

export const S6Demo = () => (
  <div className="flex h-full flex-col items-center justify-center text-center">
    <Mark size={96} animating />
    <h2 className="mt-12 font-display text-[88px] font-800 tracking-tight text-text-primary">Let&apos;s see it.</h2>
  </div>
);

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

// Sources sit bottom-right so the webcam bubble (bottom-left) never covers them.
export function Source({ children }: { children: React.ReactNode }) {
  return <p className="ml-auto max-w-[900px] text-right text-base text-text-muted">{children}</p>;
}

// Full-bleed background clip from /public/broll. If the file isn't there,
// the slide simply renders without it.
export function Broll({ name }: { name: string }) {
  return (
    <div className="pointer-events-none absolute -inset-x-[110px] -inset-y-[90px] -z-10 overflow-hidden">
      <video
        src={`/broll/${name}.mp4`}
        autoPlay
        muted
        loop
        playsInline
        onError={(e) => ((e.currentTarget.parentElement as HTMLElement).style.display = "none")}
        className="h-full w-full object-cover opacity-[0.28]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/80 to-canvas/40" />
    </div>
  );
}

// Opening frame. Matches the laptop screen in the Higgsfield intro so the
// zoom from the laptop into the deck is seamless.
export const S0Brand = () => (
  <div className="flex h-full flex-col items-center justify-center">
    <Mark size={120} animating />
    <p className="mt-10 font-display text-[72px] font-800 tracking-tight text-text-primary">FreshCast</p>
    <p className="mt-3 text-[28px] text-text-secondary">Prep less. Waste less.</p>
  </div>
);

export const S1Hook = () => (
  <div className="flex h-full flex-col justify-between">
    <Line>Who here has worked in a restaurant?</Line>
    <div>
      <Crates />
      <p className="mt-10 text-[34px] leading-snug text-text-secondary">
        Up to <span className="font-700 text-waste">1 in 10</span> crates of food a restaurant buys ends up in the trash.
      </p>
    </div>
    <Source>Galley Solutions: 4–10% of food purchased by restaurants becomes waste</Source>
  </div>
);

export const S2Country = () => (
  <div className="relative isolate flex h-full flex-col justify-between">
    <Broll name="landfill" />
    <Line>If food waste were a country, it would be the 3rd biggest polluter on Earth.</Line>
    <div className="flex justify-center">
      <Podium />
    </div>
    <Source>FAO, United Nations · Food is also the #1 material in US landfills, where it rots into methane (EPA)</Source>
  </div>
);

export const S3Guess = () => (
  <div className="relative isolate flex h-full flex-col justify-center">
    <Broll name="kitchen" />
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

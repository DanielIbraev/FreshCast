import type { CSSProperties } from "react";
import Image from "next/image";
import { BASE_WASTE_FRACTION, REDUCTION_RATE } from "@/lib/prediction";

const pct = (value: number) => `${Math.round(value * 100)}%`;

type PlanStyle = CSSProperties & { "--plan-cut": number };

export function ForecastPreview() {
  return (
    <figure
      className="w-full max-w-none overflow-hidden rounded-lg border border-border bg-surface lg:w-[150%]"
      style={{ "--plan-cut": REDUCTION_RATE } as PlanStyle}
    >
      <div className="relative overflow-hidden">
        <Image
          src="/landing/dashboard.webp"
          width={1800}
          height={1500}
          priority
          unoptimized
          alt="The FreshCast forecast for Marco's Trattoria: a 7-day outlook with live weather, guests and dollars of likely waste per day, then today's waste at risk and what the prep plan saves."
          className="h-auto w-full"
        />
        <span className="landing-preview-mask absolute inset-x-0 top-0 h-1/3 bg-canvas [--mask-delay:180ms]" aria-hidden />
        <span className="landing-preview-mask absolute inset-x-0 top-1/3 h-1/3 bg-canvas [--mask-delay:285ms]" aria-hidden />
        <span className="landing-preview-mask absolute inset-x-0 bottom-0 h-1/3 bg-canvas [--mask-delay:390ms]" aria-hidden />
      </div>

      <figcaption className="border-t border-border px-3.5 py-3 sm:px-4">
        <div className="lg:w-2/3">
          <div className="flex items-center justify-between gap-4 text-xs leading-none">
            <span className="font-600 text-waste">Waste starts at {pct(BASE_WASTE_FRACTION)} of usual prep</span>
            <span className="text-right font-600 text-good">Plan cuts {pct(REDUCTION_RATE)}</span>
          </div>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-waste/35"
            role="img"
            aria-label={`The prep plan cuts ${pct(REDUCTION_RATE)} of likely waste and keeps ${pct(1 - REDUCTION_RATE)} as a buffer.`}
          >
            <span className="landing-plan-fill block h-full w-full rounded-full bg-good" />
          </div>
        </div>
      </figcaption>
    </figure>
  );
}

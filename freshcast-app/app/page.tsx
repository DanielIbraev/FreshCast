import Link from "next/link";
import { Mark } from "@/components/brand/mark";
import { KitchenPicker } from "@/components/landing/kitchen-picker";
import { ForecastPreview } from "@/components/landing/forecast-preview";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Accuracy } from "@/components/landing/accuracy";
import { LandingFooter } from "@/components/landing/footer";

// The front page. Judges may open the link cold, so the first screen says what
// FreshCast does and drops them straight into a demo kitchen.
export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip bg-canvas">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="FreshCast home" className="flex items-center gap-2.5 rounded-md">
          <Mark size={30} />
          <span className="font-display text-lg font-700 text-text-primary">FreshCast</span>
        </Link>
        <Link
          href="/dashboard"
          className="rounded-md px-2 py-1.5 text-sm font-600 text-text-secondary transition-colors duration-150 hover:text-text-primary"
        >
          Open the app
        </Link>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-7 px-5 pb-16 pt-5 sm:px-8 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:items-center lg:gap-12 lg:py-7">
          <div className="min-w-0">
            <h1 className="min-w-0 font-display text-[2rem] font-700 leading-[1.05] text-text-primary [overflow-wrap:break-word] sm:text-5xl xl:text-6xl">
              <span className="landing-headline-line block">Prep less food.</span>
              <span className="landing-headline-line block">Throw less away.</span>
            </h1>
            <p className="mt-5 max-w-[34rem] text-lg leading-relaxed text-text-secondary">
              Each morning, FreshCast tells an independent restaurant how much less of each ingredient to prep. No hardware.
            </p>
            <KitchenPicker />
          </div>
          <div className="min-w-0 lg:justify-self-start">
            <ForecastPreview />
          </div>
        </section>

        <HowItWorks />
        <Accuracy />
      </main>

      <LandingFooter />
    </div>
  );
}

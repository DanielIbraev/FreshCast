import Image from "next/image";
import Link from "next/link";
import { Mark } from "@/components/brand/mark";
import { KitchenPicker } from "@/components/landing/kitchen-picker";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Accuracy } from "@/components/landing/accuracy";
import { LandingFooter } from "@/components/landing/footer";

// The front page. Judges may open the link cold, so the first screen says what
// FreshCast does and drops them straight into a demo kitchen.
export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip bg-canvas">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 rounded-md">
          <Mark size={30} />
          <span className="font-display text-lg font-700 text-text-primary">FreshCast</span>
        </Link>
        <Link
          href="/dashboard"
          className="rounded-md px-2 py-1 text-sm font-500 text-text-secondary transition-colors duration-150 hover:text-text-primary"
        >
          Open the app
        </Link>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-6 sm:px-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:items-center lg:gap-12 lg:pb-24 lg:pt-10">
          <div className="min-w-0">
            <h1 className="font-display text-[2.6rem] font-700 leading-[1.05] text-text-primary [overflow-wrap:break-word] sm:text-6xl">
              Prep less food. Throw less away.
            </h1>
            <p className="mt-5 max-w-[34rem] text-lg leading-relaxed text-text-secondary">
              Each morning, FreshCast tells an independent restaurant how much less of each ingredient to prep. No hardware.
            </p>
            <KitchenPicker />
          </div>
          <div className="min-w-0">
            <Image
              src="/landing/dashboard.webp"
              width={1200}
              height={800}
              priority
              sizes="(min-width: 1024px) 540px, 100vw"
              alt="The FreshCast forecast for Marco's Trattoria: a 7-day outlook with live weather, guests and dollars of likely waste per day, then today's waste at risk and what the prep plan saves."
              className="h-auto w-full rounded-lg border border-border"
            />
          </div>
        </section>

        <HowItWorks />
        <Accuracy />
      </main>

      <LandingFooter />
    </div>
  );
}

import Link from "next/link";
import { Mark } from "@/components/brand/mark";

export function LandingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-2.5">
          <Mark size={24} />
          <span className="font-display text-base font-600 text-text-primary">FreshCast</span>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-text-muted">
          Restaurants are fictional; histories are simulated; weather is live.
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-secondary">
          <li>
            <a
              href="https://github.com/DanielIbraev/FreshCast"
              className="rounded-sm transition-colors duration-150 hover:text-text-primary"
            >
              GitHub
            </a>
          </li>
          <li>Built with Kiro</li>
          <li>Climate Tech track, Hackachusetts 2026</li>
          <li>
            <Link href="/pitch" className="rounded-sm transition-colors duration-150 hover:text-text-primary">
              Pitch deck
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}

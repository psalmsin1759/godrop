import Magnetic from "@/components/ui/Magnetic";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/links";

function Badge({ kind }: { kind: "apple" | "android" }) {
  return (
    <a
      href={kind === "apple" ? APP_STORE_URL : GOOGLE_PLAY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-[54px] items-center gap-3 rounded-full border border-white/25 bg-black px-6 text-white transition-colors duration-200 hover:border-white/60 hover:bg-[#161616]"
    >
      {kind === "apple" ? (
        <svg width="18" height="22" viewBox="0 0 22 26" fill="currentColor" aria-hidden="true">
          <path d="M16.3 13.8c0-3.3 2.7-4.9 2.8-5-1.5-2.2-3.9-2.5-4.7-2.5-2-.2-3.9 1.2-4.9 1.2-1 0-2.6-1.2-4.3-1.1C3 6.4 1 7.7 0 9.7c-2 3.5-.5 8.7 1.4 11.6.9 1.4 2.1 3 3.6 2.9 1.4-.1 2-.9 3.7-.9 1.7 0 2.2.9 3.7.9 1.5 0 2.5-1.4 3.5-2.9 1.1-1.7 1.5-3.3 1.5-3.4-.1 0-2.9-1.1-2.9-4.3zM13.5 4.3c.8-1 1.3-2.3 1.2-3.7-1.1.1-2.5.8-3.3 1.7-.7.9-1.4 2.2-1.2 3.6 1.2.1 2.5-.6 3.3-1.6z" />
        </svg>
      ) : (
        <svg width="18" height="20" viewBox="0 0 22 24" fill="none" aria-hidden="true">
          <path d="M1 1.5v21l11-10.5L1 1.5z" fill="#3DDC84" />
          <path d="M1 1.5l11 10.5L17 7 1 1.5z" fill="#5B8EFF" />
          <path d="M1 22.5L17 17l-5-5-11 10.5z" fill="#FF6A2C" />
          <path d="M17 7l5 5-5 5-5-5 5-5z" fill="#FFB020" />
        </svg>
      )}
      <span className="text-left leading-tight">
        <span className="block text-[10px] font-medium text-white/60">
          {kind === "apple" ? "Download on the" : "Get it on"}
        </span>
        <span className="block text-[15px] font-bold tracking-tight">
          {kind === "apple" ? "App Store" : "Google Play"}
        </span>
      </span>
    </a>
  );
}

/** Pair of magnetic, official-style black app-store badges. */
export default function AppStoreButtons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <Magnetic>
        <Badge kind="apple" />
      </Magnetic>
      <Magnetic>
        <Badge kind="android" />
      </Magnetic>
    </div>
  );
}

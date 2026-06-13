const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
type DayKey = (typeof DAY_KEYS)[number];
interface DayHours {
  open: string;
  close: string;
}
type OpeningHours = Partial<Record<DayKey, DayHours | null>>;

function lagosNow(): { day: DayKey; minutes: number } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekdayMap: Record<string, DayKey> = {
    Sun: "sun",
    Mon: "mon",
    Tue: "tue",
    Wed: "wed",
    Thu: "thu",
    Fri: "fri",
    Sat: "sat",
  };
  const day = weekdayMap[get("weekday")] ?? "mon";
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

/**
 * Returns whether the vendor's configured opening hours cover the current
 * Lagos time, or null if `openingHours` is absent/invalid (no restriction).
 */
export function isWithinOpeningHours(openingHours: unknown): boolean | null {
  if (!openingHours || typeof openingHours !== "object") return null;
  const hours = openingHours as OpeningHours;
  const { day, minutes } = lagosNow();
  const today = hours[day];
  if (today === null || today === undefined) return false;
  const open = toMinutes(today.open);
  const close = toMinutes(today.close);
  if (close <= open) return minutes >= open || minutes < close; // overnight window
  return minutes >= open && minutes < close;
}

/**
 * Effective open status: the manual `isOpen` toggle is an override that can
 * force-close a vendor but cannot force it open outside its configured hours.
 */
export function computeIsOpenNow(vendor: { isOpen: boolean; openingHours: unknown }): boolean {
  if (!vendor.isOpen) return false;
  const withinHours = isWithinOpeningHours(vendor.openingHours);
  return withinHours === null ? vendor.isOpen : withinHours;
}

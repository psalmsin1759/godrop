import Marquee from "@/components/ui/Marquee";
import ChapterLabel from "@/components/ui/ChapterLabel";

const ROW_A = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Enugu"];
const ROW_B = ["Benin City", "Abeokuta", "Owerri", "Calabar", "Jos", "Uyo"];

function CityRow({ cities, reverse }: { cities: string[]; reverse?: boolean }) {
  return (
    <Marquee duration={48} reverse={reverse}>
      {cities.map((city) => (
        <span key={city} className="flex items-center">
          <span className="display text-stroke whitespace-nowrap px-8 text-[clamp(3.5rem,9vw,9rem)] uppercase text-white/60 transition-colors duration-300 hover:text-white">
            {city}
          </span>
          <span className="h-3 w-3 shrink-0 rounded-full bg-accent" />
        </span>
      ))}
    </Marquee>
  );
}

export default function Cities() {
  return (
    <section className="overflow-hidden border-t border-white/10 bg-ink py-28 text-white sm:py-36">
      <div className="mx-auto mb-16 flex w-full max-w-[1500px] flex-col gap-6 px-6 sm:px-10 lg:flex-row lg:items-end lg:justify-between lg:px-16">
        <div>
          <ChapterLabel index="06" title="Coverage" className="mb-8" />
          <h2 className="display text-[clamp(2.4rem,5vw,4.5rem)]">
            Already in <span className="serif-accent text-accent">your city.</span>
          </h2>
        </div>
        <p className="mono-label text-white/50">36 states · 200+ cities · expanding monthly</p>
      </div>

      <div className="flex flex-col gap-6">
        <CityRow cities={ROW_A} />
        <CityRow cities={ROW_B} reverse />
      </div>
    </section>
  );
}

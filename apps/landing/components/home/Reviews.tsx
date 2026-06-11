import Marquee from "@/components/ui/Marquee";
import ChapterLabel from "@/components/ui/ChapterLabel";

type Review = {
  name: string;
  detail: string;
  quote: string;
};

const REVIEWS: Review[] = [
  {
    name: "Adaeze N.",
    detail: "Lekki → Yaba · Parcel",
    quote: "Sent my sister's birthday cake across the bridge at 5pm on a Friday. It arrived intact in 40 minutes. In Lagos traffic. Witchcraft.",
  },
  {
    name: "Tunde B.",
    detail: "Surulere · Food",
    quote: "The tracking is so accurate I open my gate as the bike turns into my street. Jollof still hot, every time.",
  },
  {
    name: "Khadija E.",
    detail: "Abuja · Grocery",
    quote: "My shopper called me from the market to ask if I wanted the bigger yams. That's the kind of detail you can't fake.",
  },
  {
    name: "Emeka O.",
    detail: "PH → Aba · Truck",
    quote: "Moved my entire shop with one booking. Driver came with two loaders and finished before noon. ₦0 wahala.",
  },
  {
    name: "Bisi A.",
    detail: "Ikeja · SME owner",
    quote: "I run 30+ deliveries a week through the business dashboard. My customers think I have my own fleet now.",
  },
  {
    name: "Chinedu K.",
    detail: "Ibadan · Retail",
    quote: "Ordered a phone charger at 9am, had it before my 11am meeting. Faster than my own errands.",
  },
];

function Stars() {
  return (
    <div className="flex gap-1 text-amber" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 3l2.8 6 6.2.6-4.7 4.3 1.4 6.3L12 17l-5.7 3.2L7.7 14 3 9.6 9.2 9 12 3z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="mx-3 flex w-[340px] shrink-0 flex-col justify-between gap-8 rounded-3xl border border-white/10 bg-ink-soft p-7 sm:w-[400px]">
      <div>
        <Stars />
        <blockquote className="mt-5 text-[15px] leading-relaxed text-white/80">
          “{review.quote}”
        </blockquote>
      </div>
      <figcaption className="flex items-center justify-between border-t border-white/10 pt-5">
        <span className="text-sm font-bold text-white">{review.name}</span>
        <span className="mono-label text-white/45">{review.detail}</span>
      </figcaption>
    </figure>
  );
}

export default function Reviews() {
  return (
    <section className="border-t border-white/10 bg-ink py-28 text-white sm:py-36">
      <div className="mx-auto mb-16 w-full max-w-[1500px] px-6 sm:px-10 lg:px-16">
        <ChapterLabel index="07" title="Word on the street" className="mb-8" />
        <h2 className="display max-w-3xl text-[clamp(2.4rem,5vw,4.5rem)]">
          Nigeria <span className="serif-accent text-accent">talks.</span> We listen.
        </h2>
      </div>

      <Marquee duration={55}>
        {REVIEWS.map((review) => (
          <ReviewCard key={review.name} review={review} />
        ))}
      </Marquee>
    </section>
  );
}

import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  Sequence,
} from "remotion";

// ── Image pan/zoom engine ────────────────────────────────────────────────────
// Formula: left% = 50 - cx * scale * 100
//          top%  = 50 - cy * scale * 100
// cx / cy ∈ [0,1]: which point of the image to center in the frame
// scale: how many times larger than the container the image is rendered

const ZoomImg: React.FC<{
  src: string;
  scale: number;
  cx: number;
  cy: number;
}> = ({ src, scale, cx, cy }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <Img
      src={staticFile(src)}
      style={{
        position: "absolute",
        width: `${scale * 100}%`,
        height: `${scale * 100}%`,
        left: `${50 - cx * scale * 100}%`,
        top: `${50 - cy * scale * 100}%`,
        objectFit: "cover",
      }}
    />
  </AbsoluteFill>
);

// 120-frame scene standard fade (15f in, 15f out)
const sceneFade = (frame: number) =>
  interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }) *
  interpolate(frame, [105, 120], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// ── Collage cell positions (3 × 3 grid) ─────────────────────────────────────
// Column centers: 1/6 ≈ 0.167  |  3/6 = 0.5  |  5/6 ≈ 0.833
// Row centers:    1/6 ≈ 0.167  |  3/6 = 0.5  |  5/6 ≈ 0.833
const COL = [1 / 6, 3 / 6, 5 / 6] as const;
const ROW = [1 / 6, 3 / 6, 5 / 6] as const;

// ── Scene 1: Grand opening — full collage slow reveal ────────────────────────
const OpeningScene: React.FC = () => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0, 120], [1.0, 1.08], {
    extrapolateRight: "clamp",
  });

  const titleOpacity = interpolate(frame, [25, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [25, 70], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subOpacity = interpolate(frame, [65, 105], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: sceneFade(frame) }}>
      <ZoomImg src="delivery-collage.png" scale={scale} cx={0.5} cy={0.5} />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(4,4,18,0.92) 0%, rgba(4,4,18,0.35) 55%, rgba(4,4,18,0.6) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            transform: `translateY(${titleY}px)`,
            opacity: titleOpacity,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 128,
              fontWeight: 900,
              color: "white",
              letterSpacing: "-4px",
              lineHeight: 1,
              fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif",
            }}
          >
            GODROP
          </div>
        </div>
        <div
          style={{
            opacity: subOpacity,
            marginTop: 24,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.8)",
              letterSpacing: "5px",
              fontFamily: "'Helvetica Neue', sans-serif",
              fontWeight: 300,
            }}
          >
            NIGERIA'S ON-DEMAND DELIVERY PLATFORM
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Generic service scene — zooms into a character / area ───────────────────
const ServiceScene: React.FC<{
  imageSrc: string;
  // pan from → to
  fromScale: number;
  toScale: number;
  fromCx: number;
  toCx: number;
  fromCy: number;
  toCy: number;
  // overlay gradient direction
  overlayBg: string;
  // text
  badge: string;
  heading: string;
  sub: string;
  textSide?: "left" | "right" | "bottom";
}> = ({
  imageSrc,
  fromScale,
  toScale,
  fromCx,
  toCx,
  fromCy,
  toCy,
  overlayBg,
  badge,
  heading,
  sub,
  textSide = "bottom",
}) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0, 120], [fromScale, toScale], {
    extrapolateRight: "clamp",
  });
  const cx = interpolate(frame, [0, 120], [fromCx, toCx], {
    extrapolateRight: "clamp",
  });
  const cy = interpolate(frame, [0, 120], [fromCy, toCy], {
    extrapolateRight: "clamp",
  });

  const textOpacity = interpolate(frame, [30, 72], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textX =
    textSide === "right"
      ? interpolate(frame, [30, 72], [50, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;
  const textY =
    textSide === "bottom"
      ? interpolate(frame, [30, 72], [40, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  const containerStyle: React.CSSProperties =
    textSide === "bottom"
      ? {
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "80px 100px",
        }
      : textSide === "right"
      ? {
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-end",
          textAlign: "right",
          padding: "80px 100px",
        }
      : {
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 100px",
        };

  return (
    <AbsoluteFill style={{ opacity: sceneFade(frame) }}>
      <ZoomImg src={imageSrc} scale={scale} cx={cx} cy={cy} />
      <AbsoluteFill style={{ background: overlayBg }} />
      <AbsoluteFill style={containerStyle}>
        <div
          style={{
            opacity: textOpacity,
            transform: `translateX(${textX}px) translateY(${textY}px)`,
            maxWidth: 800,
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: "#F97316",
              color: "white",
              padding: "7px 20px",
              borderRadius: 100,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "1px",
              marginBottom: 16,
              fontFamily: "'Helvetica Neue', sans-serif",
            }}
          >
            {badge}
          </div>
          <div
            style={{
              fontSize: 82,
              fontWeight: 900,
              color: "white",
              letterSpacing: "-2px",
              lineHeight: 1.05,
              fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif",
            }}
          >
            {heading}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.72)",
              marginTop: 14,
              fontFamily: "'Helvetica Neue', sans-serif",
              fontWeight: 300,
            }}
          >
            {sub}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Scene 6: CTA ─────────────────────────────────────────────────────────────
const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();

  const containerOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: "clamp",
  });

  // gentle zoom
  const scale = interpolate(frame, [0, 120], [1.08, 1.18], {
    extrapolateRight: "clamp",
  });
  // slow leftward drift to follow the rider
  const cx = interpolate(frame, [0, 120], [0.45, 0.6], {
    extrapolateRight: "clamp",
  });

  const headOpacity = interpolate(frame, [20, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headScale = interpolate(frame, [20, 65], [0.88, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const btnOpacity = interpolate(frame, [70, 105], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const btnY = interpolate(frame, [70, 105], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pulse =
    1 + 0.022 * Math.sin((Math.max(0, frame - 90) / 30) * Math.PI * 2);

  return (
    <AbsoluteFill style={{ opacity: containerOpacity }}>
      <ZoomImg src="delivery-hero.png" scale={scale} cx={cx} cy={0.5} />
      <AbsoluteFill style={{ background: "rgba(4,4,18,0.74)" }} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: 60,
        }}
      >
        {/* Headline */}
        <div
          style={{
            opacity: headOpacity,
            transform: `scale(${headScale})`,
          }}
        >
          <div
            style={{
              fontSize: 26,
              color: "#F97316",
              letterSpacing: "10px",
              fontWeight: 800,
              marginBottom: 20,
              fontFamily: "'Arial Black', sans-serif",
            }}
          >
            GODROP
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 900,
              color: "white",
              lineHeight: 1.08,
              letterSpacing: "-2px",
              fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif",
            }}
          >
            Lagos Runs on{" "}
            <span style={{ color: "#F97316" }}>Godrop</span>
          </div>
        </div>

        {/* CTA cluster */}
        <div
          style={{
            opacity: btnOpacity,
            transform: `translateY(${btnY}px)`,
            marginTop: 50,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 26,
          }}
        >
          <div
            style={{
              fontSize: 26,
              color: "rgba(255,255,255,0.72)",
              letterSpacing: "1px",
              fontFamily: "'Helvetica Neue', sans-serif",
            }}
          >
            Food&nbsp;•&nbsp;Groceries&nbsp;•&nbsp;Parcels&nbsp;•&nbsp;Retail&nbsp;•&nbsp;Trucks
          </div>

          <div
            style={{
              background: "#F97316",
              color: "white",
              padding: "22px 66px",
              borderRadius: 100,
              fontSize: 26,
              fontWeight: 700,
              boxShadow: "0 0 52px rgba(249,115,22,0.55)",
              transform: `scale(${pulse})`,
              fontFamily: "'Helvetica Neue', sans-serif",
            }}
          >
            Download the App Today
          </div>

          <div
            style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.38)",
              letterSpacing: "3px",
              fontFamily: "'Helvetica Neue', sans-serif",
            }}
          >
            godrop.ng
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Root composition ──────────────────────────────────────────────────────────
// 6 scenes, 120 frames each (4 s), with 30-frame (1 s) crossfade overlaps
// Scene starts: 0  90  180  270  360  450
// Total: 450 + 90 (last CTA) = 540 frames = 18 s

export const GodropVideo: React.FC = () => (
  <AbsoluteFill style={{ background: "#04040f" }}>
    {/* 1 · Grand opening — show the whole delivery world */}
    <Sequence from={0} durationInFrames={120}>
      <OpeningScene />
    </Sequence>

    {/* 2 · Food Delivery
        Collage middle-left cell: rider handing package at a door
        Zoom: 1.5 → 2.2, slow push-in on the interaction */}
    <Sequence from={90} durationInFrames={120}>
      <ServiceScene
        imageSrc="delivery-collage.png"
        fromScale={1.5} toScale={2.3}
        fromCx={COL[0]} toCx={COL[0]}
        fromCy={ROW[1] - 0.02} toCy={ROW[1] + 0.02}
        overlayBg="linear-gradient(to top, rgba(4,4,18,0.92) 0%, rgba(4,4,18,0.25) 55%, rgba(4,4,18,0.1) 100%)"
        badge="🍔  FOOD DELIVERY"
        heading={"Hot Meals,\nFast Drops"}
        sub="Restaurant favourites at your doorstep in minutes"
      />
    </Sequence>

    {/* 3 · Grocery Delivery
        Collage middle-centre cell: person striding with grocery bags
        Pan slightly downward — follows the stride motion */}
    <Sequence from={180} durationInFrames={120}>
      <ServiceScene
        imageSrc="delivery-collage.png"
        fromScale={1.6} toScale={2.4}
        fromCx={COL[1]} toCx={COL[1]}
        fromCy={ROW[1] - 0.03} toCy={ROW[1] + 0.04}
        overlayBg="linear-gradient(135deg, rgba(4,4,18,0.9) 0%, rgba(4,4,18,0.4) 100%)"
        badge="🛒  GROCERY DELIVERY"
        heading={"Fresh Picks,\nDelivered"}
        sub="Markets & supermarkets, straight to your kitchen"
        textSide="left"
      />
    </Sequence>

    {/* 4 · Parcel & Retail — hero image
        Cinematic rider panning left → right: feels like you're riding alongside */}
    <Sequence from={270} durationInFrames={120}>
      <ServiceScene
        imageSrc="delivery-hero.png"
        fromScale={1.35} toScale={1.55}
        fromCx={0.22} toCx={0.68}
        fromCy={0.5} toCy={0.5}
        overlayBg="linear-gradient(to top, rgba(4,4,18,0.88) 0%, rgba(4,4,18,0.2) 60%, rgba(4,4,18,0.05) 100%)"
        badge="📦  PARCEL & RETAIL"
        heading={"Any Package.\nAnywhere."}
        sub="From small parcels to large retail orders"
      />
    </Sequence>

    {/* 5 · Truck Booking / Relocation
        Collage bottom-right cell: movers carrying furniture out of an apartment
        Zoom in then slow creep right — feels like surveyng the scene */}
    <Sequence from={360} durationInFrames={120}>
      <ServiceScene
        imageSrc="delivery-collage.png"
        fromScale={1.5} toScale={2.1}
        fromCx={COL[2] - 0.04} toCx={COL[2] + 0.03}
        fromCy={ROW[2]} toCy={ROW[2]}
        overlayBg="linear-gradient(to right, rgba(4,4,18,0.92) 0%, rgba(4,4,18,0.5) 55%, rgba(4,4,18,0.2) 100%)"
        badge="🚛  TRUCK BOOKING"
        heading={"Move Homes.\nMove Offices."}
        sub="Book a truck for relocation across Lagos & beyond"
        textSide="left"
      />
    </Sequence>

    {/* 6 · CTA — hero image wide pan + brand lock-up */}
    <Sequence from={450} durationInFrames={120}>
      <CTAScene />
    </Sequence>
  </AbsoluteFill>
);

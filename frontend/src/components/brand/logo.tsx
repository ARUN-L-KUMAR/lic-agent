interface LogoMarkProps {
  /** Height in px; width follows the artwork's aspect ratio. */
  size?: number;
  /** Kept for API compatibility — the mark always sits on a light chip so the artwork reads on the dark theme. */
  variant?: "color" | "onDark";
  /** Show the whole artwork including the Hindi / English tagline instead of just the emblem + LIC panel. */
  full?: boolean;
}

// Crop of /logo.jpg to the blue emblem + yellow "LIC" panel (drops the Hindi / English tagline below it).
const SRC = { w: 161, h: 78 };
const EMBLEM = { x: 0, y: 0, w: 161, h: 57 };
const FULL = { x: 0, y: 0, w: 161, h: 78 };

export function LogoMark({ size = 40, full = false }: LogoMarkProps) {
  const CROP = full ? FULL : EMBLEM;
  const width = size * (CROP.w / CROP.h);
  const scale = width / CROP.w;
  return (
    <span className="logo-chip">
      <span
        role="img"
        aria-label="LIC logo"
        style={{
          position: "relative",
          display: "block",
          flexShrink: 0,
          width,
          height: size,
          overflow: "hidden",
          borderRadius: 7,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.jpg"
          alt=""
          style={{
            position: "absolute",
            left: -CROP.x * scale,
            top: -CROP.y * scale,
            width: SRC.w * scale,
            height: SRC.h * scale,
            maxWidth: "none",
          }}
        />
      </span>
    </span>
  );
}

interface LogoProps {
  name?: string;
  tagline?: string;
  size?: number;
  onDark?: boolean;
}

export function Logo({ name = "LIC Agent", tagline, size = 40, onDark = false }: LogoProps) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem" }}>
      <LogoMark size={size} variant={onDark ? "onDark" : "color"} />
      <span>
        <span className="brand-name" style={{ display: "block", fontSize: "1.0625rem" }}>
          {name}
        </span>
        {tagline && (
          <span
            style={{
              display: "block",
              fontSize: "0.6875rem",
              fontWeight: 500,
              color: "var(--text-muted)",
            }}
          >
            {tagline}
          </span>
        )}
      </span>
    </span>
  );
}

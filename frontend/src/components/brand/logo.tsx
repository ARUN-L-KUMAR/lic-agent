interface LogoMarkProps {
  /** Height in px; width follows the artwork's aspect ratio. */
  size?: number;
  variant?: "color" | "onDark";
  /** Show the whole artwork including the Hindi / English tagline instead of just the emblem + LIC panel. */
  full?: boolean;
}

// Crop of /logo.jpg to the blue emblem + yellow "LIC" panel (drops the Hindi / English tagline below it).
const SRC = { w: 161, h: 78 };
const EMBLEM = { x: 0, y: 0, w: 161, h: 57 };
const FULL = { x: 0, y: 0, w: 161, h: 78 };

export function LogoMark({ size = 40, variant = "color", full = false }: LogoMarkProps) {
  const CROP = full ? FULL : EMBLEM;
  const width = size * (CROP.w / CROP.h);
  const scale = width / CROP.w;
  return (
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
        borderRadius: 4,
        outline: variant === "onDark" ? "2px solid #FFFFFF" : undefined,
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
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.625rem" }}>
      <LogoMark size={size} variant={onDark ? "onDark" : "color"} />
      <span>
        <span
          style={{
            display: "block",
            fontSize: "1.0625rem",
            fontWeight: 700,
            lineHeight: 1.2,
            color: onDark ? "#FFFFFF" : "var(--primary-dark)",
          }}
        >
          {name}
        </span>
        {tagline && (
          <span
            style={{
              display: "block",
              fontSize: "0.6875rem",
              fontWeight: 500,
              color: onDark ? "rgba(255,255,255,0.6)" : "var(--text-muted)",
            }}
          >
            {tagline}
          </span>
        )}
      </span>
    </span>
  );
}

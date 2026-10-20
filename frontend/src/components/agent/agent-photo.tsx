"use client";

import Image from "next/image";
import { User } from "lucide-react";
import { useSiteSettings } from "@/lib/use-site-settings";

/** Agent profile picture from site settings; falls back to an icon when none is set. */
export function AgentPhoto({
  width,
  height,
  radius = "50%",
  border,
  priority,
}: {
  width: number;
  height: number;
  radius?: string;
  border?: string;
  priority?: boolean;
}) {
  const site = useSiteSettings();
  const src = site.profile_image_url;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        border,
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
        background: "var(--primary-50)",
        color: "var(--primary-300)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={`${site.agent_name}, LIC Agent`}
          width={width * 2}
          height={height * 2}
          priority={priority}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
        />
      ) : (
        <User size={Math.min(width, height) / 2} />
      )}
    </div>
  );
}

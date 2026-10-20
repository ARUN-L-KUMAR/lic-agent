/** Recharts props that match the dark "Neon Vault" theme (SVG can't read CSS variables from props reliably). */
export const chartTheme = {
  grid: { strokeDasharray: "3 3", stroke: "rgba(130,165,255,0.14)" },
  axis: { tick: { fontSize: 12, fill: "#8C9BBD" }, stroke: "rgba(130,165,255,0.25)" },
  tooltip: {
    contentStyle: {
      background: "#0B1224",
      border: "1px solid rgba(130,165,255,0.32)",
      borderRadius: 12,
      color: "#EDF2FF",
      boxShadow: "0 12px 32px -8px rgba(0,0,0,0.6)",
    },
    labelStyle: { color: "#BAC6E3" },
    itemStyle: { color: "#EDF2FF" },
    cursor: { fill: "rgba(59,176,255,0.08)" },
  },
  bar: "#3BB0FF",
} as const;

"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Award,
  Camera,
  ChevronLeft,
  ChevronRight,
  Eye,
  Grid,
  Layers,
  Pause,
  Play,
  Rotate3d,
  RotateCcw,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Trophy,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  GALLERY_CATEGORIES,
  GALLERY_ITEMS,
  getCategorizedGalleryItems,
  type GalleryCategory,
  type GalleryItem,
} from "@/lib/gallery";

const CATEGORY_ICONS: Record<GalleryCategory, LucideIcon> = {
  Trophies: Trophy,
  Badges: Award,
  Certificates: ScrollText,
  Photoshoot: Camera,
};

const CATEGORY_NAMES: Record<GalleryCategory, string> = {
  Trophies: "Trophies",
  Badges: "Badges & Medals",
  Certificates: "Certificates",
  Photoshoot: "Moments & Ceremonies",
};

const CATEGORY_STYLES: Record<
  GalleryCategory,
  {
    badgeBg: string;
    badgeText: string;
    highlightText: string;
    borderAccent: string;
    pillActive: string;
  }
> = {
  Trophies: {
    badgeBg: "bg-amber-100 border border-amber-300",
    badgeText: "text-amber-900",
    highlightText: "text-amber-700",
    borderAccent: "border-amber-400",
    pillActive: "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-amber-400/25",
  },
  Badges: {
    badgeBg: "bg-blue-100 border border-blue-300",
    badgeText: "text-blue-900",
    highlightText: "text-blue-700",
    borderAccent: "border-blue-400",
    pillActive: "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-blue-500/25",
  },
  Certificates: {
    badgeBg: "bg-emerald-100 border border-emerald-300",
    badgeText: "text-emerald-900",
    highlightText: "text-emerald-700",
    borderAccent: "border-emerald-400",
    pillActive: "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-emerald-500/25",
  },
  Photoshoot: {
    badgeBg: "bg-purple-100 border border-purple-300",
    badgeText: "text-purple-900",
    highlightText: "text-purple-700",
    borderAccent: "border-purple-400",
    pillActive: "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/25",
  },
};

export type ViewMode = "carousel" | "grid" | "spotlight";

export interface GalleryShowcaseProps {
  initialViewMode?: ViewMode;
  lockedViewMode?: ViewMode;
  hideHeroMetrics?: boolean;
  hideTabs?: boolean;
}

export function GalleryShowcase({
  initialViewMode = "carousel",
  lockedViewMode,
  hideHeroMetrics = false,
  hideTabs = false,
}: GalleryShowcaseProps = {}) {
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory | "All">("All");
  const [viewMode, setViewMode] = useState<ViewMode>(lockedViewMode || initialViewMode);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inspectedItem, setInspectedItem] = useState<GalleryItem | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [flippedCardIds, setFlippedCardIds] = useState<Record<string, boolean>>({});

  // 3D tilt tracking for spotlight / active card
  const [tilt, setTilt] = useState({ x: 0, y: 0, gx: 50, gy: 50 });
  // Spotlight 360 degree drag rotation angle
  const [spotlightAngle, setSpotlightAngle] = useState(0);
  const [spotlightLighting, setSpotlightLighting] = useState<"warm" | "crystal" | "sky">("warm");
  const [zoomLevel, setZoomLevel] = useState<1 | 1.5 | 2>(1);

  const carouselRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const filteredItems = useMemo(() => {
    return getCategorizedGalleryItems(GALLERY_ITEMS, selectedCategory);
  }, [selectedCategory]);

  const activeIndex = Math.min(currentIndex, Math.max(0, filteredItems.length - 1));
  const activeItem = filteredItems[activeIndex] ?? filteredItems[0];

  const navigate = useCallback(
    (delta: number) => {
      setCurrentIndex((prev) => {
        const next = prev + delta;
        if (next < 0) return filteredItems.length - 1;
        if (next >= filteredItems.length) return 0;
        return next;
      });
      setSpotlightAngle(0);
    },
    [filteredItems.length]
  );

  const openInspection = (item: GalleryItem, photoIdx = 0) => {
    setInspectedItem(item);
    setSelectedPhotoIndex(photoIdx);
    setZoomLevel(1);
  };

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlay) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }
    autoPlayTimerRef.current = setInterval(() => {
      navigate(1);
    }, 4500);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlay, navigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (inspectedItem) {
        if (e.key === "Escape") setInspectedItem(null);
        return;
      }
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [inspectedItem, navigate]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (0.5 - py) * 22,
      y: (px - 0.5) * 26,
      gx: px * 100,
      gy: py * 100,
    });
  };

  const handlePointerLeave = () => {
    setTilt({ x: 0, y: 0, gx: 50, gy: 50 });
  };

  const toggleCardFlip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlippedCardIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-full relative select-none">
      {/* ─── Top Trust & Metrics Strip (Light Mode) ────────────────────────── */}
      {!hideHeroMetrics && (
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Metric 1 */}
          <div className="bg-white border-2 border-amber-200/80 hover:border-amber-400 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 text-center relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-amber-100 rounded-full blur-xl group-hover:scale-150 transition-transform" />
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Trophy className="w-5 h-5 animate-bounce" style={{ animationDuration: "3s" }} />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">27+ Policies</div>
            <div className="text-xs text-slate-500 font-semibold mt-0.5">Vellore Jubilant Milestone</div>
          </div>

          {/* Metric 2 */}
          <div className="bg-white border-2 border-blue-200/80 hover:border-blue-400 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 text-center relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-100 rounded-full blur-xl group-hover:scale-150 transition-transform" />
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0066B3]">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">68th Anniversary</div>
            <div className="text-xs text-slate-500 font-semibold mt-0.5">Agents&apos; Day Division Honor</div>
          </div>

          {/* Metric 3 */}
          <div className="bg-white border-2 border-emerald-200/80 hover:border-emerald-400 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 text-center relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-100 rounded-full blur-xl group-hover:scale-150 transition-transform" />
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">76th National</div>
            <div className="text-xs text-slate-500 font-semibold mt-0.5">Independence Medal & Award</div>
          </div>

          {/* Metric 4 */}
          <div className="bg-white border-2 border-purple-200/80 hover:border-purple-400 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 text-center relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-purple-100 rounded-full blur-xl group-hover:scale-150 transition-transform" />
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">MDRT 2023</div>
            <div className="text-xs text-slate-500 font-semibold mt-0.5">Official Executive Handover</div>
          </div>
        </div>
      )}

      {/* ─── Control Toolbar (Light Mode) ─────────────────────────────────── */}
      {(!hideTabs || !lockedViewMode) && (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-md">
          {/* Category Filter Pills */}
          {!hideTabs && (
            <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setCurrentIndex(0);
                }}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  selectedCategory === "All"
                    ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-400/30 scale-105"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>All Milestones</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-950/15 font-black">
                  {GALLERY_ITEMS.length}
                </span>
              </button>

              {GALLERY_CATEGORIES.map((cat) => {
                const count = GALLERY_ITEMS.filter(
                  (i) => i.category === cat || i.tags?.includes(cat)
                ).length;
                const Icon = CATEGORY_ICONS[cat];
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCurrentIndex(0);
                    }}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-[#0066B3] text-white shadow-md shadow-blue-500/25 scale-105"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{CATEGORY_NAMES[cat]}</span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* View Mode Switcher (hidden when locked) */}
          {!lockedViewMode && (
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-end lg:self-center">
              <button
                onClick={() => setViewMode("carousel")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "carousel"
                    ? "bg-white text-[#0066B3] shadow-md border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="3D Ring Carousel"
              >
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">3D Ring</span>
              </button>
              <button
                onClick={() => setViewMode("spotlight")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "spotlight"
                    ? "bg-white text-[#0066B3] shadow-md border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="360° Spotlight Studio"
              >
                <Rotate3d className="w-4 h-4" />
                <span className="hidden sm:inline">360° Studio</span>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-[#0066B3] shadow-md border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="3D Spatial Vault"
              >
                <Grid className="w-4 h-4" />
                <span className="hidden sm:inline">3D Vault</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── 1. MODE: 3D RING CAROUSEL (Light Mode) ───────────────────────── */}
      {viewMode === "carousel" && (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-white via-[#F5F8FC] to-[#E9F1FA] border-2 border-blue-100 shadow-xl p-4 sm:p-8">
          {/* 3D Orbit Viewport */}
          <div
            ref={carouselRef}
            className="relative h-[480px] sm:h-[550px] w-full rounded-2xl overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing bg-gradient-to-b from-white/70 via-[#F5F8FC] to-[#E8F2FB] border border-blue-100 shadow-inner"
            style={{ perspective: "1500px" }}
            onPointerDown={(e) => {
              dragStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
            }}
            onPointerUp={(e) => {
              if (!dragStartRef.current) return;
              const dx = e.clientX - dragStartRef.current.x;
              if (Math.abs(dx) > 40) {
                navigate(dx < 0 ? 1 : -1);
              }
              dragStartRef.current = null;
            }}
          >
            {/* Light Mode 3D Stage Atmosphere & Pedestal strictly contained inside stage */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Soft Warm Sunbeam from top */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-amber-300/20 via-blue-400/10 to-transparent rounded-full blur-3xl" />

              {/* Light 3D Perspective Floor Grid */}
              <div
                className="absolute bottom-0 inset-x-0 h-44 opacity-35"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(0,102,179,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,102,179,0.15) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                  transform: "perspective(350px) rotateX(60deg)",
                  transformOrigin: "bottom center",
                }}
              />

              {/* Glowing Exhibition Pedestal Disc directly under the center active card */}
              <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 w-[280px] sm:w-[400px] h-14 sm:h-16 rounded-[100%] border-4 border-amber-400/80 shadow-[0_12px_30px_rgba(255,204,0,0.35),0_5px_15px_rgba(0,102,179,0.15)] bg-gradient-to-b from-white to-amber-50" />
              <div className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 w-[220px] sm:w-[320px] h-10 sm:h-12 rounded-[100%] border border-amber-300/60 bg-white/80" />
            </div>

            <div
              className="relative w-full h-full flex items-center justify-center z-10"
              style={{ transformStyle: "preserve-3d" }}
            >
              {filteredItems.map((item, idx) => {
                const offset = idx - activeIndex;
                const total = filteredItems.length;

                // Circular modular distance
                let normalizedOffset = offset;
                if (normalizedOffset > total / 2) normalizedOffset -= total;
                if (normalizedOffset < -total / 2) normalizedOffset += total;

                const absOffset = Math.abs(normalizedOffset);
                const isActive = normalizedOffset === 0;

                // Hide cards too far back
                if (absOffset > 3.2) return null;

                const translateX = normalizedOffset * 220;
                const translateZ = isActive ? 160 : -absOffset * 150;
                const rotateY = isActive ? tilt.y : normalizedOffset * -24;
                const rotateX = isActive ? tilt.x : 0;
                const scale = isActive ? 1.05 : Math.max(0.72, 1 - absOffset * 0.15);
                const opacity = absOffset > 2.5 ? 0.35 : 1 - absOffset * 0.2;
                const zIndex = 50 - Math.round(absOffset * 10);
                const style = CATEGORY_STYLES[item.category];

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (isActive) {
                        openInspection(item);
                      } else {
                        setCurrentIndex(idx);
                      }
                    }}
                    onPointerMove={isActive ? handlePointerMove : undefined}
                    onPointerLeave={isActive ? handlePointerLeave : undefined}
                    style={{
                      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${scale})`,
                      zIndex,
                      opacity,
                      transition:
                        "transform 0.55s cubic-bezier(0.18, 0.89, 0.32, 1.15), opacity 0.35s ease",
                    }}
                    className="absolute w-[240px] sm:w-[290px] aspect-[3/4.2] rounded-2xl group cursor-pointer"
                  >
                    {/* Light 3D Card Shell */}
                    <div
                      className={`w-full h-full rounded-2xl relative overflow-hidden flex flex-col bg-white transition-all ${
                        isActive
                          ? "border-2 border-amber-400 shadow-[0_25px_60px_-15px_rgba(0,102,179,0.3),0_0_35px_rgba(255,204,0,0.35)]"
                          : "border border-slate-200 shadow-lg hover:border-slate-300"
                      }`}
                    >
                      {/* Interactive Holographic Gloss Sheen */}
                      {isActive && (
                        <div
                          className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay opacity-60"
                          style={{
                            background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.95) 0%, transparent 60%)`,
                          }}
                        />
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 ${
                            CATEGORY_STYLES[selectedCategory !== "All" ? selectedCategory : item.category].badgeBg
                          } ${
                            CATEGORY_STYLES[selectedCategory !== "All" ? selectedCategory : item.category].badgeText
                          }`}
                        >
                          {React.createElement(
                            CATEGORY_ICONS[selectedCategory !== "All" ? selectedCategory : item.category],
                            {
                              className: "w-3 h-3",
                            }
                          )}
                          {selectedCategory !== "All" ? CATEGORY_NAMES[selectedCategory] : item.category}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-700 bg-white/95 px-2 py-0.5 rounded-full border border-slate-200 shadow-sm flex items-center gap-1">
                            <Camera className="w-3 h-3 text-[#0066B3]" />
                            {item.photos?.length || 1}
                          </span>
                          <span className="text-[11px] font-extrabold text-[#0066B3] bg-white/95 px-2 py-0.5 rounded-full border border-blue-200 shadow-sm">
                            {item.year}
                          </span>
                        </div>
                      </div>

                      {/* Image Frame */}
                      <div className="relative w-full h-[68%] overflow-hidden bg-gradient-to-b from-slate-100/90 via-slate-50 to-blue-50/30">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.title}
                            className={`w-full h-full object-cover transition-transform duration-500 ${
                              isActive ? "group-hover:scale-105" : ""
                            }`}
                            style={{ objectPosition: item.objectPosition || "center 20%" }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-amber-50 rounded-xl">
                            {React.createElement(CATEGORY_ICONS[item.category], {
                              className: "w-16 h-16 text-amber-500",
                            })}
                          </div>
                        )}

                        {isActive && (
                          <div className="absolute bottom-2.5 right-2.5 z-20 bg-white/95 backdrop-blur-md text-[#004B87] text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1 shadow-md">
                            <Eye className="w-3 h-3 text-amber-500" />
                            Click to Inspect
                          </div>
                        )}
                      </div>

                      {/* Card Content Footer (Light Mode) */}
                      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between bg-white border-t border-slate-100">
                        <div>
                          {item.highlight && (
                            <div className="text-[10px] font-extrabold tracking-wider uppercase text-amber-600 mb-0.5 line-clamp-1">
                              ✦ {item.highlight}
                            </div>
                          )}
                          <h4 className="text-sm font-bold text-slate-900 leading-tight line-clamp-1">
                            {item.title}
                          </h4>
                          {item.subtitle && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {item.subtitle}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                          <span className="text-slate-500 font-medium line-clamp-1">
                            {item.division ?? "LIC Vellore Division"}
                          </span>
                          <span className="text-[#0066B3] font-bold group-hover:translate-x-1 transition-transform">
                            →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Previous & Next 3D Orbit Arrows */}
            <button
              onClick={() => navigate(-1)}
              className="absolute left-2 sm:left-4 z-40 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white hover:bg-amber-400 text-slate-800 hover:text-slate-950 border border-slate-200 flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer"
              aria-label="Previous Honor"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => navigate(1)}
              className="absolute right-2 sm:right-4 z-40 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white hover:bg-amber-400 text-slate-800 hover:text-slate-950 border border-slate-200 flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer"
              aria-label="Next Honor"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Active Honor Information & Controls Bar */}
          {activeItem && (
            <div className="mt-5 pt-4 border-t border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left relative z-10">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-0.5 rounded-full border border-amber-300">
                    {activeItem.year} • {activeItem.category}
                  </span>
                  {activeItem.highlight && (
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-300">
                      {activeItem.highlight}
                    </span>
                  )}
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-[#0066B3]" />
                    {activeItem.photos?.length || 1} Event Photos
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  {activeItem.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1">
                  {activeItem.caption}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border cursor-pointer ${
                    isAutoPlay
                      ? "bg-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-400/25"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isAutoPlay ? "Pause Rotate" : "Auto-Rotate"}</span>
                </button>

                <button
                  onClick={() => openInspection(activeItem)}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#0066B3] hover:bg-[#004B87] text-white shadow-md shadow-blue-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Inspect Event Photos</span>
                </button>
              </div>
            </div>
          )}

          {/* Slide Indicator Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-6">
            {filteredItems.map((it, i) => (
              <button
                key={it.id}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Show ${it.title}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === activeIndex
                    ? "w-8 bg-[#0066B3] shadow-sm"
                    : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── 2. MODE: 360° SPOTLIGHT STUDIO (Light Mode) ─────────────────── */}
      {viewMode === "spotlight" && activeItem && (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-white via-[#F7FAFD] to-[#EDF4FB] border-2 border-blue-100 shadow-xl p-6 sm:p-10">
          {/* Top Stage Header */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black tracking-widest text-[#0066B3] uppercase">
                  ✦ LIC Vellore Division Spotlight Stage ✦
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900">{activeItem.title}</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">{activeItem.subtitle}</p>
            </div>

            {/* Lighting Tone Selector */}
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 px-2">Studio Light:</span>
              <button
                onClick={() => setSpotlightLighting("warm")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  spotlightLighting === "warm"
                    ? "bg-amber-400 text-slate-950 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Warm Gold
              </button>
              <button
                onClick={() => setSpotlightLighting("sky")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  spotlightLighting === "sky"
                    ? "bg-[#0066B3] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Sky Blue
              </button>
              <button
                onClick={() => setSpotlightLighting("crystal")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  spotlightLighting === "crystal"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pure Crystal
              </button>
            </div>
          </div>

          {/* Main 3D Pedestal Rotating Viewport */}
          <div
            className="relative h-[440px] sm:h-[500px] w-full rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-b from-white/70 via-[#F5F8FC] to-[#E8F2FB] border border-blue-100 shadow-inner"
            style={{ perspective: "1200px" }}
            onPointerDown={(e) => {
              dragStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
            }}
            onPointerMove={(e) => {
              if (dragStartRef.current) {
                const dx = e.clientX - dragStartRef.current.x;
                setSpotlightAngle((prev) => prev + dx * 0.4);
                dragStartRef.current.x = e.clientX;
              } else {
                handlePointerMove(e);
              }
            }}
            onPointerUp={() => {
              dragStartRef.current = null;
            }}
            onPointerLeave={() => {
              dragStartRef.current = null;
              handlePointerLeave();
            }}
          >
            {/* Spotlight Lighting & Pedestal contained strictly inside Viewport */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className={`absolute top-0 left-1/2 -translate-x-1/2 w-[550px] h-[360px] blur-3xl transition-colors duration-700 ${
                  spotlightLighting === "warm"
                    ? "bg-gradient-to-b from-amber-300/30 via-amber-400/10 to-transparent"
                    : spotlightLighting === "sky"
                    ? "bg-gradient-to-b from-blue-300/30 via-blue-400/10 to-transparent"
                    : "bg-gradient-to-b from-slate-200/50 via-slate-300/10 to-transparent"
                }`}
              />
              {/* White/Gold Pedestal Disc directly under the trophy */}
              <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 w-[280px] sm:w-[380px] h-14 sm:h-16 rounded-[100%] border-4 border-amber-400/80 shadow-[0_15px_35px_rgba(255,204,0,0.3),0_5px_20px_rgba(0,102,179,0.15)] bg-gradient-to-b from-white to-amber-50" />
              <div className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 w-[220px] sm:w-[300px] h-10 sm:h-12 rounded-[100%] border border-amber-300/60 bg-white" />
            </div>

            {/* The Floating Trophy / Card */}
            <div
              className="relative w-[280px] sm:w-[340px] h-[400px] sm:h-[460px] cursor-grab active:cursor-grabbing rounded-3xl p-3 z-10"
              style={{
                transform: `rotateY(${spotlightAngle + tilt.y * 0.7}deg) rotateX(${
                  tilt.x * 0.7
                }deg) translateZ(40px)`,
                transformStyle: "preserve-3d",
                transition: dragStartRef.current ? "none" : "transform 0.25s ease-out",
              }}
            >
              <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-amber-400 shadow-[0_25px_60px_-15px_rgba(0,102,179,0.25),0_0_35px_rgba(255,204,0,0.35)] bg-white relative flex flex-col">
                {/* Dynamic Specular Sheen */}
                <div
                  className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay opacity-60"
                  style={{
                    background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.95) 0%, transparent 60%)`,
                  }}
                />

                <div className="relative w-full h-[78%] overflow-hidden bg-gradient-to-b from-slate-100/90 via-slate-50 to-blue-50/30 flex items-center justify-center p-3">
                  {activeItem.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeItem.image}
                      alt={activeItem.title}
                      className="w-full h-full object-contain rounded-xl drop-shadow-md transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-amber-50 rounded-xl">
                      {React.createElement(CATEGORY_ICONS[activeItem.category], {
                        className: "w-24 h-24 text-amber-500",
                      })}
                    </div>
                  )}

                  <div className="absolute top-3 left-3 z-20">
                    <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full text-slate-950 bg-amber-400 shadow-sm">
                      {selectedCategory !== "All" ? CATEGORY_NAMES[selectedCategory] : activeItem.category}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-800 bg-white/95 px-2 py-0.5 rounded-full border border-slate-200 shadow-sm flex items-center gap-1">
                      <Camera className="w-3 h-3 text-[#0066B3]" />
                      {activeItem.photos?.length || 1}
                    </span>
                    <span className="text-xs font-bold text-[#0066B3] bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-blue-200 shadow-sm">
                      {activeItem.year}
                    </span>
                  </div>
                </div>

                <div className="p-3 sm:p-4 bg-white border-t border-slate-100">
                  <div className="text-[11px] font-bold text-[#0066B3]">{activeItem.division}</div>
                  <div className="text-xs text-slate-600 line-clamp-1">{activeItem.presentedBy}</div>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <button
              onClick={() => navigate(-1)}
              className="absolute left-2 sm:left-4 z-30 w-11 h-11 rounded-full bg-white text-slate-700 hover:bg-amber-400 hover:text-slate-950 border border-slate-200 flex items-center justify-center shadow-lg transition-all cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => navigate(1)}
              className="absolute right-2 sm:right-4 z-30 w-11 h-11 rounded-full bg-white text-slate-700 hover:bg-amber-400 hover:text-slate-950 border border-slate-200 flex items-center justify-center shadow-lg transition-all cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Interactive Footer & 360 Spin Helper */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <RotateCcw className="w-4 h-4 text-[#0066B3] animate-spin" style={{ animationDuration: "12s" }} />
              <span>Drag horizontally to rotate 360° · Move cursor for 3D tilt & lighting</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSpotlightAngle(0)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Reset Angle
              </button>
              <button
                onClick={() => openInspection(activeItem)}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#0066B3] hover:bg-[#004B87] text-white shadow-md shadow-blue-500/25 flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Full Event Inspection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. MODE: 3D SPATIAL VAULT (LIGHT MODE GRID) ─────────────────── */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isFlipped = !!flippedCardIds[item.id];
            const style = CATEGORY_STYLES[item.category];

            return (
              <div
                key={item.id}
                className="h-[440px] rounded-2xl group cursor-pointer"
                style={{ perspective: "1000px" }}
                onClick={() => openInspection(item)}
              >
                {/* 3D Card Container with Flip Transform */}
                <div
                  className="w-full h-full relative rounded-2xl transition-transform duration-700 shadow-md group-hover:shadow-[0_20px_40px_-10px_rgba(0,102,179,0.2)]"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* FRONT SIDE (Light Mode) */}
                  <div
                    className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col bg-white border border-slate-200 group-hover:border-amber-400 transition-all duration-300"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    {/* Top Badges */}
                    <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between">
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 ${
                          CATEGORY_STYLES[selectedCategory !== "All" ? selectedCategory : item.category].badgeBg
                        } ${
                          CATEGORY_STYLES[selectedCategory !== "All" ? selectedCategory : item.category].badgeText
                        }`}
                      >
                        {React.createElement(
                          CATEGORY_ICONS[selectedCategory !== "All" ? selectedCategory : item.category],
                          {
                            className: "w-3 h-3",
                          }
                        )}
                        {selectedCategory !== "All" ? CATEGORY_NAMES[selectedCategory] : item.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-700 bg-white/95 px-2 py-0.5 rounded-full border border-slate-200 shadow-sm flex items-center gap-1">
                          <Camera className="w-3 h-3 text-[#0066B3]" />
                          {item.photos?.length || 1}
                        </span>
                        <span className="text-[11px] font-extrabold text-[#0066B3] bg-white/95 px-2.5 py-0.5 rounded-full border border-blue-200 shadow-sm">
                          {item.year}
                        </span>
                      </div>
                    </div>

                    {/* Image Area */}
                    <div className="relative w-full h-[62%] overflow-hidden bg-gradient-to-b from-slate-100/90 via-slate-50 to-blue-50/30">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          style={{ objectPosition: item.objectPosition || "center 20%" }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-amber-50 rounded-xl">
                          {React.createElement(CATEGORY_ICONS[item.category], {
                            className: "w-16 h-16 text-amber-500",
                          })}
                        </div>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between bg-white border-t border-slate-100">
                      <div>
                        {item.highlight && (
                          <div className="text-[10px] font-bold tracking-wider uppercase text-amber-700 mb-1 line-clamp-1">
                            ✦ {item.highlight}
                          </div>
                        )}
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                          {item.subtitle || item.caption}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                        <button
                          onClick={(e) => toggleCardFlip(item.id, e)}
                          className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <Rotate3d className="w-3.5 h-3.5" />
                          <span>Flip Details</span>
                        </button>

                        <span className="text-[11px] font-extrabold text-[#0066B3] group-hover:translate-x-1 transition-transform">
                          Inspect ({item.photos?.length || 1} photos) →
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BACK SIDE (Light Mode Flipped Credentials & Citation) */}
                  <div
                    className="absolute inset-0 rounded-2xl p-5 overflow-hidden flex flex-col justify-between bg-gradient-to-br from-white via-[#F8FAFC] to-[#EEF5FC] border-2 border-amber-400 shadow-xl"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-amber-300">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Verified LIC Honor
                        </span>
                        <button
                          onClick={(e) => toggleCardFlip(item.id, e)}
                          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 mt-3 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#0066B3] font-semibold mt-1">
                        {item.subtitle}
                      </p>

                      <div className="mt-4 p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-slate-700 leading-relaxed">
                        &quot;{item.caption}&quot;
                      </div>

                      <div className="mt-4 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Division:</span>
                          <span className="font-bold text-slate-800">{item.division ?? "LIC Vellore"}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Awarded Year:</span>
                          <span className="font-extrabold text-amber-700">{item.year}</span>
                        </div>
                        {item.presentedBy && (
                          <div className="flex items-center justify-between text-slate-500">
                            <span>Presented by:</span>
                            <span className="font-bold text-slate-800">{item.presentedBy}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                      <button
                        onClick={(e) => toggleCardFlip(item.id, e)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Flip Back</span>
                      </button>

                      <button
                        onClick={() => openInspection(item)}
                        className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-[#0066B3] text-white hover:bg-[#004B87] shadow-sm cursor-pointer"
                      >
                        View {item.photos?.length || 1} Photos
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Bottom Call-to-Action Bar for Prospects (High-Contrast Light Mode) ── */}
      <div className="mt-12 bg-gradient-to-r from-[#004B87] via-[#0066B3] to-[#004B87] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-extrabold border border-amber-400/40 mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span style={{ color: "#FDE047" }}>Award-Winning Advisory Services</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black !text-white" style={{ color: "#FFFFFF" }}>
            Secure Your Family with a Recognized LIC Professional
          </h3>
          <p className="text-xs sm:text-sm !text-blue-100 max-w-xl mt-1.5 leading-relaxed" style={{ color: "#E8F3FB" }}>
            Benefit from personalized guidance, seamless claim settlement, and career-tested dedication trusted by hundreds of families.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 flex-shrink-0">
          <Link
            href="/appointment"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 !text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            style={{ color: "#090d16" }}
          >
            Book Free Consultation
          </Link>
          <Link
            href="/plans"
            className="px-5 py-3 rounded-xl bg-white/20 hover:bg-white/30 !text-white font-extrabold text-sm border-2 border-white/50 shadow-md backdrop-blur-sm transition-all cursor-pointer"
            style={{ color: "#FFFFFF" }}
          >
            Explore Insurance Plans
          </Link>
        </div>
      </div>

      {/* ─── 4. MODAL: IMMERSIVE 3D INSPECTION MODAL WITH PHOTO SWITCHER ──── */}
      {inspectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in"
          onClick={() => setInspectedItem(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 shadow-2xl flex flex-col lg:flex-row overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ perspective: "1000px" }}
          >
            {/* Close Button */}
            <button
              onClick={() => setInspectedItem(null)}
              className="absolute top-4 right-4 z-40 w-10 h-10 rounded-full bg-white/90 text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200 flex items-center justify-center transition-all cursor-pointer shadow-md"
              aria-label="Close Inspection"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column: Interactive 3D Zoomable Showcase Image with Event Gallery Switcher */}
            <div className="relative w-full lg:w-1/2 min-h-[380px] lg:min-h-[520px] bg-gradient-to-b from-[#F0F6FC] to-[#E3EEF9] flex flex-col items-center justify-between p-6 overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-amber-300/30 rounded-full blur-3xl pointer-events-none" />

              {/* 3D Tilting Image Box */}
              <div
                className="relative my-auto max-w-full max-h-[340px] sm:max-h-[380px] rounded-2xl overflow-hidden border-2 border-white shadow-xl transition-transform duration-300 flex items-center justify-center"
                style={{
                  transform: `scale(${zoomLevel})`,
                  cursor: zoomLevel > 1 ? "zoom-out" : "zoom-in",
                }}
                onClick={() => setZoomLevel((z) => (z === 1 ? 1.5 : z === 1.5 ? 2 : 1))}
              >
                {/* Active photo */}
                <img
                  src={
                    inspectedItem.photos?.[selectedPhotoIndex]?.url ||
                    inspectedItem.image
                  }
                  alt={
                    inspectedItem.photos?.[selectedPhotoIndex]?.label ||
                    inspectedItem.title
                  }
                  className="max-h-[340px] sm:max-h-[380px] w-auto object-contain rounded-2xl bg-white"
                />
              </div>

              {/* Event Photos Thumbnails Strip */}
              {inspectedItem.photos && inspectedItem.photos.length > 1 && (
                <div className="relative z-20 w-full mt-3 p-2 bg-white/80 backdrop-blur-md rounded-2xl border border-blue-100 shadow-sm">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1 px-1 flex items-center justify-between">
                    <span>Event Gallery ({inspectedItem.photos.length} Photos)</span>
                    <span className="text-[#0066B3]">Click to switch photo</span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                    {inspectedItem.photos.map((p, pIdx) => (
                      <button
                        key={p.url + pIdx}
                        onClick={() => {
                          setSelectedPhotoIndex(pIdx);
                          setZoomLevel(1);
                        }}
                        className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                          selectedPhotoIndex === pIdx
                            ? "border-amber-400 scale-105 shadow-md ring-2 ring-amber-400/40"
                            : "border-slate-200 opacity-65 hover:opacity-100"
                        }`}
                        title={p.label}
                      >
                        <img
                          src={p.url}
                          alt={p.label}
                          className="w-full h-full object-cover"
                          style={{ objectPosition: p.objectPosition || "center 20%" }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Zoom Controls */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 shadow-sm">
                <span>Zoom:</span>
                {([1, 1.5, 2] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setZoomLevel(lvl)}
                    className={`px-2 py-0.5 rounded-md cursor-pointer ${
                      zoomLevel === lvl ? "bg-[#0066B3] text-white font-bold" : "hover:bg-slate-100"
                    }`}
                  >
                    {lvl}x
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Detailed Credential & Milestone Breakdown (Light Mode) */}
            <div className="w-full lg:w-1/2 p-6 sm:p-8 flex flex-col justify-between bg-white text-slate-900">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full text-slate-950 bg-amber-400">
                    {inspectedItem.category}
                  </span>
                  <span className="text-xs font-bold text-[#0066B3] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    Year: {inspectedItem.year}
                  </span>
                  {inspectedItem.highlight && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {inspectedItem.highlight}
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {inspectedItem.title}
                </h3>
                {inspectedItem.subtitle && (
                  <p className="text-sm font-semibold text-[#0066B3] mt-1">
                    {inspectedItem.subtitle}
                  </p>
                )}

                {/* Currently selected photo context */}
                {inspectedItem.photos?.[selectedPhotoIndex] && (
                  <div className="mt-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs">
                    <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-amber-600" />
                      Photo {selectedPhotoIndex + 1} of {inspectedItem.photos.length}:{" "}
                      {inspectedItem.photos[selectedPhotoIndex].label}
                    </div>
                    {inspectedItem.photos[selectedPhotoIndex].description && (
                      <p className="text-slate-600 mt-1">
                        {inspectedItem.photos[selectedPhotoIndex].description}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">
                    Achievement Citation & Event History
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {inspectedItem.caption}
                  </p>
                </div>

                {/* Milestone Metadata Badges */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500">Division / Branch:</span>
                    <span className="font-bold text-slate-800">{inspectedItem.division ?? "LIC Vellore Division"}</span>
                  </div>
                  {inspectedItem.presentedBy && (
                    <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500">Award Authority:</span>
                      <span className="font-bold text-slate-800">{inspectedItem.presentedBy}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-emerald-800">Authenticity Status:</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      Verified Official Award
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-3">
                <Link
                  href="/appointment"
                  onClick={() => setInspectedItem(null)}
                  className="flex-1 py-3 px-4 rounded-xl text-center text-xs sm:text-sm font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-400/25 transition-all"
                >
                  Consult with this Advisor
                </Link>
                <button
                  onClick={() => setInspectedItem(null)}
                  className="py-3 px-5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                >
                  Back to Showcase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

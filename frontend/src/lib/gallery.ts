export type GalleryCategory = "Trophies" | "Badges" | "Certificates" | "Photoshoot";

export interface EventPhoto {
  url: string;
  label: string;
  description?: string;
  /** Primary category of this specific photograph (e.g. Trophy, Medal, Person/Ceremony) */
  category?: GalleryCategory;
  /** Additional categories matching this photograph */
  tags?: GalleryCategory[];
  /** CSS object-position for optimal framing of faces and trophy crests */
  objectPosition?: string;
}

export interface GalleryItem {
  id: string;
  category: GalleryCategory;
  /** Categories this event spans across (e.g. Trophy + Ceremony + Medal) */
  tags?: GalleryCategory[];
  title: string;
  subtitle?: string;
  caption: string;
  year: string;
  highlight?: string;
  division?: string;
  presentedBy?: string;
  /** Primary hero image for 3D stage and cards */
  image: string;
  /** CSS object-position tailored so faces and trophies are prominently framed */
  objectPosition?: string;
  /** All authentic photos associated with this single milestone achievement */
  photos: EventPhoto[];
}

export const GALLERY_CATEGORIES: GalleryCategory[] = [
  "Trophies",
  "Badges",
  "Certificates",
  "Photoshoot",
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "jubilant-25",
    category: "Trophies",
    tags: ["Trophies", "Photoshoot"],
    title: "Vellore Jubilant 25 Milestone Award",
    subtitle: "Branch Milestone — 27 Policies Closed Under Ranipet BO",
    caption:
      "Honored with the Vellore Jubilant 25 award for achieving an outstanding milestone of 27 policies under Ranipet BO. Presented personally by Branch Manager P. Saravanan alongside senior branch officials.",
    year: "2021-22",
    highlight: "27 Policies Milestone",
    division: "Vellore Division · Ranipet BO",
    presentedBy: "P. Saravanan, Branch Manager & Divisional Executives",
    image: "/gallery/vellore-jubilant-showcase.png",
    objectPosition: "center center",
    photos: [
      {
        url: "/gallery/vellore-jubilant-showcase.png",
        label: "Division Trophy Showcase",
        category: "Trophies",
        description: "Vellore Division trophy collection featuring the Jubilant 25 milestone.",
        objectPosition: "center center",
      },
      {
        url: "/gallery/branch-manager-trophy-presentation.jpg",
        label: "Official Handover with BM",
        category: "Photoshoot",
        tags: ["Photoshoot", "Trophies"],
        description: "Branch Manager P. Saravanan personally presenting the Jubilant 25 trophy at Ranipet BO.",
        objectPosition: "center 22%",
      },
      {
        url: "/gallery/vellore-jubilant-25-award.png",
        label: "Jubilant 25 Trophy Plaque",
        category: "Trophies",
        description: "Official Vellore Jubilant 25 division award crest for 27 policies.",
        objectPosition: "center 35%",
      },
    ],
  },
  {
    id: "independence-day-76",
    category: "Badges",
    tags: ["Trophies", "Badges", "Photoshoot"],
    title: "76th Independence Day National Honor & Medal",
    subtitle: "Crystal Trophy, Tricolor Medal & Division Felicitation",
    caption:
      "Distinguished performance recognition at the 76th Independence Day ceremony by LIC Vellore Division. Celebrated with the commemorative crystal trophy, gold-rimmed Tricolor honor medal, and rooftop flag-hoisting executive felicitations.",
    year: "2023",
    highlight: "National Day Honor & Medalist",
    division: "LIC Vellore Division",
    presentedBy: "Senior Divisional Officers & Branch Executives",
    image: "/gallery/patriotic-rooftop-presentation.png",
    objectPosition: "center 18%",
    photos: [
      {
        url: "/gallery/patriotic-rooftop-presentation.png",
        label: "Live Stage Felicitation",
        category: "Photoshoot",
        tags: ["Photoshoot", "Trophies"],
        description: "Divisional managers and branch officers presenting the trophy on stage.",
        objectPosition: "center 18%",
      },
      {
        url: "/gallery/proud-award-recipient-portrait.png",
        label: "Medalist Advisor Portrait",
        category: "Photoshoot",
        tags: ["Photoshoot", "Badges", "Trophies"],
        description: "Licensed advisor adorned with the Independence Day medal and trophy.",
        objectPosition: "center 15%",
      },
      {
        url: "/gallery/independence-day-trophy.png",
        label: "Crystal Trophy & Tricolor Ribbon",
        category: "Trophies",
        description: "Division Independence Day crystal trophy with national tricolor sash.",
        objectPosition: "center 30%",
      },
      {
        url: "/gallery/independence-day-medal-set.png",
        label: "Tricolor Honor Medal",
        category: "Badges",
        description: "Gold-rimmed 76th Independence Day medal with Ashoka Chakra emblem.",
        objectPosition: "center center",
      },
      {
        url: "/gallery/independence-day-medal-front-back.png",
        label: "LIC Official Seal (Reverse)",
        category: "Badges",
        description: "Embossed Life Insurance Corporation seal with hands protecting the flame.",
        objectPosition: "center center",
      },
      {
        url: "/gallery/patriotic-rooftop-assembly.jpg",
        label: "Division Assembly Gathering",
        category: "Photoshoot",
        description: "Division officers, colleagues, and family celebrating the milestone.",
        objectPosition: "center 25%",
      },
      {
        url: "/gallery/independence-day-trophy-showcase.png",
        label: "Commemorative Crystal Award",
        category: "Trophies",
        description: "Official crystal trophy presented for unwavering client service.",
        objectPosition: "center center",
      },
    ],
  },
  {
    id: "agents-day-68",
    category: "Trophies",
    tags: ["Trophies"],
    title: "68th Anniversary Agents’ Day Victory Award",
    subtitle: "Commemorating 68 Years of LIC Advisory Excellence",
    caption:
      "Prestigious recognition presented on Agents' Day honoring continuous client protection and outstanding performance during the 68th Insurance Anniversary celebrations by LIC Vellore Division.",
    year: "2024",
    highlight: "68th Anniversary Honor",
    division: "LIC Vellore Division",
    presentedBy: "Divisional Office Executives",
    image: "/gallery/agents-day-victory-trophy.png",
    objectPosition: "center center",
    photos: [
      {
        url: "/gallery/agents-day-victory-trophy.png",
        label: "Winged Victory Trophy",
        category: "Trophies",
        description: "Sculpted golden angel trophy for dedicated policyholder protection.",
        objectPosition: "center center",
      },
      {
        url: "/gallery/agents-day-anniversary-trophy.png",
        label: "68th Anniversary Trophy",
        category: "Trophies",
        description: "Commemorative Agents' Day trophy celebrating 68 years of LIC excellence.",
        objectPosition: "center 35%",
      },
    ],
  },
  {
    id: "golden-pillar-memento",
    category: "Trophies",
    tags: ["Trophies", "Photoshoot"],
    title: "Vellore Division Ashoka Emblem Golden Memento",
    subtitle: "Executive Service Honor & Golden Pillar Presentation",
    caption:
      "Golden framed division plaque and Ashoka pillar trophy presented by Senior Branch Leadership during official division felicitations in recognition of outstanding client service.",
    year: "2023",
    highlight: "Executive Service Honor",
    division: "LIC Vellore Division",
    presentedBy: "Senior Branch Management",
    image: "/gallery/men-presenting-award-trophy.png",
    objectPosition: "center 12%",
    photos: [
      {
        url: "/gallery/men-presenting-award-trophy.png",
        label: "Memento Handover Ceremony",
        category: "Photoshoot",
        tags: ["Photoshoot", "Trophies"],
        description: "Senior branch leadership presenting the golden Ashoka pillar memento.",
        objectPosition: "center 12%",
      },
    ],
  },
  {
    id: "mdrt-2023",
    category: "Certificates",
    tags: ["Certificates", "Photoshoot"],
    title: "MDRT 2023 Performance Charter Recognition",
    subtitle: "Million Dollar Round Table Milestone Handover",
    caption:
      "Official handover of Million Dollar Round Table (MDRT) qualification charter and targets by senior branch management, honoring high-standard insurance advisory benchmarks.",
    year: "2023",
    highlight: "MDRT Qualifier Recognition",
    division: "LIC Branch Management",
    presentedBy: "Senior Branch Managers",
    image: "/gallery/mdrt-recognition-presentation.png",
    objectPosition: "center 22%",
    photos: [
      {
        url: "/gallery/mdrt-recognition-presentation.png",
        label: "MDRT Recognition Handover",
        category: "Certificates",
        tags: ["Certificates", "Photoshoot"],
        description: "Senior branch managers presenting the official MDRT recognition charter.",
        objectPosition: "center 22%",
      },
    ],
  },
];

/**
 * Returns gallery items tailored for the active tab:
 * - Items matching the category are included.
 * - For each item, photos are reordered so that the photograph matching the chosen tab
 *   (e.g., person/ceremony for "Photoshoot", medals for "Badges", trophies for "Trophies")
 *   is placed first as the primary preview image.
 */
export function getCategorizedGalleryItems(
  items: GalleryItem[],
  selectedCategory: GalleryCategory | "All"
): GalleryItem[] {
  if (selectedCategory === "All") return items;

  const matchingItems = items.filter(
    (item) => item.category === selectedCategory || item.tags?.includes(selectedCategory)
  );

  return matchingItems.map((item) => {
    if (!item.photos || item.photos.length <= 1) {
      return item;
    }

    // Direct category matches come first, followed by secondary tagged matches
    const directMatches = item.photos.filter((p) => p.category === selectedCategory);
    const taggedMatches = item.photos.filter(
      (p) => p.category !== selectedCategory && p.tags?.includes(selectedCategory)
    );
    const otherPhotos = item.photos.filter(
      (p) => p.category !== selectedCategory && !p.tags?.includes(selectedCategory)
    );

    const matchingPhotos = [...directMatches, ...taggedMatches];

    // If matching photos found, promote them to the top of the photo array
    if (matchingPhotos.length > 0) {
      const reorderedPhotos = [...matchingPhotos, ...otherPhotos];
      const topPhoto = reorderedPhotos[0];

      return {
        ...item,
        image: topPhoto.url,
        objectPosition: topPhoto.objectPosition || item.objectPosition,
        photos: reorderedPhotos,
      };
    }

    return item;
  });
}

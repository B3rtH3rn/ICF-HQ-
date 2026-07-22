/**
 * Avatar customization — options + types.
 *
 * IMPORTANT (product constraint): the figure is a fixed, abstract silhouette
 * for every user. ONLY color, energy, pose, hair, and accent symbols are
 * customizable. There is deliberately NO body-shape, body-size, or facial
 * customization — this app serves teens in a mental-health context and
 * body-shape customization risks becoming a body-image trigger. Do not add
 * body/face options here without explicit sign-off.
 */

export type EnergyStyle = "still" | "sparkles" | "trails" | "shards";
export type PoseStyle = "standing" | "open";
export type HairStyle = "none" | "short" | "long" | "tied";

export type AvatarConfig = {
  /** Signature color (hex) for outline + glow. null = theme default gradient. */
  color: string | null;
  /** Hair color (hex). null = follow the signature color. */
  hairColor: string | null;
  energy: EnergyStyle;
  pose: PoseStyle;
  hair: HairStyle;
  /** Selected accent-symbol ids that orbit the figure. */
  symbols: string[];
};

export const defaultAvatarConfig: AvatarConfig = {
  color: null,
  hairColor: null,
  energy: "still",
  pose: "standing",
  hair: "none",
  symbols: [],
};

/** Curated, blue-forward palette so every avatar stays cohesive with the theme. */
export const AVATAR_COLORS = [
  { id: "cyan", label: "Cyan", value: "#38e0e8" },
  { id: "azure", label: "Azure", value: "#5a97ff" },
  { id: "teal", label: "Teal", value: "#2dd4bf" },
  { id: "peri", label: "Periwinkle", value: "#8ab4ff" },
  { id: "violet", label: "Violet", value: "#9b8cff" },
  { id: "ice", label: "Ice", value: "#7dd3fc" },
  { id: "indigo", label: "Indigo", value: "#6d76f0" },
];

export const ENERGY_OPTIONS: { id: EnergyStyle; label: string }[] = [
  { id: "still", label: "Calm glow" },
  { id: "sparkles", label: "Sparkles" },
  { id: "trails", label: "Light trails" },
  { id: "shards", label: "Geometric" },
];

export const POSE_OPTIONS: { id: PoseStyle; label: string }[] = [
  { id: "standing", label: "Standing" },
  { id: "open", label: "Arms open" },
];

export const HAIR_OPTIONS: { id: HairStyle; label: string }[] = [
  { id: "none", label: "None" },
  { id: "short", label: "Short" },
  { id: "long", label: "Flowing" },
  { id: "tied", label: "Tied back" },
];

/** Curated interest motifs (no body-related icons). */
export const SYMBOL_OPTIONS = [
  { id: "music", char: "🎵", label: "Music" },
  { id: "leaf", char: "🍃", label: "Nature" },
  { id: "star", char: "⭐", label: "Star" },
  { id: "book", char: "📖", label: "Books" },
  { id: "paw", char: "🐾", label: "Animals" },
  { id: "art", char: "🎨", label: "Art" },
  { id: "moon", char: "🌙", label: "Moon" },
  { id: "ball", char: "⚽", label: "Sport" },
];

/** Full-body outline paths per pose (viewBox 0 0 200 380). Abstract stances only. */
export const POSE_PATHS: Record<PoseStyle, string> = {
  standing:
    "M86 100 L50 122 L36 236 L38 256 L52 252 L50 158 L70 168 L66 236 L70 358 L72 368 L90 368 L92 252 L100 242 L108 252 L110 368 L128 368 L130 358 L134 236 L130 168 L150 158 L148 252 L162 256 L164 236 L150 122 L114 100 Z",
  open: "M86 100 L48 118 L20 210 L18 232 L36 234 L58 150 L70 168 L66 236 L70 358 L72 368 L90 368 L92 252 L100 242 L108 252 L110 368 L128 368 L130 358 L134 236 L130 168 L142 150 L164 234 L182 232 L180 210 L152 118 L114 100 Z",
};

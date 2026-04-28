import type { CSSProperties } from 'react';

const DEFAULT_CATEGORY_BADGE_COLOR = '#8B5CF6';
const CATEGORY_SEQUENCE_LIGHT_TEXT_FALLBACK = '#1e293b';
const CATEGORY_SEQUENCE_DARK_TEXT_FALLBACK = '#f8fafc';

function normalizeHexColor(color?: string) {
  if (!color || !color.startsWith('#')) {
    return DEFAULT_CATEGORY_BADGE_COLOR;
  }

  const hex = color.slice(1);

  if (hex.length === 3) {
    return `#${hex
      .split('')
      .map((char) => `${char}${char}`)
      .join('')}`;
  }

  if (hex.length === 6) {
    return color;
  }

  return DEFAULT_CATEGORY_BADGE_COLOR;
}

function hexToRgb(color: string) {
  const normalized = normalizeHexColor(color).slice(1);
  const value = Number.parseInt(normalized, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbToCss({ r, g, b }: { r: number; g: number; b: number }) {
  return `rgb(${r} ${g} ${b})`;
}

function blendRgb(
  color: { r: number; g: number; b: number },
  target: { r: number; g: number; b: number },
  ratio: number
) {
  const blendChannel = (channel: number, targetChannel: number) =>
    Math.round(channel * (1 - ratio) + targetChannel * ratio);

  return {
    r: blendChannel(color.r, target.r),
    g: blendChannel(color.g, target.g),
    b: blendChannel(color.b, target.b),
  };
}

function blendWithWhite(color: string, whiteRatio: number) {
  return rgbToCss(blendRgb(hexToRgb(color), { r: 255, g: 255, b: 255 }, whiteRatio));
}

function blendWithBlack(color: string, blackRatio: number) {
  return rgbToCss(blendRgb(hexToRgb(color), { r: 0, g: 0, b: 0 }, blackRatio));
}

function relativeLuminance(color: { r: number; g: number; b: number }) {
  const toLinear = (channel: number) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };

  const r = toLinear(color.r);
  const g = toLinear(color.g);
  const b = toLinear(color.b);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(
  foreground: { r: number; g: number; b: number },
  background: { r: number; g: number; b: number }
) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function pickReadableTextColor(
  background: { r: number; g: number; b: number },
  preferred: { r: number; g: number; b: number },
  fallback: { r: number; g: number; b: number }
) {
  return contrastRatio(preferred, background) >= 4.5 ? preferred : fallback;
}

export function getCategoryBadgeColor(color?: string) {
  return normalizeHexColor(color);
}

export function getCategoryBadgeTextColor(color?: string) {
  return '#1e293b';
}

export function getCategoryBadgeStyle(color?: string) {
  const baseColor = getCategoryBadgeColor(color);

  return {
    backgroundColor: blendWithWhite(baseColor, 0.82),
    border: `1px solid ${blendWithWhite(baseColor, 0.62)}`,
    color: getCategoryBadgeTextColor(baseColor),
  };
}

export function getCategorySequenceBadgeStyle(color?: string): CSSProperties {
  const baseColor = getCategoryBadgeColor(color);
  const baseRgb = hexToRgb(baseColor);

  const lightBg = blendRgb(baseRgb, { r: 255, g: 255, b: 255 }, 0.82);
  const lightBorder = blendRgb(baseRgb, { r: 255, g: 255, b: 255 }, 0.62);
  const lightPreferredText = blendRgb(baseRgb, { r: 0, g: 0, b: 0 }, 0.55);
  const lightText = pickReadableTextColor(
    lightBg,
    lightPreferredText,
    hexToRgb(CATEGORY_SEQUENCE_LIGHT_TEXT_FALLBACK)
  );

  const darkBg = blendRgb(baseRgb, { r: 25, g: 18, b: 42 }, 0.72);
  const darkBorder = blendRgb(baseRgb, { r: 255, g: 255, b: 255 }, 0.18);
  const darkPreferredText = blendRgb(baseRgb, { r: 255, g: 255, b: 255 }, 0.72);
  const darkText = pickReadableTextColor(
    darkBg,
    darkPreferredText,
    hexToRgb(CATEGORY_SEQUENCE_DARK_TEXT_FALLBACK)
  );

  return {
    '--category-sequence-badge-light-bg': rgbToCss(lightBg),
    '--category-sequence-badge-light-border': rgbToCss(lightBorder),
    '--category-sequence-badge-light-text': rgbToCss(lightText),
    '--category-sequence-badge-dark-bg': rgbToCss(darkBg),
    '--category-sequence-badge-dark-border': rgbToCss(darkBorder),
    '--category-sequence-badge-dark-text': rgbToCss(darkText),
    '--category-sequence-badge-base': baseColor,
  } as CSSProperties;
}

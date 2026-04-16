const DEFAULT_CATEGORY_BADGE_COLOR = '#8B5CF6';

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

function blendWithWhite(color: string, whiteRatio: number) {
  const { r, g, b } = hexToRgb(color);

  const blendChannel = (channel: number) =>
    Math.round(channel * (1 - whiteRatio) + 255 * whiteRatio);

  return `rgb(${blendChannel(r)} ${blendChannel(g)} ${blendChannel(b)})`;
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

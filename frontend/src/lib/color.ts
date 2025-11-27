type ColorFormat = 'hex' | 'rgb' | 'hsl';
type ColorOptions = {
  format?: ColorFormat;
  min?: number;
  max?: number;
  alpha?: boolean;
  seed?: number | null;
};
type GradientOptions = ColorOptions & { count?: number };
type ColorFamilyOptions = ColorOptions & {
  count?: number;
  hueRange?: number;
  saturationRange?: number;
  lightnessRange?: number;
};

type RGB = { r: number; g: number; b: number };

const mulberry32 = (seed: number) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const generateRandomNumber = (min: number, max: number, random: () => number) =>
  Math.floor(random() * (max - min + 1)) + min;

const generateRandomHexColor = (random: () => number) =>
  '#' +
  Math.floor(random() * 0x1000000)
    .toString(16)
    .padStart(6, '0');

const generateRandomRGBColor = (min: number, max: number, alpha: boolean, random: () => number) => {
  const red = generateRandomNumber(min, max, random);
  const green = generateRandomNumber(min, max, random);
  const blue = generateRandomNumber(min, max, random);
  return alpha
    ? `rgba(${red},${green},${blue},${random().toFixed(2)})`
    : `rgb(${red},${green},${blue})`;
};

const generateRandomHSLColor = (alpha: boolean, random: () => number) => {
  const hue = generateRandomNumber(0, 360, random);
  const saturation = generateRandomNumber(0, 100, random);
  const lightness = generateRandomNumber(0, 100, random);
  return alpha
    ? `hsla(${hue},${saturation}%,${lightness}%,${random().toFixed(2)})`
    : `hsl(${hue},${saturation}%,${lightness}%)`;
};

export const generateRandomColor = (options: ColorOptions = {}) => {
  const { format = 'hex', min = 0, max = 255, alpha = false, seed = null } = options;
  const random = seed ? mulberry32(seed) : Math.random;
  switch (format) {
    case 'rgb':
      return generateRandomRGBColor(min, max, alpha, random);
    case 'hsl':
      return generateRandomHSLColor(alpha, random);
    default:
      return generateRandomHexColor(random);
  }
};

export const generateRandomGradientColors = (options: GradientOptions = {}) => {
  const { format = 'hex', count = 2, min = 0, max = 255, alpha = false, seed = null } = options;
  const random = seed ? mulberry32(seed) : Math.random;
  return Array.from({ length: count }, () =>
    generateRandomColor({ format, min, max, alpha, seed: random() })
  );
};

export const generateRandomColorFamily = (options: ColorFamilyOptions = {}) => {
  const {
    count = 5,
    min = 0,
    max = 255,
    alpha = false,
    seed = null,
    hueRange = 30,
    saturationRange = 20,
    lightnessRange = 20,
  } = options;

  const baseColor = generateRandomColor({ format: 'hsl', min, max, alpha, seed });
  const [hue, saturation, lightness] = baseColor.match(/\d+/g)!.map(Number);
  const random = seed ? mulberry32(seed) : Math.random;

  return [
    baseColor,
    ...Array.from({ length: count - 1 }, () => {
      const newHue = (hue + generateRandomNumber(-hueRange, hueRange, random)) % 360;
      const newSaturation = Math.max(
        0,
        Math.min(100, saturation + generateRandomNumber(-saturationRange, saturationRange, random))
      );
      const newLightness = Math.max(
        0,
        Math.min(100, lightness + generateRandomNumber(-lightnessRange, lightnessRange, random))
      );
      return `hsl(${newHue},${newSaturation}%,${newLightness}%)`;
    }),
  ];
};

export const hexToRgb = (hex: string): RGB => {
  const bigint = Number.parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
};

export const rgbToHex = (r: number, g: number, b: number) =>
  '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

export const calculateColorContrast = (color1: string, color2: string) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const lum1 = (0.2126 * rgb1.r + 0.7152 * rgb1.g + 0.0722 * rgb1.b) / 255;
  const lum2 = (0.2126 * rgb2.r + 0.7152 * rgb2.g + 0.0722 * rgb2.b) / 255;
  const lightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (lightest + 0.05) / (darkest + 0.05);
};

export const ensureColorContrast = (options: {
  color1: string;
  color2: string;
  format?: ColorFormat;
  contrastRatio?: number;
}) => {
  const { color1, color2, format = 'hex', contrastRatio = 4.5 } = options;
  const contrast = calculateColorContrast(color1, color2);
  if (contrast >= contrastRatio) return [color1, color2];

  const { r, g, b } = hexToRgb(color1);
  const backgroundColor = rgbToHex(r, g, b);
  let textColor = color2;

  while (calculateColorContrast(backgroundColor, textColor) < contrastRatio) {
    const { r, g, b } = hexToRgb(textColor);
    textColor = rgbToHex(Math.min(255, r + 10), Math.min(255, g + 10), Math.min(255, b + 10));
  }

  return format === 'hex'
    ? [backgroundColor, textColor]
    : [hexToRgb(backgroundColor), hexToRgb(textColor)];
};

// Pastel / Dark / Light Colors
export const generateRandomPastelColor = (options: ColorOptions = {}) => {
  const { format = 'hex', alpha = false, seed = null } = options;
  const random = seed ? mulberry32(seed) : Math.random;
  const hue = generateRandomNumber(0, 360, random);
  const saturation = generateRandomNumber(25, 50, random);
  const lightness = generateRandomNumber(75, 90, random);
  const hslColor = `hsl(${hue},${saturation}%,${lightness}%)`;
  return format === 'hex'
    ? hslToHex(hslColor)
    : alpha
      ? hslToRgba(hslColor, random().toFixed(2))
      : hslToRgb(hslColor);
};

export const generateRandomDarkColor = (options: ColorOptions = {}) => {
  const { format = 'hex', alpha = false, seed = null } = options;
  const random = seed ? mulberry32(seed) : Math.random;
  const hue = generateRandomNumber(0, 360, random);
  const saturation = generateRandomNumber(50, 100, random);
  const lightness = generateRandomNumber(10, 30, random);
  const hslColor = `hsl(${hue},${saturation}%,${lightness}%)`;
  return format === 'hex'
    ? hslToHex(hslColor)
    : alpha
      ? hslToRgba(hslColor, random().toFixed(2))
      : hslToRgb(hslColor);
};

export const generateRandomLightColor = (options: ColorOptions = {}) => {
  const { format = 'hex', alpha = false, seed = null } = options;
  const random = seed ? mulberry32(seed) : Math.random;
  const hue = generateRandomNumber(0, 360, random);
  const saturation = generateRandomNumber(50, 100, random);
  const lightness = generateRandomNumber(70, 90, random);
  const hslColor = `hsl(${hue},${saturation}%,${lightness}%)`;
  return format === 'hex'
    ? hslToHex(hslColor)
    : alpha
      ? hslToRgba(hslColor, random().toFixed(2))
      : hslToRgb(hslColor);
};

// HSL Converters
export const hslToRgb = (hslColor: string) => {
  const [hue, saturation, lightness] = hslColor.match(/\d+/g)!.map(Number);
  const h = hue / 360;
  const s = saturation / 100;
  const l = lightness / 100;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
};

export const hslToRgba = (hslColor: string, alpha: string) =>
  hslToRgb(hslColor).replace('rgb', 'rgba').replace(')', `, ${alpha})`);

export const hslToHex = (hslColor: string) => {
  const [r, g, b] = hslToRgb(hslColor).match(/\d+/g)!.map(Number);
  return rgbToHex(r, g, b);
};

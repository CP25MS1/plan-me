import { CSSProperties } from 'react';

export const sanitizeStyle = (style?: CSSProperties): CSSProperties | undefined => {
  if (!style) return style;

  const next: CSSProperties = {
    ...style,
    width: '100%',
    display: 'block',
  };

  if (typeof style.transform === 'string') {
    // translate3d(x, y, z)
    const t3 = style.transform.match(
      /translate3d\(\s*(-?[\d.]+)px,\s*(-?[\d.]+)px,\s*(-?[\d.]+)px\)/
    );
    if (t3) {
      next.transform = `translate3d(0px, ${t3[2]}px, ${t3[3]}px)`;
      return next;
    }

    // translate(x, y)
    const t2 = style.transform.match(/translate\(\s*(-?[\d.]+)px,\s*(-?[\d.]+)px\)/);
    if (t2) {
      next.transform = `translate(0px, ${t2[2]}px)`;
      return next;
    }

    // fallback: original transform
    next.transform = style.transform;
  }

  // No transform > not set property
  return next;
};

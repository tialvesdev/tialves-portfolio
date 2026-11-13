import type { CSSProperties, HTMLAttributes } from 'react';
import { cx } from './cx';
import { PATTERNS, patternSrc, type PatternName } from './assets';

/** Estilo de fundo com padrão seamless em escala inteira. Use em qualquer elemento. */
export function patternStyle(name: PatternName, scale = 3): CSSProperties {
  const p = PATTERNS[name];
  return {
    backgroundImage: `url(${patternSrc(name)})`,
    backgroundSize: `${p.w * scale}px ${p.h * scale}px`,
    imageRendering: 'pixelated',
  };
}

export type PatternSurfaceProps = HTMLAttributes<HTMLDivElement> & { pattern: PatternName; scale?: number };

/** Superfície com padrão repetido (brocado, damasco, treliça...). */
export function PatternSurface({ pattern, scale = 3, className, style, ...rest }: PatternSurfaceProps) {
  return <div className={cx('gx-pattern', className)} style={{ ...patternStyle(pattern, scale), ...style }} {...rest} />;
}

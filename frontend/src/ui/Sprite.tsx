import type { CSSProperties } from 'react';
import { cx } from './cx';
import { SPRITES, spriteSrc, type SpriteName } from './assets';

export type SpriteProps = {
  name: SpriteName;
  scale?: number;
  /** Sobrescreve o fps padrão da folha. */
  fps?: number;
  paused?: boolean;
  className?: string;
  /** Texto acessível. Omitido = decorativo. */
  label?: string;
};

/** Anima uma sprite sheet horizontal com CSS steps(). */
export function Sprite({ name, scale = 4, fps, paused, className, label }: SpriteProps) {
  const s = SPRITES[name];
  const rate = fps ?? s.fps;
  const sheetW = s.w * s.frames * scale;
  const style = {
    width: s.w * scale,
    height: s.h * scale,
    backgroundImage: `url(${spriteSrc(name)})`,
    backgroundSize: `${sheetW}px ${s.h * scale}px`,
    animationDuration: `${s.frames / rate}s`,
    animationTimingFunction: `steps(${s.frames})`,
    animationPlayState: paused ? 'paused' : 'running',
    '--gx-sheet-w': `${sheetW}px`,
  } as CSSProperties;
  return (
    <span
      className={cx('gx-sprite', className)}
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

import { cx } from './cx';
import { RELICS, relicSrc, type RelicName } from './assets';

export type RelicProps = {
  name: RelicName;
  scale?: 2 | 3 | 4;
  /** float = sobe e brilha no hover; idle = flutua sempre; none = parado. */
  motion?: 'float' | 'idle' | 'none';
  /** Mostra o pedestal escuro atrás do objeto. */
  pedestal?: boolean;
  caption?: boolean;
  className?: string;
};

/** Objeto decorativo em pixel art (vela, grimório, compasso...). */
export function Relic({ name, scale = 3, motion = 'float', pedestal = true, caption = false, className }: RelicProps) {
  const r = RELICS[name];
  return (
    <figure className={cx('gx-relic', motion !== 'none' && `gx-relic--${motion}`, className)}>
      <div className={cx('gx-relic__stage', !pedestal && 'gx-relic__stage--bare')}>
        <img src={relicSrc(name)} width={r.w * scale} height={r.h * scale} alt={caption ? '' : r.label} />
      </div>
      {caption && <figcaption className="gx-caption">{r.label}</figcaption>}
    </figure>
  );
}

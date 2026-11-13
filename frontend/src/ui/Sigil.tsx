import type { ImgHTMLAttributes } from 'react';
import { cx } from './cx';
import { sigilSrc, type SigilName } from './assets';

export type SigilProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  name: SigilName;
  /** Escala inteira do glifo 24×24 (1 = 24px, 2 = 48px...). */
  scale?: 1 | 2 | 3 | 4;
  /** Texto alternativo. Omitido = decorativo. */
  label?: string;
};

/** Símbolo gravado em ouro, para ícones de navegação e marcadores. */
export function Sigil({ name, scale = 1, label, className, ...rest }: SigilProps) {
  const s = 24 * scale;
  return (
    <img
      src={sigilSrc(name)}
      width={s}
      height={s}
      alt={label ?? ''}
      className={cx('gx-sigil', className)}
      {...rest}
    />
  );
}

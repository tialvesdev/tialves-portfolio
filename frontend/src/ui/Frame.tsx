import type { ElementType, HTMLAttributes } from 'react';
import { cx } from './cx';

export type FrameVariant = 'filigrana' | 'gotica' | 'carmim';

export type FrameProps = HTMLAttributes<HTMLElement> & {
  variant?: FrameVariant;
  /** Remove o respiro interno de 4px (útil para imagens/canvas). */
  flush?: boolean;
  as?: ElementType;
};

/** Moldura 9-slice: filigrana dourada, gótica (osso e ouro) ou carmim real. */
export function Frame({ variant = 'filigrana', flush, as: Tag = 'div', className, ...rest }: FrameProps) {
  return <Tag className={cx('gx-frame', `gx-frame--${variant}`, flush && 'gx-frame--flush', className)} {...rest} />;
}

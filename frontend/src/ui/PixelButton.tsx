import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';
import { sigilSrc, type SigilName } from './assets';

type Common = {
  variant?: 'default' | 'primary';
  size?: 'md' | 'sm';
  /** Símbolo gravado à esquerda do texto. */
  sigil?: SigilName;
  children: ReactNode;
};
type AsButton = Common & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsLink = Common & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; disabled?: boolean };

export type PixelButtonProps = AsButton | AsLink;

/** Botão 9-slice (normal, hover, pressionado, primário, desabilitado). Vira <a> quando recebe href. */
export function PixelButton(props: PixelButtonProps) {
  const { variant = 'default', size = 'md', sigil, children, className, ...rest } = props;
  const cls = cx('gx-btn', variant === 'primary' && 'gx-btn--primary', size === 'sm' && 'gx-btn--sm', className);
  const content = (
    <>
      {sigil && <img src={sigilSrc(sigil)} alt="" />}
      {children}
    </>
  );
  if (rest.href !== undefined) {
    const { disabled, ...a } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & { disabled?: boolean };
    return (
      <a {...a} className={cls} aria-disabled={disabled || undefined} tabIndex={disabled ? -1 : a.tabIndex}>
        {content}
      </a>
    );
  }
  const b = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type="button" {...b} className={cls}>
      {content}
    </button>
  );
}

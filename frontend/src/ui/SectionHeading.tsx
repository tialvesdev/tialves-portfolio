import type { ReactNode } from 'react';
import { sigilSrc, type SigilName } from './assets';

export type SectionHeadingProps = {
  title: ReactNode;
  sigil?: SigilName;
  kicker?: string;
  lede?: ReactNode;
  id?: string;
};

/** Título de seção com símbolos gravados e linhas douradas. */
export function SectionHeading({ title, sigil = 'flor_de_lis', kicker, lede, id }: SectionHeadingProps) {
  return (
    <header>
      {kicker && <span className="gx-heading__kicker">{kicker}</span>}
      <div className="gx-heading">
        <img src={sigilSrc(sigil)} alt="" />
        <h2 id={id}>{title}</h2>
        <img src={sigilSrc(sigil)} alt="" />
      </div>
      {lede && <p className="gx-heading__lede">{lede}</p>}
    </header>
  );
}

import { asset, sigilSrc, type SigilName } from './assets';

export type NavItem = { href: string; label: string; sigil?: SigilName };

export type GothicNavProps = {
  brand: string;
  brandHref?: string;
  items: NavItem[];
  current?: string;
};

/** Barra de navegação fixa com símbolos gravados. */
export function GothicNav({ brand, brandHref = '#top', items, current }: GothicNavProps) {
  return (
    <nav className="gx-nav" aria-label="Principal">
      <div className="gx-nav__in">
        <a className="gx-nav__brand" href={brandHref}>
          <img src={asset('ui/favicon_32.png')} alt="" />
          {brand}
        </a>
        <ul className="gx-nav__links">
          {items.map((it) => (
            <li key={it.href}>
              <a href={it.href} aria-current={current === it.href ? 'true' : undefined}>
                {it.sigil && <img src={sigilSrc(it.sigil)} alt="" />}
                {it.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

import type { ReactNode } from 'react';
import { Frame } from './Frame';
import { ChipList } from './Chip';
import { PixelButton } from './PixelButton';
import { roomSrc, type RoomName } from './assets';

export type ProjectLink = { label: string; href?: string; primary?: boolean };

export type ProjectCardProps = {
  title: string;
  description: ReactNode;
  /** URL de imagem própria ou o nome de uma sala do kit. */
  image?: string;
  room?: RoomName;
  imageAlt?: string;
  tags?: string[];
  links?: ProjectLink[];
  /** Destaque: moldura carmim com ouro. */
  featured?: boolean;
  badge?: ReactNode;
  headingLevel?: 'h2' | 'h3' | 'h4';
};

/** Card de projeto com moldura 9-slice, chips de tecnologia e ações. */
export function ProjectCard({
  title,
  description,
  image,
  room = 'galeria_retratos',
  imageAlt = '',
  tags = [],
  links = [],
  featured = false,
  badge,
  headingLevel: H = 'h3',
}: ProjectCardProps) {
  return (
    <Frame as="article" variant={featured ? 'carmim' : 'filigrana'} className="gx-card">
      <div className="gx-card__media">
        <img src={image ?? roomSrc(room)} alt={imageAlt} loading="lazy" />
        {badge && <div className="gx-card__badge">{badge}</div>}
      </div>
      <div className="gx-card__body">
        <H className="gx-card__title">{title}</H>
        <p className="gx-card__text">{description}</p>
        {tags.length > 0 && <ChipList items={tags} label={`Tecnologias de ${title}`} />}
        {links.length > 0 && (
          <div className="gx-card__actions">
            {links.map((l) =>
              l.href ? (
                <PixelButton key={l.label} href={l.href} variant={l.primary ? 'primary' : 'default'} target="_blank" rel="noreferrer">
                  {l.label}
                </PixelButton>
              ) : (
                <PixelButton key={l.label} disabled>
                  {l.label}
                </PixelButton>
              ),
            )}
          </div>
        )}
      </div>
    </Frame>
  );
}

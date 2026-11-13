import type { CSSProperties, HTMLAttributes } from 'react';
import { cx } from './cx';
import { roomSrc, type RoomName } from './assets';

export type RoomBackdropProps = HTMLAttributes<HTMLElement> & {
  room: RoomName;
  /** Véu sobre a cena (qualquer background CSS) para manter o texto legível. */
  veil?: string;
  as?: 'section' | 'div' | 'header' | 'footer';
};

/** Usa uma sala do castelo como fundo de seção. */
export function RoomBackdrop({ room, veil, as: Tag = 'section', className, style, children, ...rest }: RoomBackdropProps) {
  const vars = (veil ? { '--gx-room-veil': veil } : {}) as CSSProperties;
  return (
    <Tag className={cx('gx-room', className)} style={{ ...vars, ...style }} {...rest}>
      <img className="gx-room__img" src={roomSrc(room)} alt="" />
      {children}
    </Tag>
  );
}

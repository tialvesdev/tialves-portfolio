import type { HTMLAttributes } from 'react';
import { cx } from './cx';

/** Etiqueta de tecnologia em pedra entalhada. */
export function Chip({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx('gx-chip', className)} {...rest} />;
}

/** Lista semântica de chips. */
export function ChipList({ items, label }: { items: string[]; label?: string }) {
  return (
    <ul className="gx-chips" aria-label={label} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {items.map((t) => (
        <li key={t}>
          <Chip>{t}</Chip>
        </li>
      ))}
    </ul>
  );
}

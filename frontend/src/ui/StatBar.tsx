import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { cx } from './cx';

export type StatBarProps = {
  label: string;
  value: number;
  max?: number;
  tone?: 'carmim' | 'ciano' | 'ouro';
  /** Enche a barra quando entra na tela. */
  animateOnView?: boolean;
};

/** Barra de atributo estilo HP/MP para habilidades. */
export function StatBar({ label, value, max = 100, tone = 'carmim', animateOnView = true }: StatBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(!animateOnView);
  const ratio = Math.max(0, Math.min(1, value / max));

  useEffect(() => {
    if (!animateOnView || !ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [animateOnView]);

  const fill = { '--gx-v': shown ? ratio : 0 } as CSSProperties;

  return (
    <div ref={ref} className={cx('gx-stat', tone !== 'carmim' && `gx-stat--${tone}`)}>
      <span>{label}</span>
      <div className="gx-stat__bar" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
        <i className="gx-stat__fill" style={fill} />
      </div>
      <span className="gx-stat__num">
        {value}
        <small>/{max}</small>
      </span>
    </div>
  );
}

export type PagerProps = {
  /** Página atual, começando em 1. */
  page: number;
  total: number;
  onChange: (page: number) => void;
  loop?: boolean;
};

/** Setas de navegação para carrossel ou paginação. */
export function Pager({ page, total, onChange, loop = true }: PagerProps) {
  const prev = () => onChange(page > 1 ? page - 1 : loop ? total : 1);
  const next = () => onChange(page < total ? page + 1 : loop ? 1 : total);
  return (
    <div className="gx-pager">
      <button type="button" aria-label="Anterior" onClick={prev} disabled={!loop && page <= 1} />
      <span aria-live="polite">
        {page} / {total}
      </span>
      <button type="button" className="gx-pager__next" aria-label="Próximo" onClick={next} disabled={!loop && page >= total} />
    </div>
  );
}

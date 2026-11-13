/** Divisor ornamentado: pontas + trilho + emblema central. */
export function OrnateDivider({ emblem = true }: { emblem?: boolean }) {
  return (
    <div className="gx-divider" role="separator" aria-hidden="true">
      <span className="gx-divider__end" />
      <span className="gx-divider__mid" />
      {emblem && <span className="gx-divider__emblem" />}
      {emblem && <span className="gx-divider__mid" />}
      <span className="gx-divider__end gx-divider__end--r" />
    </div>
  );
}

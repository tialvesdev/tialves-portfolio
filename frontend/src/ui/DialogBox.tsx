import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export type DialogBoxProps = {
  speaker?: string;
  text: string;
  /** Caracteres por segundo do efeito máquina de escrever. 0 = texto instantâneo. */
  speed?: number;
  /** Mostra a seta piscando quando o texto termina. */
  caret?: boolean;
  onDone?: () => void;
};

/** Janela de diálogo de RPG com efeito de digitação. Clique para pular a animação. */
export function DialogBox({ speaker, text, speed = 40, caret = true, onDone }: DialogBoxProps) {
  const reduced = usePrefersReducedMotion();
  const instant = speed <= 0 || reduced;
  const [n, setN] = useState(instant ? text.length : 0);

  useEffect(() => {
    if (instant) {
      setN(text.length);
      return;
    }
    setN(0);
    const id = window.setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          window.clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, 1000 / speed);
    return () => window.clearInterval(id);
  }, [text, speed, instant]);

  const done = n >= text.length;
  useEffect(() => {
    if (done) onDone?.();
  }, [done, onDone]);

  return (
    <div className="gx-dialog">
      {speaker && <div className="gx-dialog__who">{speaker}</div>}
      {/* O texto completo fica disponível para leitores de tela desde o início. */}
      <p className="gx-dialog__text">
        <span aria-hidden="true">{text.slice(0, n)}</span>
        <span className="gx-sr-only">{text}</span>
      </p>
      {!done && <button type="button" className="gx-dialog__skip" aria-label="Mostrar texto completo" onClick={() => setN(text.length)} />}
      {caret && done && <span className="gx-dialog__caret" aria-hidden="true" />}
    </div>
  );
}

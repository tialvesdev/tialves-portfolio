import { useState, type ReactNode } from 'react';

export type SpecimenProps = {
  name: string;
  summary: string;
  code: string;
  children: ReactNode;
  wide?: boolean;
  /** Fundo do palco: pedra (padrão) ou liso. */
  stage?: 'stone' | 'plain';
};

/** Bloco de catálogo: demo ao vivo + snippet de uso copiável. */
export function Specimen({ name, summary, code, children, wide, stage = 'stone' }: SpecimenProps) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard bloqueado: o usuário ainda pode selecionar o texto */
    }
  };
  return (
    <article className={`sc-spec${wide ? ' sc-spec--wide' : ''}`}>
      <header className="sc-spec__head">
        <h3>
          <code>&lt;{name} /&gt;</code>
        </h3>
        <p>{summary}</p>
      </header>
      <div className={`sc-spec__stage sc-spec__stage--${stage}`}>{children}</div>
      <div className="sc-spec__code">
        <pre>
          <code>{code}</code>
        </pre>
        <button type="button" className="sc-copy" onClick={copy}>
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </article>
  );
}

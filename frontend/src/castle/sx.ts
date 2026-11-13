import type { CSSProperties } from 'react';

const cache = new Map<string, CSSProperties>();

/** Converte um estilo inline em texto ("left: 10px; --c: red") no objeto que o React espera. */
export function sx(style: string | undefined | null): CSSProperties | undefined {
  if (!style) return undefined;
  const hit = cache.get(style);
  if (hit) return hit;
  const out: Record<string, string> = {};
  for (const decl of style.split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    const value = decl.slice(i + 1).trim();
    if (!prop) continue;
    const key = prop.startsWith('--') ? prop : prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    out[key] = value;
  }
  if (cache.size > 2000) cache.clear();
  cache.set(style, out as CSSProperties);
  return out as CSSProperties;
}

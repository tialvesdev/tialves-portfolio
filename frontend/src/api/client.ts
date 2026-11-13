import { useEffect, useState } from 'react';
import { seedProfile, seedProjects, seedSkills } from './seed';
import type { ApiProblem, ContactReceipt, ContactRequest, Profile, Project, Skill } from './types';

const API = import.meta.env.VITE_API_URL ?? '/api';

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API}${path}`, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok || !res.headers.get('content-type')?.includes('json')) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export type PortfolioData = {
  profile: Profile;
  projects: Project[];
  skills: Skill[];
  source: 'loading' | 'api' | 'local';
};

/** Carrega o portfólio da API; se ela estiver fora do ar, usa os dados locais. */
export function usePortfolio(): PortfolioData {
  const [data, setData] = useState<PortfolioData>({ profile: seedProfile, projects: seedProjects, skills: seedSkills, source: 'loading' });

  useEffect(() => {
    const ctrl = new AbortController();
    Promise.all([
      getJson<Profile>('/profile', ctrl.signal),
      getJson<Project[]>('/projects', ctrl.signal),
      getJson<Skill[]>('/skills', ctrl.signal),
    ])
      .then(([profile, projects, skills]) => setData({ profile, projects, skills, source: 'api' }))
      .catch(() => {
        if (!ctrl.signal.aborted) setData((d) => ({ ...d, source: 'local' }));
      });
    return () => ctrl.abort();
  }, []);

  return data;
}

/**
 * Acorda a API em segundo plano. No plano gratuito do Render ela dorme depois de um tempo parada;
 * com esse aviso no início da visita, ela já está de pé quando a pessoa chega ao formulário.
 */
export function wakeApi(): void {
  fetch(`${API}/profile`, { headers: { Accept: 'application/json' } }).catch(() => undefined);
}

export class ContactError extends Error {
  constructor(
    message: string,
    public fieldErrors: Record<string, string> = {},
  ) {
    super(message);
  }
}

export async function sendContact(body: ContactRequest): Promise<ContactReceipt> {
  let res: Response;
  try {
    res = await fetch(`${API}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ContactError('O cristal não respondeu agora. Tente de novo em instantes ou escreva para tialves.dev@gmail.com.');
  }
  if (res.ok) return res.json() as Promise<ContactReceipt>;
  const problem = (await res.json().catch(() => ({}))) as ApiProblem;
  if (res.status === 400) throw new ContactError(problem.detail ?? 'Confira os campos destacados.', problem.errors ?? {});
  throw new ContactError('O cristal não conseguiu enviar a mensagem. Tente de novo em instantes ou escreva para tialves.dev@gmail.com.');
}

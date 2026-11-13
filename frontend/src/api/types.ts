import type { RoomName } from '../ui';

/** Contratos espelhados dos records Java em backend/src/main/java/dev/tiago/portfolio/model. */

export type Link = { label: string; href: string };

export type Profile = {
  name: string;
  role: string;
  tagline: string;
  location: string;
  links: Link[];
};

export type Project = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  room: RoomName;
  featured: boolean;
  status: 'PUBLISHED' | 'IN_PROGRESS' | 'PLANNED';
  repoUrl: string | null;
  liveUrl: string | null;
};

export type SkillTone = 'carmim' | 'ciano' | 'ouro';

export type Skill = {
  name: string;
  level: number;
  category: 'FRONTEND' | 'BACKEND' | 'TOOLS';
  tone: SkillTone;
};

export type ContactRequest = { name: string; email: string; message: string };
export type ContactReceipt = { id: string; receivedAt: string };

/** Erro de validação no formato ProblemDetail (RFC 9457) do Spring. */
export type ApiProblem = {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string>;
};

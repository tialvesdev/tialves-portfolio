import type { Profile, Project, Skill } from './types';

/**
 * Dados locais usados quando a API Spring Boot está desligada.
 * Mantenha em sincronia com backend/src/main/java/dev/tiago/portfolio/service/PortfolioSeed.java.
 * Os níveis de habilidade são valores de exemplo: ajuste antes de publicar.
 */
export const seedProfile: Profile = {
  name: 'Tiago Alves da Silva',
  role: 'Desenvolvedor Full Stack',
  tagline: 'Interfaces em React e TypeScript, APIs em Java e Spring Boot.',
  location: 'Brasil',
  links: [
    { label: 'Projetos', href: '#projetos' },
    { label: 'Contato', href: '#contato' },
  ],
};

export const seedProjects: Project[] = [
  {
    id: 'atelie-gotico-ui',
    title: 'Ateliê Gótico UI',
    description:
      'Biblioteca de componentes React + TypeScript em pixel art: molduras 9-slice, botões, barras de atributo e uma cena animada em canvas.',
    tags: ['React', 'TypeScript', 'CSS'],
    room: 'save',
    featured: true,
    status: 'IN_PROGRESS',
    repoUrl: null,
    liveUrl: null,
  },
  {
    id: 'portfolio-api',
    title: 'API do Portfólio',
    description: 'Back-end Spring Boot que serve perfil, projetos e habilidades e recebe mensagens de contato com validação.',
    tags: ['Java 21', 'Spring Boot', 'REST'],
    room: 'atelie_arquiteto',
    featured: false,
    status: 'IN_PROGRESS',
    repoUrl: null,
    liveUrl: null,
  },
  {
    id: 'proximo-projeto',
    title: 'Próximo projeto',
    description: 'Espaço reservado. Cadastre seus projetos em PortfolioSeed.java e eles aparecem aqui.',
    tags: [],
    room: 'vitral',
    featured: false,
    status: 'PLANNED',
    repoUrl: null,
    liveUrl: null,
  },
];

export const seedSkills: Skill[] = [
  { name: 'React', level: 80, category: 'FRONTEND', tone: 'ciano' },
  { name: 'TypeScript', level: 75, category: 'FRONTEND', tone: 'ciano' },
  { name: 'Java', level: 75, category: 'BACKEND', tone: 'carmim' },
  { name: 'Spring Boot', level: 70, category: 'BACKEND', tone: 'carmim' },
  { name: 'UI / pixel art', level: 70, category: 'TOOLS', tone: 'ouro' },
];

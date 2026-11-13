/**
 * Registro tipado de todos os assets do kit "Ateliê Gótico".
 * Os PNGs vivem em /public/assets e são servidos na raiz do site.
 * Todos são pixel art: renderize sempre em múltiplos inteiros (2×, 3×, 4×).
 */

const BASE = `${import.meta.env.BASE_URL}assets`;
export const asset = (path: string) => `${BASE}/${path}`;

/* ---------- Relíquias / objetos de decoração ---------- */
export const RELICS = {
  ampulheta: { label: 'Ampulheta', w: 32, h: 48 },
  bola_de_cristal: { label: 'Bola de cristal', w: 32, h: 48 },
  calice: { label: 'Cálice', w: 32, h: 48 },
  candelabro: { label: 'Candelabro', w: 48, h: 48 },
  caveira_vela: { label: 'Caveira com vela', w: 32, h: 48 },
  chave: { label: 'Chave', w: 48, h: 24 },
  compasso: { label: 'Compasso', w: 40, h: 48 },
  coracao_rubi: { label: 'Coração de rubi', w: 32, h: 32 },
  espelho: { label: 'Espelho', w: 40, h: 52 },
  estandarte: { label: 'Estandarte', w: 32, h: 64 },
  grimorio: { label: 'Grimório', w: 40, h: 40 },
  lua_crescente: { label: 'Lua crescente', w: 40, h: 40 },
  morcego: { label: 'Morcego', w: 40, h: 24 },
  pena: { label: 'Pena', w: 40, h: 48 },
  relogio: { label: 'Relógio', w: 48, h: 48 },
  rosa: { label: 'Rosa', w: 32, h: 48 },
  selo_de_cera: { label: 'Selo de cera', w: 32, h: 32 },
  vela: { label: 'Vela', w: 32, h: 48 },
  vela_espectral: { label: 'Vela espectral', w: 32, h: 48 },
} as const;
export type RelicName = keyof typeof RELICS;
export const relicSrc = (n: RelicName) => asset(`objetos/${n}.png`);

/* ---------- Props interativos (ateliê) ---------- */
export const PROPS = {
  cadeira: { label: 'Cadeira' },
  lamparina: { label: 'Lamparina' },
  livro_aberto: { label: 'Livro aberto' },
  livro_estante: { label: 'Livro na estante' },
  tinteiro_pena: { label: 'Tinteiro e pena' },
} as const;
export type PropName = keyof typeof PROPS;
export const propSrc = (n: PropName) => asset(`interativos/${n}.png`);

/* ---------- Símbolos gravados 24×24 ---------- */
export const SIGILS = {
  crescente: 'Crescente',
  estrela: 'Estrela',
  flor_de_lis: 'Flor-de-lis',
  no_bezier: 'Nó de bézier',
  olho: 'Olho',
  pena: 'Pena',
  quadrifolio: 'Quadrifólio',
  rosa_dos_ventos: 'Rosa dos ventos',
} as const;
export type SigilName = keyof typeof SIGILS;
export const sigilSrc = (n: SigilName) => asset(`simbolos/${n}.png`);

/* ---------- Padrões seamless ---------- */
export const PATTERNS = {
  brocado_vinhas: { label: 'Brocado de vinhas', file: 'padrao_brocado_vinhas_48x64.png', w: 48, h: 64 },
  damasco_carmim: { label: 'Damasco carmim', file: 'padrao_damasco_carmim_64.png', w: 64, h: 64 },
  damasco_espectral: { label: 'Damasco espectral', file: 'padrao_damasco_espectral_64.png', w: 64, h: 64 },
  filigrana: { label: 'Filigrana', file: 'padrao_filigrana_24.png', w: 24, h: 24 },
  pedra_escura: { label: 'Pedra escura', file: 'padrao_pedra_escura_96.png', w: 96, h: 96 },
  tracado_arquiteto: { label: 'Traçado de arquiteto', file: 'padrao_tracado_arquiteto_64.png', w: 64, h: 64 },
  trelica_dourada: { label: 'Treliça dourada', file: 'padrao_trelica_dourada_24.png', w: 24, h: 24 },
} as const;
export type PatternName = keyof typeof PATTERNS;
export const patternSrc = (n: PatternName) => asset(`padroes/${PATTERNS[n].file}`);

/* ---------- Sprite sheets de partículas (horizontais) ---------- */
export const SPRITES = {
  poeira: { label: 'Poeira', file: 'poeira_4f_8x8.png', w: 8, h: 8, frames: 4, fps: 6 },
  brasa: { label: 'Brasa', file: 'brasa_6f_8x8.png', w: 8, h: 8, frames: 6, fps: 10 },
  espirito_ciano: { label: 'Espírito ciano', file: 'espirito_ciano_8f_16x24.png', w: 16, h: 24, frames: 8, fps: 10 },
  chama_quente: { label: 'Chama quente', file: 'chama_quente_6f_12x20.png', w: 12, h: 20, frames: 6, fps: 12 },
  chama_espectral: { label: 'Chama espectral', file: 'chama_espectral_6f_12x20.png', w: 12, h: 20, frames: 6, fps: 12 },
  morcego_voo: { label: 'Morcego', file: 'morcego_voo_8f_24x16.png', w: 24, h: 16, frames: 8, fps: 14 },
  petala: { label: 'Pétala', file: 'petala_8f_8x8.png', w: 8, h: 8, frames: 8, fps: 10 },
  brilho_dourado: { label: 'Brilho dourado', file: 'brilho_dourado_6f_11x11.png', w: 11, h: 11, frames: 6, fps: 12 },
  brilho_ciano: { label: 'Brilho ciano', file: 'brilho_ciano_6f_11x11.png', w: 11, h: 11, frames: 6, fps: 12 },
  anel_save: { label: 'Anel de save', file: 'anel_save_8f_48x24.png', w: 48, h: 24, frames: 8, fps: 10 },
  glifos_atelie: { label: 'Glifos do ateliê', file: 'glifos_atelie_6x_8x8.png', w: 8, h: 8, frames: 6, fps: 1 },
  pena_caindo: { label: 'Pena caindo', file: 'pena_caindo_8f_16x16.png', w: 16, h: 16, frames: 8, fps: 8 },
} as const;
export type SpriteName = keyof typeof SPRITES;
export const spriteSrc = (n: SpriteName) => asset(`particulas/${SPRITES[n].file}`);

/* ---------- Salas (cenários 480×270) ---------- */
export const ROOMS = {
  save: { label: 'Sala de save', file: 'sala_save.png', mood: 'ciano espectral · relíquia flutuante' },
  torre_relogio: { label: 'Torre do relógio', file: 'salas/sala_torre_relogio.png', mood: 'exterior noturno · lua de sangue' },
  atelie_arquiteto: { label: 'Ateliê do arquiteto', file: 'salas/sala_atelie_arquiteto.png', mood: 'musgo · nogueira · lamparina âmbar' },
  galeria_retratos: { label: 'Galeria de retratos', file: 'salas/sala_galeria_retratos.png', mood: 'madeira oxblood · chamas violeta' },
  vitral: { label: 'Sala do vitral', file: 'salas/sala_vitral.png', mood: 'vitral âmbar e safira · tapete carmim' },
} as const;
export type RoomName = keyof typeof ROOMS;
export const roomSrc = (n: RoomName) => asset(ROOMS[n].file);

/* ---------- Paleta ---------- */
export const PALETTE = [
  { name: 'Carmim profundo', token: '--gx-crimson-900', hex: '#2c0a12' },
  { name: 'Carmim', token: '--gx-crimson-600', hex: '#721a26' },
  { name: 'Rubi', token: '--gx-ruby', hex: '#c42032' },
  { name: 'Ouro velho', token: '--gx-gold-500', hex: '#8a5c14' },
  { name: 'Ouro', token: '--gx-gold-300', hex: '#e8b038' },
  { name: 'Osso', token: '--gx-bone', hex: '#aaa08a' },
  { name: 'Pedra noite', token: '--gx-stone', hex: '#262630' },
  { name: 'Índigo tinta', token: '--gx-indigo', hex: '#12142a' },
  { name: 'Ciano espectral', token: '--gx-cyan', hex: '#3ec8d4' },
  { name: 'Brilho ciano', token: '--gx-cyan-hi', hex: '#d4fff6' },
] as const;

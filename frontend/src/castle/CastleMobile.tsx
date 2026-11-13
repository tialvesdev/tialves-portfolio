// Gerado a partir do protótipo do canvas e ajustado à mão.
import { Component, Fragment } from 'react';
import { sx } from './sx';
import './castle-mobile.css';

import { sendContact, ContactError } from '../api/client';

export default class CastleMobile extends Component<any, any> {
  [key: string]: any;
  constructor(props: any) {
    super(props);
    this.state = {
      room: 0, screen: 'castle', x: 253, facing: 1, walking: false, anim: false, fade: false, busy: false,
      heroTop: null, shrink: false, warp: false, beam: false, zoom: null, flash: false, heroFx: null,
      dialog: null, visited: [true, false, false, false, false, false], seenObj: {},
      bats: [true, true, true], dying: [false, false, false], ball: null, burst: null,
      door: null, doorLit: false, quill: null, book: false, sketch: false, astro: false,
      clockRun: false, clockDone: false, bell: false,
      glassLit: { c: false, r: false, o: false, v: false }, glassSel: null, vitralDone: false,
      form: false, copied: false, errName: '', errEmail: '', errMsg: '',
      caseId: 'blume', loadTarget: 'Galeria › Blume'
    };
    this.timers = [];
    this.busy = false;
    this.finish = null;
    this.downX = null;
    this.seenCases = {};
  }
  componentDidMount() {
    this.onWinKey = (e: KeyboardEvent) => { const t = e.target as HTMLElement | null; if (t && t.closest && t.closest('.mb-root')) return; this.vals().keydown(e); };
    window.addEventListener('keydown', this.onWinKey);
  }
  componentWillUnmount() { this.clearTimers(); window.removeEventListener('keydown', this.onWinKey); }
  later(fn: any, ms: any) { this.timers.push(setTimeout(fn, ms)); }
  clearTimers() { this.timers.forEach(clearTimeout); this.timers = []; }
  begin(finish: any) { this.busy = true; this.finish = finish; this.setState({ busy: true }); }
  end() { this.busy = false; this.finish = null; this.setState({ busy: false }); }
  skipAnim() {
    if (!this.busy) return;
    this.clearTimers();
    const f = this.finish;
    this.busy = false; this.finish = null;
    this.setState({ busy: false });
    if (f) f();
  }

  // a caixa de diálogo abre sem mexer na rolagem: o foco vai para o botão depois, sem rolar a tela
  openDialog(dialog: any) {
    this.setState({ dialog });
    setTimeout(() => { const el = typeof document !== 'undefined' && document.getElementById('m-dlg-x'); if (el && el.focus) el.focus({ preventScroll: true }); }, 280);
  }

  // a cena mostra a arte inteira (480×270 reduzida a 390×219); posições em pixels da arte
  rooms() {
    const B = (id: any) => '/assets/castelo/' + id + '.png';
    return [
      { name: 'Entrada do Castelo', section: 'Início', img: B('e9afd4b64cf03155a8c7ee73caffd8ee'), feet: 249, stand: 253, alt: 'Castelo gótico vivo diante da lua cheia' },
      { name: 'Biblioteca do Desenvolvedor', section: 'Sobre', img: B('e7bd81ee852a0df2b911ce9c4e3b9650'), feet: 243, stand: 180, alt: 'Biblioteca com estante, mesa com diário e tinteiro, prancheta e astrolábio' },
      { name: 'Torre do Relógio', section: 'Experiência', img: B('114a298f2749c8a0e82f2753ca770df9'), feet: 257, stand: 273, alt: 'Terraço da torre com relógio e lua vermelha' },
      { name: 'Galeria de Retratos', section: 'Projetos', img: B('cde5d3888e3344c6bdcfd1c7365d7cd8'), feet: 248, stand: 110, alt: 'Galeria com três retratos' },
      { name: 'Capela do Vitral', section: 'Habilidades', img: B('da65cfdc72632bec469fe25cf2ccc762'), feet: 257, stand: 227, alt: 'Capela com vitral colorido' },
      { name: 'Sala do Portal', section: 'Contato', img: B('0f9f7443725d3d6f07021aa313a731a7'), feet: 245, stand: 233, alt: 'Sala do portal: altar com cristal à direita e um círculo rúnico no chão' }
    ];
  }

  texts() {
    return {
      estante: { who: 'Estante · formação', title: 'Análise e Desenvolvimento de Sistemas', text: 'Tecnólogo pela SPTech, com projetos em PostgreSQL, Kubernetes, GitLab CI/CD, MVVM e Git Flow.', facts: ['SPTech · 2023–2025', 'ETEC de Guaianases · Técnico · 2021–2022'] },
      diario: { who: 'Diário do Tiago', title: 'Desenvolvedor Full Stack', text: 'Gosto de interface bem acabada e de código que outra pessoa consegue manter. Quero construir aplicações escaláveis num time que leve qualidade a sério.', facts: ['React · TypeScript', 'Node.js · Nest.js', 'Java · Spring Boot'] },
      prancheta: { who: 'Prancheta', title: 'UI Designer na PwC', text: 'Desenhava as telas no Figma antes de construir. Este castelo saiu da mesma prancheta.', facts: ['Figma', 'Material-UI', 'Acessibilidade'] },
      astrolabio: { who: 'Astrolábio · idiomas', title: 'Inglês fluente · Alemão básico', text: 'Português nativo, inglês fluente e alemão básico.', facts: ['Português · nativo', 'Inglês · fluente', 'Alemão · básico'] },
      relogio: { who: 'Relógio da torre', title: 'PwC Brasil · 2023 → abr. 2026', text: 'Três anos na PwC Brasil, do estágio a desenvolvedor front-end e UI designer.', facts: ['Estagiário', 'Desenvolvedor Front-End', 'UI Designer'] },
      sent: { who: 'Sistema', title: 'Progresso salvo', text: 'Sua mensagem foi gravada no cristal.', facts: ['tialves.dev@gmail.com'] }
    };
  }

  objDefs() {
    const B = (id: any) => '/assets/castelo/' + id + '.png';
    return [
      { id: 'estante', label: 'Estante', icon: B('a2f8c216c00c5ef75e68b2429d2325e2'), walk: 133, face: -1, spot: [22, 32, 110, 173] },
      { id: 'diario', label: 'Diário', icon: B('07c24342622cb9cdc38810582f558a16'), walk: 187, face: 1, spot: [213, 167, 40, 23] },
      { id: 'prancheta', label: 'Prancheta', icon: B('b2d9eb6dc4ed18aab87d777357ea2c2a'), walk: 313, face: 1, spot: [345, 145, 57, 73] },
      { id: 'astrolabio', label: 'Astrolábio', icon: B('eb800164571ca545ff9644118cc5b192'), walk: 390, face: 1, spot: [431, 137, 37, 77] }
    ];
  }

  // os morcegos-bug voam por cima do painel de texto, cada um numa altura e num ritmo
  bugDefs() {
    return [
      { type: 'Estado', fix: 'Rastreado e corrigido com Redux e Context API', top: 330, t: 9, d: 0, rev: false },
      { type: 'Interface', fix: 'Coberto por teste com Jest e Testing Library', top: 480, t: 11, d: -4, rev: true },
      { type: 'Performance', fix: 'Render otimizado e pipeline de CI/CD verde', top: 640, t: 13, d: -8, rev: false }
    ];
  }

  portraitDefs() {
    const B = (id: any) => '/assets/castelo/' + id + '.png';
    return [
      { id: 'heelp', title: 'Heelp', sub: 'Fórum para estudantes de cursos técnicos', sx: 63, sy: 78, sw: 72, sh: 58, thumb: B('2f27f4de6e0248b09dd6fca1050f22c2') },
      { id: 'blume', title: 'Blume', sub: 'Plataforma full-stack de beleza', sx: 195, sy: 71, sw: 90, sh: 70, thumb: B('da65cfdc72632bec469fe25cf2ccc762') },
      { id: 'atelie', title: 'Ateliê Gótico', sub: 'Este portfólio', sx: 345, sy: 78, sw: 72, sh: 58, thumb: B('e9afd4b64cf03155a8c7ee73caffd8ee') }
    ];
  }

  cases() {
    const B = (id: any) => '/assets/castelo/' + id + '.png';
    return {
      blume: { title: 'Blume', kicker: 'Galeria › Blume', img: B('da65cfdc72632bec469fe25cf2ccc762'), full: true,
        sub: 'Plataforma full-stack de beleza: React em micro-frontends e microsserviços Node.js com Docker.',
        chips: ['React', 'Node.js', 'Docker', 'Tailwind'], arch: ['Front-end React', 'APIs REST', 'Microsserviços Docker', 'Banco [ confirmar ]'],
        note: 'Autenticação, tratamento de erros, acessibilidade e performance de ponta a ponta.' },
      heelp: { title: 'Heelp', kicker: 'Galeria › Heelp', img: B('2f27f4de6e0248b09dd6fca1050f22c2'), full: false,
        sub: 'Fórum para estudantes de cursos técnicos trocarem conhecimento.',
        chips: ['[ stack ]', '[ ano ]'], arch: ['Estudantes', 'Perguntas', 'Respostas', '[ stack ]'],
        note: '[ Conte o problema que o Heelp resolve e o que você construiu nele. ]' },
      atelie: { title: 'Ateliê Gótico', kicker: 'Galeria › Ateliê Gótico', img: B('e9afd4b64cf03155a8c7ee73caffd8ee'), full: false,
        sub: 'Este portfólio: componentes em pixel art com React e TypeScript, API em Java com Spring Boot.',
        chips: ['React', 'TypeScript', 'Java', 'Spring Boot'], arch: ['Componentes React', 'API REST', 'Spring Boot', 'Dados do portfólio'],
        note: '18 componentes tipados, 89 assets originais e 5 endpoints com testes.' }
    };
  }

  paneDefs() {
    return [
      { k: 'c', label: 'Front-end', kicker: 'Vitral ciano', title: 'Front-end', chips: ['React', 'TypeScript', 'Angular', 'Redux', 'Tailwind', 'Material-UI'] },
      { k: 'r', label: 'Back-end', kicker: 'Vitral carmim', title: 'Back-end e dados', chips: ['Node.js', 'Nest.js', 'Java', 'Spring Boot', 'APIs REST', 'PostgreSQL'] },
      { k: 'o', label: 'Qualidade', kicker: 'Vitral de ouro', title: 'Qualidade e DevOps', chips: ['Jest', 'Testing Library', 'CI/CD', 'Docker', 'Kubernetes', 'GitLab'] },
      { k: 'v', label: 'Design', kicker: 'Vitral roxo', title: 'Design e idiomas', chips: ['Figma', 'Acessibilidade', 'Português · nativo', 'Inglês · fluente', 'Alemão · básico'] }
    ];
  }

  markVisited(i: any) { const v = this.state.visited.slice(); v[i] = true; return v; }
  roomFx() { return { quill: null, book: false, astro: false, bell: false, glassSel: null, ball: null, burst: null, heroFx: null, door: null, doorLit: false }; }
  roomFinal(i: any) { return { room: i, x: this.rooms()[i].stand, walking: false, anim: false, fade: false, heroTop: null, warp: false, beam: false, flash: false, visited: this.markVisited(i), form: false, ...this.roomFx() }; }

  go(dir: any) {
    if (this.busy || this.state.screen !== 'castle') return;
    const room = this.state.room;
    if (room === 5 && dir > 0) return this.teleport(0);
    if (room === 0 && dir < 0) return;
    if (room === 0 && dir > 0) return this.enterCastle();
    if (room === 1 && dir < 0) return this.exitCastle();
    const next = room + dir;
    this.begin(() => this.setState(this.roomFinal(next)));
    this.setState({ walking: true, facing: dir, anim: true, x: dir > 0 ? 500 : -60, heroTop: null, dialog: null });
    this.later(() => this.setState({ fade: true }), 420);
    this.later(() => this.setState({ ...this.roomFinal(next), anim: false, walking: true, x: dir > 0 ? -60 : 500, fade: true }), 600);
    this.later(() => this.setState({ fade: false, anim: true, x: this.rooms()[next].stand }), 650);
    this.later(() => { this.setState({ walking: false, anim: false }); this.end(); }, 1250);
  }

  // portão: anda até a porta, ela abre, sobe diminuindo, some na luz e a porta bate
  enterCastle() {
    if (this.busy) return;
    this.begin(() => this.setState(this.roomFinal(1)));
    this.setState({ walking: true, anim: true, facing: 359 >= this.state.x ? 1 : -1, x: 359, heroTop: null, dialog: null });
    this.later(() => { this.setState({ walking: false, anim: false, facing: 1, door: 'opening' }); this.playDoor('open'); }, 600);
    this.later(() => this.setState({ door: 'open', doorLit: true, heroFx: 'enter', walking: true, heroTop: 147 }), 950);
    this.later(() => this.setState({ walking: false, heroFx: 'enter dissolve' }), 1450);
    this.later(() => { this.setState({ heroFx: 'gone', door: 'closing', doorLit: false }); this.playDoor('close'); }, 1800);
    this.later(() => this.setState({ fade: true }), 2050);
    this.later(() => this.setState({ ...this.roomFinal(1), x: -60, fade: true }), 2250);
    this.later(() => this.setState({ fade: false, anim: true, walking: true, facing: 1, x: this.rooms()[1].stand }), 2300);
    this.later(() => { this.setState({ walking: false, anim: false }); this.end(); }, 2900);
  }

  // volta à entrada: sai da biblioteca e reaparece no portão, crescendo enquanto desce
  exitCastle() {
    if (this.busy) return;
    const stand = this.rooms()[0].stand;
    this.begin(() => this.setState({ ...this.roomFinal(0), facing: -1 }));
    this.setState({ walking: true, facing: -1, anim: true, x: -60, heroTop: null, dialog: null });
    this.later(() => this.setState({ fade: true }), 420);
    this.later(() => this.setState({ ...this.roomFinal(0), x: 359, facing: 1, heroFx: 'enter gone', heroTop: 147, fade: true }), 600);
    this.later(() => this.setState({ fade: false }), 660);
    this.later(() => { this.setState({ door: 'opening' }); this.playDoor('open'); }, 800);
    this.later(() => this.setState({ door: 'open', doorLit: true, heroFx: 'enter materialize' }), 1150);
    this.later(() => this.setState({ heroFx: 'exit', heroTop: null, walking: true }), 1650);
    this.later(() => this.setState({ heroFx: null, anim: true, walking: true, facing: -1, x: stand }), 2150);
    this.later(() => { this.setState({ door: 'closing', doorLit: false }); this.playDoor('close'); }, 2250);
    this.later(() => { this.setState({ walking: false, anim: false, door: null }); this.end(); }, 2800);
  }

  travel(i: any) {
    if (this.busy || this.state.screen !== 'castle' || i === this.state.room) return;
    this.begin(() => this.setState(this.roomFinal(i)));
    this.setState({ fade: true, dialog: null });
    this.later(() => this.setState({ ...this.roomFinal(i), fade: true }), 180);
    this.later(() => { this.setState({ fade: false }); this.end(); }, 260);
  }

  // teleporte a partir do círculo rúnico, com os sons do desktop
  teleport(to: any) {
    if (this.busy) return;
    const padX = 423;
    this.begin(() => this.setState(this.roomFinal(to)));
    this.setState({ walking: true, anim: true, facing: padX - 16 >= this.state.x ? 1 : -1, x: padX - 16, heroTop: null, dialog: null, form: false });
    this.later(() => { this.setState({ walking: false, anim: false, beam: true }); this.playSfx('charge'); this.playSfx('beam'); }, 600);
    this.later(() => { this.setState({ warp: true }); this.playSfx('dissolve'); }, 900);
    this.later(() => this.setState({ flash: true }), 1150);
    this.later(() => this.setState({ ...this.roomFinal(to), warp: true, beam: true, flash: true }), 1400);
    this.later(() => this.setState({ flash: false }), 1460);
    this.later(() => { this.setState({ warp: false }); this.playSfx('materialize'); }, 1650);
    this.later(() => { this.setState({ beam: false }); this.end(); }, 2050);
  }

  // itens da biblioteca: anda até o objeto, a animação e o som tocam, e o texto vem no fim;
  // da segunda vez, o texto aparece na hora
  examine(o: any) {
    if (this.busy) return;
    const dialog = (this.texts() as Record<string, any>)[o.id];
    if (this.state.seenObj[o.id]) { this.openDialog(dialog); return; }
    const seenObj = { ...this.state.seenObj, [o.id]: true };
    const finals: Record<string, any> = { estante: { book: false }, diario: { quill: null }, prancheta: { sketch: true }, astrolabio: { astro: false } };
    this.begin(() => { this.setState({ x: o.walk, walking: false, anim: false, facing: o.face, seenObj, ...finals[o.id] }); this.openDialog(dialog); });
    this.setState({ walking: true, anim: true, facing: o.walk >= this.state.x ? 1 : -1, x: o.walk, dialog: null });
    const steps = ({
      estante: [[0, { book: true }, 'slide'], [450, null, 'flip'], [1500, { book: false }]],
      diario: [[0, { quill: 'lift' }, 'clink'], [300, { quill: 'fly' }, 'swish'], [750, { quill: 'write' }, 'scratch'], [1950, { quill: 'back' }, 'swish'], [2400, { quill: 'drop' }, 'clink'], [2700, { quill: null }]],
      prancheta: [[0, { sketch: true }, 'sketch']],
      astrolabio: [[0, { astro: true }, 'astro'], [1400, { astro: false }]]
    } as Record<string, any[]>)[o.id];
    const at = ({ estante: 1100, diario: 2700, prancheta: 1500, astrolabio: 1400 } as Record<string, number>)[o.id];
    this.later(() => {
      this.setState({ walking: false, anim: false, facing: o.face });
      steps.forEach(([t, st, snd]: any) => this.later(() => { if (st) this.setState(st); if (snd) this.playSfx(snd); }, t));
      this.later(() => { this.setState({ seenObj }); this.openDialog(dialog); this.end(); }, at);
    }, 700);
  }

  // relógio: os ponteiros correm até a meia-noite, o sino toca e o texto aparece
  clockAct() {
    if (this.busy) return;
    const dialog = this.texts().relogio;
    if (this.state.clockDone) { this.openDialog(dialog); return; }
    this.begin(() => { this.setState({ clockRun: false, clockDone: true, bell: false }); this.openDialog(dialog); });
    this.setState({ clockRun: true, dialog: null });
    this.later(() => { this.setState({ clockRun: false, clockDone: true, bell: true }); this.playBell(); }, 1450);
    this.later(() => { this.openDialog(dialog); this.end(); }, 1900);
    this.later(() => this.setState({ bell: false }), 3500);
  }

  // bola de fogo do Tiago (na cena) até o morcego (sobre o texto)
  hitBat(i: any, e: any) {
    if (this.inFlight || !this.state.bats[i] || this.state.dying[i]) return;
    const el = e && e.currentTarget;
    const root = el && el.closest && el.closest('.mb-root');
    if (!el || !root) return;
    const q = root.getBoundingClientRect(), r = el.getBoundingClientRect();
    const k = root.offsetWidth / (q.width || 1);
    const tx = Math.round((r.left - q.left) * k + 22), ty = Math.round((r.top - q.top) * k + 22);
    const s = this.state;
    const top = s.heroTop != null ? s.heroTop : this.rooms()[s.room].feet - 53;
    const hx = Math.round((s.x + 16) * 0.8125), hy = Math.round(56 + (top + 20) * 0.8125);
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dur = reduce ? 1 : Math.round(Math.min(520, Math.max(260, Math.hypot(tx - hx, ty - hy) * 0.9)));
    const dying = s.dying.slice(); dying[i] = true;
    this.inFlight = true;
    this.playFire(dur);
    this.setState({ ball: { x: tx, y: ty }, dying, facing: tx / 0.8125 >= s.x + 16 ? 1 : -1 });
    requestAnimationFrame(() => {
      const f = root.querySelector('.mb-fire');
      if (f && f.animate) f.animate([{ transform: 'translate(' + (hx - tx) + 'px, ' + (hy - ty) + 'px)' }, { transform: 'translate(0px, 0px)' }], { duration: dur, easing: 'linear', fill: 'both' });
    });
    setTimeout(() => {
      this.inFlight = false;
      this.playBoom();
      this.setState({ ball: null, burst: { x: tx, y: ty } });
      setTimeout(() => {
        const bats = this.state.bats.slice(); bats[i] = false;
        this.setState({ bats, burst: null });
        if (!bats.some(Boolean)) {
          this.playJingle();
          setTimeout(() => { const qn = typeof document !== 'undefined' && document.getElementById('m-quest'); if (qn && qn.scrollIntoView) { qn.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); if (qn.focus) qn.focus({ preventScroll: true }); } }, 120);
        }
      }, 500);
    }, dur + 20);
  }

  // vitral: a parte tocada acende com luz de fora; as quatro juntas fecham a capela
  lightPane(k: any) {
    if (this.busy) return;
    const s = this.state;
    const lit = { ...s.glassLit, [k]: true };
    const all = ['c', 'r', 'o', 'v'].every((q: any) => lit[q]);
    if (!s.glassLit[k]) this.playGlass(k);
    if (all && !s.vitralDone) this.playVitral();
    this.setState({ glassSel: k, glassLit: lit, vitralDone: s.vitralDone || all });
  }

  caseFinal(id: any) { return { screen: 'case', caseId: id, x: 75, heroTop: 193, shrink: false, warp: false, anim: false, walking: false, zoom: null, flash: false, dialog: null, facing: 1, heroFx: null }; }

  openPortrait(p: any) {
    if (this.busy) return;
    const cx = p.sx + p.sw / 2, cy = p.sy + p.sh / 2;
    this.begin(() => this.setState(this.caseFinal(p.id)));
    this.setState({ walking: true, anim: true, facing: cx - 16 >= this.state.x ? 1 : -1, x: cx - 16, heroTop: null, dialog: null });
    this.later(() => this.setState({ walking: false, anim: true, heroTop: cy - 26, shrink: true }), 600);
    this.later(() => this.setState({ zoom: { x: cx, y: cy } }), 800);
    this.later(() => this.setState({ flash: true }), 1350);
    const quick = !!this.seenCases[p.id];
    this.seenCases[p.id] = true;
    if (!quick) this.later(() => this.setState({ screen: 'loading', zoom: null, flash: false, shrink: false, heroTop: null, anim: false, caseId: p.id, loadTarget: 'Galeria › ' + p.title }), 1550);
    this.later(() => {
      this.setState({ ...this.caseFinal(p.id), shrink: true, heroTop: 60, x: 75 });
      this.later(() => this.setState({ anim: true, shrink: false, heroTop: 193 }), 80);
      this.later(() => { this.setState({ anim: false }); this.end(); }, 700);
    }, quick ? 1550 : 1550 + 950);
  }

  leaveCase() {
    if (this.busy) return;
    const p = this.portraitDefs().find((q: any) => q.id === this.state.caseId) || this.portraitDefs()[1];
    const cx = p.sx + p.sw / 2;
    const final = { ...this.roomFinal(3), screen: 'castle', x: cx - 16, shrink: false, zoom: null };
    this.begin(() => this.setState(final));
    this.setState({ anim: true, heroTop: 60, shrink: true });
    this.later(() => this.setState({ flash: true }), 500);
    this.later(() => this.setState({ ...final, heroTop: p.sy + p.sh / 2 - 26, shrink: true, flash: true }), 750);
    this.later(() => this.setState({ flash: false }), 820);
    this.later(() => this.setState({ anim: true, shrink: false, heroTop: null }), 1000);
    this.later(() => { this.setState({ anim: false }); this.end(); }, 1600);
  }

  sendForm() {
    const v = (id: any) => { const el = typeof document !== 'undefined' && (document.getElementById(id) as HTMLInputElement | null); return el ? String(el.value || '').trim() : ''; };
    const name = v('m-nome'), email = v('m-email'), msg = v('m-msg');
    const errName = name ? '' : 'Escreva seu nome.';
    const errEmail = !email ? 'Escreva seu e-mail.' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Esse e-mail parece incompleto.';
    const errMsg = msg.length >= 10 ? '' : 'Escreva a mensagem com pelo menos 10 caracteres.';
    this.setState({ errName, errEmail, errMsg });
    if (errName || errEmail || errMsg) {
      const first = errName ? 'm-nome' : errEmail ? 'm-email' : 'm-msg';
      setTimeout(() => { const el = typeof document !== 'undefined' && document.getElementById(first); if (el) el.focus(); }, 30);
      return;
    }
    if (this.sending) return;
    this.sending = true;
    this.setState({ sending: true, errGeneral: '' });
    sendContact({ name, email, message: msg })
      .then(() => { this.setState({ form: false }); this.openDialog(this.texts().sent); })
      .catch((e: unknown) => { const fe = e instanceof ContactError ? e.fieldErrors : {}; this.setState({ errName: fe.name || '', errEmail: fe.email || '', errMsg: fe.message || '', errGeneral: e instanceof Error ? e.message : 'Não foi possível enviar agora.' }); })
      .finally(() => { this.sending = false; this.setState({ sending: false }); });
  }

  ctx() {
    if (typeof window === 'undefined') return null;
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    if (!this.audio) this.audio = new AC();
    if (this.audio.state === 'suspended') this.audio.resume();
    return this.audio;
  }

  tone(ac: any, type: any, freq: any, start: any, dur: any, vol: any) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, ac.currentTime + start);
    g.gain.linearRampToValueAtTime(vol, ac.currentTime + start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + dur);
    o.connect(g); g.connect(ac.destination);
    o.start(ac.currentTime + start); o.stop(ac.currentTime + start + dur + 0.05);
  }

  noiseSrc(ac: any, dur: any) {
    const b = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const n = ac.createBufferSource(); n.buffer = b; return n;
  }

  playSfx(name: any) {
    if (name === 'bell') return this.playBell();
    const ac = this.ctx(); if (!ac) return;
    const now = ac.currentTime;
    const burst = (t: any, dur: any, type: any, f0: any, f1: any, q: any, vol: any) => {
      const n = this.noiseSrc(ac, dur + 0.02); const fl = ac.createBiquadFilter(); fl.type = type; fl.Q.value = q;
      fl.frequency.setValueAtTime(f0, now + t); fl.frequency.exponentialRampToValueAtTime(f1, now + t + dur);
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, now + t); g.gain.linearRampToValueAtTime(vol, now + t + Math.min(0.02, dur / 3)); g.gain.exponentialRampToValueAtTime(0.0001, now + t + dur);
      n.connect(fl); fl.connect(g); g.connect(ac.destination); n.start(now + t);
    };
    const sweep = (t: any, dur: any, type: any, f0: any, f1: any, vol: any) => {
      const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, now + t); o.frequency.exponentialRampToValueAtTime(f1, now + t + dur);
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, now + t); g.gain.linearRampToValueAtTime(vol, now + t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, now + t + dur);
      o.connect(g); g.connect(ac.destination); o.start(now + t); o.stop(now + t + dur + 0.05);
    };
    const S = {
      // livro raspando na prateleira e um toque surdo de madeira
      slide: () => { burst(0, 0.32, 'lowpass', 1400, 500, 0.7, 0.16); this.tone(ac, 'sine', 120, 0.3, 0.18, 0.12); },
      // páginas virando e o pequeno tema de item obtido
      flip: () => { [0, 0.11, 0.2].forEach((t: any) => burst(t, 0.07, 'highpass', 2600, 4200, 0.8, 0.1)); [[784, 0.28], [988, 0.36], [1175, 0.44], [1568, 0.52]].forEach(([f, t]: any) => this.tone(ac, 'square', f, t, 0.16, 0.035)); },
      // pena batendo no vidro do tinteiro
      clink: () => { this.tone(ac, 'sine', 1860, 0, 0.18, 0.05); this.tone(ac, 'sine', 2790, 0.01, 0.12, 0.025); },
      swish: () => burst(0, 0.28, 'bandpass', 900, 2600, 1.2, 0.12),
      // a pena arranhando o papel em traços curtos
      scratch: () => { let t = 0; for (let i = 0; i < 14; i++) { const d = 0.04 + ((i * 37) % 5) / 100; burst(t, d, 'bandpass', 3200 + ((i * 53) % 9) * 120, 3600, 2.2, 0.1); t += d + 0.03 + ((i * 29) % 4) / 100; } },
      // lápis riscando a prancheta: traços mais longos e graves
      sketch: () => { let t = 0; for (let i = 0; i < 7; i++) { const d = 0.12 + ((i * 41) % 7) / 100; burst(t, d, 'bandpass', 1500 + ((i * 67) % 5) * 150, 2100, 1.4, 0.11); t += d + 0.05; } },
      // anéis de metal girando e se alinhando
      astro: () => { [660, 880, 990, 1320, 1760].forEach((f: any, i: any) => { this.tone(ac, 'triangle', f, i * 0.09, 0.5, 0.04); }); burst(0, 0.5, 'bandpass', 4000, 6000, 3, 0.03); },
      // teleporte: o círculo carrega, o feixe sobe, o corpo se desfaz e se refaz
      charge: () => { sweep(0, 0.9, 'sawtooth', 90, 420, 0.035); sweep(0, 0.9, 'sine', 180, 840, 0.05); },
      beam: () => { burst(0, 0.6, 'bandpass', 400, 3200, 1.5, 0.12); this.tone(ac, 'sine', 1318.5, 0.05, 0.6, 0.04); },
      dissolve: () => { [1568, 1318.5, 1046.5, 784, 659.3, 523.3].forEach((f: any, i: any) => this.tone(ac, 'sine', f, i * 0.07, 0.3, 0.04)); burst(0, 0.5, 'highpass', 3000, 6000, 0.7, 0.05); },
      materialize: () => { [523.3, 659.3, 784, 1046.5, 1318.5].forEach((f: any, i: any) => this.tone(ac, 'sine', f, i * 0.07, 0.4, 0.045)); burst(0, 0.45, 'bandpass', 2400, 800, 1.2, 0.06); this.tone(ac, 'sine', 196, 0.35, 0.4, 0.08); }
    };
    const fx = (S as Record<string, () => void>)[name]; if (fx) fx();
  }

  playBell() {
    const ac = this.ctx(); if (!ac) return;
    [0, 0.6].forEach((s: any) => { this.tone(ac, 'sine', 196, s, 1.4, 0.12); this.tone(ac, 'sine', 392, s, 0.9, 0.05); this.tone(ac, 'sine', 587.3, s, 0.5, 0.03); });
  }

  playFire(ms: any) {
    const ac = this.ctx(); if (!ac) return;
    const now = ac.currentTime, dur = Math.max(0.25, (ms || 300) / 1000);
    const n = this.noiseSrc(ac, dur + 0.05);
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(500, now); bp.frequency.exponentialRampToValueAtTime(2200, now + dur);
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.16, now + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    n.connect(bp); bp.connect(g); g.connect(ac.destination); n.start(now);
    const o = ac.createOscillator(); o.type = 'square';
    o.frequency.setValueAtTime(620, now); o.frequency.exponentialRampToValueAtTime(160, now + 0.16);
    const og = ac.createGain(); og.gain.setValueAtTime(0.05, now); og.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    o.connect(og); og.connect(ac.destination); o.start(now); o.stop(now + 0.2);
  }

  playBoom() {
    const ac = this.ctx(); if (!ac) return;
    const now = ac.currentTime;
    const n = this.noiseSrc(ac, 0.32);
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(1600, now); lp.frequency.exponentialRampToValueAtTime(180, now + 0.3);
    const g = ac.createGain(); g.gain.setValueAtTime(0.28, now); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    n.connect(lp); lp.connect(g); g.connect(ac.destination); n.start(now);
    const o = ac.createOscillator(); o.type = 'square';
    o.frequency.setValueAtTime(140, now); o.frequency.exponentialRampToValueAtTime(40, now + 0.22);
    const og = ac.createGain(); og.gain.setValueAtTime(0.07, now); og.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
    o.connect(og); og.connect(ac.destination); o.start(now); o.stop(now + 0.26);
  }

  playDoor(kind: any) {
    const ac = this.ctx(); if (!ac) return;
    const now = ac.currentTime;
    const noise = (dur: any) => { const b = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = ac.createBufferSource(); s.buffer = b; return s; };
    const creak = (start: any, dur: any, f0: any, f1: any, vol: any) => {
      const o = ac.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(f0, now + start); o.frequency.linearRampToValueAtTime(f1, now + start + dur * 0.6); o.frequency.linearRampToValueAtTime(f0 * 0.9, now + start + dur);
      const lfo = ac.createOscillator(); lfo.frequency.value = 23; const lg = ac.createGain(); lg.gain.value = 18; lfo.connect(lg); lg.connect(o.frequency);
      const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 3;
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, now + start); g.gain.linearRampToValueAtTime(vol, now + start + 0.08); g.gain.linearRampToValueAtTime(vol * 0.7, now + start + dur * 0.8); g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      o.connect(bp); bp.connect(g); g.connect(ac.destination);
      o.start(now + start); lfo.start(now + start); o.stop(now + start + dur + 0.05); lfo.stop(now + start + dur + 0.05);
    };
    const thud = (start: any, vol: any) => {
      const o = ac.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(90, now + start); o.frequency.exponentialRampToValueAtTime(38, now + start + 0.4);
      const g = ac.createGain(); g.gain.setValueAtTime(vol, now + start); g.gain.exponentialRampToValueAtTime(0.0001, now + start + 0.6);
      o.connect(g); g.connect(ac.destination); o.start(now + start); o.stop(now + start + 0.7);
      const n = noise(0.3); const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400;
      const ng = ac.createGain(); ng.gain.setValueAtTime(vol * 0.8, now + start); ng.gain.exponentialRampToValueAtTime(0.0001, now + start + 0.25);
      n.connect(lp); lp.connect(ng); ng.connect(ac.destination); n.start(now + start);
    };
    const rumble = (start: any, dur: any, vol: any) => { const n = noise(dur); const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180; const g = ac.createGain(); g.gain.setValueAtTime(0.0001, now + start); g.gain.linearRampToValueAtTime(vol, now + start + 0.1); g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur); n.connect(lp); lp.connect(g); g.connect(ac.destination); n.start(now + start); };
    if (kind === 'open') { thud(0, 0.22); creak(0.05, 0.9, 95, 140, 0.05); rumble(0, 0.9, 0.18); }
    else { creak(0, 0.5, 130, 90, 0.045); rumble(0, 0.5, 0.15); thud(0.5, 0.45); thud(0.62, 0.2); }
  }

  playJingle() {
    const ac = this.ctx(); if (!ac) return;
    // arpejo original de "missão cumprida": dó maior subindo, pausa curta, resolução longa
    [[523.25, 0, 0.11], [659.25, 0.11, 0.11], [783.99, 0.22, 0.11], [1046.5, 0.33, 0.16], [880, 0.52, 0.1], [1046.5, 0.62, 0.1], [1318.5, 0.72, 0.5]]
      .forEach(([f, s, d]: any) => this.tone(ac, 'square', f, s, d, 0.05));
    [[130.81, 0, 0.3], [196, 0.33, 0.3], [261.63, 0.72, 0.5]].forEach(([f, s, d]: any) => this.tone(ac, 'triangle', f, s, d, 0.09));
  }

  playGlass(k: any) {
    const ac = this.ctx(); if (!ac) return;
    const f = ({ c: 659.25, r: 523.25, o: 783.99, v: 880 } as Record<string, number>)[k];
    this.tone(ac, 'sine', f, 0, 0.9, 0.09); this.tone(ac, 'triangle', f * 2, 0.02, 0.5, 0.03);
  }

  playVitral() {
    const ac = this.ctx(); if (!ac) return;
    [523.25, 659.25, 783.99, 880, 1046.5, 1318.5].forEach((fq: any, i: any) => this.tone(ac, 'sine', fq, 0.25 + i * 0.12, 0.9, 0.07));
  }

  kwParts(text: any) {
    const K = ['Spring Boot', 'Testing Library', 'Context API', 'Material-UI', 'Git Flow', 'micro-frontends', 'microsserviços', 'APIs REST', 'PwC Brasil', 'TypeScript', 'PostgreSQL', 'Kubernetes', 'Tailwind', 'Angular', 'Node.js', 'Nest.js', 'Appian', 'Docker', 'Redux', 'React', 'Figma', 'Axios', 'Fetch', 'MVVM', 'CI/CD', 'GitLab', 'Jest', 'Java', 'SPTech', 'UI designer', 'UI Designer', 'full stack', 'full-stack', 'acessibilidade', 'Acessibilidade'];
    const out = [];
    let rest = String(text || ''), buf = '';
    while (rest.length) {
      const hit = K.find((k: any) => rest.startsWith(k));
      if (hit) { if (buf) out.push({ t: buf, cls: '' }); out.push({ t: hit, cls: 'kw' }); buf = ''; rest = rest.slice(hit.length); }
      else { buf += rest[0]; rest = rest.slice(1); }
    }
    if (buf) out.push({ t: buf, cls: '' });
    return out;
  }

  // ambiente: halos, chamas, poeira e brilhos, em pixels da arte
  ambient(room: any) {
    const P: Record<string, string[]> = { amber: ['rgba(255,200,110,.42)', 'rgba(255,170,70,.2)', 'rgba(255,150,60,.08)'], cyan: ['rgba(140,245,255,.45)', 'rgba(80,220,235,.2)', 'rgba(60,200,220,.08)'], lilac: ['rgba(230,220,255,.42)', 'rgba(170,150,255,.2)', 'rgba(140,120,240,.08)'] };
    const H = (x: any, y: any, sz: any, c: any, d: any) => ({ style: 'left: ' + (x - sz / 2) + 'px; top: ' + (y - sz / 2) + 'px; width: ' + sz + 'px; height: ' + sz + 'px; --c: ' + P[c][0] + '; --c2: ' + P[c][1] + '; --c3: ' + P[c][2] + '; animation-delay: ' + d + 's' });
    const flameList = room === 3 ? [[30, 99], [42, 99], [154, 99], [166, 99], [314, 99], [326, 99], [438, 99], [450, 99], [220, 152], [260, 152]] : room === 4 ? (() => { const l = [[66, 144], [80, 138], [96, 140], [112, 138], [126, 144], [40, 170], [50, 164], [60, 172]]; return l.concat(l.map(([x, y]: any) => [480 - x, y])); })() : [];
    const flames = flameList.map(([cx, by]: any, i: any) => ({ cls: room === 3 ? 'mb-flame roxa' : 'mb-flame', style: 'left: ' + (cx - 2) + 'px; top: ' + (by - 6) + 'px; animation-duration: ' + (0.58 + ((i * 37) % 30) / 100).toFixed(2) + 's; animation-delay: ' + (-((i * 53) % 70) / 100).toFixed(2) + 's' }));
    let halos = flameList.map(([cx, by]: any, i: any) => H(cx, by - 3, room === 3 ? 24 : 22, room === 3 ? 'lilac' : 'amber', -((i * 0.37) % 1.9).toFixed(2)));
    if (room === 0) halos = [H(205, 157, 50, 'cyan', 0), H(356, 183, 32, 'amber', -0.6), H(393, 183, 32, 'amber', -1.2)];
    if (room === 1) halos = [H(261, 167, 43, 'amber', 0)];
    if (room === 2) halos = [H(83, 84, 50, 'cyan', 0)];
    const r = (i: any, k: any) => { let n = i * 374761393 + k * 668265263; n = (n ^ (n >>> 13)) * 1274126177; return ((n ^ (n >>> 16)) >>> 0) / 4294967295; };
    const box = room === 3 ? [50, 110, 383, 110] : room === 4 ? [200, 140, 80, 100] : null;
    const motes = box ? Array.from({ length: room === 3 ? 10 : 14 }, (_: any, i: any) => ({ style: 'left: ' + (box[0] + Math.round(r(i, room) * box[2])) + 'px; top: ' + (box[1] + Math.round(r(i, room + 9) * box[3])) + 'px; background: ' + (room === 4 ? (i % 3 ? '#ffe6a0' : '#ffffff') : (i % 2 ? '#d8ccff' : '#f6dc8c')) + '; animation-duration: ' + (6 + r(i, 5) * 5).toFixed(1) + 's; animation-delay: ' + (-r(i, 7) * 10).toFixed(1) + 's' })) : [];
    const G = (x: any, y: any, cls: any, d: any) => ({ cls, style: 'left: ' + (x - 2) + 'px; top: ' + (y - 2) + 'px; animation-delay: ' + d + 's' });
    const glints = room === 0 ? [G(335, 37, 'mb-glint', 0), G(412, 31, 'mb-glint', 1.4), G(396, 87, 'mb-glint', 2.8)] : room === 3 ? [[65, 80], [131, 80], [65, 133], [131, 133], [200, 76], [280, 76], [200, 136], [280, 136], [350, 80], [415, 80], [350, 133], [415, 133]].map(([x, y]: any, i: any) => G(x, y, 'mb-glint gold', ((i * 7) % 12) * 0.5)) : [];
    return { flames, halos, motes, glints };
  }

  vals() {
    const s = this.state;
    const rooms = this.rooms();
    const r = rooms[s.room];
    const defs = this.bugDefs();
    const fixed = 3 - s.bats.filter(Boolean).length;
    const c = (this.cases() as Record<string, any>)[s.caseId] || this.cases().blume;
    const d = s.dialog;
    const nextName = s.room === 5 ? 'Teleporte à entrada' : s.room === 0 ? 'Entrar no castelo' : rooms[s.room + 1].section;
    const heroTop = s.heroTop != null ? s.heroTop : r.feet - 53;
    const litCount = ['c', 'r', 'o', 'v'].filter((k: any) => s.glassLit[k]).length;
    return {
      ...this.ambient(s.room),
      busy: s.busy,
      inCastle: s.screen === 'castle',
      inLoading: s.screen === 'loading',
      inCase: s.screen === 'case',
      roomName: r.name,
      roomSection: r.section,
      roomImg: r.img,
      roomAlt: r.alt,
      isSaveRoom: s.room === 5,
      isEntrada: s.room === 0,
      isSobre: s.room === 1,
      isExp: s.room === 2,
      isProj: s.room === 3,
      isHab: s.room === 4,
      isContato: s.room === 5,
      sceneCls: 'mb-scene' + (s.zoom ? ' mb-zoom' : ''),
      zx: s.zoom ? Math.round(s.zoom.x * 0.8125) : 195,
      zy: s.zoom ? Math.round(s.zoom.y * 0.8125) : 110,
      heroCls: 'mb-hero' + (s.walking ? ' mb-walking' : '') + (s.facing < 0 ? ' mb-left' : '') + (s.anim ? ' mb-moving' : '') + (s.shrink ? ' mb-shrink' : '') + (s.warp ? ' mb-warp' : '') + (s.heroFx ? ' ' + s.heroFx.split(' ').map((w: any) => 'mb-' + w).join(' ') : ''),
      x: s.x,
      heroTop,
      beam: s.beam,
      beamLeft: s.x - 12,
      beamH: r.feet,
      fadeCls: s.fade ? 'mb-fade mb-on' : 'mb-fade',
      flashCls: s.flash ? 'mb-flash mb-on' : 'mb-flash',
      hasPrev: s.room > 0,
      prevName: s.room > 0 ? rooms[s.room - 1].section : '',
      nextName,
      miniBats: s.room === 0 ? [[110, 63, 13, 0, 1], [100, 50, 10, -4, 0.8], [113, 77, 16, -9, 1], [90, 40, 8, -2, 0.7], [115, 70, 19, -13, 0.9], [107, 57, 12, -7, 0.75]].map(([rx, ry, t, dl, sc]: any) => ({ style: 'left: 362px; top: 100px; --rx: ' + rx + 'px; --ry: ' + ry + 'px; --t: ' + t + 's; --d: ' + dl + 's; width: ' + Math.round(12 * sc) + 'px; height: ' + Math.round(8 * sc) + 'px; background-size: ' + Math.round(96 * sc) + 'px ' + Math.round(8 * sc) + 'px' })) : [],
      doorCls: 'mb-door' + (s.door ? ' ' + s.door : ''),
      doorLit: s.doorLit,
      quillCls: 'mb-quill ' + (s.quill || 'rest'),
      quillX: s.quill === 'fly' || s.quill === 'write' ? 222 : 296,
      quillY: s.quill === 'write' ? 161 : s.quill === 'fly' || s.quill === 'back' ? 152 : 161,
      sketch: s.sketch,
      astro: s.astro,
      hasBook: !!s.book,
      bookX: s.x, bookY: heroTop - 26, bookGX: s.x + 26, bookGY: heroTop - 32,
      spots: this.objDefs().map((o: any) => ({ label: o.label, act: () => this.examine(o), style: 'left: ' + o.spot[0] + 'px; top: ' + o.spot[1] + 'px; width: ' + o.spot[2] + 'px; height: ' + o.spot[3] + 'px' })),
      cityLights: [{"x":283,"y":127,"off":"#0d091e","d":0},{"x":228,"y":143,"off":"#0e091e","d":1.7},{"x":223,"y":146,"off":"#0e0b1f","d":3.4},{"x":290,"y":146,"off":"#0b091d","d":5.1},{"x":223,"y":160,"off":"#0d0a1f","d":6.8}].map((l: any) => ({ style: 'left: ' + l.x + 'px; top: ' + l.y + 'px; --off: ' + l.off + '; animation-delay: ' + l.d + 's' })),
      clockCls: 'mb-clock' + (s.clockRun ? ' run' : s.clockDone ? ' end' : '') + (s.bell ? ' ring' : ''),
      qbats: s.room === 2 && s.screen === 'castle' ? defs.map((b: any, i: any) => ({ ...b, alive: s.bats[i], cls: 'mb-qbat' + (b.rev ? ' rev' : '') + (s.dying[i] ? ' mb-dying' : ''), style: 'top: ' + b.top + 'px; --t: ' + b.t + 's; --d: ' + b.d + 's', hit: (e: any) => this.hitBat(i, e) })).filter((b: any) => b.alive) : [],
      hasBall: !!s.ball, ballX: s.ball ? s.ball.x : 0, ballY: s.ball ? s.ball.y : 0,
      hasBurst: !!s.burst, burstX: s.burst ? s.burst.x : 0, burstY: s.burst ? s.burst.y : 0,
      quest: defs.map((b: any) => ({ type: 'Bug de ' + b.type.toLowerCase(), fix: b.fix })),
      fixed,
      questOpen: fixed < 3,
      questDone: fixed === 3,
      objs: this.objDefs().map((o: any) => ({ ...o, cls: s.seenObj[o.id] ? 'mb-obj mb-done' : 'mb-obj', act: () => this.examine(o) })),
      clock: () => this.clockAct(),
      portraits: this.portraitDefs().map((p: any) => ({ ...p, cls: p.id === 'blume' ? 'mb-proj mb-feat' : 'mb-proj', open: () => this.openPortrait(p) })),
      panes: this.paneDefs().map((p: any) => ({ ...p, pressed: s.glassSel === p.k ? 'true' : 'false', cls: 'mb-pane mb-pane-' + p.k + (s.glassLit[p.k] ? ' on' : '') + (s.glassSel === p.k ? ' sel' : ''), light: () => this.lightPane(p.k) })),
      glassCards: this.paneDefs().map((p: any) => ({ ...p, pressed: s.glassLit[p.k] ? 'true' : 'false', state: s.glassLit[p.k] ? 'Aceso ✦' : 'Apagado', cls: 'mb-gcard mb-gc-' + p.k + (s.glassLit[p.k] ? ' lit' : '') + (s.glassSel === p.k ? ' sel' : ''), chipsDisplay: s.glassLit[p.k] ? 'flex' : 'none', hintDisplay: s.glassLit[p.k] ? 'none' : 'block', light: () => this.lightPane(p.k) })),
      litCount,
      rayCls: 'mb-rays' + (s.glassSel ? ' on-' + s.glassSel : s.vitralDone ? ' all' : ''),
      wglowCls: 'mb-wglow' + (s.vitralDone ? ' done' : ''),
      showContactInfo: !s.form,
      form: s.form,
      errName: s.errName, errEmail: s.errEmail, errMsg: s.errMsg,
      errGeneral: s.errGeneral || '', sending: !!s.sending, sendLabel: s.sending ? 'Gravando…' : '◆ Gravar e enviar',
      errNameInv: s.errName ? 'true' : 'false', errEmailInv: s.errEmail ? 'true' : 'false', errMsgInv: s.errMsg ? 'true' : 'false',
      copyLabel: s.copied ? 'E-mail copiado ✓' : 'Copiar e-mail',
      copyEmail: () => {
        try { if (navigator.clipboard) navigator.clipboard.writeText('tialves.dev@gmail.com'); } catch (err) { /* sem área de transferência */ }
        this.setState({ copied: true });
        clearTimeout(this.copyT); this.copyT = setTimeout(() => this.setState({ copied: false }), 2200);
      },
      hasSheet: !!d,
      dialogWho: d ? d.who : '',
      dialogTitle: d ? d.title : '',
      dialogParts: d ? this.kwParts(d.text) : [],
      dialogFacts: d ? d.facts : [],
      loadTarget: s.loadTarget,
      caseImg: c.img, caseTitle: c.title, caseKicker: c.kicker, caseChips: c.chips, caseFull: c.full,
      caseSubParts: this.kwParts(c.sub), caseNoteParts: this.kwParts(c.note),
      caseArch: c.arch.map((label: any, i: any) => ({ n: i + 1, label, border: i === 0 ? '#3ec8d4' : label.indexOf('[') >= 0 ? '#5a4a30' : '#8a5c14', color: i === 0 ? '#d4fff6' : label.indexOf('[') >= 0 ? '#a39a86' : '#f6dc8c' })),
      goNext: () => this.go(1),
      goPrev: () => this.go(-1),
      goProjects: () => this.travel(3),
      openForm: () => { if (!this.busy) this.setState({ form: true, errName: '', errEmail: '', errMsg: '' }); },
      closeForm: () => this.setState({ form: false }),
      send: () => this.sendForm(),
      closeDialog: () => this.setState({ dialog: null }),
      skipAnim: () => this.skipAnim(),
      leaveCase: () => this.leaveCase(),
      pdown: (e: any) => { this.downX = e.clientX; },
      pup: (e: any) => {
        if (this.downX == null) return;
        const dx = e.clientX - this.downX;
        this.downX = null;
        if (Math.abs(dx) > 48) this.go(dx < 0 ? 1 : -1);
      },
      keydown: (e: any) => {
        const tag = e.target && e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        if (e.key === 'Escape') { if (this.busy) this.skipAnim(); else this.setState({ dialog: null }); }
        else if (e.key === ' ' && this.busy) { e.preventDefault(); this.skipAnim(); }
        else if (e.key === 'ArrowRight' && !s.dialog) this.go(1);
        else if (e.key === 'ArrowLeft' && !s.dialog) this.go(-1);
      }
    };
  }

  render() {
    const v: any = this.vals();
    return (
      <div className="mb-root" style={sx(`position: relative; width: 390px; height: ${this.props.height || 844}px; zoom: ${this.props.zoom || 1}; overflow: clip; background: #000000; color: #d8cfbb; font-family: 'Pixelify Sans', Silkscreen, monospace; font-size: 16px; line-height: 1.45`)} onKeyDown={v.keydown}>
        {v.inCastle && (
          <>
            <header className="m-top" style={sx(`position: absolute; left: 0; top: 0; width: 390px; height: 56px; box-sizing: border-box; padding: 5px 8px; display: flex; align-items: center; gap: 8px; z-index: 12`)}>
              <div className="m-plate" role="status" aria-live="polite" style={sx(`flex: 1`)}>
                <span style={sx(`font: 600 16px/1.15 'Pixelify Sans', Silkscreen, monospace; color: #f6dc8c; white-space: nowrap; overflow: hidden; text-overflow: ellipsis`)}>
                  {v.roomName}
                </span>
                <span className="mb-lbl">
                  {v.roomSection}
                </span>
              </div>
              <a className="mb-read" href="Mobile.dc.html" aria-label="Modo leitura: abrir a versão em texto">
                Ler ▸
              </a>
            </header>
            <div className={v.sceneCls} onPointerDown={v.pdown} onPointerUp={v.pup} style={sx(`transform-origin: ${v.zx}px ${v.zy}px`)}>
              <div className="mb-world">
                <img className="mb-scene-img" src={v.roomImg} alt={v.roomAlt} style={sx(`left: 0`)} />
                <div className="mb-vig" />
                {(v.halos as any[]).map((hl: any, i1: number) => (
                  <Fragment key={i1}>
                    <span className="mb-halo" aria-hidden="true" style={sx(hl.style)} />
                  </Fragment>
                ))}
                {(v.flames as any[]).map((fm: any, i2: number) => (
                  <Fragment key={i2}>
                    <span className={fm.cls} aria-hidden="true" style={sx(fm.style)} />
                  </Fragment>
                ))}
                {(v.motes as any[]).map((mt: any, i3: number) => (
                  <Fragment key={i3}>
                    <span className="mb-mote" aria-hidden="true" style={sx(mt.style)} />
                  </Fragment>
                ))}
                {(v.glints as any[]).map((gl: any, i4: number) => (
                  <Fragment key={i4}>
                    <span className={gl.cls} aria-hidden="true" style={sx(gl.style)} />
                  </Fragment>
                ))}
                {v.isEntrada && (
                  <>
                    <span className="mb-moon-glow" aria-hidden="true" style={sx(`left: 296px`)} />
                    {(v.miniBats as any[]).map((mb: any, i5: number) => (
                      <Fragment key={i5}>
                        <span className="mb-mini-bat" aria-hidden="true" style={sx(mb.style)} />
                      </Fragment>
                    ))}
                    <span className={v.doorCls} aria-hidden="true" style={sx(`left: 363px`)} />
                    {v.doorLit && (
                      <>
                        <span className="mb-door-glow" aria-hidden="true" style={sx(`left: 335px`)} />
                      </>
                    )}
                    <button type="button" className="mb-spot" onClick={v.goNext} aria-label="Entrar pelo portão do castelo" style={sx(`left: 355px; top: 168px; width: 42px; height: 40px`)} />
                  </>
                )}
                {v.isSobre && (
                  <>
                    <span className="mb-rain" aria-hidden="true" style={sx(`left: 213px`)} />
                    <span className="mb-lightning" aria-hidden="true" style={sx(`left: 213px`)} />
                    <span className="mb-storm" aria-hidden="true" />
                    <span className={v.quillCls} aria-hidden="true" style={sx(`left: ${v.quillX}px; top: ${v.quillY}px`)} />
                    {v.sketch && (
                      <>
                        <svg className="mb-sketch" viewBox="0 0 128 108" aria-hidden="true">
                          <rect x="9" y="9" width="111" height="90" />
                          <path d="M9 27 H120 M18 42 H69 M18 54 H57 M18 69 H54 V87 H18 Z M66 69 H111 V87 H66 Z M84 36 H111 V57 H84 Z" />
                        </svg>
                      </>
                    )}
                    {v.astro && (
                      <>
                        <span className="mb-spark" aria-hidden="true" style={sx(`left: 421px; top: 127px`)} />
                        <span className="mb-spark" aria-hidden="true" style={sx(`left: 451px; top: 137px; animation-delay: .12s`)} />
                        <span className="mb-spark" aria-hidden="true" style={sx(`left: 425px; top: 163px; animation-delay: .24s`)} />
                        <span className="mb-spark" aria-hidden="true" style={sx(`left: 449px; top: 179px; animation-delay: .36s`)} />
                      </>
                    )}
                    {(v.spots as any[]).map((sp: any, i6: number) => (
                      <Fragment key={i6}>
                        <button type="button" className="mb-spot" onClick={sp.act} aria-label={`Examinar: ${sp.label}`} style={sx(sp.style)} />
                      </Fragment>
                    ))}
                  </>
                )}
                {v.isExp && (
                  <>
                    <div className="mb-clouds" aria-hidden="true" style={sx(`left: 100px`)}>
                      <span />
                    </div>
                    <span className="mb-lamp" aria-hidden="true" style={sx(`left: 63px`)} />
                    {(v.cityLights as any[]).map((cl: any, i7: number) => (
                      <Fragment key={i7}>
                        <span className="mb-clight" aria-hidden="true" style={sx(cl.style)} />
                      </Fragment>
                    ))}
                    <div className={v.clockCls} aria-hidden="true" />
                    <button type="button" className="mb-spot" onClick={v.clock} aria-label="Examinar o relógio da torre" style={sx(`left: 377px; top: 59px; width: 74px; height: 74px`)} />
                  </>
                )}
                {v.isProj && (
                  <>
                    {(v.portraits as any[]).map((p: any, i8: number) => (
                      <Fragment key={i8}>
                        <button type="button" className="mb-pf" onClick={p.open} aria-label={`Entrar na pintura do projeto ${p.title}`} style={sx(`left: ${p.sx}px; top: ${p.sy}px; width: ${p.sw}px; height: ${p.sh}px`)} />
                      </Fragment>
                    ))}
                  </>
                )}
                {v.isHab && (
                  <>
                    <span className={v.wglowCls} aria-hidden="true" />
                    <span className={v.rayCls} aria-hidden="true" />
                    {(v.panes as any[]).map((pz: any, i9: number) => (
                      <Fragment key={i9}>
                        <button type="button" className={pz.cls} onClick={pz.light} aria-pressed={pz.pressed} aria-label={`Deixar a luz entrar pela parte ${pz.label} do vitral`}>
                          <span className="mb-spark" aria-hidden="true" />
                        </button>
                      </Fragment>
                    ))}
                  </>
                )}
                {v.isSaveRoom && (
                  <>
                    <span className="mb-relic" aria-hidden="true" style={sx(`left: 288px`)} />
                    <span className="mb-pad" aria-hidden="true" style={sx(`left: 375px; top: 219px`)} />
                    <button type="button" className="mb-spot" onClick={v.openForm} aria-label="Tocar o cristal e gravar uma mensagem" style={sx(`left: 288px; top: 74px; width: 64px; height: 80px`)} />
                    <button type="button" className="mb-spot" onClick={v.goNext} aria-label="Círculo de teleporte de volta à entrada" style={sx(`left: 375px; top: 212px; width: 96px; height: 44px`)} />
                  </>
                )}
                {v.beam && (
                  <>
                    <span className="mb-beam" aria-hidden="true" style={sx(`left: ${v.beamLeft}px; height: ${v.beamH}px`)} />
                  </>
                )}
                <span className={v.heroCls} aria-hidden="true" style={sx(`left: ${v.x}px; top: ${v.heroTop}px`)} />
                {v.hasBook && (
                  <>
                    <span className="mb-book" aria-hidden="true" style={sx(`left: ${v.bookX}px; top: ${v.bookY}px`)} />
                    <span className="mb-spark" aria-hidden="true" style={sx(`left: ${v.bookGX}px; top: ${v.bookGY}px`)} />
                  </>
                )}
              </div>
              {v.hasPrev && (
                <>
                  <button type="button" className="mb-nav-arrow" onClick={v.goPrev} aria-label={`Sala anterior: ${v.prevName}`} style={sx(`left: 6px`)} />
                </>
              )}
              <button type="button" className="mb-nav-arrow mb-r" onClick={v.goNext} aria-label={`Próxima: ${v.nextName}`} style={sx(`right: 6px`)} />
              <div className={v.fadeCls} />
            </div>
            <main className="mb-panel" aria-label={v.roomSection}>
              {v.isEntrada && (
                <>
                  <span className="mb-kick">
                    Desenvolvedor · Designer · São Paulo
                  </span>
                  <h1 className="mb-name" aria-label="Tiago Alves da Silva">
                    <span>
                      <svg className="mb-capg" viewBox="0 0 15.4 21.6" style={sx(`width: 0.6417em`)} shapeRendering="crispEdges" aria-hidden="true">
                        <defs>
                          <linearGradient id="m-cap-t" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="21.6">
                            <stop offset="0" stopColor="#fff6d6" />
                            <stop offset=".38" stopColor="#fff6d6" />
                            <stop offset=".38" stopColor="#f2c35a" />
                            <stop offset=".64" stopColor="#f2c35a" />
                            <stop offset=".64" stopColor="#c88a24" />
                            <stop offset=".82" stopColor="#c88a24" />
                            <stop offset=".82" stopColor="#9a5e16" />
                            <stop offset="1" stopColor="#9a5e16" />
                          </linearGradient>
                        </defs>
                        <path fill="url(#m-cap-t)" d="M3.5 3.8h9v1h-9zM13.5 3.8h1v1h-1zM1.5 4.8h11v1h-11zM13.5 4.8h2v1h-2zM0.5 5.8h2v1h-2zM6.5 5.8h3v1h-3zM13.5 5.8h1v1h-1zM0.5 6.8h1v1h-1zM6.5 6.8h3v1h-3zM6.5 7.8h3v1h-3zM6.5 8.8h3v1h-3zM6.5 9.8h3v1h-3zM6.5 10.8h3v1h-3zM6.5 11.8h3v1h-3zM6.5 12.8h3v1h-3zM6.5 13.8h3v1h-3zM6.5 14.8h3v1h-3zM5.5 15.8h5v1h-5zM6.5 16.8h3v1h-3z" />
                      </svg>
                      iago Alves
                    </span>
                    <span>
                      da Silva
                    </span>
                  </h1>
                  <p className="mb-desc">
                    Desenho a tela. Escrevo o código.
                  </p>
                  <button type="button" className="mb-btn mb-btn-p" onClick={v.goNext}>
                    ▶ Entrar no castelo
                  </button>
                  <button type="button" className="mb-btn" onClick={v.goProjects}>
                    Ir aos projetos
                  </button>
                  <span className="mb-chip" style={sx(`align-self: flex-start; --gc: #5adc7a; color: #bff0c8`)}>
                    ● Aberto a oportunidades
                  </span>
                  <p style={sx(`font-size: 14px; color: #a39a86`)}>
                    Deslize a cena ou use as setas para andar pelo castelo.
                  </p>
                </>
              )}
              {v.isSobre && (
                <>
                  <h2>
                    Sobre
                  </h2>
                  <p>
                    Desenvolvedor full stack. Trabalho entre o código e o desenho da interface.
                  </p>
                  <div className="mb-facts">
                    <span className="mb-fact">
                      ADS · SPTech 2023–25
                    </span>
                    <span className="mb-fact">
                      Técnico · ETEC 2021–22
                    </span>
                    <span className="mb-fact">
                      Inglês fluente
                    </span>
                    <span className="mb-fact">
                      Alemão básico
                    </span>
                  </div>
                  <span className="mb-lbl" style={sx(`margin-top: 4px`)}>
                    Examine a biblioteca
                  </span>
                  <div className="mb-objs">
                    {(v.objs as any[]).map((o: any, i10: number) => (
                      <Fragment key={i10}>
                        <button type="button" className={o.cls} onClick={o.act}>
                          <img src={o.icon} alt="" />
                          {o.label}
                        </button>
                      </Fragment>
                    ))}
                  </div>
                  <p style={sx(`font-size: 14px; color: #a39a86`)}>
                    Você também pode tocar nos objetos da cena.
                  </p>
                </>
              )}
              {v.isExp && (
                <>
                  <h2>
                    Experiência
                  </h2>
                  <div style={sx(`display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap`)}>
                    <span style={sx(`font: 600 19px 'Pixelify Sans', Silkscreen, monospace; color: #ffffff`)}>
                      PwC Brasil
                    </span>
                    <span className="mb-lbl">
                      2023 → abr. 2026
                    </span>
                  </div>
                  <p style={sx(`font-size: 15px; color: #cfc5ad`)}>
                    Do estágio a desenvolvedor front-end e UI designer.
                  </p>
                  <ul style={sx(`margin: 0; padding-left: 18px; font-size: 15px; display: flex; flex-direction: column; gap: 2px`)}>
                    <li>
                      <b className="mb-kw">
                        React
                      </b>
                      ,{' '}
                      <b className="mb-kw">
                        TypeScript
                      </b>
                      ,{' '}
                      <b className="mb-kw">
                        Angular
                      </b>
                      {' '}e{' '}
                      <b className="mb-kw">
                        Nest.js
                      </b>
                      {' '}em{' '}
                      <b className="mb-kw">
                        micro-frontends
                      </b>
                    </li>
                    <li>
                      <b className="mb-kw">
                        APIs REST
                      </b>
                      ; estado com{' '}
                      <b className="mb-kw">
                        Redux
                      </b>
                      {' '}e{' '}
                      <b className="mb-kw">
                        Context API
                      </b>
                    </li>
                    <li>
                      Testes com{' '}
                      <b className="mb-kw">
                        Jest
                      </b>
                      {' '}e{' '}
                      <b className="mb-kw">
                        Testing Library
                      </b>
                      ;{' '}
                      <b className="mb-kw">
                        CI/CD
                      </b>
                    </li>
                    <li>
                      Interfaces no{' '}
                      <b className="mb-kw">
                        Figma
                      </b>
                      {' '}e soluções em{' '}
                      <b className="mb-kw">
                        Appian
                      </b>
                    </li>
                  </ul>
                  <button type="button" className="mb-obj" onClick={v.clock} style={sx(`width: 100%`)}>
                    <img src="/assets/castelo/7777ae4a787a33521e28eb47e432df02.png" alt="" />
                    Examinar o relógio
                  </button>
                  {v.questOpen && (
                    <>
                      <p style={sx(`font-size: 14px; color: #ff9aa4`)}>
                        Morcegos-bug escaparam da torre e voam sobre este texto. Toque neles.{' '}
                        <b style={sx(`font-weight: 400; color: #f6dc8c`)}>
                          {v.fixed}/3
                        </b>
                      </p>
                    </>
                  )}
                  {v.questDone && (
                    <>
                      <section id="m-quest" className="mb-frame mb-f-car mb-quest" aria-label="Missão cumprida: limpar a torre" tabIndex={-1}>
                        <div style={sx(`display: flex; justify-content: space-between`)}>
                          <span className="mb-lbl" style={sx(`color: #ff9aa4`)}>
                            Missão · limpar a torre
                          </span>
                          <span style={sx(`font: 13px Silkscreen, monospace; color: #f6dc8c`)}>
                            3/3
                          </span>
                        </div>
                        {(v.quest as any[]).map((q: any, i11: number) => (
                          <Fragment key={i11}>
                            <div className="mb-quest-row">
                              <span className="mb-check mb-on" aria-hidden="true" />
                              <div>
                                <span style={sx(`font: 13px Silkscreen, monospace; color: #ffb0b8`)}>
                                  {q.type}
                                </span>
                                <div style={sx(`color: #ece6d4`)}>
                                  {q.fix}
                                </div>
                              </div>
                            </div>
                          </Fragment>
                        ))}
                        <p style={sx(`font-size: 15px; color: #ffffff`)}>
                          Conquista: Caçador de bugs.
                        </p>
                      </section>
                    </>
                  )}
                </>
              )}
              {v.isProj && (
                <>
                  <h2>
                    Projetos
                  </h2>
                  <p style={sx(`font-size: 15px; color: #cfc5ad`)}>
                    Toque num retrato da cena ou num projeto para entrar na pintura.
                  </p>
                  {(v.portraits as any[]).map((p: any, i12: number) => (
                    <Fragment key={i12}>
                      <button type="button" className={p.cls} onClick={p.open}>
                        <img src={p.thumb} alt="" />
                        <span style={sx(`display: flex; flex-direction: column; gap: 2px`)}>
                          <span style={sx(`font: 600 17px 'Pixelify Sans', Silkscreen, monospace; color: #f6dc8c`)}>
                            {p.title}
                          </span>
                          <span style={sx(`font-size: 14px`)}>
                            {p.sub}
                          </span>
                          <span style={sx(`font: 13px Silkscreen, monospace; color: #3ec8d4`)}>
                            ENTRAR NA PINTURA ▸
                          </span>
                        </span>
                      </button>
                    </Fragment>
                  ))}
                </>
              )}
              {v.isHab && (
                <>
                  <h2>
                    A stack em vitral
                  </h2>
                  <p style={sx(`font-size: 15px; color: #cfc5ad`)}>
                    Toque numa parte do vitral, ou num cartão, para deixar a luz entrar.
                  </p>
                  <div className="mb-vt" role="status">
                    <span>
                      Vitrais acesos
                    </span>
                    <b>
                      {v.litCount}/4
                    </b>
                  </div>
                  {(v.glassCards as any[]).map((gc: any, i13: number) => (
                    <Fragment key={i13}>
                      <button type="button" className={gc.cls} onClick={gc.light} aria-pressed={gc.pressed}>
                        <span className="mb-gl-head">
                          <span className="mb-gl-k">
                            {gc.kicker}
                          </span>
                          <span className="mb-gl-state">
                            {gc.state}
                          </span>
                        </span>
                        <span className="mb-gl-t">
                          {gc.title}
                        </span>
                        <span className="mb-chips" style={sx(`display: ${gc.chipsDisplay}`)}>
                          {(gc.chips as any[]).map((ch: any, i14: number) => (
                            <Fragment key={i14}>
                              <span className="mb-chip">
                                {ch}
                              </span>
                            </Fragment>
                          ))}
                        </span>
                        <span className="mb-gl-hint" style={sx(`display: ${gc.hintDisplay}`)}>
                          Toque para deixar a luz entrar
                        </span>
                      </button>
                    </Fragment>
                  ))}
                  <button type="button" className="mb-btn mb-btn-p" onClick={v.goNext}>
                    Seguir para o portal ▸
                  </button>
                </>
              )}
              {v.isContato && (
                <>
                  {v.showContactInfo && (
                    <>
                      <span className="mb-kick">
                        Fim do passeio · sala do portal
                      </span>
                      <h2 className="mb-name" aria-label="Vamos conversar">
                        <svg className="mb-capg" viewBox="0 0 15 21.6" style={sx(`width: 0.6250em`)} shapeRendering="crispEdges" aria-hidden="true">
                          <defs>
                            <linearGradient id="m-cap-v" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="21.6">
                              <stop offset="0" stopColor="#fff6d6" />
                              <stop offset=".38" stopColor="#fff6d6" />
                              <stop offset=".38" stopColor="#f2c35a" />
                              <stop offset=".64" stopColor="#f2c35a" />
                              <stop offset=".64" stopColor="#c88a24" />
                              <stop offset=".82" stopColor="#c88a24" />
                              <stop offset=".82" stopColor="#9a5e16" />
                              <stop offset="1" stopColor="#9a5e16" />
                            </linearGradient>
                          </defs>
                          <path fill="url(#m-cap-v)" d="M0.5 3.8h3v1h-3zM10.5 3.8h1v1h-1zM12.5 3.8h2v1h-2zM1.5 4.8h3v1h-3zM10.5 4.8h3v1h-3zM1.5 5.8h3v1h-3zM11.5 5.8h2v1h-2zM2.5 6.8h3v1h-3zM11.5 6.8h2v1h-2zM2.5 7.8h3v1h-3zM11.5 7.8h1v1h-1zM3.5 8.8h3v1h-3zM10.5 8.8h2v1h-2zM3.5 9.8h3v1h-3zM10.5 9.8h1v1h-1zM4.5 10.8h3v1h-3zM9.5 10.8h2v1h-2zM4.5 11.8h3v1h-3zM9.5 11.8h1v1h-1zM5.5 12.8h3v1h-3zM9.5 12.8h1v1h-1zM5.5 13.8h5v1h-5zM6.5 14.8h3v1h-3zM6.5 15.8h2v1h-2zM6.5 16.8h1v1h-1z" />
                        </svg>
                        amos conversar
                      </h2>
                      <p className="mb-sub">
                        Estou aberto a oportunidades como desenvolvedor full stack. Escolha o canal que preferir: eu respondo.
                      </p>
                      <div className="mb-channels">
                        <a className="mb-ch ch-mail ch-main" href="mailto:tialves.dev@gmail.com">
                          <span className="mb-ch-icon">
                            <svg viewBox="0 0 12 9" width="27" height="20" shapeRendering="crispEdges" aria-hidden="true">
                              <path d="M0 0h1v1h-1zM1 0h1v1h-1zM2 0h1v1h-1zM3 0h1v1h-1zM4 0h1v1h-1zM5 0h1v1h-1zM6 0h1v1h-1zM7 0h1v1h-1zM8 0h1v1h-1zM9 0h1v1h-1zM10 0h1v1h-1zM11 0h1v1h-1zM0 1h1v1h-1zM1 1h1v1h-1zM10 1h1v1h-1zM11 1h1v1h-1zM0 2h1v1h-1zM2 2h1v1h-1zM9 2h1v1h-1zM11 2h1v1h-1zM0 3h1v1h-1zM3 3h1v1h-1zM8 3h1v1h-1zM11 3h1v1h-1zM0 4h1v1h-1zM4 4h1v1h-1zM7 4h1v1h-1zM11 4h1v1h-1zM0 5h1v1h-1zM5 5h1v1h-1zM6 5h1v1h-1zM11 5h1v1h-1zM0 6h1v1h-1zM11 6h1v1h-1zM0 7h1v1h-1zM11 7h1v1h-1zM0 8h1v1h-1zM1 8h1v1h-1zM2 8h1v1h-1zM3 8h1v1h-1zM4 8h1v1h-1zM5 8h1v1h-1zM6 8h1v1h-1zM7 8h1v1h-1zM8 8h1v1h-1zM9 8h1v1h-1zM10 8h1v1h-1zM11 8h1v1h-1z" fill="#f6dc8c" />
                            </svg>
                          </span>
                          <span>
                            <span className="mb-ch-k">
                              E-mail
                            </span>
                            <span className="mb-ch-v">
                              tialves.dev@gmail.com
                            </span>
                          </span>
                          <span className="mb-ch-go" aria-hidden="true">
                            ▸
                          </span>
                        </a>
                        <a className="mb-ch ch-in" href="https://www.linkedin.com/in/ti-alves/" target="_blank" rel="noopener noreferrer">
                          <span className="mb-ch-icon">
                            <svg viewBox="0 0 12 10" width="27" height="23" shapeRendering="crispEdges" aria-hidden="true">
                              <path d="M4 0h1v1h-1zM5 0h1v1h-1zM6 0h1v1h-1zM7 0h1v1h-1zM3 1h1v1h-1zM8 1h1v1h-1zM0 2h1v1h-1zM1 2h1v1h-1zM2 2h1v1h-1zM3 2h1v1h-1zM4 2h1v1h-1zM5 2h1v1h-1zM6 2h1v1h-1zM7 2h1v1h-1zM8 2h1v1h-1zM9 2h1v1h-1zM10 2h1v1h-1zM11 2h1v1h-1zM0 3h1v1h-1zM11 3h1v1h-1zM0 4h1v1h-1zM11 4h1v1h-1zM0 5h1v1h-1zM1 5h1v1h-1zM2 5h1v1h-1zM3 5h1v1h-1zM4 5h1v1h-1zM7 5h1v1h-1zM8 5h1v1h-1zM9 5h1v1h-1zM10 5h1v1h-1zM11 5h1v1h-1zM0 6h1v1h-1zM4 6h1v1h-1zM5 6h1v1h-1zM6 6h1v1h-1zM7 6h1v1h-1zM11 6h1v1h-1zM0 7h1v1h-1zM11 7h1v1h-1zM0 8h1v1h-1zM11 8h1v1h-1zM0 9h1v1h-1zM1 9h1v1h-1zM2 9h1v1h-1zM3 9h1v1h-1zM4 9h1v1h-1zM5 9h1v1h-1zM6 9h1v1h-1zM7 9h1v1h-1zM8 9h1v1h-1zM9 9h1v1h-1zM10 9h1v1h-1zM11 9h1v1h-1z" fill="#7fdde6" />
                            </svg>
                          </span>
                          <span>
                            <span className="mb-ch-k">
                              LinkedIn
                            </span>
                            <span className="mb-ch-v">
                              linkedin.com/in/ti-alves
                            </span>
                          </span>
                          <span className="mb-ch-go" aria-hidden="true">
                            ▸
                          </span>
                        </a>
                        <a className="mb-ch ch-gh" href="https://github.com/tialvesdev" target="_blank" rel="noopener noreferrer">
                          <span className="mb-ch-icon">
                            <svg viewBox="0 0 17 9" width="38" height="20" shapeRendering="crispEdges" aria-hidden="true">
                              <path d="M9 0h1v1h-1zM10 0h1v1h-1zM3 1h1v1h-1zM4 1h1v1h-1zM9 1h1v1h-1zM10 1h1v1h-1zM12 1h1v1h-1zM13 1h1v1h-1zM2 2h1v1h-1zM3 2h1v1h-1zM8 2h1v1h-1zM9 2h1v1h-1zM13 2h1v1h-1zM14 2h1v1h-1zM1 3h1v1h-1zM2 3h1v1h-1zM8 3h1v1h-1zM9 3h1v1h-1zM14 3h1v1h-1zM15 3h1v1h-1zM0 4h1v1h-1zM1 4h1v1h-1zM7 4h1v1h-1zM8 4h1v1h-1zM15 4h1v1h-1zM16 4h1v1h-1zM1 5h1v1h-1zM2 5h1v1h-1zM7 5h1v1h-1zM8 5h1v1h-1zM14 5h1v1h-1zM15 5h1v1h-1zM2 6h1v1h-1zM3 6h1v1h-1zM6 6h1v1h-1zM7 6h1v1h-1zM13 6h1v1h-1zM14 6h1v1h-1zM3 7h1v1h-1zM4 7h1v1h-1zM6 7h1v1h-1zM7 7h1v1h-1zM12 7h1v1h-1zM13 7h1v1h-1zM5 8h1v1h-1zM6 8h1v1h-1z" fill="#c8a8f0" />
                            </svg>
                          </span>
                          <span>
                            <span className="mb-ch-k">
                              GitHub
                            </span>
                            <span className="mb-ch-v">
                              github.com/tialvesdev
                            </span>
                          </span>
                          <span className="mb-ch-go" aria-hidden="true">
                            ▸
                          </span>
                        </a>
                      </div>
                      <div className="mb-row2">
                        <button type="button" className="mb-btn mb-btn-p" onClick={v.openForm}>
                          Gravar mensagem
                        </button>
                        <button type="button" className="mb-btn" onClick={v.copyEmail} aria-live="polite">
                          {v.copyLabel}
                        </button>
                      </div>
                      <button type="button" className="mb-link" onClick={v.goNext}>
                        ◆ Teleporte de volta à entrada
                      </button>
                    </>
                  )}
                  {v.form && (
                    <>
                      <span className="mb-kick">
                        Cristal do portal · mensagem
                      </span>
                      <h2 className="mb-name">
                        Gravar no cristal
                      </h2>
                      <p className="mb-sub" style={sx(`font-size: 15px; color: #cfc5ad`)}>
                        Conte quem você é e o que quer construir. Eu respondo por e-mail.
                      </p>
                      <div className="mb-field">
                        <label className="mb-f-lbl" htmlFor="m-nome">
                          Nome
                        </label>
                        <input id="m-nome" className="mb-f-inp" type="text" autoComplete="name" placeholder="Ana Souza" aria-invalid={v.errNameInv} aria-describedby="m-nome-err" />
                        <span id="m-nome-err" className="mb-f-err">
                          {v.errName}
                        </span>
                      </div>
                      <div className="mb-field">
                        <label className="mb-f-lbl" htmlFor="m-email">
                          E-mail
                        </label>
                        <input id="m-email" className="mb-f-inp" type="email" inputMode="email" autoComplete="email" placeholder="ana@empresa.com" aria-invalid={v.errEmailInv} aria-describedby="m-email-err" />
                        <span id="m-email-err" className="mb-f-err">
                          {v.errEmail}
                        </span>
                      </div>
                      <div className="mb-field">
                        <label className="mb-f-lbl" htmlFor="m-msg">
                          Mensagem
                        </label>
                        <textarea id="m-msg" className="mb-f-inp" rows={4} placeholder="Sobre o que quer conversar?" aria-invalid={v.errMsgInv} aria-describedby="m-msg-err" />
                        <span id="m-msg-err" className="mb-f-err">
                          {v.errMsg}
                        </span>
                      </div>
                      {v.errGeneral && (
                        <p role="alert" className="mb-f-err" style={sx(`margin: 0`)}>{v.errGeneral}</p>
                      )}
                      <button type="button" className="mb-btn mb-btn-p" onClick={v.send} disabled={v.sending} aria-busy={v.sending}>
                        {v.sendLabel}
                      </button>
                      <button type="button" className="mb-link" onClick={v.closeForm}>
                        ◂ Voltar aos canais
                      </button>
                    </>
                  )}
                </>
              )}
            </main>
            {(v.qbats as any[]).map((qb: any, i15: number) => (
              <Fragment key={i15}>
                <button type="button" className={qb.cls} onClick={qb.hit} aria-label={`Morcego-bug de ${qb.type}: acertar com bola de fogo`} style={sx(qb.style)}>
                  <span />
                </button>
              </Fragment>
            ))}
            {v.hasBall && (
              <>
                <span className="mb-fire" aria-hidden="true" style={sx(`left: ${v.ballX}px; top: ${v.ballY}px`)} />
              </>
            )}
            {v.hasBurst && (
              <>
                <span className="mb-burst" aria-hidden="true" style={sx(`left: ${v.burstX}px; top: ${v.burstY}px`)} />
              </>
            )}
          </>
        )}
        {v.inLoading && (
          <>
            <div role="status" aria-label={`Carregando ${v.loadTarget}`} style={sx(`position: absolute; inset: 0; background: #000000; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px`)}>
              <img className="mb-px" src="/assets/castelo/b658f56d710eee94f3166b7dfeac9682.png" alt="" style={sx(`width: 96px; height: 54px`)} />
              <span className="mb-px" aria-hidden="true" style={sx(`width: 48px; height: 80px; background: url(/assets/castelo/d4116e62c613798d8bee992e485cb4c0.png) 0 0/288px 80px; animation: m-walk-l .6s steps(6) infinite`)} />
              <span style={sx(`font: 13px Silkscreen, monospace; letter-spacing: .3em; color: #3ec8d4`)}>
                CARREGANDO
              </span>
              <span style={sx(`font: 600 22px 'Pixelify Sans', Silkscreen, monospace; color: #f6dc8c; text-align: center`)}>
                {v.loadTarget}
              </span>
              <div className="mb-bar" style={sx(`width: 280px`)}>
                <i className="mb-ld-bar-fill" />
              </div>
            </div>
          </>
        )}
        {v.inCase && (
          <>
            <header className="m-top" style={sx(`position: absolute; left: 0; top: 0; width: 390px; height: 56px; box-sizing: border-box; padding: 5px 8px; display: flex; align-items: center; gap: 8px; z-index: 12`)}>
              <button type="button" className="mb-read" onClick={v.leaveCase} style={sx(`border-color: #8a5c14; color: #f6dc8c`)}>
                ◂ Sair
              </button>
              <span style={sx(`flex: 1; font: 600 16px 'Pixelify Sans', Silkscreen, monospace; color: #f6dc8c`)}>
                Dentro da pintura
              </span>
            </header>
            <div className="mb-scene" style={sx(`top: 56px; height: 270px`)}>
              <img className="mb-scene-img" src={v.caseImg} alt="" style={sx(`left: -45px; filter: brightness(.45)`)} />
              <div className="mb-portal" aria-hidden="true">
                <img className="mb-px" src="/assets/castelo/cde5d3888e3344c6bdcfd1c7365d7cd8.png" alt="" style={sx(`width: 100%; height: 100%; object-fit: cover; filter: brightness(.6)`)} />
              </div>
              <span className={v.heroCls} aria-hidden="true" style={sx(`left: ${v.x}px; top: ${v.heroTop}px`)} />
            </div>
            <main className="mb-panel mb-tall" aria-label={v.caseTitle}>
              <span className="mb-lbl">
                {v.caseKicker}
              </span>
              <h1>
                {v.caseTitle}
              </h1>
              <p style={sx(`color: #cfc5ad`)}>
                {(v.caseSubParts as any[]).map((cs: any, i16: number) => (
                  <Fragment key={i16}>
                    <span className={cs.cls}>
                      {cs.t}
                    </span>
                  </Fragment>
                ))}
              </p>
              <div className="mb-chips">
                {(v.caseChips as any[]).map((c: any, i17: number) => (
                  <Fragment key={i17}>
                    <span className="mb-chip">
                      {c}
                    </span>
                  </Fragment>
                ))}
              </div>
              <ol style={sx(`margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 6px`)}>
                {(v.caseArch as any[]).map((a: any, i18: number) => (
                  <Fragment key={i18}>
                    <li style={sx(`padding: 8px 10px; border: 2px solid ${a.border}; color: ${a.color}; font: 13px Silkscreen, monospace`)}>
                      {a.n}. {a.label}
                    </li>
                  </Fragment>
                ))}
              </ol>
              <p>
                {(v.caseNoteParts as any[]).map((cn: any, i19: number) => (
                  <Fragment key={i19}>
                    <span className={cn.cls}>
                      {cn.t}
                    </span>
                  </Fragment>
                ))}
              </p>
              {v.caseFull && (
                <>
                  <a className="mb-btn mb-btn-p" href="Projeto.dc.html">
                    Estudo completo ▸
                  </a>
                </>
              )}
              <p style={sx(`font-size: 14px; color: #a39a86`)}>
                Código: [ link a confirmar ]
              </p>
              <button type="button" className="mb-btn" onClick={v.leaveCase}>
                ◂ Sair da pintura
              </button>
            </main>
          </>
        )}
        {v.hasSheet && (
          <>
            <button type="button" className="mb-backdrop" onClick={v.closeDialog} aria-label="Fechar" />
            <div className="mb-sheet" role="dialog" aria-labelledby="m-dlg-title" aria-live="polite">
              <span className="mb-grab" aria-hidden="true" />
              <span className="mb-lbl">
                {v.dialogWho}
              </span>
              <h2 id="m-dlg-title" style={sx(`margin: 0; font: 600 22px/1.15 'Pixelify Sans', Silkscreen, monospace; color: #f6dc8c`)}>
                {v.dialogTitle}
              </h2>
              <p style={sx(`margin: 0; font-size: 16px; line-height: 1.5; color: #ece6d4`)}>
                {(v.dialogParts as any[]).map((dp: any, i20: number) => (
                  <Fragment key={i20}>
                    <span className={dp.cls}>
                      {dp.t}
                    </span>
                  </Fragment>
                ))}
              </p>
              <div className="mb-facts">
                {(v.dialogFacts as any[]).map((f: any, i21: number) => (
                  <Fragment key={i21}>
                    <span className="mb-fact">
                      {f}
                    </span>
                  </Fragment>
                ))}
              </div>
              <button type="button" id="m-dlg-x" className="mb-x-btn" onClick={v.closeDialog}>
                Fechar
              </button>
            </div>
          </>
        )}
        {v.busy && (
          <>
            <button type="button" className="mb-skip" onClick={v.skipAnim} aria-label="Pular animação" />
            <span className="mb-skip-hint">
              Toque para pular
            </span>
          </>
        )}
        <div className={v.flashCls} />
      </div>
    );
  }
}

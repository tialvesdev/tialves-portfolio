// Gerado a partir do protótipo do canvas e ajustado à mão.
import { Component, Fragment } from 'react';
import { sx } from './sx';
import './castle-desktop.css';
import Loading from './Loading';
import CastleMobile from './CastleMobile';

import { sendContact, ContactError } from '../api/client';

export default class CastleDesktop extends Component<any, any> {
  [key: string]: any;
  constructor(props: any) {
    super(props);
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.state = {
      room: 0, screen: 'castle', x: 760, facing: 1, walking: false, anim: false, fade: false, busy: false, scale: 1,
      narrow: false, paused: false, crt: !reduce,
      heroTop: null, heroFx: null, beam: false, iris: null, flash: false, attack: false,
      dialog: null, visited: [true, false, false, false, false, false],
      bats: [true, true, true], ball: null, burst: null, amb: [{ dead: false, gen: 0 }, { dead: false, gen: 0 }], bonus: 0,
      book: null, quill: null, sketch: false, astro: false,
      clockDone: false, clockRun: false, door: null, doorLit: false, bell: false, relicPulse: false, glassLit: { c: false, r: false, o: false, v: false }, glassSel: null, vitralDone: false, flames: false, gate: false,
      form: false, formErr: {}, copied: false, caseId: 'blume', loadTarget: 'Galeria › Blume'
    };
    this.timers = [];
    this.busy = false;
    this.finish = null;
    this.lastWheel = 0;
    this.seenCases = {};
    this.rootEl = null;
    this.audio = null;
    this.setRoot = (el: any) => { this.rootEl = el; };
  }

  componentDidMount() {
    if (this.rootEl && typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver((entries: any) => {
        const r = entries[0].contentRect;
        const sc = Math.max(0.2, Math.min(r.width / 1440, r.height / 810));
        const narrow = r.width < 1100 || r.height < 560;
        const vw = Math.round(r.width), vh = Math.round(r.height);
        if (narrow !== this.state.narrow || Math.abs(sc - this.state.scale) > 0.004 || vw !== this.state.vw || vh !== this.state.vh) this.setState({ scale: Math.round(sc * 1000) / 1000, narrow, vw, vh });
      });
      this.ro.observe(this.rootEl);
    }
    if (this.rootEl && this.rootEl.focus) this.rootEl.focus({ preventScroll: true });
    if (this.state.crt) this.crtTimer = setTimeout(() => this.setState({ crt: false }), 1550);
    this.onWinKey = (e: KeyboardEvent) => { const t = e.target as Node | null; if (t && this.rootEl && this.rootEl.contains(t)) return; this.vals().keydown(e); };
    window.addEventListener('keydown', this.onWinKey);
  }
  componentWillUnmount() { this.clearTimers(); if (this.ro) this.ro.disconnect(); clearTimeout(this.crtTimer); window.removeEventListener('keydown', this.onWinKey); }
  later(fn: any, ms: any) { this.timers.push(setTimeout(fn, ms)); }
  clearTimers() { this.timers.forEach(clearTimeout); this.timers = []; }

  // ---- som: sintetizado no navegador, sem arquivos ----
  ctx() {
    if (typeof window === 'undefined') return null;
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    if (!this.audio) this.audio = new AC();
    if (this.audio.state === 'suspended') this.audio.resume();
    return this.audio;
  }
  // efeitos curtos: ruído filtrado (papel, madeira, pena) e tons (vidro, metal, magia)
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

  tone(ac: any, type: any, freq: any, start: any, dur: any, vol: any) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, ac.currentTime + start);
    g.gain.linearRampToValueAtTime(vol, ac.currentTime + start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + dur);
    o.connect(g); g.connect(ac.destination);
    o.start(ac.currentTime + start); o.stop(ac.currentTime + start + dur + 0.05);
  }
  playJingle() {
    const ac = this.ctx(); if (!ac) return;
    // arpejo original de "missão cumprida": dó maior subindo, pausa curta, resolução longa
    [[523.25, 0, 0.11], [659.25, 0.11, 0.11], [783.99, 0.22, 0.11], [1046.5, 0.33, 0.16], [880, 0.52, 0.1], [1046.5, 0.62, 0.1], [1318.5, 0.72, 0.5]]
      .forEach(([f, s, d]: any) => this.tone(ac, 'square', f, s, d, 0.05));
    [[130.81, 0, 0.3], [196, 0.33, 0.3], [261.63, 0.72, 0.5]].forEach(([f, s, d]: any) => this.tone(ac, 'triangle', f, s, d, 0.09));
  }
  noiseSrc(ac: any, dur: any) {
    const b = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const n = ac.createBufferSource(); n.buffer = b; return n;
  }

  // disparo: um "fuu" de chama (ruído com filtro que sobe) e um estalo quadrado de 8 bits
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

  // impacto: estouro grave e chiado curto
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

  playBell() {
    const ac = this.ctx(); if (!ac) return;
    [0, 0.6].forEach((s: any) => { this.tone(ac, 'sine', 196, s, 1.4, 0.12); this.tone(ac, 'sine', 392, s, 0.9, 0.05); this.tone(ac, 'sine', 587.3, s, 0.5, 0.03); });
  }

  // ---- foco ----
  remember() { this.lastTrigger = typeof document !== 'undefined' ? document.activeElement : null; }
  focusSel(sel: any) { setTimeout(() => { const el = this.rootEl && this.rootEl.querySelector(sel); if (el && el.focus) el.focus(); }, 60); }
  closeDialog() {
    const t = this.lastTrigger;
    this.lastTrigger = null;
    this.setState({ dialog: null, book: null });
    setTimeout(() => { if (t && t.isConnected && t.focus) t.focus(); else this.focusSel('#room-plate'); }, 60);
  }
  sendForm() {
    const q = (id: any) => (this.rootEl && this.rootEl.querySelector(id) ? this.rootEl.querySelector(id).value.trim() : '');
    const name = q('#j-nome'), email = q('#j-email'), msg = q('#j-msg');
    const err: Record<string, string> = {};
    if (!name) err.name = 'Informe seu nome.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) err.email = 'Informe um e-mail no formato ana@empresa.com.';
    if (msg.length < 10) err.message = 'Escreva a mensagem com pelo menos 10 caracteres.';
    if (Object.keys(err).length) {
      this.setState({ formErr: err });
      this.focusSel(err.name ? '#j-nome' : err.email ? '#j-email' : '#j-msg');
      return;
    }
    if (this.sending) return;
    this.sending = true;
    this.setState({ sending: true, formErr: {} });
    sendContact({ name, email, message: msg })
      .then(() => { this.lastTrigger = null; this.setState({ form: false, formErr: {}, dialog: this.texts().sent }); })
      .catch((e: unknown) => { const fe = e instanceof ContactError ? e.fieldErrors : {}; this.setState({ formErr: { ...fe, general: e instanceof Error ? e.message : 'Não foi possível enviar agora.' } }); })
      .finally(() => { this.sending = false; this.setState({ sending: false }); });
  }

  // trava a interação durante uma animação; finish leva direto ao estado final quando a pessoa pula
  begin(finish: any) { this.busy = true; this.finish = finish; this.setState({ busy: true }); }
  end() { this.busy = false; this.finish = null; this.setState({ busy: false }); }
  skipAnim() {
    if (!this.busy) return;
    this.clearTimers();
    const f = this.finish;
    this.busy = false;
    this.finish = null;
    this.setState({ busy: false });
    if (f) f();
  }

  rooms() {
    const B = (id: any) => '/assets/castelo/' + id + '.png';
    return [
      { name: 'Entrada do Castelo', section: 'Início', img: B('e9afd4b64cf03155a8c7ee73caffd8ee'), feet: 748, stand: 760, alt: 'Castelo gótico vivo sobre um rochedo, com torres finas que se inclinam, torres suspensas de ponta para baixo e pontes com dentes, diante da lua cheia',
        spots: [{ id: 'portao', label: 'Portão', x: 1080, y: 520, w: 92, h: 90 }] },
      { name: 'Biblioteca do Desenvolvedor', section: 'Sobre', img: B('e7bd81ee852a0df2b911ce9c4e3b9650'), feet: 728, stand: 540, alt: 'Biblioteca com estante, mesa com diário e tinteiro, prancheta e astrolábio',
        spots: [
          { id: 'estante', label: 'Estante', x: 66, y: 96, w: 330, h: 520 },
          { id: 'diario', label: 'Diário', x: 640, y: 500, w: 120, h: 70 },
          { id: 'prancheta', label: 'Prancheta', x: 1036, y: 436, w: 170, h: 220 },
          { id: 'astrolabio', label: 'Astrolábio', x: 1292, y: 410, w: 110, h: 230 }
        ] },
      { name: 'Torre do Relógio', section: 'Experiência', img: B('114a298f2749c8a0e82f2753ca770df9'), feet: 772, stand: 820, alt: 'Terraço da torre com relógio e lua vermelha',
        spots: [{ id: 'relogio', label: 'Relógio', x: 1135, y: 175, w: 220, h: 220 }] },
      { name: 'Galeria de Retratos', section: 'Projetos', img: B('cde5d3888e3344c6bdcfd1c7365d7cd8'), feet: 744, stand: 330, alt: 'Galeria com três retratos',
        spots: [] },
      { name: 'Capela do Vitral', section: 'Habilidades', img: B('da65cfdc72632bec469fe25cf2ccc762'), feet: 772, stand: 680, alt: 'Capela com vitral colorido',
        spots: [] },
      { name: 'Sala do Portal', section: 'Contato', img: B('0f9f7443725d3d6f07021aa313a731a7'), feet: 735, stand: 700, alt: 'Sala do portal: altar com cristal à direita e um portal de pedra no fim da sala',
        spots: [{ id: 'cristal', label: 'Cristal', x: 880, y: 236, w: 160, h: 210 }] }
    ];
  }

  // chamas das velas pintadas no fundo: centro e base da chama, em pixels da arte (3x na tela)
  halosFor(room: any) {
    const P: Record<string, string[]> = { amber: ['rgba(255,200,110,.42)', 'rgba(255,170,70,.2)', 'rgba(255,150,60,.08)'], cyan: ['rgba(140,245,255,.45)', 'rgba(80,220,235,.2)', 'rgba(60,200,220,.08)'], lilac: ['rgba(230,220,255,.42)', 'rgba(170,150,255,.2)', 'rgba(140,120,240,.08)'] };
    const H = (x: any, y: any, sz: any, c: any, d: any) => ({ style: 'left: ' + (x - sz / 2) + 'px; top: ' + (y - sz / 2) + 'px; width: ' + sz + 'px; height: ' + sz + 'px; --c: ' + P[c][0] + '; --c2: ' + P[c][1] + '; --c3: ' + P[c][2] + '; animation-delay: ' + d + 's' });
    const fromFlames = (c: any, sz: any) => this.flamesFor(room).map((f: any, i: any) => H(f.x + 7, f.y + 9, sz, c, -((i * 0.37) % 1.9).toFixed(2)));
    if (room === 0) return [H(615, 470, 150, 'cyan', 0), H(1068, 548, 96, 'amber', -0.6), H(1178, 548, 96, 'amber', -1.2)];
    if (room === 1) return [H(784, 500, 130, 'amber', 0)];
    if (room === 2) return [H(249, 252, 150, 'cyan', 0)];
    if (room === 3) return fromFlames('lilac', 72);
    if (room === 4) return fromFlames('amber', 66);
    return [];
  }

  flamesFor(room: any) {
    const mk = (cls: any, list: any) => list.map(([cx, by]: any, i: any) => ({ cls, x: (cx - 2) * 3, y: (by - 6) * 3, dur: (0.58 + ((i * 37) % 30) / 100).toFixed(2), d: (-((i * 53) % 70) / 100).toFixed(2) }));
    if (room === 3) return mk('flame roxa', [[30, 99], [42, 99], [154, 99], [166, 99], [314, 99], [326, 99], [438, 99], [450, 99], [220, 152], [260, 152]]);
    if (room === 4) {
      const left = [[66, 144], [80, 138], [96, 140], [112, 138], [126, 144], [40, 170], [50, 164], [60, 172]];
      return mk('flame', left.concat(left.map(([x, y]: any) => [480 - x, y])));
    }
    return [];
  }

  // poeira subindo devagar: na galeria pelo salão, na capela dentro da luz do vitral
  motesFor(room: any) {
    const r = (i: any, k: any) => { let n = i * 374761393 + k * 668265263; n = (n ^ (n >>> 13)) * 1274126177; return ((n ^ (n >>> 16)) >>> 0) / 4294967295; };
    const box = room === 3 ? [150, 330, 1150, 330] : room === 4 ? [600, 420, 240, 300] : null;
    if (!box) return [];
    const n = room === 3 ? 10 : 14;
    return Array.from({ length: n }, (_: any, i: any) => ({ x: box[0] + Math.round(r(i, room) * box[2] / 3) * 3, y: box[1] + Math.round(r(i, room + 9) * box[3] / 3) * 3, c: room === 4 ? (i % 3 ? '#ffe6a0' : '#ffffff') : (i % 2 ? '#d8ccff' : '#f6dc8c'), dur: (6 + r(i, 5) * 5).toFixed(1), d: (-r(i, 7) * 10).toFixed(1) }));
  }

  glowsFor(room: any) {
    const G = (x: any, y: any, s: any, c: any, d: any) => ({ l: x - s / 2, t: y - s / 2, s, c, d });
    const amber = 'rgba(255,190,90,.55)', cyan = 'rgba(80,220,235,.55)';
    return [
      [G(618, 474, 170, cyan, 0.4)],
      [G(792, 519, 200, amber, 0), G(792, 519, 90, amber, 0.8)],
      [G(249, 255, 150, cyan, 0.3)],
      [G(108, 294, 90, amber, 0), G(480, 294, 90, amber, 0.7), G(960, 294, 90, amber, 0.3), G(1332, 294, 90, amber, 1), G(720, 450, 110, amber, 0.5)],
      [G(285, 405, 160, amber, 0), G(1155, 405, 160, amber, 1)],
      [G(960, 66, 120, amber, 0), G(1270, 752, 240, cyan, 0.5)]
    ][room];
  }

  texts() {
    return {
      cristal: { who: 'Cristal do portal', title: 'Grave uma mensagem', text: 'Fim do passeio. Grave uma mensagem no cristal; o círculo rúnico no fim da sala leva de volta à entrada do castelo.', facts: ['tialves.dev@gmail.com', 'linkedin.com/in/ti-alves', 'github.com/tialvesdev'] },
      estante: { who: 'Item obtido · livro da estante', title: 'Análise e Desenvolvimento de Sistemas', text: 'Tecnólogo pela SPTech, com projetos acadêmicos em PostgreSQL, Kubernetes, GitLab CI/CD, arquitetura MVVM e Git Flow.', facts: ['SPTech · 2023–2025', 'ETEC de Guaianases · Técnico em Desenvolvimento de Sistemas · 2021–2022'] },
      diario: { who: 'Diário do Tiago', title: 'Desenvolvedor Full Stack', text: 'Gosto de interface bem acabada e de código que outra pessoa consegue manter. Quero construir aplicações escaláveis e de qualidade num time que leve isso a sério.', facts: ['React · TypeScript', 'Node.js · Nest.js', 'Java · Spring Boot', 'Aberto a oportunidades'] },
      prancheta: { who: 'Prancheta', title: 'UI Designer na PwC', text: 'Desenhava as telas no Figma antes de construir. Este castelo saiu da mesma prancheta.', facts: ['Figma', 'Material-UI', 'Acessibilidade'] },
      astrolabio: { who: 'Astrolábio · idiomas', title: 'Inglês fluente · Alemão básico', text: 'Português nativo, inglês fluente e alemão básico.', facts: ['Português · nativo', 'Inglês · fluente', 'Alemão · básico'] },
      relogio: { who: 'Relógio da torre · meia-noite', title: 'PwC Brasil · 2023 → abr. 2026', text: 'Três anos na PwC Brasil, do estágio a desenvolvedor front-end e UI designer.', facts: ['Estagiário', 'Desenvolvedor Front-End', 'UI Designer', 'Micro-frontends'] },
      vitral: { who: 'Vitral', title: 'A stack em cores', text: 'Cada vitral é uma família da stack. A luz que atravessa o vidro é a ferramenta trabalhando.', facts: ['Ciano · front-end', 'Carmim · back-end', 'Ouro · qualidade e DevOps', 'Roxo · design e idiomas'] },
      sent: { who: 'Sistema', title: 'Progresso salvo', text: 'Sua mensagem foi gravada no cristal.', facts: ['tialves.dev@gmail.com'] }
    };
  }

  // onde o Tiago para, o que acontece em cada instante (estado e som) e o estado final, usado também ao pular
  sequences() {
    return {
      estante: { x: 400, face: -1, steps: [[0, { book: 'out' }, 'slide'], [350, { book: 'fly' }], [900, { book: 'held' }, 'flip'], [2400, { book: null }]], at: 1050, final: { book: null } },
      diario: { x: 560, face: 1, steps: [[0, { quill: 'lift' }, 'clink'], [300, { quill: 'fly' }, 'swish'], [750, { quill: 'write' }, 'scratch'], [1950, { quill: 'back' }, 'swish'], [2400, { quill: 'drop' }, 'clink'], [2700, { quill: null }]], at: 2700, final: { quill: null } },
      prancheta: { x: 940, face: 1, steps: [[0, { sketch: true }, 'sketch']], at: 1500, final: { sketch: true } },
      astrolabio: { x: 1170, face: 1, steps: [[0, { astro: true }, 'astro'], [1400, { astro: false }]], at: 1400, final: { astro: false } },
      relogio: { x: null, face: 1, steps: [[0, { clockRun: true }], [1450, { bell: true, clockRun: false, clockDone: true }, 'bell'], [3500, { bell: false }]], at: 1800, final: { clockDone: true, clockRun: false, bell: false } },
    };
  }

  bugDefs() {
    return [
      { type: 'Estado', fix: 'Rastreado e corrigido com Redux e Context API', x: 760, y: 110 },
      { type: 'Interface', fix: 'Coberto por teste com Jest e Testing Library', x: 960, y: 210 },
      { type: 'Performance', fix: 'Render otimizado e pipeline de CI/CD verde', x: 800, y: 330 }
    ];
  }

  portraitDefs() {
    return [
      { id: 'heelp', title: 'Heelp', sub: 'Fórum para estudantes', x: 195, y: 240, w: 204, h: 165 },
      { id: 'blume', title: 'Blume', sub: 'Plataforma full-stack', x: 591, y: 219, w: 258, h: 201 },
      { id: 'atelie', title: 'Ateliê Gótico', sub: 'Este portfólio', x: 1041, y: 240, w: 204, h: 165 }
    ];
  }

  cases() {
    const B = (id: any) => '/assets/castelo/' + id + '.png';
    return {
      blume: { title: 'Blume', kicker: 'Galeria › Blume · projeto pessoal', img: B('da65cfdc72632bec469fe25cf2ccc762'), full: true,
        sub: 'Plataforma full-stack de beleza. Front-end React em micro-frontends, backend em microsserviços Node.js com Docker.',
        chips: ['React', 'Node.js', 'Docker', 'Tailwind', 'Context API'],
        arch: ['FRONT-END REACT', 'APIs REST', 'MICROSSERVIÇOS', 'BANCO [ ? ]'],
        note: 'Autenticação, tratamento de erros, acessibilidade e performance de ponta a ponta.' },
      heelp: { title: 'Heelp', kicker: 'Galeria › Heelp', img: B('2f27f4de6e0248b09dd6fca1050f22c2'), full: false,
        sub: 'Fórum para estudantes de cursos técnicos trocarem conhecimento e tirarem dúvidas entre si.',
        chips: ['[ stack a confirmar ]', '[ ano ]'],
        arch: ['ESTUDANTES', 'PERGUNTAS', 'RESPOSTAS', '[ STACK ]'],
        note: '[ Conte o problema que o Heelp resolve e o que você construiu nele. ]' },
      atelie: { title: 'Ateliê Gótico', kicker: 'Galeria › Ateliê Gótico', img: B('e9afd4b64cf03155a8c7ee73caffd8ee'), full: false,
        sub: 'Este portfólio: componentes em pixel art com React e TypeScript, e uma API em Java com Spring Boot.',
        chips: ['React', 'TypeScript', 'Java', 'Spring Boot'],
        arch: ['REACT', 'API REST', 'SPRING BOOT', 'DADOS'],
        note: '18 componentes tipados, 89 assets originais e 5 endpoints com testes automatizados.' }
    };
  }

  resetRoomFx() {
    return { book: null, quill: null, sketch: false, astro: false, bell: false, glassSel: null, relicPulse: false, ball: null, burst: null, attack: false, heroFx: null };
  }

  markVisited(i: any) {
    const visited = this.state.visited.slice();
    visited[i] = true;
    return visited;
  }

  act(id: any) {
    if (this.busy) return;
    const s = this.state;
    this.remember();
    if (id === 'portao') return this.go(1);
    if (id === 'cristal') {
      this.begin(() => this.setState({ relicPulse: false, form: true, dialog: null }));
      this.setState({ relicPulse: true, dialog: null });
      this.later(() => { this.setState({ relicPulse: false, form: true }); this.end(); }, 600);
      return;
    }
    if (id === 'relogio' && s.clockDone) { this.setState({ dialog: this.texts().relogio }); return; }
    const q = (this.sequences() as Record<string, any>)[id];
    if (!q) return;
    const dialog = (this.texts() as Record<string, any>)[id];
    if (this.doneActs && this.doneActs[id]) { this.setState({ dialog }); return; }
    this.doneActs = { ...(this.doneActs || {}), [id]: true };
    const finalX = q.x != null ? q.x : s.x;
    const finalFace = q.face != null ? q.face : s.facing;
    this.begin(() => this.setState({ ...q.final, dialog, walking: false, anim: false, x: finalX, facing: finalFace, heroTop: null }));
    const run = () => {
      q.steps.forEach(([t, st, sound]: any) => this.later(() => { this.setState(st); if (sound) this.playSfx(sound); }, t));
      this.later(() => { this.setState({ dialog }); this.end(); }, q.at);
    };
    if (q.x != null) {
      this.setState({ walking: true, anim: true, facing: q.x >= s.x ? 1 : -1, x: q.x, heroTop: null, dialog: null });
      this.later(() => { this.setState({ walking: false, anim: false, facing: finalFace }); run(); }, 800);
    } else {
      this.setState({ dialog: null, facing: finalFace });
      run();
    }
  }

  // palavras-chave da stack ganham destaque dentro dos textos corridos
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

  // portão pesado: rangido grave, ronco da madeira e a batida do fechamento
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

  // entrada: o Tiago vai até o portão, as portas abrem, ele sobe a escada diminuindo em degraus
  // (ficando longe), some na luz e as portas batem atrás dele
  enterCastle() {
    if (this.busy) return;
    const stand = this.rooms()[1].stand;
    this.begin(() => this.setState({ room: 1, x: stand, walking: false, anim: false, fade: false, heroTop: null, door: null, doorLit: false, visited: this.markVisited(1), ...this.resetRoomFx() }));
    this.setState({ walking: true, anim: true, facing: 1077 >= this.state.x ? 1 : -1, x: 1077, heroTop: null, dialog: null });
    this.later(() => { this.setState({ walking: false, anim: false, facing: 1, door: 'opening' }); this.playDoor('open'); }, 700);
    this.later(() => this.setState({ door: 'open', doorLit: true, heroFx: 'enter', walking: true, heroTop: 440 }), 1050);
    this.later(() => this.setState({ walking: false, heroFx: 'enter dissolve' }), 1550);
    this.later(() => { this.setState({ heroFx: 'gone', door: 'closing', doorLit: false }); this.playDoor('close'); }, 1900);
    this.later(() => this.setState({ fade: true }), 2150);
    this.later(() => this.setState({ room: 1, x: -120, heroTop: null, door: null, anim: false, visited: this.markVisited(1), ...this.resetRoomFx() }), 2400);
    this.later(() => this.setState({ fade: false, anim: true, walking: true, facing: 1, x: stand }), 2460);
    this.later(() => { this.setState({ walking: false, anim: false }); this.end(); }, 3240);
  }

  // volta para a entrada: o Tiago sai pela esquerda da biblioteca e aparece no portão do castelo,
  // crescendo em degraus enquanto desce a escada; as portas batem atrás dele
  exitCastle() {
    if (this.busy) return;
    const stand = this.rooms()[0].stand;
    this.begin(() => this.setState({ room: 0, x: stand, facing: -1, walking: false, anim: false, fade: false, heroTop: null, door: null, doorLit: false, visited: this.markVisited(0), ...this.resetRoomFx() }));
    this.setState({ walking: true, facing: -1, anim: true, x: -120, heroTop: null, dialog: null, form: false });
    this.later(() => this.setState({ fade: true }), 560);
    this.later(() => this.setState({ room: 0, anim: false, walking: false, x: 1077, facing: 1, door: null, doorLit: false, visited: this.markVisited(0), ...this.resetRoomFx(), heroFx: 'enter gone', heroTop: 440 }), 820);
    this.later(() => this.setState({ fade: false }), 880);
    this.later(() => { this.setState({ door: 'opening' }); this.playDoor('open'); }, 1050);
    this.later(() => this.setState({ door: 'open', doorLit: true, heroFx: 'enter materialize' }), 1400);
    this.later(() => this.setState({ heroFx: 'exit', heroTop: null, walking: true }), 1850);
    this.later(() => this.setState({ heroFx: null, anim: true, walking: true, facing: -1, x: stand }), 2350);
    this.later(() => { this.setState({ door: 'closing', doorLit: false }); this.playDoor('close'); }, 2450);
    this.later(() => { this.setState({ walking: false, anim: false, door: null }); this.end(); }, 3150);
  }

  go(dir: any) {
    if (this.busy || this.state.screen !== 'castle') return;
    const room = this.state.room;
    if (room === 5 && dir > 0) return this.teleport(0);
    if (room === 0 && dir < 0) return;
    if (room === 0 && dir > 0) return this.enterCastle();
    if (room === 1 && dir < 0) return this.exitCastle();
    const rooms = this.rooms();
    const next = room + dir;
    this.begin(() => this.setState({ room: next, x: rooms[next].stand, walking: false, anim: false, fade: false, heroTop: null, visited: this.markVisited(next), ...this.resetRoomFx() }));
    this.setState({ walking: true, facing: dir, anim: true, x: dir > 0 ? 1480 : -120, heroTop: null, dialog: null, form: false });
    this.later(() => this.setState({ fade: true }), 560);
    this.later(() => this.setState({ room: next, anim: false, x: dir > 0 ? -120 : 1480, visited: this.markVisited(next), ...this.resetRoomFx() }), 820);
    this.later(() => this.setState({ fade: false, anim: true, x: rooms[next].stand }), 880);
    this.later(() => { this.setState({ walking: false, anim: false }); this.end(); }, 1660);
  }

  // portal: o Tiago entra no arco, chamas espectrais sobem, o feixe o desfaz, a íris fecha no portal
  // e abre onde ele chega, já se refazendo dentro do feixe
  teleport(to: any) {
    if (this.busy) return;
    const padX = 1222, gx = 1270, gy = 752;
    const stand = this.rooms()[to].stand;
    const arriveTop = this.rooms()[to].feet - 158;
    this.remember();
    this.begin(() => { this.setState({ room: to, x: stand, walking: false, anim: false, beam: false, flash: false, flames: false, gate: false, iris: null, heroTop: null, visited: this.markVisited(to), ...this.resetRoomFx() }); this.focusSel('#room-plate'); });
    this.setState({ walking: true, anim: true, facing: padX >= this.state.x ? 1 : -1, x: padX, heroTop: null, dialog: null, form: false });
    this.later(() => { this.setState({ walking: false, anim: false, facing: 1, gate: true, flames: true }); this.playSfx('charge'); }, 800);
    this.later(() => { this.setState({ beam: true }); this.playSfx('beam'); }, 1100);
    this.later(() => { this.setState({ heroFx: 'dissolve' }); this.playSfx('dissolve'); }, 1400);
    this.later(() => this.setState({ heroFx: 'gone', iris: { x: gx, y: gy, mode: 'close' } }), 2000);
    this.later(() => this.setState({ room: to, x: stand, visited: this.markVisited(to), ...this.resetRoomFx(), heroFx: 'gone', gate: false, beam: true, flames: true, iris: { x: stand + 48, y: arriveTop + 80, mode: 'open' } }), 2600);
    this.later(() => { this.setState({ heroFx: 'materialize' }); this.playSfx('materialize'); }, 3100);
    this.later(() => this.setState({ heroFx: null, beam: false, flames: false }), 3700);
    this.later(() => { this.setState({ iris: null }); this.end(); this.focusSel('#room-plate'); }, 3800);
  }

  // capela: cada vitral aceso projeta sua cor e mostra sua família da stack
  paneDefs() {
    return [
      { k: 'v', label: 'Design', cx: 720, cy: 138 },
      { k: 'r', label: 'Back-end', cx: 580, cy: 330 },
      { k: 'o', label: 'Qualidade', cx: 860, cy: 330 },
      { k: 'c', label: 'Front-end', cx: 720, cy: 382 }
    ];
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
  lightPane(k: any) {
    if (this.busy) return;
    const s = this.state;
    const p = this.paneDefs().find((q: any) => q.k === k)!;
    const lit = { ...s.glassLit, [k]: true };
    const all = ['c', 'r', 'o', 'v'].every((q: any) => lit[q]);
    const target = Math.max(60, Math.min(1300, p.cx - 48));
    this.setState({ glassSel: k, glassLit: lit, vitralDone: s.vitralDone || all, walking: true, anim: true, facing: target >= s.x ? 1 : -1, x: target, heroTop: null });
    clearTimeout(this.paneWalk);
    this.paneWalk = setTimeout(() => this.setState({ walking: false, anim: false }), 780);
    if (!s.glassLit[k]) this.playGlass(k);
    if (all && !s.vitralDone) this.playVitral();
  }

  travel(i: any) {
    if (this.busy || (i === this.state.room && this.state.screen === 'castle')) return;
    const finalState = { screen: 'castle', room: i, anim: false, walking: false, heroTop: null, x: this.rooms()[i].stand, facing: 1, fade: false, iris: null, visited: this.markVisited(i), ...this.resetRoomFx() };
    this.begin(() => this.setState(finalState));
    this.setState({ fade: true, dialog: null, form: false });
    this.later(() => this.setState({ ...finalState, fade: true }), 260);
    this.later(() => { this.setState({ fade: false }); this.end(); this.focusSel('#room-plate'); }, 360);
  }

  // uma bola de fogo do Tiago até o alvo; o voo é animado pelo navegador, sem passar pelo estado
  shoot(tx: any, ty: any, onHit: any) {
    if (this.inFlight) return false;
    this.inFlight = true;
    const s = this.state;
    const top = s.heroTop != null ? s.heroTop : this.rooms()[s.room].feet - 158;
    const dir = tx >= s.x + 48 ? 1 : -1;
    const sx = dir > 0 ? s.x + 84 : s.x + 12, sy = top + 62;
    const dx = Math.round(sx - tx), dy = Math.round(sy - ty);
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dur = reduce ? 1 : Math.round(Math.min(480, Math.max(240, Math.hypot(dx, dy) * 0.5)));
    this.lastTrigger = null;
    this.playFire(dur);
    this.setState({ facing: dir, attack: true, dialog: null, ball: { x: tx, y: ty, dx, dy } });
    requestAnimationFrame(() => {
      const q = (sel: any) => this.rootEl && this.rootEl.querySelector(sel);
      [['.fireball', 0], ['.ember.e1', 40], ['.ember.e2', 80]].forEach(([sel, delay]: any) => {
        const el = q(sel);
        if (el && el.animate) el.animate([{ transform: 'translate(' + dx + 'px, ' + dy + 'px)' }, { transform: 'translate(0px, 0px)' }], { duration: dur, delay: reduce ? 0 : delay, easing: 'linear', fill: 'both' });
      });
    });
    setTimeout(() => {
      this.inFlight = false;
      const id = (this.burstId = (this.burstId || 0) + 1);
      this.playBoom();
      this.setState({ ball: null, attack: false, burst: { x: tx, y: ty } });
      if (onHit) onHit();
      setTimeout(() => { if (this.burstId === id) this.setState({ burst: null }); }, 500);
    }, dur + 20);
    return true;
  }

  hitBat(i: any) {
    if (this.busy || !this.state.bats[i]) return;
    const b = this.bugDefs()[i];
    this.shoot(b.x + 36, b.y + 24, () => {
      const bats = this.state.bats.slice();
      bats[i] = false;
      this.setState({ bats });
      if (!bats.some(Boolean)) { this.playJingle(); this.focusSel('#quest-panel'); }
    });
  }

  // morcegos de passagem: não limpam bug, só somam bônus e voltam a voar depois
  hitAmb(k: any, e: any) {
    if (this.busy || this.state.amb[k].dead || !this.rootEl) return;
    const stage = this.rootEl.querySelector('.stage');
    const el = e && e.currentTarget;
    if (!stage || !el) return;
    const r = el.getBoundingClientRect(), q = stage.getBoundingClientRect(), sc = this.state.scale || 1;
    const tx = (r.left - q.left) / sc + 24 + 50, ty = (r.top - q.top) / sc + 16;
    this.shoot(tx, ty, () => {
      const amb = this.state.amb.map((a: any, j: any) => (j === k ? { dead: true, gen: a.gen } : a));
      this.setState({ amb, bonus: this.state.bonus + 1 });
      setTimeout(() => this.setState({ amb: this.state.amb.map((a: any, j: any) => (j === k ? { dead: false, gen: 1 - a.gen } : a)) }), 2600);
    });
  }

  caseFinal(id: any) {
    return { screen: 'case', caseId: id, anim: false, walking: false, heroFx: null, x: 257, heroTop: 586, facing: 1, flash: false, iris: null, dialog: null, beam: false };
  }

  openPortrait(p: any) {
    if (this.busy) return;
    this.clearTimers();
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    const quick = !!this.seenCases[p.id];
    this.seenCases[p.id] = true;
    this.begin(() => { this.setState(this.caseFinal(p.id)); this.focusSel('#case-title'); });
    this.setState({ walking: true, anim: true, facing: cx - 48 >= this.state.x ? 1 : -1, x: cx - 48, heroTop: null, dialog: null });
    // salta até o quadro, se desfaz nele e a íris fecha sobre a pintura
    this.later(() => this.setState({ walking: false, anim: true, heroTop: cy - 80 }), 800);
    this.later(() => this.setState({ heroFx: 'dissolve' }), 1250);
    this.later(() => this.setState({ heroFx: 'gone', iris: { x: cx, y: cy, mode: 'close' } }), 1850);
    const arrive = () => {
      this.setState({ ...this.caseFinal(p.id), heroFx: 'gone', heroTop: 196, iris: { x: 305, y: 275, mode: 'open' } });
      this.later(() => this.setState({ heroFx: 'materialize' }), 600);
      this.later(() => this.setState({ heroFx: null, anim: true, heroTop: 586 }), 1200);
      this.later(() => { this.setState({ anim: false, iris: null }); this.end(); this.focusSel('#case-title'); }, 1700);
    };
    if (quick) this.later(arrive, 2450);
    else {
      this.later(() => this.setState({ screen: 'loading', iris: null, anim: false, heroFx: null, caseId: p.id, loadTarget: 'Galeria › ' + p.title }), 2450);
      this.later(arrive, 2450 + 1000);
    }
  }

  leaveCase() {
    if (this.busy) return;
    this.clearTimers();
    const p = this.portraitDefs().find((q: any) => q.id === this.state.caseId) || this.portraitDefs()[1];
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    const floor = this.rooms()[3].feet - 158;
    const back = '[data-portrait="' + p.id + '"]';
    const finalState = { screen: 'castle', room: 3, anim: false, walking: false, fade: false, flash: false, iris: null, x: cx - 48, heroTop: floor, facing: 1, ...this.resetRoomFx() };
    this.begin(() => { this.setState(finalState); this.focusSel(back); });
    // volta ao quadro do projeto, some nele; na galeria a íris abre sobre o retrato e ele salta para fora
    this.setState({ walking: true, anim: true, facing: -1, x: 257, heroTop: 586 });
    this.later(() => this.setState({ walking: false, heroTop: 196 }), 760);
    this.later(() => this.setState({ anim: false, heroFx: 'dissolve' }), 1200);
    this.later(() => this.setState({ heroFx: 'gone', iris: { x: 305, y: 275, mode: 'close' } }), 1800);
    this.later(() => this.setState({ ...finalState, heroTop: cy - 80, heroFx: 'gone', iris: { x: cx, y: cy, mode: 'open' } }), 2400);
    this.later(() => this.setState({ heroFx: 'materialize' }), 3000);
    this.later(() => this.setState({ heroFx: null, anim: true, heroTop: floor }), 3600);
    this.later(() => { this.setState({ anim: false, iris: null }); this.end(); this.focusSel(back); }, 4100);
  }

  vals() {
    const s = this.state;
    const rooms = this.rooms();
    const r = rooms[s.room];
    const defs = this.bugDefs();
    const fixed = 3 - s.bats.filter(Boolean).length;
    const c = (this.cases() as Record<string, any>)[s.caseId] || this.cases().blume;
    const fx = s.heroFx;
    const heroCls = 'hero' + (s.walking ? ' walking' : '') + (s.facing < 0 ? ' left' : '') + (s.anim ? ' moving' : '') + (fx ? ' ' + fx : '') + (s.attack ? ' attack' : '');
    const d = s.dialog;
    const heroTopNow = s.heroTop != null ? s.heroTop : r.feet - 158;
    const book = ({
      out: { x: 236, y: 330, w: 24, h: 78, src: '/assets/castelo/382df148ca7e674069c4a7970544d620.png' },
      fly: { x: 436, y: 474, w: 24, h: 78, src: '/assets/castelo/382df148ca7e674069c4a7970544d620.png' },
      held: { x: 400, y: 496, w: 96, h: 66, src: '' }
    } as Record<string, { x: number; y: number; w: number; h: number; src: string }>)[s.book] || { x: 0, y: 0, w: 0, h: 0, src: '' };
    return {
      rootRef: this.setRoot,
      scale: s.scale,
      yes: true,
      busy: s.busy,
      wide: !s.narrow,
      mbZoom: Math.min(1, (s.vw || 390) / 390),
      mbH: Math.max(640, Math.round((s.vh || 844) / Math.min(1, (s.vw || 390) / 390))),
      narrow: s.narrow,
      rootOverflow: s.narrow ? 'auto' : 'hidden',
      rootAlign: s.narrow ? 'flex-start' : 'center',
      innerCls: s.paused ? 'paused' : '',
      pausedStr: s.paused ? 'true' : 'false',
      paused: s.paused,
      notPaused: !s.paused,
      copyLabel: s.copied ? 'E-mail copiado ✓' : 'Copiar e-mail',
      copyEmail: () => {
        const done = () => { this.setState({ copied: true }); clearTimeout(this.copyTimer); this.copyTimer = setTimeout(() => this.setState({ copied: false }), 2200); };
        try { navigator.clipboard.writeText('tialves.dev@gmail.com').then(done, done); } catch (e) { done(); }
      },
      pauseLabel: s.paused ? 'Retomar animações' : 'Pausar animações',
      togglePause: () => this.setState({ paused: !this.state.paused }),
      crt: s.crt,
      showHint: s.visited.filter(Boolean).length <= 1,
      jumps: rooms.map((rr: any, i: any) => ({ label: rr.section, go: () => this.travel(i) })),
      errName: s.formErr.name || '', errEmail: s.formErr.email || '', errMsg: s.formErr.message || '',
      errNameInv: s.formErr.name ? 'true' : 'false', errEmailInv: s.formErr.email ? 'true' : 'false', errMsgInv: s.formErr.message ? 'true' : 'false',
      inCastle: s.screen === 'castle',
      inLoading: s.screen === 'loading',
      inCase: s.screen === 'case',
      roomName: r.name,
      roomSection: r.section,
      roomImg: r.img,
      roomAlt: r.alt,
      isEntrada: s.room === 0,
      isSobre: s.room === 1,
      isExp: s.room === 2,
      isProj: s.room === 3,
      isHab: s.room === 4,
      isContato: s.room === 5,
      glows: this.glowsFor(s.room),
      stars: [[60, 30], [210, 22], [300, 60], [540, 40], [700, 18], [820, 70], [980, 30], [1080, 12], [1240, 52], [1400, 26], [460, 110], [620, 140]].map(([x, y]: any, i: any) => ({ x, y, d: (i * 0.37) % 2.2 })),
      ticks: Array.from({ length: 12 }, (_: any, i: any) => ({ deg: i * 30 })),
      hourDeg: s.clockDone ? 360 : 305,
      minDeg: s.clockDone ? 1080 : 60,
      clockCls: 'clock' + (s.clockRun ? ' run' : s.clockDone ? ' end' : '') + (s.bell ? ' ring' : ''),
      relicCls: s.relicPulse ? 'relic pulse' : 'relic',
      showBook: s.book === 'out' || s.book === 'fly',
      bookHeld: s.book === 'held',
      bookSrc: book.src, bookX: book.x, bookY: book.y, bookW: book.w, bookH: book.h,
      glintAX: book.x - 18, glintAY: book.y - 18, glintBX: book.x + book.w - 12, glintBY: book.y - 6,
      quillCls: 'quill ' + (s.quill || 'rest'),
      quillX: s.quill === 'fly' || s.quill === 'write' ? 666 : 888,
      quillY: s.quill === 'write' ? 484 : s.quill === 'fly' || s.quill === 'back' ? 456 : 483,
      candleFlames: this.flamesFor(s.room),
      halos: this.halosFor(s.room),
      miniBats: s.room === 0 ? [[330, 190, 13, 0, 1], [300, 150, 10, -4, 0.8], [340, 230, 16, -9, 1], [270, 120, 8, -2, 0.7], [345, 210, 19, -13, 0.9], [320, 170, 12, -7, 0.75]].map(([rx, ry, t, d, sc]: any) => ({ style: '--rx: ' + rx + 'px; --ry: ' + ry + 'px; --t: ' + t + 's; --d: ' + d + 's; width: ' + Math.round(30 * sc) + 'px; height: ' + Math.round(20 * sc) + 'px; background-size: ' + Math.round(240 * sc) + 'px ' + Math.round(20 * sc) + 'px' })) : [],
      motes: this.motesFor(s.room),
      fglints: s.room === 3 ? [[195, 240], [393, 240], [195, 399], [393, 399], [600, 228], [840, 228], [600, 408], [840, 408], [1050, 240], [1245, 240], [1050, 399], [1245, 399]].map(([x, y]: any, i: any) => ({ x: x - 4, y: y - 4, d: ((i * 7) % 12) * 0.5 })) : [],
      cityLights: [{"x":849,"y":381,"off":"#0d091e","d":0},{"x":684,"y":429,"off":"#0e091e","d":1.7},{"x":669,"y":438,"off":"#0e0b1f","d":3.4},{"x":870,"y":438,"off":"#0b091d","d":5.1},{"x":669,"y":480,"off":"#0d0a1f","d":6.8}].map((l: any) => ({ ...l, style: 'left: ' + l.x + 'px; top: ' + l.y + 'px; --off: ' + l.off + '; animation-delay: ' + l.d + 's' })),
      sketch: s.sketch,
      astro: s.astro,
      noGlass: !s.glassSel,
      selC: s.glassSel === 'c', selR: s.glassSel === 'r', selO: s.glassSel === 'o', selV: s.glassSel === 'v',
      rayCls: 'rays' + (s.glassSel ? ' on-' + s.glassSel : s.vitralDone ? ' all' : ''),
      winCls: 'win-glow' + (s.vitralDone ? ' done' : '') + (s.glassSel ? ' on-' + s.glassSel : ''),
      litCount: ['c', 'r', 'o', 'v'].filter((k: any) => s.glassLit[k]).length,
      litDots: ['c', 'r', 'o', 'v'].map((k: any) => ({ cls: 'vt-dot vt-' + k + (s.glassLit[k] ? ' on' : '') })),
      vitralDone: s.vitralDone,
      panes: this.paneDefs().map((p: any) => ({ ...p, x: p.cx - 30, y: p.cy - 30, pressed: s.glassSel === p.k ? 'true' : 'false', cls: 'pane pane-' + p.k + (s.glassLit[p.k] ? ' on' : '') + (s.glassSel === p.k ? ' sel' : ''), light: () => this.lightPane(p.k) })),
      padCls: s.gate ? 'pad charge' : 'pad',
      padCharge: s.gate,
      flames: s.flames,
      flameList: [[-12, 104, 0], [72, 96, 0.3], [8, 58, 0.6], [54, 38, 0.15], [30, 118, 0.45]].map(([dx, dy, dd]: any) => ({ x: s.x + dx, y: heroTopNow + dy, d: dd })),
      beamX: s.x + 48,
      showContactInfo: !s.form,
      form: s.form,
      spots: r.spots.map((sp: any) => ({ ...sp, act: () => this.act(sp.id) })),
      bats: defs.map((b: any, i: any) => ({ ...b, alive: s.bats[i], hit: () => this.hitBat(i) })).filter((b: any) => b.alive),
      hasBall: !!s.ball,
      ballX: s.ball ? s.ball.x : 0,
      ballY: s.ball ? s.ball.y : 0,
      ballDx: s.ball ? s.ball.dx : 0,
      ballDy: s.ball ? s.ball.dy : 0,
      ambBats: s.amb.map((a: any, k: any) => ({ cls: 'amb-bat ab' + (k + 1) + ' g' + a.gen + (a.dead ? ' dead' : ''), hit: (e: any) => this.hitAmb(k, e) })),
      hasBonus: s.bonus > 0,
      bonus: s.bonus,
      bonusWord: s.bonus === 1 ? 'morcego de passagem' : 'morcegos de passagem',
      hasBurst: !!s.burst,
      burstX: s.burst ? s.burst.x : 0,
      burstY: s.burst ? s.burst.y : 0,
      quest: defs.map((b: any, i: any) => ({
        type: 'Bug de ' + b.type.toLowerCase(),
        fix: s.bats[i] ? '???' : b.fix,
        color: s.bats[i] ? '#9a92ac' : '#ece6d4',
        checkCls: s.bats[i] ? 'check' : 'check on'
      })),
      questDone: fixed === 3,
      questOpen: fixed < 3,
      portraits: this.portraitDefs().map((p: any) => ({ ...p, px: p.x - 20, pw: p.w + 40, py: p.y + p.h + 14, plaqueCls: p.id === 'blume' ? 'plaque feat' : 'plaque', aria: 'Entrar na pintura do projeto ' + p.title, open: () => this.openPortrait(p) })),
      heroCls,
      x: s.x,
      heroTop: heroTopNow,
      beam: s.beam,
      beamH: r.feet - 10,
      hasIris: !!s.iris,
      irisCls: s.iris ? 'iris ' + s.iris.mode : 'iris',
      irisX: s.iris ? s.iris.x : 0,
      irisY: s.iris ? s.iris.y : 0,
      fadeCls: s.fade ? 'fade on' : 'fade',
      flashCls: s.flash ? 'flash on' : 'flash',
      hasDialog: !!d,
      dialogWho: d ? d.who : '',
      dialogTitle: d ? d.title : '',
      dialogText: d ? d.text : '',
      dialogParts: this.kwParts(d ? d.text : ''),
      caseSubParts: this.kwParts(c.sub),
      caseNoteParts: this.kwParts(c.note),
      doorCls: 'door' + (s.door ? ' ' + s.door : ''),
      doorLit: s.doorLit,
      dialogFacts: d ? d.facts : [],
      loadTarget: s.loadTarget,
      loadDur: 0.9,
      caseImg: c.img,
      caseTitle: c.title,
      caseKicker: c.kicker,
      caseSub: c.sub,
      caseChips: c.chips,
      caseNote: c.note,
      caseFull: c.full,
      caseArch: c.arch.map((label: any, i: any) => ({
        label,
        arrow: i < c.arch.length - 1,
        border: i === 0 ? '#3ec8d4' : label.indexOf('[') >= 0 ? '#5a4a30' : '#8a5c14',
        color: i === 0 ? '#d4fff6' : label.indexOf('[') >= 0 ? '#a39a86' : '#f6dc8c'
      })),
      goNext: () => this.go(1),
      goProjects: () => this.travel(3),
      openForm: () => this.setState({ form: true, dialog: null }),
      closeForm: () => this.setState({ form: false, formErr: {} }),
      formGeneral: (s.formErr && s.formErr.general) || '',
      sendLabel: s.sending ? 'Gravando…' : '◆ Gravar e enviar',
      sending: !!s.sending,
      send: () => this.sendForm(),
      closeDialog: () => this.closeDialog(),
      skipAnim: () => this.skipAnim(),
      leaveCase: () => this.leaveCase(),
      keydown: (e: any) => {
        if (this.state.narrow) return;
        const tag = e.target && e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') { if (e.key === 'Escape') this.setState({ form: false, formErr: {} }); return; }
        if (e.key === 'Escape') {
          if (this.busy) this.skipAnim();
          else if (this.state.dialog) this.closeDialog();
          else if (this.state.form) this.setState({ form: false, formErr: {} });
          else if (this.state.screen === 'case') this.leaveCase();
        } else if (e.key === ' ' && this.busy) {
          e.preventDefault();
          this.skipAnim();
        } else if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey) {
          this.setState({ paused: !this.state.paused });
        } else if (this.state.screen === 'castle' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
          e.preventDefault();
          this.go(e.key === 'ArrowRight' ? 1 : -1);
        }
      },
      wheel: (e: any) => {
        if (this.state.screen !== 'castle' || Math.abs(e.deltaY) < 15) return;
        const now = Date.now();
        if (now - this.lastWheel < 1100) return;
        this.lastWheel = now;
        this.go(e.deltaY > 0 ? 1 : -1);
      }
    };
  }

  render() {
    const v: any = this.vals();
    return (
      <div ref={v.rootRef} role="region" aria-label="Castelo jogável: portfólio do Tiago. Role ou use as setas do teclado para andar; Esc fecha diálogos e pula animações; P pausa as animações." tabIndex={0} onKeyDown={v.keydown} style={sx(`position: relative; width: 100%; height: 100vh; overflow: ${v.rootOverflow}; background: #000000; display: flex; align-items: ${v.rootAlign}; justify-content: center`)}>
        {v.wide && (
          <>
            <div className={v.innerCls} style={sx(`position: relative; flex: none; width: 1440px; height: 810px; overflow: hidden; background: #000000; color: #d8cfbb; font-family: 'Pixelify Sans', Silkscreen, monospace; font-size: 17px; line-height: 1.45; transform: scale(${v.scale}); transform-origin: center center`)}>
              <nav className="jump" aria-label="Ir para uma seção">
                <span className="lbl">
                  Ir para
                </span>
                {(v.jumps as any[]).map((j: any, i1: number) => (
                  <Fragment key={i1}>
                    <button type="button" className="cell" onClick={j.go}>
                      {j.label}
                    </button>
                  </Fragment>
                ))}
                <a className="cell" href="Main.dc.html">
                  Versão em texto
                </a>
              </nav>
              {v.inCastle && (
                <>
                  <div className="stage" onWheel={v.wheel}>
                    <img className="px" src={v.roomImg} alt={v.roomAlt} style={sx(`position: absolute; inset: 0; width: 1440px; height: 810px; z-index: 0`)} />
                    {(v.glows as any[]).map((g: any, i2: number) => (
                      <Fragment key={i2}>
                        <span className="glow" aria-hidden="true" style={sx(`left: ${g.l}px; top: ${g.t}px; width: ${g.s}px; height: ${g.s}px; background: radial-gradient(circle, ${g.c}, transparent 68%); animation-delay: ${g.d}s`)} />
                      </Fragment>
                    ))}
                    {(v.halos as any[]).map((hl: any, i3: number) => (
                      <Fragment key={i3}>
                        <span className="halo" aria-hidden="true" style={sx(hl.style)} />
                      </Fragment>
                    ))}
                    {(v.candleFlames as any[]).map((fm: any, i4: number) => (
                      <Fragment key={i4}>
                        <span className={fm.cls} aria-hidden="true" style={sx(`left: ${fm.x}px; top: ${fm.y}px; animation-duration: ${fm.dur}s; animation-delay: ${fm.d}s`)} />
                      </Fragment>
                    ))}
                    {(v.motes as any[]).map((mt: any, i5: number) => (
                      <Fragment key={i5}>
                        <span className="mote" aria-hidden="true" style={sx(`left: ${mt.x}px; top: ${mt.y}px; background: ${mt.c}; animation-duration: ${mt.dur}s; animation-delay: ${mt.d}s`)} />
                      </Fragment>
                    ))}
                    {(v.fglints as any[]).map((fg: any, i6: number) => (
                      <Fragment key={i6}>
                        <span className="fglint" aria-hidden="true" style={sx(`left: ${fg.x}px; top: ${fg.y}px; animation-delay: ${fg.d}s`)} />
                      </Fragment>
                    ))}
                    {v.isSobre && (
                      <>
                        <span className="rain" aria-hidden="true" />
                        <span className="lightning" aria-hidden="true" />
                        <span className="storm-flash" aria-hidden="true" />
                      </>
                    )}
                    {v.isEntrada && (
                      <>
                        <span className="moon-glow" aria-hidden="true" />
                        <span className="moon-glint" aria-hidden="true" style={sx(`left: 1004px; top: 110px`)} />
                        <span className="moon-glint" aria-hidden="true" style={sx(`left: 1236px; top: 92px; animation-delay: 1.4s`)} />
                        <span className="moon-glint" aria-hidden="true" style={sx(`left: 1188px; top: 262px; animation-delay: 2.8s`)} />
                        {(v.miniBats as any[]).map((mb: any, i7: number) => (
                          <Fragment key={i7}>
                            <span className="mini-bat" aria-hidden="true" style={sx(mb.style)} />
                          </Fragment>
                        ))}
                        <span className={v.doorCls} aria-hidden="true" />
                        {v.doorLit && (
                          <>
                            <span className="door-glow" aria-hidden="true" />
                          </>
                        )}
                        {(v.stars as any[]).map((st: any, i8: number) => (
                          <Fragment key={i8}>
                            <span className="twinkle" aria-hidden="true" style={sx(`left: ${st.x}px; top: ${st.y}px; animation-delay: ${st.d}s`)} />
                          </Fragment>
                        ))}
                      </>
                    )}
                    {v.isExp && (
                      <>
                        <div className="clouds" aria-hidden="true">
                          <span />
                        </div>
                        <span className="lamp-flick" aria-hidden="true" />
                        {(v.cityLights as any[]).map((cl: any, i9: number) => (
                          <Fragment key={i9}>
                            <span className="clight" aria-hidden="true" style={sx(cl.style)} />
                          </Fragment>
                        ))}
                        {(v.ambBats as any[]).map((ab: any, i10: number) => (
                          <Fragment key={i10}>
                            <button type="button" className={ab.cls} onClick={ab.hit} aria-label="Morcego de passagem: alvo bônus" />
                          </Fragment>
                        ))}
                        {v.hasBonus && (
                          <>
                            <span className="bonus" role="status">
                              Bônus · {v.bonus} {v.bonusWord}
                            </span>
                          </>
                        )}
                        <div className={v.clockCls} aria-hidden="true" />
                      </>
                    )}
                    {v.isHab && (
                      <>
                        <span className={v.rayCls} aria-hidden="true" />
                      </>
                    )}
                    <div className="vig" />
                    {v.isContato && (
                      <>
                        <span className={v.relicCls} aria-hidden="true" />
                        <button type="button" className={v.padCls} onClick={v.goNext} aria-label="Círculo de teleporte de volta à entrada do castelo" />
                        {v.padCharge && (
                          <>
                            <span className="sigil-burst" aria-hidden="true" />
                          </>
                        )}
                        <span className="tag" style={sx(`left: 1270px; bottom: auto; top: 652px; z-index: 4; text-transform: uppercase`)}>
                          Círculo ▸ entrada
                        </span>
                      </>
                    )}
                    {v.isEntrada && (
                      <>
                        <section className="title-float" aria-label="Início" style={sx(`left: 72px; top: 130px; width: 660px; gap: 14px`)}>
                          <span className="kicker">
                            Desenvolvedor · Designer · São Paulo
                          </span>
                          <h1 className="title-name" aria-label="Tiago Alves da Silva">
                            <span>
                              <svg className="capg" viewBox="0 0 15.4 21.6" style={sx(`width: 0.6417em`)} shapeRendering="crispEdges" aria-hidden="true">
                                <defs>
                                  <linearGradient id="cap-t" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="21.6">
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
                                <path fill="url(#cap-t)" d="M3.5 3.8h9v1h-9zM13.5 3.8h1v1h-1zM1.5 4.8h11v1h-11zM13.5 4.8h2v1h-2zM0.5 5.8h2v1h-2zM6.5 5.8h3v1h-3zM13.5 5.8h1v1h-1zM0.5 6.8h1v1h-1zM6.5 6.8h3v1h-3zM6.5 7.8h3v1h-3zM6.5 8.8h3v1h-3zM6.5 9.8h3v1h-3zM6.5 10.8h3v1h-3zM6.5 11.8h3v1h-3zM6.5 12.8h3v1h-3zM6.5 13.8h3v1h-3zM6.5 14.8h3v1h-3zM5.5 15.8h5v1h-5zM6.5 16.8h3v1h-3z" />
                              </svg>
                              iago{' '}
                              <span className="cap">
                                A
                              </span>
                              lves
                            </span>
                            <span>
                              da{' '}
                              <span className="cap">
                                S
                              </span>
                              ilva
                            </span>
                          </h1>
                          <svg viewBox="0 0 100 6" width="300" height="18" shapeRendering="crispEdges" aria-hidden="true">
                            <rect x="0" y="3" width="44" height="1" fill="#8a5c14" />
                            <rect x="56" y="3" width="44" height="1" fill="#8a5c14" />
                            <rect x="14" y="2" width="30" height="1" fill="#e8b038" />
                            <rect x="56" y="2" width="30" height="1" fill="#e8b038" />
                            <rect x="45" y="3" width="1" height="1" fill="#f6dc8c" />
                            <rect x="54" y="3" width="1" height="1" fill="#f6dc8c" />
                            <rect x="50" y="0" width="1" height="1" fill="#e8b038" />
                            <rect x="49" y="1" width="3" height="1" fill="#e8b038" />
                            <rect x="48" y="2" width="5" height="2" fill="#e8b038" />
                            <rect x="49" y="4" width="3" height="1" fill="#e8b038" />
                            <rect x="50" y="5" width="1" height="1" fill="#e8b038" />
                            <rect x="50" y="2" width="1" height="2" fill="#c42032" />
                          </svg>
                          <p className="title-desc">
                            Desenho a tela. Escrevo o código.
                          </p>
                          <div style={sx(`display: flex; gap: 10px; align-items: center; margin-top: 6px`)}>
                            <button type="button" className="btn btn-p" onClick={v.goNext} style={sx(`min-width: 280px`)}>
                              ▶ Entrar no castelo
                            </button>
                            <button type="button" className="icon-btn" aria-pressed={v.pausedStr} aria-label={v.pauseLabel} title={`${v.pauseLabel} (P)`} onClick={v.togglePause}>
                              {v.notPaused && (
                                <>
                                  <svg viewBox="0 0 6 6" width="18" height="18" shapeRendering="crispEdges" aria-hidden="true">
                                    <rect x="0" y="0" width="2" height="6" fill="#f6dc8c" />
                                    <rect x="4" y="0" width="2" height="6" fill="#f6dc8c" />
                                  </svg>
                                </>
                              )}
                              {v.paused && (
                                <>
                                  <svg viewBox="0 0 6 6" width="18" height="18" shapeRendering="crispEdges" aria-hidden="true">
                                    <rect x="0" y="0" width="2" height="6" fill="#d4fff6" />
                                    <rect x="2" y="1" width="2" height="4" fill="#d4fff6" />
                                    <rect x="4" y="2" width="2" height="2" fill="#d4fff6" />
                                  </svg>
                                </>
                              )}
                            </button>
                          </div>
                          <span className="status">
                            <i aria-hidden="true" />
                            Aberto a oportunidades
                          </span>
                        </section>
                      </>
                    )}
                    {v.isSobre && (
                      <>
                        <section className="pn pn-fil" aria-label="Sobre e formação" style={sx(`left: 450px; top: 28px; width: 540px; display: flex; flex-direction: column; gap: 8px`)}>
                          <h2 style={sx(`margin: 0; font: 600 28px 'Pixelify Sans', Silkscreen, monospace; color: #f6dc8c`)}>
                            Sobre
                          </h2>
                          <p style={sx(`margin: 0`)}>
                            Desenvolvedor full stack. Trabalho entre o código e o desenho da interface.
                          </p>
                          <div className="facts">
                            <span className="fact">
                              ADS · SPTech 2023–25
                            </span>
                            <span className="fact">
                              Técnico · ETEC 2021–22
                            </span>
                            <span className="fact">
                              Inglês fluente
                            </span>
                            <span className="fact">
                              Alemão básico
                            </span>
                          </div>
                          <p style={sx(`margin: 0; font-size: 14px; color: #a39a86`)}>
                            Examine a estante, o diário, a prancheta e o astrolábio para saber mais.
                          </p>
                        </section>
                        {v.showBook && (
                          <>
                            <img className="book" src={v.bookSrc} alt="" style={sx(`left: ${v.bookX}px; top: ${v.bookY}px; width: ${v.bookW}px; height: ${v.bookH}px`)} />
                          </>
                        )}
                        {v.bookHeld && (
                          <>
                            <span className="book-sheet" aria-hidden="true" style={sx(`left: ${v.bookX}px; top: ${v.bookY}px`)} />
                            <span className="book-glint" aria-hidden="true" style={sx(`left: ${v.glintAX}px; top: ${v.glintAY}px`)} />
                            <span className="book-glint" aria-hidden="true" style={sx(`left: ${v.glintBX}px; top: ${v.glintBY}px; animation-delay: .25s`)} />
                          </>
                        )}
                        <span className={v.quillCls} aria-hidden="true" style={sx(`left: ${v.quillX}px; top: ${v.quillY}px`)} />
                        {v.sketch && (
                          <>
                            <svg className="sketch" viewBox="0 0 128 108" aria-hidden="true">
                              <rect x="9" y="9" width="111" height="90" />
                              <path d="M9 27 H120 M18 42 H69 M18 54 H57 M18 69 H54 V87 H18 Z M66 69 H111 V87 H66 Z M84 36 H111 V57 H84 Z" />
                            </svg>
                          </>
                        )}
                        {v.astro && (
                          <>
                            <span className="glint" aria-hidden="true" style={sx(`left: 1278px; top: 396px`)} />
                            <span className="glint" aria-hidden="true" style={sx(`left: 1368px; top: 426px; animation-delay: .12s`)} />
                            <span className="glint" aria-hidden="true" style={sx(`left: 1290px; top: 504px; animation-delay: .24s`)} />
                            <span className="glint" aria-hidden="true" style={sx(`left: 1362px; top: 552px; animation-delay: .36s`)} />
                          </>
                        )}
                      </>
                    )}
                    {v.isExp && (
                      <>
                        <section className="pn pn-got" aria-label="Experiência" style={sx(`left: 48px; top: 24px; width: 620px; display: flex; flex-direction: column; gap: 8px`)}>
                          <h2 style={sx(`margin: 0; font: 600 28px 'Pixelify Sans', Silkscreen, monospace; color: #f6dc8c`)}>
                            Experiência
                          </h2>
                          <div style={sx(`display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap`)}>
                            <span style={sx(`font: 600 20px 'Pixelify Sans', Silkscreen, monospace; color: #ffffff`)}>
                              PwC Brasil
                            </span>
                            <span className="lbl">
                              2023 → abr. 2026
                            </span>
                          </div>
                          <div style={sx(`display: flex; align-items: center; gap: 8px; font: 13px Silkscreen, monospace; color: #f6dc8c; text-transform: uppercase`)}>
                            <span style={sx(`padding: 4px 8px; border: 2px solid #8a5c14`)}>
                              Estagiário
                            </span>
                            <span style={sx(`flex: 1; height: 2px; background: #8a5c14`)} />
                            <span style={sx(`padding: 4px 8px; border: 2px solid #3ec8d4; color: #d4fff6`)}>
                              Desenvolvedor front-end + UI
                            </span>
                          </div>
                          <ul style={sx(`margin: 0; padding-left: 18px; font-size: 16px; display: flex; flex-direction: column; gap: 2px`)}>
                            <li>
                              <b className="kw">
                                React
                              </b>
                              ,{' '}
                              <b className="kw">
                                TypeScript
                              </b>
                              ,{' '}
                              <b className="kw">
                                Angular
                              </b>
                              {' '}e{' '}
                              <b className="kw">
                                Nest.js
                              </b>
                              {' '}em{' '}
                              <b className="kw">
                                micro-frontends
                              </b>
                            </li>
                            <li>
                              <b className="kw">
                                APIs REST
                              </b>
                              {' '}com{' '}
                              <b className="kw">
                                Axios
                              </b>
                              {' '}e{' '}
                              <b className="kw">
                                Fetch
                              </b>
                              ; estado com{' '}
                              <b className="kw">
                                Redux
                              </b>
                              {' '}e{' '}
                              <b className="kw">
                                Context API
                              </b>
                            </li>
                            <li>
                              Testes com{' '}
                              <b className="kw">
                                Jest
                              </b>
                              {' '}e{' '}
                              <b className="kw">
                                Testing Library
                              </b>
                              ; pipelines de{' '}
                              <b className="kw">
                                CI/CD
                              </b>
                            </li>
                            <li>
                              Interfaces no{' '}
                              <b className="kw">
                                Figma
                              </b>
                              {' '}e soluções em{' '}
                              <b className="kw">
                                Appian
                              </b>
                            </li>
                          </ul>
                        </section>
                        {v.questDone && (
                          <>
                            <section className="pn pn-car" id="quest-panel" tabIndex={-1} aria-label="Missão: limpar a torre" style={sx(`left: 48px; top: 360px; width: 620px; display: flex; flex-direction: column; gap: 8px`)}>
                              <span className="lbl" style={sx(`color: #ff9aa4`)}>
                                Missão · limpar a torre
                              </span>
                              {(v.quest as any[]).map((q: any, i11: number) => (
                                <Fragment key={i11}>
                                  <div className="quest-row">
                                    <span className={q.checkCls} aria-hidden="true" />
                                    <span style={sx(`font: 13px Silkscreen, monospace; color: #ffb0b8; flex: 0 0 200px`)}>
                                      {q.type}
                                    </span>
                                    <span style={sx(`color: ${q.color}`)}>
                                      {q.fix}
                                    </span>
                                  </div>
                                </Fragment>
                              ))}
                              <div style={sx(`display: flex; align-items: center; gap: 10px; margin-top: 4px; padding: 6px 10px; border: 2px solid #e8b038; background: rgba(232,176,56,.1)`)}>
                                <span style={sx(`font: 13px Silkscreen, monospace; color: #f6dc8c; text-transform: uppercase`)}>
                                  Missão cumprida
                                </span>
                                <span style={sx(`color: #ffffff`)}>
                                  Caçador de bugs: na PwC eu era chamado para resolvê-los.
                                </span>
                              </div>
                            </section>
                          </>
                        )}
                        {(v.bats as any[]).map((b: any, i12: number) => (
                          <Fragment key={i12}>
                            <button type="button" className="bat" onClick={b.hit} aria-label={`Corrigir bug de ${b.type}`} style={sx(`left: ${b.x}px; top: ${b.y}px`)}>
                              <span className="bat-tag">
                                {b.type}
                              </span>
                            </button>
                          </Fragment>
                        ))}
                      </>
                    )}
                    {v.isProj && (
                      <>
                        <div className="pn pn-car" style={sx(`left: 440px; top: 36px; width: 560px; padding: 6px 14px; text-align: center`)}>
                          <span className="lbl">
                            Projetos · entre numa pintura
                          </span>
                        </div>
                        {(v.portraits as any[]).map((p: any, i13: number) => (
                          <Fragment key={i13}>
                            <button type="button" className="pframe" data-portrait={p.id} onClick={p.open} aria-label={p.aria} style={sx(`left: ${p.x}px; top: ${p.y}px; width: ${p.w}px; height: ${p.h}px`)} />
                            <div className={p.plaqueCls} style={sx(`left: ${p.px}px; top: ${p.py}px; width: ${p.pw}px`)}>
                              <span style={sx(`font: 600 17px 'Pixelify Sans', Silkscreen, monospace; color: #f6dc8c`)}>
                                {p.title}
                              </span>
                              <span style={sx(`font-size: 14px; color: #cfc5ad`)}>
                                {p.sub}
                              </span>
                              <span style={sx(`font: 13px Silkscreen, monospace; color: #3ec8d4; text-transform: uppercase`)}>
                                Entrar na pintura ▸
                              </span>
                            </div>
                          </Fragment>
                        ))}
                      </>
                    )}
                    {v.isHab && (
                      <>
                        <span className={v.winCls} aria-hidden="true" />
                        {(v.panes as any[]).map((pz: any, i14: number) => (
                          <Fragment key={i14}>
                            <button type="button" className={pz.cls} onClick={pz.light} aria-pressed={pz.pressed} aria-label={`Deixar a luz entrar pela parte ${pz.label} do vitral`}>
                              <span className="spark" aria-hidden="true" />
                            </button>
                            <span className="ptag" aria-hidden="true" style={sx(`left: ${pz.cx}px; top: ${pz.cy}px`)}>
                              {pz.label}
                            </span>
                          </Fragment>
                        ))}
                        {v.noGlass && (
                          <>
                            <section className="pn pn-got" aria-label="Habilidades" style={sx(`left: 48px; top: 40px; width: 400px; display: flex; flex-direction: column; gap: 10px`)}>
                              <span className="lbl">
                                Capela do Vitral · Habilidades
                              </span>
                              <h2 style={sx(`margin: 0; font: 600 28px 'Pixelify Sans', Silkscreen, monospace; color: #f6dc8c`)}>
                                A stack em vitral
                              </h2>
                              <p style={sx(`margin: 0`)}>
                                Quatro partes do vitral estão apagadas. Clique numa delas para deixar a luz de fora entrar e revelar uma família da stack; acenda as quatro para completar a capela.
                              </p>
                            </section>
                          </>
                        )}
                        {v.selC && (
                          <>
                            <section className="glass glass-c sel" aria-label="Front-end" style={sx(`left: 48px; top: 40px; width: 400px`)}>
                              <span className="mini-v" aria-hidden="true" />
                              <span className="lbl" style={sx(`color: #7fdde6`)}>
                                Vitral ciano
                              </span>
                              <h3>
                                Front-end
                              </h3>
                              <div style={sx(`display: flex; gap: 4px; flex-wrap: wrap; padding-right: 30px`)}>
                                <span className="chip">
                                  React
                                </span>
                                <span className="chip">
                                  TypeScript
                                </span>
                                <span className="chip">
                                  Angular
                                </span>
                                <span className="chip">
                                  Redux
                                </span>
                                <span className="chip">
                                  Tailwind
                                </span>
                                <span className="chip">
                                  MUI
                                </span>
                              </div>
                            </section>
                          </>
                        )}
                        {v.selR && (
                          <>
                            <section className="glass glass-r sel" aria-label="Back-end e dados" style={sx(`left: 48px; top: 40px; width: 400px`)}>
                              <span className="mini-v" aria-hidden="true" />
                              <span className="lbl" style={sx(`color: #ff9aa4`)}>
                                Vitral carmim
                              </span>
                              <h3>
                                Back-end e dados
                              </h3>
                              <div style={sx(`display: flex; gap: 4px; flex-wrap: wrap; padding-right: 30px`)}>
                                <span className="chip">
                                  Node.js
                                </span>
                                <span className="chip">
                                  Nest.js
                                </span>
                                <span className="chip">
                                  Java
                                </span>
                                <span className="chip">
                                  Spring Boot
                                </span>
                                <span className="chip">
                                  REST
                                </span>
                                <span className="chip">
                                  PostgreSQL
                                </span>
                              </div>
                            </section>
                          </>
                        )}
                        {v.selO && (
                          <>
                            <section className="glass glass-o sel" aria-label="Qualidade e DevOps" style={sx(`left: 48px; top: 40px; width: 400px`)}>
                              <span className="mini-v" aria-hidden="true" />
                              <span className="lbl" style={sx(`color: #f6dc8c`)}>
                                Vitral de ouro
                              </span>
                              <h3>
                                Qualidade e DevOps
                              </h3>
                              <div style={sx(`display: flex; gap: 4px; flex-wrap: wrap`)}>
                                <span className="chip">
                                  Jest
                                </span>
                                <span className="chip">
                                  Testing Library
                                </span>
                                <span className="chip">
                                  CI/CD
                                </span>
                                <span className="chip">
                                  Docker
                                </span>
                                <span className="chip">
                                  Kubernetes
                                </span>
                                <span className="chip">
                                  AWS
                                </span>
                              </div>
                            </section>
                          </>
                        )}
                        {v.selV && (
                          <>
                            <section className="glass glass-v sel" aria-label="Design e idiomas" style={sx(`left: 48px; top: 40px; width: 400px`)}>
                              <span className="mini-v" aria-hidden="true" />
                              <span className="lbl" style={sx(`color: #c8a8f0`)}>
                                Vitral roxo
                              </span>
                              <h3>
                                Design e idiomas
                              </h3>
                              <div style={sx(`display: flex; gap: 4px; flex-wrap: wrap`)}>
                                <span className="chip">
                                  Figma
                                </span>
                                <span className="chip">
                                  Acessibilidade
                                </span>
                              </div>
                              <div style={sx(`display: grid; grid-template-columns: 96px minmax(0, 1fr) 78px; align-items: center; gap: 4px 8px; font: 13px Silkscreen, monospace; color: #f6dc8c`)}>
                                <span>
                                  Português
                                </span>
                                <div className="bar" role="meter" aria-label="Português nativo" aria-valuemin={0} aria-valuemax={3} aria-valuenow={3}>
                                  <i className="fill fill-r" style={sx(`width: calc(100% + 42px)`)} />
                                </div>
                                <span>
                                  Nativo
                                </span>
                                <span>
                                  Inglês
                                </span>
                                <div className="bar" role="meter" aria-label="Inglês fluente" aria-valuemin={0} aria-valuemax={3} aria-valuenow={3}>
                                  <i className="fill" style={sx(`width: calc(100% + 42px)`)} />
                                </div>
                                <span>
                                  Fluente
                                </span>
                                <span>
                                  Alemão
                                </span>
                                <div className="bar" role="meter" aria-label="Alemão básico" aria-valuemin={0} aria-valuemax={3} aria-valuenow={1}>
                                  <i className="fill fill-o" style={sx(`width: calc((100% + 42px) * .333)`)} />
                                </div>
                                <span>
                                  Básico
                                </span>
                              </div>
                            </section>
                          </>
                        )}
                        <div className="vt-progress" role="status">
                          <span className="lbl" style={sx(`color: #cbb98f`)}>
                            Vitrais acesos
                          </span>
                          {(v.litDots as any[]).map((vd: any, i15: number) => (
                            <Fragment key={i15}>
                              <span className={vd.cls} />
                            </Fragment>
                          ))}
                          <span>
                            {v.litCount}/4
                          </span>
                          {v.vitralDone && (
                            <>
                              <span style={sx(`color: #f6dc8c`)}>
                                · Capela completa
                              </span>
                            </>
                          )}
                        </div>
                      </>
                    )}
                    {v.isContato && (
                      <>
                        {v.showContactInfo && (
                          <>
                            <section className="pn pn-car" aria-label="Contato" style={sx(`left: 48px; top: 36px; width: 568px; display: flex; flex-direction: column; gap: 12px`)}>
                              <span className="kicker">
                                Fim do passeio · sala do portal
                              </span>
                              <h2 className="title-name" aria-label="Vamos conversar" style={sx(`font-size: 68px`)}>
                                <svg className="capg" viewBox="0 0 15 21.6" style={sx(`width: 0.6250em`)} shapeRendering="crispEdges" aria-hidden="true">
                                  <defs>
                                    <linearGradient id="cap-v" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="21.6">
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
                                  <path fill="url(#cap-v)" d="M0.5 3.8h3v1h-3zM10.5 3.8h1v1h-1zM12.5 3.8h2v1h-2zM1.5 4.8h3v1h-3zM10.5 4.8h3v1h-3zM1.5 5.8h3v1h-3zM11.5 5.8h2v1h-2zM2.5 6.8h3v1h-3zM11.5 6.8h2v1h-2zM2.5 7.8h3v1h-3zM11.5 7.8h1v1h-1zM3.5 8.8h3v1h-3zM10.5 8.8h2v1h-2zM3.5 9.8h3v1h-3zM10.5 9.8h1v1h-1zM4.5 10.8h3v1h-3zM9.5 10.8h2v1h-2zM4.5 11.8h3v1h-3zM9.5 11.8h1v1h-1zM5.5 12.8h3v1h-3zM9.5 12.8h1v1h-1zM5.5 13.8h5v1h-5zM6.5 14.8h3v1h-3zM6.5 15.8h2v1h-2zM6.5 16.8h1v1h-1z" />
                                </svg>
                                amos conversar
                              </h2>
                              <p style={sx(`margin: 0; font-size: 18px; line-height: 1.4; color: #ece2cc`)}>
                                Estou aberto a oportunidades como desenvolvedor full stack. Escolha o canal que preferir: eu respondo.
                              </p>
                              <div className="channels">
                                <a className="channel ch-mail ch-main" href="mailto:tialves.dev@gmail.com">
                                  <span className="ch-icon">
                                    <svg viewBox="0 0 12 9" width="36" height="27" shapeRendering="crispEdges" aria-hidden="true">
                                      <path d="M0 0h1v1h-1zM1 0h1v1h-1zM2 0h1v1h-1zM3 0h1v1h-1zM4 0h1v1h-1zM5 0h1v1h-1zM6 0h1v1h-1zM7 0h1v1h-1zM8 0h1v1h-1zM9 0h1v1h-1zM10 0h1v1h-1zM11 0h1v1h-1zM0 1h1v1h-1zM1 1h1v1h-1zM10 1h1v1h-1zM11 1h1v1h-1zM0 2h1v1h-1zM2 2h1v1h-1zM9 2h1v1h-1zM11 2h1v1h-1zM0 3h1v1h-1zM3 3h1v1h-1zM8 3h1v1h-1zM11 3h1v1h-1zM0 4h1v1h-1zM4 4h1v1h-1zM7 4h1v1h-1zM11 4h1v1h-1zM0 5h1v1h-1zM5 5h1v1h-1zM6 5h1v1h-1zM11 5h1v1h-1zM0 6h1v1h-1zM11 6h1v1h-1zM0 7h1v1h-1zM11 7h1v1h-1zM0 8h1v1h-1zM1 8h1v1h-1zM2 8h1v1h-1zM3 8h1v1h-1zM4 8h1v1h-1zM5 8h1v1h-1zM6 8h1v1h-1zM7 8h1v1h-1zM8 8h1v1h-1zM9 8h1v1h-1zM10 8h1v1h-1zM11 8h1v1h-1z" fill="#f6dc8c" />
                                    </svg>
                                  </span>
                                  <span>
                                    <span className="ch-k">
                                      E-mail
                                    </span>
                                    <span className="ch-v">
                                      tialves.dev@gmail.com
                                    </span>
                                  </span>
                                  <span className="ch-go" aria-hidden="true">
                                    Escrever ▸
                                  </span>
                                </a>
                                <a className="channel ch-in" href="https://www.linkedin.com/in/ti-alves/" target="_blank" rel="noopener noreferrer">
                                  <span className="ch-icon">
                                    <svg viewBox="0 0 12 10" width="36" height="30" shapeRendering="crispEdges" aria-hidden="true">
                                      <path d="M4 0h1v1h-1zM5 0h1v1h-1zM6 0h1v1h-1zM7 0h1v1h-1zM3 1h1v1h-1zM8 1h1v1h-1zM0 2h1v1h-1zM1 2h1v1h-1zM2 2h1v1h-1zM3 2h1v1h-1zM4 2h1v1h-1zM5 2h1v1h-1zM6 2h1v1h-1zM7 2h1v1h-1zM8 2h1v1h-1zM9 2h1v1h-1zM10 2h1v1h-1zM11 2h1v1h-1zM0 3h1v1h-1zM11 3h1v1h-1zM0 4h1v1h-1zM11 4h1v1h-1zM0 5h1v1h-1zM1 5h1v1h-1zM2 5h1v1h-1zM3 5h1v1h-1zM4 5h1v1h-1zM7 5h1v1h-1zM8 5h1v1h-1zM9 5h1v1h-1zM10 5h1v1h-1zM11 5h1v1h-1zM0 6h1v1h-1zM4 6h1v1h-1zM5 6h1v1h-1zM6 6h1v1h-1zM7 6h1v1h-1zM11 6h1v1h-1zM0 7h1v1h-1zM11 7h1v1h-1zM0 8h1v1h-1zM11 8h1v1h-1zM0 9h1v1h-1zM1 9h1v1h-1zM2 9h1v1h-1zM3 9h1v1h-1zM4 9h1v1h-1zM5 9h1v1h-1zM6 9h1v1h-1zM7 9h1v1h-1zM8 9h1v1h-1zM9 9h1v1h-1zM10 9h1v1h-1zM11 9h1v1h-1z" fill="#7fdde6" />
                                    </svg>
                                  </span>
                                  <span>
                                    <span className="ch-k">
                                      LinkedIn
                                    </span>
                                    <span className="ch-v">
                                      linkedin.com/in/ti-alves
                                    </span>
                                  </span>
                                  <span className="ch-go" aria-hidden="true">
                                    Conectar ▸
                                  </span>
                                </a>
                                <a className="channel ch-gh" href="https://github.com/tialvesdev" target="_blank" rel="noopener noreferrer">
                                  <span className="ch-icon">
                                    <svg viewBox="0 0 17 9" width="51" height="27" shapeRendering="crispEdges" aria-hidden="true">
                                      <path d="M9 0h1v1h-1zM10 0h1v1h-1zM3 1h1v1h-1zM4 1h1v1h-1zM9 1h1v1h-1zM10 1h1v1h-1zM12 1h1v1h-1zM13 1h1v1h-1zM2 2h1v1h-1zM3 2h1v1h-1zM8 2h1v1h-1zM9 2h1v1h-1zM13 2h1v1h-1zM14 2h1v1h-1zM1 3h1v1h-1zM2 3h1v1h-1zM8 3h1v1h-1zM9 3h1v1h-1zM14 3h1v1h-1zM15 3h1v1h-1zM0 4h1v1h-1zM1 4h1v1h-1zM7 4h1v1h-1zM8 4h1v1h-1zM15 4h1v1h-1zM16 4h1v1h-1zM1 5h1v1h-1zM2 5h1v1h-1zM7 5h1v1h-1zM8 5h1v1h-1zM14 5h1v1h-1zM15 5h1v1h-1zM2 6h1v1h-1zM3 6h1v1h-1zM6 6h1v1h-1zM7 6h1v1h-1zM13 6h1v1h-1zM14 6h1v1h-1zM3 7h1v1h-1zM4 7h1v1h-1zM6 7h1v1h-1zM7 7h1v1h-1zM12 7h1v1h-1zM13 7h1v1h-1zM5 8h1v1h-1zM6 8h1v1h-1z" fill="#c8a8f0" />
                                    </svg>
                                  </span>
                                  <span>
                                    <span className="ch-k">
                                      GitHub
                                    </span>
                                    <span className="ch-v">
                                      github.com/tialvesdev
                                    </span>
                                  </span>
                                  <span className="ch-go" aria-hidden="true">
                                    Ver código ▸
                                  </span>
                                </a>
                              </div>
                              <div style={sx(`display: flex; gap: 10px; flex-wrap: wrap; align-items: center`)}>
                                <button type="button" className="btn btn-p" onClick={v.openForm}>
                                  Gravar mensagem
                                </button>
                                <button type="button" className="btn" onClick={v.copyEmail} aria-live="polite">
                                  {v.copyLabel}
                                </button>
                              </div>
                            </section>
                          </>
                        )}
                        {v.form && (
                          <>
                            <section className="pn pn-car" aria-label="Gravar mensagem no cristal" style={sx(`left: 48px; top: 36px; width: 568px; display: flex; flex-direction: column; gap: 12px`)}>
                              <span className="kicker">
                                Cristal do portal · mensagem
                              </span>
                              <h2 className="title-name" style={sx(`font-size: 60px`)}>
                                Gravar no cristal
                              </h2>
                              <p style={sx(`margin: 0; font-size: 16px; color: #cfc5ad`)}>
                                Conte quem você é e o que quer construir. Eu respondo por e-mail.
                              </p>
                              <div className="f-row">
                                <div className="field">
                                  <label className="f-lbl" htmlFor="j-nome">
                                    Nome
                                  </label>
                                  <input id="j-nome" name="name" autoComplete="name" className="f-inp" type="text" placeholder="Ana Souza" aria-invalid={v.errNameInv} aria-describedby="j-nome-err" />
                                  <span id="j-nome-err" className="f-err">
                                    {v.errName}
                                  </span>
                                </div>
                                <div className="field">
                                  <label className="f-lbl" htmlFor="j-email">
                                    E-mail
                                  </label>
                                  <input id="j-email" name="email" autoComplete="email" inputMode="email" className="f-inp" type="email" placeholder="ana@empresa.com" aria-invalid={v.errEmailInv} aria-describedby="j-email-err" />
                                  <span id="j-email-err" className="f-err">
                                    {v.errEmail}
                                  </span>
                                </div>
                              </div>
                              <div className="field">
                                <label className="f-lbl" htmlFor="j-msg">
                                  Mensagem
                                </label>
                                <textarea id="j-msg" name="message" className="f-inp" rows={4} placeholder="Vi seu portfólio e queria conversar sobre uma vaga." aria-invalid={v.errMsgInv} aria-describedby="j-msg-err" />
                                <span id="j-msg-err" className="f-err">
                                  {v.errMsg}
                                </span>
                              </div>
                              <div style={sx(`display: flex; gap: 12px; align-items: center; flex-wrap: wrap`)}>
                                {v.formGeneral && (
                                  <p role="alert" className="f-err" style={sx(`margin: 0; width: 100%`)}>{v.formGeneral}</p>
                                )}
                                <button type="button" className="btn btn-p" onClick={v.send} disabled={v.sending} aria-busy={v.sending} style={sx(`min-width: 240px`)}>
                                  {v.sendLabel}
                                </button>
                                <button type="button" className="link-btn" onClick={v.closeForm}>
                                  ◂ Voltar aos canais
                                </button>
                              </div>
                            </section>
                          </>
                        )}
                      </>
                    )}
                    {(v.spots as any[]).map((s: any, i16: number) => (
                      <Fragment key={i16}>
                        <button type="button" className="spot" onClick={s.act} aria-label={`Examinar ${s.label}`} style={sx(`left: ${s.x}px; top: ${s.y}px; width: ${s.w}px; height: ${s.h}px`)}>
                          <span className="spark" aria-hidden="true" />
                          <span className="tag">
                            {s.label}
                          </span>
                        </button>
                      </Fragment>
                    ))}
                    {v.beam && (
                      <>
                        <span className="beam" aria-hidden="true" style={sx(`left: ${v.beamX}px; height: ${v.beamH}px`)} />
                      </>
                    )}
                    <span className={v.heroCls} aria-hidden="true" style={sx(`left: ${v.x}px; top: ${v.heroTop}px`)} />
                    {v.flames && (
                      <>
                        {(v.flameList as any[]).map((fl: any, i17: number) => (
                          <Fragment key={i17}>
                            <span className="tflame" aria-hidden="true" style={sx(`left: ${fl.x}px; top: ${fl.y}px; animation-delay: 0s, ${fl.d}s`)} />
                          </Fragment>
                        ))}
                      </>
                    )}
                    {v.hasBall && (
                      <>
                        <span className="ember e2" aria-hidden="true" style={sx(`left: ${v.ballX}px; top: ${v.ballY}px; transform: translate(${v.ballDx}px, ${v.ballDy}px)`)} />
                        <span className="ember e1" aria-hidden="true" style={sx(`left: ${v.ballX}px; top: ${v.ballY}px; transform: translate(${v.ballDx}px, ${v.ballDy}px)`)} />
                        <span className="fireball" aria-hidden="true" style={sx(`left: ${v.ballX}px; top: ${v.ballY}px; transform: translate(${v.ballDx}px, ${v.ballDy}px)`)} />
                      </>
                    )}
                    {v.hasBurst && (
                      <>
                        <span className="burst" aria-hidden="true" style={sx(`left: ${v.burstX}px; top: ${v.burstY}px`)} />
                      </>
                    )}
                    <div className="plate" id="room-plate" tabIndex={-1} role="status" aria-live="polite">
                      <span style={sx(`font: 600 20px/1.15 'Pixelify Sans', Silkscreen, monospace; color: #f6dc8c; text-shadow: 0 2px 0 #3a2208`)}>
                        {v.roomName}
                      </span>
                      <span className="lbl">
                        {v.roomSection}
                      </span>
                    </div>
                    {v.showHint && (
                      <>
                        <span style={sx(`position: absolute; left: 50%; bottom: 22px; transform: translateX(-50%); z-index: 6; font: 15px 'Pixelify Sans', Silkscreen, monospace; color: #cfc5ad; background: rgba(7,6,11,.75); border: 1px solid #5a4a30; padding: 3px 12px; white-space: nowrap`)}>
                          Role o mouse ou use ← → para andar pelo castelo
                        </span>
                      </>
                    )}
                    <div aria-live="polite">
                      {v.hasDialog && (
                        <>
                          <div className="dlg" role="dialog" aria-labelledby="dlg-title" aria-describedby="dlg-text">
                            <div style={sx(`flex: 1; display: flex; flex-direction: column; gap: 8px`)}>
                              <span className="lbl">
                                {v.dialogWho}
                              </span>
                              <h2 id="dlg-title" style={sx(`margin: 0; font: 600 30px/1.15 'Pixelify Sans', Silkscreen, monospace; color: #f6dc8c; text-shadow: 0 3px 0 #0a0a20`)}>
                                {v.dialogTitle}
                              </h2>
                              <p id="dlg-text" style={sx(`margin: 0; font-size: 19px; line-height: 1.5; color: #ece6d4; max-width: 980px`)}>
                                {(v.dialogParts as any[]).map((dp: any, i18: number) => (
                                  <Fragment key={i18}>
                                    <span className={dp.cls}>
                                      {dp.t}
                                    </span>
                                  </Fragment>
                                ))}
                              </p>
                              <div className="facts" style={sx(`margin-top: 4px`)}>
                                {(v.dialogFacts as any[]).map((f: any, i19: number) => (
                                  <Fragment key={i19}>
                                    <span className="fact">
                                      {f}
                                    </span>
                                  </Fragment>
                                ))}
                              </div>
                            </div>
                            <button type="button" className="x-btn" onClick={v.closeDialog} autoFocus={v.yes}>
                              Fechar ▸
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    {v.busy && (
                      <>
                        <button type="button" className="skip-layer" onClick={v.skipAnim} aria-label="Pular animação" />
                        <span className="skip-hint">
                          Espaço ou clique para pular
                        </span>
                      </>
                    )}
                    <div className={v.fadeCls} />
                  </div>
                </>
              )}
              {v.inLoading && (
                <>
                  <Loading destino={v.loadTarget} duracao={v.loadDur} onSkip={v.skipAnim} />
                </>
              )}
              {v.inCase && (
                <>
                  <div style={sx(`position: absolute; inset: 0`)}>
                    <img className="px" src={v.caseImg} alt="" style={sx(`position: absolute; inset: 0; width: 1440px; height: 810px; object-fit: cover`)} />
                    <div style={sx(`position: absolute; inset: 0; background: linear-gradient(90deg, rgba(7,6,11,.45), rgba(7,6,11,.94) 40%)`)} />
                    <div className="portal" aria-hidden="true">
                      <img className="px" src="/assets/castelo/cde5d3888e3344c6bdcfd1c7365d7cd8.png" alt="" style={sx(`width: 100%; height: 100%; object-fit: cover; filter: brightness(.6)`)} />
                    </div>
                    <span className={v.heroCls} aria-hidden="true" style={sx(`left: ${v.x}px; top: ${v.heroTop}px`)} />
                    <section className="pn pn-car" aria-label={v.caseTitle} style={sx(`left: 520px; top: 60px; width: 860px; display: flex; flex-direction: column; gap: 12px`)}>
                      <span className="lbl">
                        {v.caseKicker}
                      </span>
                      <h2 id="case-title" tabIndex={-1} style={sx(`margin: 0; font: 600 46px/1.05 'Pixelify Sans', Silkscreen, monospace; color: #f6dc8c`)}>
                        {v.caseTitle}
                      </h2>
                      <p style={sx(`margin: 0; font-size: 18px; color: #cfc5ad`)}>
                        {(v.caseSubParts as any[]).map((sp: any, i20: number) => (
                          <Fragment key={i20}>
                            <span className={sp.cls}>
                              {sp.t}
                            </span>
                          </Fragment>
                        ))}
                      </p>
                      <div style={sx(`display: flex; gap: 6px; flex-wrap: wrap`)}>
                        {(v.caseChips as any[]).map((c: any, i21: number) => (
                          <Fragment key={i21}>
                            <span className="chip">
                              {c}
                            </span>
                          </Fragment>
                        ))}
                      </div>
                      <div style={sx(`display: flex; align-items: center; gap: 8px; font: 13px Silkscreen, monospace; color: #f6dc8c; margin-top: 6px`)}>
                        {(v.caseArch as any[]).map((a: any, i22: number) => (
                          <Fragment key={i22}>
                            <span style={sx(`flex: 1; text-align: center; padding: 12px 6px; border: 2px solid ${a.border}; color: ${a.color}`)}>
                              {a.label}
                            </span>
                            {a.arrow && (
                              <>
                                <span style={sx(`color: #3ec8d4`)}>
                                  ▶
                                </span>
                              </>
                            )}
                          </Fragment>
                        ))}
                      </div>
                      <p style={sx(`margin: 0`)}>
                        {(v.caseNoteParts as any[]).map((np: any, i23: number) => (
                          <Fragment key={i23}>
                            <span className={np.cls}>
                              {np.t}
                            </span>
                          </Fragment>
                        ))}
                      </p>
                      <div style={sx(`display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-top: 4px`)}>
                        <button type="button" className="btn" onClick={v.leaveCase}>
                          ◂ Sair da pintura
                        </button>
                        {v.caseFull && (
                          <>
                            <a className="btn btn-p" href="Projeto.dc.html">
                              Estudo completo ▸
                            </a>
                          </>
                        )}
                        <span style={sx(`font-size: 15px; color: #a39a86`)}>
                          Código: [ link a confirmar ]
                        </span>
                      </div>
                    </section>
                    <div className="plate" role="status" aria-live="polite">
                      <span style={sx(`font: 600 20px/1.15 'Pixelify Sans', Silkscreen, monospace; color: #f6dc8c; text-shadow: 0 2px 0 #3a2208`)}>
                        Dentro da pintura
                      </span>
                      <span className="lbl">
                        {v.caseTitle}
                      </span>
                    </div>
                    {v.busy && (
                      <>
                        <button type="button" className="skip-layer" onClick={v.skipAnim} aria-label="Pular animação" />
                        <span className="skip-hint">
                          Espaço ou clique para pular
                        </span>
                      </>
                    )}
                  </div>
                </>
              )}
              {v.hasIris && (
                <>
                  <span className={v.irisCls} aria-hidden="true" style={sx(`left: ${v.irisX}px; top: ${v.irisY}px`)} />
                </>
              )}
              <div className={v.flashCls} />
              {v.crt && (
                <>
                  <div className="crt" aria-hidden="true">
                    <span className="crt-beam" />
                  </div>
                </>
              )}
            </div>
          </>
        )}
        {v.narrow && (
          <>
            <CastleMobile zoom={v.mbZoom} height={v.mbH} />
          </>
        )}
      </div>
    );
  }
}

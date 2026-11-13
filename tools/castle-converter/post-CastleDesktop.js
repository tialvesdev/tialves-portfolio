// Correções do desktop depois da conversão automática.
module.exports = (s) => {
  const rep = (a, b, all) => { const n = s.split(a).length - 1; if (!n || (n > 1 && !all)) throw new Error('post desktop ' + n + 'x: ' + a.slice(0, 70)); s = s.split(a).join(b); };
  rep('if (S[name]) S[name]();', 'const fx = (S as Record<string, () => void>)[name]; if (fx) fx();');
  rep('const P = { amber:', 'const P: Record<string, string[]> = { amber:');
  s = s.replace(/this\.(sequences|texts|cases)\(\)\[([\w.]+)\]/g, '(this.$1() as Record<string, any>)[$2]');
  rep("const f = { c: 659.25, r: 523.25, o: 783.99, v: 880 }[k];", "const f = ({ c: 659.25, r: 523.25, o: 783.99, v: 880 } as Record<string, number>)[k];");
  rep(", pale = 'rgba(240,232,200,.28)'", '');
  rep('const err = {};', 'const err: Record<string, string> = {};');
  rep('const p = this.paneDefs().find((q: any) => q.k === k);', 'const p = this.paneDefs().find((q: any) => q.k === k)!;');
  rep('    const book = {', '    const book = ({');
  rep("    }[s.book] || { x: 0, y: 0, w: 0, h: 0, src: '' };", "    } as Record<string, { x: number; y: number; w: number; h: number; src: string }>)[s.book] || { x: 0, y: 0, w: 0, h: 0, src: '' };");
  // a lista de chamas de vela tinha o mesmo nome do estado das chamas do teleporte
  rep('      flames: this.flamesFor(s.room),', '      candleFlames: this.flamesFor(s.room),');
  rep('{(v.flames as any[]).map((fm: any,', '{(v.candleFlames as any[]).map((fm: any,');
  // teclado: quando o foco cai no <body> (depois de um botão sumir), o castelo ainda ouve as teclas
  rep('    if (this.state.crt) this.crtTimer = setTimeout(() => this.setState({ crt: false }), 1550);\n  }',
    '    if (this.state.crt) this.crtTimer = setTimeout(() => this.setState({ crt: false }), 1550);\n' +
    '    this.onWinKey = (e: KeyboardEvent) => { const t = e.target as Node | null; if (t && this.rootEl && this.rootEl.contains(t)) return; this.vals().keydown(e); };\n' +
    "    window.addEventListener('keydown', this.onWinKey);\n  }");
  rep('  componentWillUnmount() { this.clearTimers(); if (this.ro) this.ro.disconnect(); clearTimeout(this.crtTimer); }',
    "  componentWillUnmount() { this.clearTimers(); if (this.ro) this.ro.disconnect(); clearTimeout(this.crtTimer); window.removeEventListener('keydown', this.onWinKey); }");
  // formulário do cristal: envia para a API (Spring Boot → e-mail via Resend)
  rep('    this.lastTrigger = null;\n    this.setState({ form: false, formErr: {}, dialog: this.texts().sent });',
    '    if (this.sending) return;\n' +
    '    this.sending = true;\n' +
    '    this.setState({ sending: true, formErr: {} });\n' +
    '    sendContact({ name, email, message: msg })\n' +
    '      .then(() => { this.lastTrigger = null; this.setState({ form: false, formErr: {}, dialog: this.texts().sent }); })\n' +
    "      .catch((e: unknown) => { const fe = e instanceof ContactError ? e.fieldErrors : {}; this.setState({ formErr: { ...fe, general: e instanceof Error ? e.message : 'Não foi possível enviar agora.' } }); })\n" +
    '      .finally(() => { this.sending = false; this.setState({ sending: false }); });');
  rep("      closeForm: () => this.setState({ form: false, formErr: {} }),",
    "      closeForm: () => this.setState({ form: false, formErr: {} }),\n      formGeneral: (s.formErr && s.formErr.general) || '',\n      sendLabel: s.sending ? 'Gravando…' : '◆ Gravar e enviar',\n      sending: !!s.sending,");
  rep('                                <button type="button" className="btn btn-p" onClick={v.send} style={sx(`min-width: 240px`)}>\n                                  ◆ Gravar e enviar\n                                </button>',
    '                                {v.formGeneral && (\n                                  <p role="alert" className="f-err" style={sx(`margin: 0; width: 100%`)}>{v.formGeneral}</p>\n                                )}\n' +
    '                                <button type="button" className="btn btn-p" onClick={v.send} disabled={v.sending} aria-busy={v.sending} style={sx(`min-width: 240px`)}>\n                                  {v.sendLabel}\n                                </button>');
  // celular: a versão de 390 px acompanha a largura e a altura reais da tela
  rep('if (narrow !== this.state.narrow || Math.abs(sc - this.state.scale) > 0.004) this.setState({ scale: Math.round(sc * 1000) / 1000, narrow });',
    'const vw = Math.round(r.width), vh = Math.round(r.height);\n        if (narrow !== this.state.narrow || Math.abs(sc - this.state.scale) > 0.004 || vw !== this.state.vw || vh !== this.state.vh) this.setState({ scale: Math.round(sc * 1000) / 1000, narrow, vw, vh });');
  rep('      wide: !s.narrow,', '      wide: !s.narrow,\n      mbZoom: Math.min(1, (s.vw || 390) / 390),\n      mbH: Math.max(640, Math.round((s.vh || 844) / Math.min(1, (s.vw || 390) / 390))),');
  rep('<CastleMobile />', '<CastleMobile zoom={v.mbZoom} height={v.mbH} />');
  s = "import { sendContact, ContactError } from '../api/client';\n\n" + s;
  return s;
};

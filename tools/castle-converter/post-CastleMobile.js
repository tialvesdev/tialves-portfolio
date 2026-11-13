// Correções do celular depois da conversão automática.
module.exports = (s) => {
  const rep = (a, b, all) => { const n = s.split(a).length - 1; if (!n || (n > 1 && !all)) throw new Error('post mobile ' + n + 'x: ' + a.slice(0, 70)); s = s.split(a).join(b); };
  rep('if (S[name]) S[name]();', 'const fx = (S as Record<string, () => void>)[name]; if (fx) fx();');
  rep('const P = { amber:', 'const P: Record<string, string[]> = { amber:');
  s = s.replace(/this\.(sequences|texts|cases)\(\)\[([\w.]+)\]/g, '(this.$1() as Record<string, any>)[$2]');
  rep("const f = { c: 659.25, r: 523.25, o: 783.99, v: 880 }[k];", "const f = ({ c: 659.25, r: 523.25, o: 783.99, v: 880 } as Record<string, number>)[k];");
  rep('const finals = {', 'const finals: Record<string, any> = {');
  rep('    const steps = {\n', '    const steps = ({\n');
  rep('    }[o.id];\n    const at = {', '    } as Record<string, any[]>)[o.id];\n    const at = ({');
  rep('astrolabio: 1400 }[o.id];', 'astrolabio: 1400 } as Record<string, number>)[o.id];');
  rep('document.getElementById(id); return el ?', '(document.getElementById(id) as HTMLInputElement | null); return el ?');
  // teclado: com o foco no <body>, as setas e o Esc ainda chegam ao castelo do celular
  rep('  componentWillUnmount() { this.clearTimers(); }',
    '  componentDidMount() {\n' +
    "    this.onWinKey = (e: KeyboardEvent) => { const t = e.target as HTMLElement | null; if (t && t.closest && t.closest('.mb-root')) return; this.vals().keydown(e); };\n" +
    "    window.addEventListener('keydown', this.onWinKey);\n  }\n" +
    "  componentWillUnmount() { this.clearTimers(); window.removeEventListener('keydown', this.onWinKey); }");
  // formulário do cristal: mesma regra da API (mensagem com 10+ caracteres) e envio de verdade
  rep("    const errMsg = msg ? '' : 'Escreva a mensagem.';", "    const errMsg = msg.length >= 10 ? '' : 'Escreva a mensagem com pelo menos 10 caracteres.';");
  rep('    this.setState({ form: false });\n    this.openDialog(this.texts().sent);',
    '    if (this.sending) return;\n' +
    "    this.sending = true;\n    this.setState({ sending: true, errGeneral: '' });\n" +
    '    sendContact({ name, email, message: msg })\n' +
    '      .then(() => { this.setState({ form: false }); this.openDialog(this.texts().sent); })\n' +
    "      .catch((e: unknown) => { const fe = e instanceof ContactError ? e.fieldErrors : {}; this.setState({ errName: fe.name || '', errEmail: fe.email || '', errMsg: fe.message || '', errGeneral: e instanceof Error ? e.message : 'Não foi possível enviar agora.' }); })\n" +
    '      .finally(() => { this.sending = false; this.setState({ sending: false }); });');
  rep("      errNameInv: s.errName ? 'true' : 'false',", "      errGeneral: s.errGeneral || '', sending: !!s.sending, sendLabel: s.sending ? 'Gravando…' : '◆ Gravar e enviar',\n      errNameInv: s.errName ? 'true' : 'false',");
  rep('                      <button type="button" className="mb-btn mb-btn-p" onClick={v.send}>\n                        ◆ Gravar e enviar\n',
    '                      {v.errGeneral && (\n                        <p role="alert" className="mb-f-err" style={sx(`margin: 0`)}>{v.errGeneral}</p>\n                      )}\n' +
    '                      <button type="button" className="mb-btn mb-btn-p" onClick={v.send} disabled={v.sending} aria-busy={v.sending}>\n                        {v.sendLabel}\n');
  rep('width: 390px; height: 844px; overflow: clip;', 'width: 390px; height: ${this.props.height || 844}px; zoom: ${this.props.zoom || 1}; overflow: clip;');
  s = "import { sendContact, ContactError } from '../api/client';\n\n" + s;
  return s;
};

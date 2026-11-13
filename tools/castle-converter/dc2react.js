// Converte os protótipos .dc.html (modelo + lógica + CSS) em componentes React/TypeScript.
// Uso: node dc2react.js <arquivo.dc.html> <NomeDoComponente> <saída.tsx> <saída.css> [props]
const fs = require('fs');
const [, , SRC, NAME, OUT_TSX, OUT_CSS, MODE] = process.argv;
const src = fs.readFileSync(SRC, 'utf8');

// ---------- CSS ----------
let css = (src.match(/<style>([\s\S]*?)<\/style>/) || [, ''])[1];
css = css.replace(/\/_blob\/([0-9a-f]{32})/g, '/assets/castelo/$1.png');
css = css.replace(/^body\{[^}]*\}\n?/m, '').replace(/^a\{color:#f6dc8c\}\n?/m, '');
fs.writeFileSync(OUT_CSS, css.trim() + '\n');

// ---------- modelo ----------
const body = src.slice(src.indexOf('</helmet>') + 9, src.indexOf('</x-dc>'));
const VOID = new Set(['img', 'input', 'br', 'link', 'meta', 'hr']);
// tokenização simples (o modelo é HTML bem formado)
const tokens = [];
const re = /<!--[\s\S]*?-->|<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*"[^"]*")?)*)\s*(\/?)>|([^<]+)/g;
let m;
while ((m = re.exec(body))) {
  if (m[0].startsWith('<!--')) continue;
  if (m[1]) tokens.push({ t: 'close', name: m[1] });
  else if (m[2]) {
    const attrs = [];
    const ar = /([^\s=>\/]+)(?:\s*=\s*"([^"]*)")?/g;
    let a;
    while ((a = ar.exec(m[3] || ''))) attrs.push([a[1], a[2] === undefined ? null : a[2]]);
    tokens.push({ t: 'open', name: m[2], attrs, self: !!m[4] || VOID.has(m[2]) });
  } else tokens.push({ t: 'text', v: m[5] });
}
const root = { name: '#root', kids: [] };
const stack = [root];
for (const tk of tokens) {
  const top = stack[stack.length - 1];
  if (tk.t === 'text') top.kids.push({ text: tk.v });
  else if (tk.t === 'open') { const n = { name: tk.name, attrs: tk.attrs, kids: [] }; top.kids.push(n); if (!tk.self) stack.push(n); }
  else { while (stack.length > 1 && stack[stack.length - 1].name !== tk.name) stack.pop(); if (stack.length > 1) stack.pop(); }
}

const RENAME = { class: 'className', for: 'htmlFor', autocomplete: 'autoComplete', inputmode: 'inputMode', 'stop-color': 'stopColor', 'shape-rendering': 'shapeRendering', 'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap', 'fill-rule': 'fillRule', 'clip-path': 'clipPath', tabindex: 'tabIndex', readonly: 'readOnly', maxlength: 'maxLength', spellcheck: 'spellCheck' };
const DROP = /^hint-/;
const holeRe = /\{\{\s*([^}]+?)\s*\}\}/g;
let loopVars = [];
let loopN = 0;
const V = MODE === 'props' ? 'p' : 'v';
const expr = (path) => { const head = path.split('.')[0]; return loopVars.includes(head) ? path : V + '.' + path; };
const tmpl = (s) => {
  const only = s.match(/^\{\{\s*([^}]+?)\s*\}\}$/);
  if (only) return expr(only[1]);
  return '`' + s.replace(/`/g, '\\`').replace(/\$\{/g, '\\${').replace(holeRe, (_, p) => '${' + expr(p) + '}') + '`';
};
const escText = (t) => t.replace(/[{}]/g, (c) => "{'" + c + "'}").replace(/>/g, '&gt;');
const text = (t) => { let out = '', last = 0; t.replace(holeRe, (all, p, off) => { out += escText(t.slice(last, off)) + '{' + expr(p) + '}'; last = off + all.length; return all; }); return out + escText(t.slice(last)); };

const comps = { Carregando: 'Loading', JogoMobile: 'CastleMobile' };
const used = new Set();
const emit = (n, ind) => {
  const pad = ' '.repeat(ind);
  if (n.text !== undefined) {
    const t = n.text;
    if (!t.trim()) return /\n/.test(t) ? '' : pad + "{' '}\n";
    const c = t.replace(/\s+/g, ' ');
    const lead = /^\s/.test(t) && !/^\s*\n/.test(t) ? "{' '}" : '';
    const trail = /\s$/.test(t) && !/\n\s*$/.test(t) ? "{' '}" : '';
    return pad + lead + text(c.trim()) + trail + '\n';
  }
  const A = Object.fromEntries(n.attrs.map(([k, v]) => [k, v]));
  if (n.name === 'sc-if') {
    return pad + '{' + tmpl(A.value) + ' && (\n' + pad + '  <>\n' + n.kids.map((k) => emit(k, ind + 4)).join('') + pad + '  </>\n' + pad + ')}\n';
  }
  if (n.name === 'sc-for') {
    const as = A.as, idx = 'i' + ++loopN;
    const list = tmpl(A.list);
    loopVars.push(as);
    const inner = n.kids.map((k) => emit(k, ind + 4)).join('');
    loopVars.pop();
    return pad + '{(' + list + ' as any[]).map((' + as + ': any, ' + idx + ': number) => (\n' + pad + '  <Fragment key={' + idx + '}>\n' + inner + pad + '  </Fragment>\n' + pad + '))}\n';
  }
  if (n.name === 'dc-import') {
    const C = comps[A.name]; used.add(C);
    const props = n.attrs.filter(([k]) => !DROP.test(k) && k !== 'name').map(([k, v]) => { const key = k === 'on-skip' ? 'onSkip' : k; return key + '={' + tmpl(v) + '}'; });
    return pad + '<' + C + (props.length ? ' ' + props.join(' ') : '') + ' />\n';
  }
  const attrs = [];
  for (const [k, v] of n.attrs) {
    if (DROP.test(k)) continue;
    const key = RENAME[k] || k;
    if (v === null) { attrs.push(key); continue; }
    if (key === 'style') { attrs.push('style={sx(' + tmpl(v) + ')}'); continue; }
    if (/\{\{/.test(v)) attrs.push(key + '={' + tmpl(v) + '}');
    else if (/^-?\d+$/.test(v) && /^(tabIndex|rows|cols|aria-valuemin|aria-valuemax|aria-valuenow)$/.test(key)) attrs.push(key + '={' + v + '}');
    else attrs.push(key + '="' + v.replace(/"/g, '&quot;') + '"');
  }
  const open = '<' + n.name + (attrs.length ? ' ' + attrs.join(' ') : '');
  if (!n.kids.length || VOID.has(n.name)) return pad + open + ' />\n';
  return pad + open + '>\n' + n.kids.map((k) => emit(k, ind + 2)).join('') + pad + '</' + n.name + '>\n';
};
const firstEl = root.kids.find((k) => k.name);
const jsx = emit(firstEl, 6);

// ---------- lógica ----------
let logic = '';
const sm = src.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/);
if (sm) {
  logic = sm[1].trim();
  logic = logic.replace('class Component extends DCLogic {', 'export default class ' + NAME + ' extends Component<any, any> {\n  [key: string]: any;');
  logic = logic.replace(/^ {2}renderVals\(\) \{/m, '  vals() {');
  // parâmetros sem tipo recebem `any` (métodos e arrows)
  logic = logic.replace(/^( {2}[a-zA-Z_$][\w$]*)\(([^)]*)\) \{/gm, (all, nm, ps) => nm + '(' + (ps.trim() ? ps.split(',').map((p) => { p = p.trim(); return /[:=]/.test(p) ? p : p + ': any'; }).join(', ') : '') + ') {');
  // divide os parâmetros no nível de cima (respeitando [a, b] e {a, b}) e tipa cada um como any
  const splitTop = (s) => { const out = []; let d = 0, cur = ''; for (const ch of s) { if (ch === '[' || ch === '{') d++; if (ch === ']' || ch === '}') d--; if (ch === ',' && !d) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out.map((x) => x.trim()); };
  const typeParam = (p) => { if (p.startsWith('[') || p.startsWith('{')) return p + ': any'; if (p.includes(':')) return p; if (p.includes('=')) { const i = p.indexOf('='); return p.slice(0, i).trim() + ': any = ' + p.slice(i + 1).trim(); } return p + ': any'; };
  logic = logic.replace(/\(([^()]*?)\)\s*=>/g, (all, ps) => { if (!ps.trim() || /:\s*(any|number|string)/.test(ps)) return all; return '(' + splitTop(ps).map(typeParam).join(', ') + ') =>'; });
  logic = logic.replace(/(\b\w+) => /g, (all, p) => (['return', 'await'].includes(p) ? all : '(' + p + ': any) => '));
  logic = logic.replace(/window\.AudioContext \|\| window\.webkitAudioContext/g, 'window.AudioContext || (window as any).webkitAudioContext');
  const render = '\n  render() {\n    const v: any = this.vals();\n    return (\n' + jsx + '    );\n  }\n}';
  logic = logic.replace(/\}\s*$/, render);
} else {
  logic = 'export default function ' + NAME + '(p: any) {\n  return (\n' + jsx + '  );\n}';
}
const imports = ["import { Component, Fragment } from 'react';", "import { sx } from './sx';", "import './" + OUT_CSS.split(/[\\/]/).pop() + "';"];
for (const c of used) imports.push("import " + c + " from './" + c + "';");
if (!sm) imports[0] = "import { Fragment } from 'react';";
logic = logic.replace(/\/_blob\/([0-9a-f]{32})/g, '/assets/castelo/$1.png');
logic = logic.replace(/'\/_blob\/' \+ (\w+)/g, "'/assets/castelo/' + $1 + '.png'");
// correções pontuais (tipos e um nome repetido) guardadas em post-<Nome>.js
const postFile = require('path').join(__dirname, 'post-' + NAME + '.js');
if (fs.existsSync(postFile)) logic = require(postFile)(logic);
fs.writeFileSync(OUT_TSX, '// Gerado a partir do protótipo do canvas e ajustado à mão.\n' + imports.join('\n') + '\n\n' + logic + '\n');
console.log('ok', OUT_TSX, jsx.length, logic.length);

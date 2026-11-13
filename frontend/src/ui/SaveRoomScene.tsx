import { useEffect, useRef } from 'react';
import { asset } from './assets';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Cena animada da sala de save (480×270 lógico, desenhada em 3×).
 * Camadas: fundo + relíquia flutuante (16 frames) + partículas.
 */
export type SaveRoomSceneProps = {
  paused?: boolean;
  particles?: boolean;
  className?: string;
  label?: string;
};

type Kind = 'dust' | 'wisp' | 'spC' | 'spG' | 'glyph' | 'ring' | 'petal' | 'bat' | 'feather';

type Particle = {
  kind: Kind; fw: number; fh: number; n: number; fps: number;
  age: number; life: number; x: number; y: number; vx: number; vy: number;
  f0: number; fade: boolean; sway: number; ph: number;
  ymax?: number; bob?: number; bobf?: number; flip?: boolean;
};

const W = 480;
const H = 270;
const S = 3;
const P = 'particulas/';
const SRC: Record<Kind | 'bg' | 'relic', string> = {
  bg: 'sala_save_fundo.png',
  relic: 'reliquia_save_sheet_16f_64x80.png',
  dust: P + 'poeira_4f_8x8.png',
  wisp: P + 'espirito_ciano_8f_16x24.png',
  spC: P + 'brilho_ciano_6f_11x11.png',
  spG: P + 'brilho_dourado_6f_11x11.png',
  glyph: P + 'glifos_atelie_6x_8x8.png',
  ring: P + 'anel_save_8f_48x24.png',
  petal: P + 'petala_8f_8x8.png',
  bat: P + 'morcego_voo_8f_24x16.png',
  feather: P + 'pena_caindo_8f_16x16.png',
};
// [largura, altura, frames, fps]
const META: Record<Kind, [number, number, number, number]> = {
  dust: [8, 8, 4, 6], wisp: [16, 24, 8, 10], spC: [11, 11, 6, 12], spG: [11, 11, 6, 12], glyph: [8, 8, 6, 0],
  ring: [48, 24, 8, 10], petal: [8, 8, 8, 10], bat: [24, 16, 8, 14], feather: [16, 16, 8, 8],
};
const RATES: Partial<Record<Kind, number>> = { wisp: 1.7, spC: 0.8, spG: 1.8, glyph: 2.6, ring: 3.2, petal: 3.8, bat: 12, feather: 12 };
const ADDITIVE = new Set<Kind>(['wisp', 'spC', 'glyph', 'ring', 'spG']);
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const q = (v: number) => Math.round(v * S) / S;

export function SaveRoomScene({ paused = false, particles = true, className, label = 'Sala de save animada com relíquia flutuante' }: SaveRoomSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();
  const state = useRef({ paused: paused || reduced, fx: particles });

  useEffect(() => {
    state.current.paused = paused || reduced;
  }, [paused, reduced]);

  useEffect(() => {
    state.current.fx = particles;
  }, [particles]);

  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    ctx.setTransform(S, 0, 0, S, 0, 0);
    ctx.imageSmoothingEnabled = false;

    const img = {} as Record<keyof typeof SRC, HTMLImageElement>;
    const parts: Particle[] = [];
    const timers: Partial<Record<Kind, number>> = { wisp: 0, spC: 0, spG: 0, glyph: 0, ring: 0, petal: 0, bat: 4, feather: 2 };
    let raf = 0;
    let last = 0;
    let T = 0;
    let alive = true;

    const spawn = (kind: Kind, o: Partial<Particle>) => {
      const [fw, fh, n, fps] = META[kind];
      parts.push({ kind, fw, fh, n, fps, age: 0, life: 3, x: 0, y: 0, vx: 0, vy: 0, f0: 0, fade: true, sway: 0, ph: Math.random() * 6, ...o });
    };

    const emit = (dt: number) => {
      for (const k of Object.keys(RATES) as Kind[]) {
        timers[k] = (timers[k] ?? 0) - dt;
        if ((timers[k] ?? 0) > 0) continue;
        timers[k] = (RATES[k] ?? 1) * rnd(0.7, 1.3);
        if (k === 'wisp') spawn('wisp', { x: 240 + rnd(-16, 16), y: 152, vy: -rnd(14, 24), life: rnd(2.4, 3.6), sway: 6 });
        if (k === 'spC') {
          const a = rnd(0, 6.28), r = rnd(18, 34);
          spawn('spC', { x: 240 + Math.cos(a) * r, y: 114 + Math.sin(a) * r, life: 0.5, fade: false });
        }
        if (k === 'spG') spawn('spG', { x: rnd(110, 370), y: rnd(10, 70), life: 0.5, fade: false });
        if (k === 'glyph') spawn('glyph', { x: 240 + rnd(-60, 60), y: 244 + rnd(-6, 6), vy: -rnd(6, 11), life: rnd(3.5, 5), f0: Math.floor(rnd(0, 6)), sway: 3 });
        if (k === 'ring') spawn('ring', { x: 240, y: 244, life: 1.6, fade: false });
        if (k === 'petal') spawn('petal', { x: rnd(140, 340), y: 66, vy: rnd(10, 18), life: 8, sway: 10, ymax: 214 });
        if (k === 'bat') {
          const L = Math.random() < 0.5;
          spawn('bat', { x: L ? -20 : 500, y: rnd(18, 56), vx: L ? 46 : -46, vy: rnd(-3, 3), life: 12, fade: false, bob: 5, bobf: 6.2, flip: !L });
        }
        if (k === 'feather') spawn('feather', { x: rnd(20, 460), y: -10, vy: rnd(8, 12), life: 22, sway: 14, ymax: 260 });
      }
      let dust = parts.reduce((c, p) => c + (p.kind === 'dust' ? 1 : 0), 0);
      while (dust++ < 14) spawn('dust', { x: rnd(0, 480), y: rnd(14, 250), vx: rnd(-3, 3), vy: rnd(-4, 1.5), life: rnd(6, 12) });
    };

    const drawRing = (p: Particle) => {
      const t = p.age / p.life, rx = 18 + 58 * t, ry = rx * 0.165;
      ctx.globalAlpha = Math.max(0, 1 - t) * 0.9;
      ctx.fillStyle = t < 0.5 ? '#7ae4e6' : '#2a9eb0';
      const n = Math.ceil(rx * 7), seen = new Set<number>();
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const x = Math.round(p.x + Math.cos(a) * rx), y = Math.round(p.y + Math.sin(a) * ry);
        const key = x * 1000 + y;
        if (seen.has(key)) continue;
        seen.add(key);
        ctx.fillRect(x, y, 1, 1);
      }
    };

    const drawP = (p: Particle) => {
      if (p.kind === 'ring') return drawRing(p);
      const fi = p.fps ? (p.f0 + Math.floor(p.age * p.fps)) % p.n : p.f0;
      const t = p.age / p.life;
      ctx.globalAlpha = Math.max(0, p.fade ? Math.min(1, t * 4, (1 - t) * 3) : 1);
      const w = p.fw, h = p.fh;
      const x = q(p.x + Math.sin(p.ph + p.age * 1.3) * p.sway - w / 2);
      const y = q(p.y - h / 2 + (p.bob ? Math.sin(p.age * (p.bobf ?? 1) + p.ph) * p.bob : 0));
      if (p.flip) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(img[p.kind], fi * p.fw, 0, p.fw, p.fh, -x - w, y, w, h);
        ctx.restore();
      } else ctx.drawImage(img[p.kind], fi * p.fw, 0, p.fw, p.fh, x, y, w, h);
    };

    const glowAt = (x: number, y: number, r: number, rgb: string, a: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${rgb},${a})`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    };

    const frame = (now: number) => {
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      const { paused: isPaused, fx } = state.current;
      if (!isPaused) T += dt;
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(img.bg, 0, 0);
      ctx.globalCompositeOperation = 'lighter';
      glowAt(240, 114, 60, '62,200,212', 0.1 + 0.05 * Math.sin(T * 2.2));
      for (const [sx, sy] of [[27, 34], [39, 34], [440, 34], [452, 34]]) glowAt(sx, sy, 9, '122,228,230', 0.13 + 0.025 * Math.sin(T * 1.4 + sx * 0.37));
      ctx.globalCompositeOperation = 'source-over';
      const rf = Math.floor(T * 10) % 16, by = q(114 + Math.sin(T * 2) * 2.6);
      ctx.drawImage(img.relic, rf * 64, 0, 64, 80, 208, by - 40, 64, 80);
      if (fx) {
        if (!isPaused) emit(dt);
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i];
          if (!isPaused) {
            p.age += dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
          }
          if (p.age >= p.life || (p.ymax && p.y > p.ymax)) {
            parts.splice(i, 1);
            continue;
          }
          if (ADDITIVE.has(p.kind)) ctx.globalCompositeOperation = 'lighter';
          drawP(p);
          ctx.globalCompositeOperation = 'source-over';
        }
        ctx.globalAlpha = 1;
      } else parts.length = 0;
      raf = requestAnimationFrame(frame);
    };

    Promise.all(
      (Object.keys(SRC) as Array<keyof typeof SRC>).map(
        (k) =>
          new Promise<void>((res, rej) => {
            const i = new Image();
            i.onload = () => {
              img[k] = i;
              res();
            };
            i.onerror = rej;
            i.src = asset(SRC[k]);
          }),
      ),
    )
      .then(() => {
        if (alive) raf = requestAnimationFrame(frame);
      })
      .catch(() => {
        /* asset ausente: o canvas fica preto */
      });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={W * S}
      height={H * S}
      role="img"
      aria-label={label}
      className={className}
      style={{ display: 'block', width: '100%', aspectRatio: '16 / 9', background: '#000' }}
    />
  );
}

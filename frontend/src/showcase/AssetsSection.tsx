import {
  PALETTE,
  PATTERNS,
  PROPS,
  RELICS,
  ROOMS,
  SIGILS,
  SPRITES,
  PatternSurface,
  Relic,
  SectionHeading,
  Sprite,
  propSrc,
  roomSrc,
  sigilSrc,
  type PatternName,
  type PropName,
  type RelicName,
  type RoomName,
  type SigilName,
  type SpriteName,
} from '../ui';

const keys = <T extends object>(o: T) => Object.keys(o) as Array<keyof T>;

export function AssetsSection() {
  return (
    <section id="assets" className="sc-section" aria-labelledby="assets-title">
      <SectionHeading
        id="assets-title"
        kicker="public/assets"
        sigil="quadrifolio"
        title="Assets"
        lede="Tudo tipado em src/ui/assets.ts. Renderize em múltiplos inteiros (2×, 3×, 4×) com image-rendering: pixelated."
      />

      <h3 className="sc-sub">Padrões seamless</h3>
      <div className="sc-grid sc-grid--pat">
        {keys(PATTERNS).map((k: PatternName) => (
          <figure key={k} className="sc-figure">
            <PatternSurface pattern={k} scale={3} className="sc-tile" />
            <figcaption className="sc-cap">
              {PATTERNS[k].label}
              <span>
                {PATTERNS[k].w}×{PATTERNS[k].h} · pattern="{k}"
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      <h3 className="sc-sub">Relíquias</h3>
      <div className="sc-grid sc-grid--obj">
        {keys(RELICS).map((k: RelicName) => (
          <figure key={k} className="sc-figure">
            <Relic name={k} scale={3} />
            <figcaption className="sc-cap">
              {RELICS[k].label}
              <span>
                {RELICS[k].w}×{RELICS[k].h}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      <h3 className="sc-sub">Props do ateliê</h3>
      <div className="sc-row sc-row--end sc-props">
        {keys(PROPS).map((k: PropName) => (
          <figure key={k} className="sc-figure">
            <img src={propSrc(k)} alt={PROPS[k].label} className="sc-prop" />
            <figcaption className="sc-cap">{PROPS[k].label}</figcaption>
          </figure>
        ))}
      </div>

      <h3 className="sc-sub">Símbolos gravados</h3>
      <div className="sc-row sc-sigils">
        {keys(SIGILS).map((k: SigilName) => (
          <figure key={k} className="sc-figure">
            <img src={sigilSrc(k)} width={72} height={72} alt="" />
            <figcaption className="sc-cap">{SIGILS[k]}</figcaption>
          </figure>
        ))}
      </div>

      <h3 className="sc-sub">Partículas</h3>
      <div className="sc-grid sc-grid--spr">
        {keys(SPRITES).map((k: SpriteName) => {
          const s = SPRITES[k];
          const scale = s.w >= 24 ? 3 : 4;
          return (
            <figure key={k} className="sc-figure">
              <div className="sc-stage">
                <Sprite name={k} scale={scale} />
              </div>
              <figcaption className="sc-cap">
                {s.label}
                <span>
                  {s.frames} frames · {s.w}×{s.h} · {s.fps} fps
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>

      <h3 className="sc-sub">Paleta</h3>
      <ul className="sc-palette">
        {PALETTE.map((c) => (
          <li key={c.hex}>
            <i style={{ background: c.hex }} />
            <b>{c.name}</b>
            <code>
              {c.hex} · var({c.token})
            </code>
          </li>
        ))}
      </ul>

      <h3 className="sc-sub">Salas do castelo</h3>
      <div className="sc-grid sc-grid--rooms">
        {keys(ROOMS).map((k: RoomName) => (
          <figure key={k} className="sc-figure">
            <img src={roomSrc(k)} alt={ROOMS[k].label} className="sc-room-img" loading="lazy" />
            <figcaption className="sc-cap">
              {ROOMS[k].label}
              <span>480×270 · {ROOMS[k].mood}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

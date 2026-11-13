import { useState } from 'react';
import { Frame, PixelButton, SaveRoomScene, Sprite } from '../ui';

export function Hero() {
  const [paused, setPaused] = useState(false);
  const [fx, setFx] = useState(true);
  return (
    <section className="sc-hero" aria-labelledby="hero-title">
      <div className="sc-hero__copy">
        <span className="sc-kicker">UI kit · pixel art 16-bit · React + TypeScript</span>
        <h1 id="hero-title">O Ateliê Gótico</h1>
        <p className="sc-lede">
          Componentes e assets para montar um portfólio com cara de castelo metroidvania: molduras 9-slice, botões de pedra,
          barras de atributo, diálogos de RPG e uma sala de save animada. A API em Spring Boot entrega os dados.
        </p>
        <div className="sc-hero__cta">
          <PixelButton href="#componentes" variant="primary" sigil="estrela">
            Ver componentes
          </PixelButton>
          <PixelButton href="#portfolio" sigil="olho">
            Demo de portfólio
          </PixelButton>
        </div>
        <dl className="sc-stats">
          <div>
            <dt>Componentes</dt>
            <dd>18</dd>
          </div>
          <div>
            <dt>Assets PNG</dt>
            <dd>89</dd>
          </div>
          <div>
            <dt>Endpoints</dt>
            <dd>5</dd>
          </div>
        </dl>
      </div>
      <div className="sc-hero__scene">
        <Frame variant="carmim" flush>
          <SaveRoomScene paused={paused} particles={fx} />
        </Frame>
        <div className="sc-hero__controls">
          <span className="sc-hero__bats" aria-hidden="true">
            <Sprite name="chama_espectral" scale={2} />
            <Sprite name="brilho_ciano" scale={2} />
          </span>
          <PixelButton size="sm" aria-pressed={paused} onClick={() => setPaused((v) => !v)}>
            {paused ? 'Animar' : 'Pausar'}
          </PixelButton>
          <PixelButton size="sm" aria-pressed={fx} variant={fx ? 'primary' : 'default'} onClick={() => setFx((v) => !v)}>
            Partículas
          </PixelButton>
        </div>
      </div>
    </section>
  );
}

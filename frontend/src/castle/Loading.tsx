// Gerado a partir do protótipo do canvas e ajustado à mão.
import { Component } from 'react';
import { sx } from './sx';
import './loading.css';

export default class Loading extends Component<any, any> {
  [key: string]: any;
  vals() {
    const cb = this.props.onSkip;
    return {
      destino: this.props.destino ?? 'Galeria › Blume',
      dur: Number(this.props.duracao ?? 2.3),
      skip: () => { if (typeof cb === 'function') cb(); }
    };
  }

  render() {
    const v: any = this.vals();
    return (
      <div role="status" aria-label={`Carregando ${v.destino}`} style={sx(`position: relative; width: 1440px; height: 900px; overflow: hidden; background: #000000; font-family: 'Pixelify Sans', Silkscreen, monospace`)}>
        <div aria-hidden="true" style={sx(`position: absolute; left: 170px; top: 96px; width: 1100px; display: flex; align-items: center; height: 81px`)}>
          <span className="ld-end" />
          <span className="ld-mid" />
          <span className="ld-emb" />
          <span className="ld-mid" />
          <span className="ld-end" style={sx(`transform: scaleX(-1)`)} />
        </div>
        <div className="ld-fr" style={sx(`position: absolute; left: 250px; top: 196px; width: 940px; height: 420px; background: #0a0814; padding: 0`)}>
          <div className="ld-wall" style={sx(`position: absolute; inset: 0`)} />
          <div style={sx(`position: absolute; left: 120px; top: 0; bottom: 0; width: 28px; background: linear-gradient(90deg, #2a1c08, #6a4a14, #2a1c08)`)} />
          <div style={sx(`position: absolute; right: 120px; top: 0; bottom: 0; width: 28px; background: linear-gradient(90deg, #2a1c08, #6a4a14, #2a1c08)`)} />
          <div style={sx(`position: absolute; left: 0; right: 0; bottom: 0; height: 30px; background: linear-gradient(#3a2810, #1a1006); border-top: 3px solid #8a5c14`)} />
        </div>
        <img className="ld-px" src="/assets/castelo/6b0b3f2f44e100ae82e604b1992a75b2.png" alt="" style={sx(`position: absolute; left: 70px; top: 150px; width: 128px; height: 256px`)} />
        <img className="ld-px" src="/assets/castelo/6b0b3f2f44e100ae82e604b1992a75b2.png" alt="" style={sx(`position: absolute; right: 70px; top: 150px; width: 128px; height: 256px`)} />
        <img className="ld-px" src="/assets/castelo/5ce5c232d85e4e23f851bb0e0ecc085a.png" alt="" style={sx(`position: absolute; left: 62px; top: 470px; width: 144px; height: 144px`)} />
        <img className="ld-px" src="/assets/castelo/5ce5c232d85e4e23f851bb0e0ecc085a.png" alt="" style={sx(`position: absolute; right: 62px; top: 470px; width: 144px; height: 144px`)} />
        <span className="ld-flame" aria-hidden="true" style={sx(`left: 116px; top: 420px`)} />
        <span className="ld-flame" aria-hidden="true" style={sx(`right: 116px; top: 420px`)} />
        <div className="ld-floor" style={sx(`position: absolute; left: 170px; top: 616px; width: 1100px; height: 42px; border-top: 3px solid #0a3a40; border-bottom: 3px solid #041416`)} />
        <div style={sx(`position: absolute; left: 170px; top: 664px; width: 1100px; height: 30px; background: linear-gradient(#0a1a14, #000000)`)} />
        <div className="ld-frg" style={sx(`position: absolute; left: 136px; top: 600px; width: 34px; height: 100px; background: #1a1820`)} />
        <div className="ld-frg" style={sx(`position: absolute; left: 1270px; top: 600px; width: 34px; height: 100px; background: #1a1820`)} />
        <span className="ld-hero" aria-hidden="true" style={sx(`left: 672px; top: 474px`)} />
        <div style={sx(`position: absolute; left: 0; right: 0; top: 724px; display: flex; flex-direction: column; align-items: center; gap: 12px`)}>
          <span className="ld-blink" style={sx(`font: 13px Silkscreen, monospace; letter-spacing: .3em; color: #3ec8d4`)}>
            CARREGANDO
          </span>
          <span style={sx(`font: 600 36px/1.05 'Pixelify Sans', Silkscreen, monospace; color: #f6dc8c; text-shadow: 0 3px 0 #3a2208`)}>
            {v.destino}
          </span>
          <div style={sx(`display: flex; align-items: center; gap: 20px; margin-top: 6px`)}>
            <div className="ld-bar" style={sx(`width: 560px`)}>
              <i className="ld-fill" style={sx(`animation-duration: ${v.dur}s`)} />
            </div>
            <button type="button" className="ld-skip" onClick={v.skip}>
              Pular ▸
            </button>
          </div>
        </div>
      </div>
    );
  }
}

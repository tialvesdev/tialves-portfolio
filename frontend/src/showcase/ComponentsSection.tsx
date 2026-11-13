import { useState } from 'react';
import {
  Chip,
  ChipList,
  DialogBox,
  Field,
  Frame,
  OrnateDivider,
  Pager,
  PatternSurface,
  PixelButton,
  ProjectCard,
  Relic,
  RoomBackdrop,
  SectionHeading,
  Sigil,
  Sprite,
  StatBar,
  roomSrc,
} from '../ui';
import { Specimen } from './Specimen';

const DIALOG_LINES = [
  'Progresso salvo. Seu portfólio foi gravado no cristal.',
  'Uma nova relíquia foi adicionada à galeria de projetos.',
  'O ateliê está aberto. Clique para pular a animação de texto.',
];

export function ComponentsSection() {
  const [line, setLine] = useState(1);
  const [slide, setSlide] = useState(1);
  const slides = ['torre_relogio', 'galeria_retratos', 'vitral', 'atelie_arquiteto'] as const;

  return (
    <section id="componentes" className="sc-section" aria-labelledby="componentes-title">
      <SectionHeading
        id="componentes-title"
        kicker="src/ui"
        sigil="flor_de_lis"
        title="Componentes"
        lede="Todos tipados, sem dependências além do React. Importe de '@/ui' e carregue theme.css uma vez."
      />

      <div className="sc-specs">
        <Specimen
          name="PixelButton"
          summary="Botão 9-slice com estados normal, hover, pressionado, primário e desabilitado. Vira link quando recebe href."
          code={`<PixelButton variant="primary" sigil="estrela">Ver projeto</PixelButton>
<PixelButton href="/cv.pdf">Currículo</PixelButton>
<PixelButton size="sm">Pequeno</PixelButton>
<PixelButton disabled>Em breve</PixelButton>`}
        >
          <div className="sc-row">
            <PixelButton variant="primary" sigil="estrela">
              Ver projeto
            </PixelButton>
            <PixelButton>Código</PixelButton>
            <PixelButton size="sm">Pequeno</PixelButton>
            <PixelButton disabled>Em breve</PixelButton>
          </div>
        </Specimen>

        <Specimen
          name="Chip"
          summary="Etiqueta de tecnologia em pedra entalhada. ChipList gera a lista semântica."
          code={`<ChipList items={['React', 'TypeScript', 'Spring Boot']} />
<Chip>Java 21</Chip>`}
        >
          <div className="sc-col">
            <ChipList items={['React', 'TypeScript', 'Spring Boot']} label="Exemplo de tecnologias" />
            <Chip>Java 21</Chip>
          </div>
        </Specimen>

        <Specimen
          name="ProjectCard"
          wide
          summary="Card de projeto com imagem, chips e ações. featured troca para a moldura carmim; links sem href viram botões desabilitados."
          code={`<ProjectCard
  title="API do Portfólio"
  description="Spring Boot servindo projetos e contato."
  room="atelie_arquiteto"        // ou image="/meu-print.png"
  tags={['Java', 'Spring Boot']}
  links={[{ label: 'Ver projeto', href: 'https://…', primary: true }, { label: 'Em breve' }]}
  featured
/>`}
        >
          <div className="sc-cards">
            <ProjectCard
              title="Card padrão"
              description="Moldura de filigrana dourada sobre pedra."
              room="galeria_retratos"
              tags={['React', 'TypeScript']}
              links={[{ label: 'Ver projeto', href: '#componentes', primary: true }, { label: 'Código', href: '#componentes' }]}
            />
            <ProjectCard
              featured
              title="Card em destaque"
              description="Variação carmim para o trabalho principal."
              room="save"
              tags={['Java', 'Spring Boot']}
              badge={<Chip>Destaque</Chip>}
              links={[{ label: 'Estudo de caso', href: '#componentes' }, { label: 'Em breve' }]}
            />
          </div>
        </Specimen>

        <Specimen
          name="Frame"
          summary="Moldura 9-slice em três variantes. Aceita qualquer conteúdo e muda a tag com as."
          code={`<Frame variant="filigrana">…</Frame>
<Frame variant="gotica" as="figure">…</Frame>
<Frame variant="carmim" flush><img src={roomSrc('vitral')} alt="" /></Frame>`}
        >
          <div className="sc-frames">
            {(['filigrana', 'gotica', 'carmim'] as const).map((v, i) => (
              <figure key={v} className="sc-figure">
                <Frame variant={v} flush>
                  <img src={roomSrc((['torre_relogio', 'atelie_arquiteto', 'vitral'] as const)[i])} alt="" />
                </Frame>
                <figcaption className="gx-caption">{v}</figcaption>
              </figure>
            ))}
          </div>
        </Specimen>

        <Specimen
          name="DialogBox"
          summary="Janela de diálogo de RPG com efeito máquina de escrever. Respeita prefers-reduced-motion e lê o texto completo para leitores de tela."
          code={`<DialogBox speaker="SISTEMA" text="Progresso salvo." speed={40} />`}
        >
          <div className="sc-col">
            <DialogBox speaker="SISTEMA" text={DIALOG_LINES[line - 1]} />
            <Pager page={line} total={DIALOG_LINES.length} onChange={setLine} />
          </div>
        </Specimen>

        <Specimen
          name="StatBar"
          summary="Barra de atributo (HP/MP) para habilidades. Enche quando entra na tela, em passos de pixel."
          code={`<StatBar label="React" value={80} tone="ciano" />
<StatBar label="Java" value={75} />            // carmim
<StatBar label="Design" value={70} tone="ouro" />`}
        >
          <div className="sc-col">
            <StatBar label="Ciano" value={80} tone="ciano" />
            <StatBar label="Carmim" value={65} />
            <StatBar label="Ouro" value={90} tone="ouro" />
          </div>
        </Specimen>

        <Specimen
          name="Field"
          summary="Input e textarea com moldura de diálogo, label ligado e mensagem de erro anunciada."
          code={`<Field label="Nome" name="name" autoComplete="name" />
<Field label="Mensagem" name="message" multiline rows={4} />
<Field label="E-mail" error="Informe um e-mail válido." />`}
        >
          <div className="sc-col">
            <Field label="Nome" placeholder="Como posso te chamar?" />
            <Field label="E-mail" defaultValue="sem-arroba" error="Informe um e-mail válido." />
          </div>
        </Specimen>

        <Specimen
          name="Pager"
          summary="Setas para carrossel ou paginação, com contador anunciado e modo loop."
          code={`const [page, setPage] = useState(1);
<Pager page={page} total={4} onChange={setPage} />`}
        >
          <div className="sc-col sc-col--center">
            <Frame variant="gotica" flush className="sc-slide">
              <img src={roomSrc(slides[slide - 1])} alt="" />
            </Frame>
            <Pager page={slide} total={slides.length} onChange={setSlide} />
          </div>
        </Specimen>

        <Specimen
          name="SectionHeading"
          wide
          summary="Título de seção com símbolos gravados e linhas douradas. OrnateDivider separa blocos."
          code={`<SectionHeading kicker="Capítulo II" title="Projetos" sigil="quadrifolio" lede="…" />
<OrnateDivider />`}
        >
          <div className="sc-col" style={{ width: '100%' }}>
            <SectionHeading kicker="Capítulo II" title="Projetos" sigil="quadrifolio" />
            <OrnateDivider />
          </div>
        </Specimen>

        <Specimen
          name="Relic"
          summary="Objeto decorativo em escala inteira. motion: float (hover), idle (sempre) ou none."
          code={`<Relic name="grimorio" scale={3} />
<Relic name="vela_espectral" motion="idle" pedestal={false} />`}
        >
          <div className="sc-row sc-row--end">
            <Relic name="grimorio" scale={3} />
            <Relic name="vela_espectral" scale={3} motion="idle" pedestal={false} />
            <Relic name="compasso" scale={2} pedestal={false} />
          </div>
        </Specimen>

        <Specimen
          name="Sprite"
          summary="Anima qualquer sprite sheet de partícula com CSS steps(). Pausável."
          code={`<Sprite name="chama_espectral" scale={4} />
<Sprite name="morcego_voo" scale={3} fps={10} />`}
        >
          <div className="sc-row sc-row--end">
            <Sprite name="chama_quente" scale={4} />
            <Sprite name="chama_espectral" scale={4} />
            <Sprite name="morcego_voo" scale={3} />
            <Sprite name="espirito_ciano" scale={3} />
          </div>
        </Specimen>

        <Specimen
          name="Sigil"
          summary="Glifos 24×24 em relevo dourado para ícones e marcadores. Decorativo por padrão; passe label para anunciar."
          code={`<Sigil name="rosa_dos_ventos" scale={2} />
<Sigil name="olho" label="Visualizar" />`}
        >
          <div className="sc-row">
            {(['crescente', 'estrela', 'flor_de_lis', 'no_bezier', 'olho', 'pena', 'quadrifolio', 'rosa_dos_ventos'] as const).map((n) => (
              <Sigil key={n} name={n} scale={2} />
            ))}
          </div>
        </Specimen>

        <Specimen
          name="PatternSurface"
          summary="Fundo seamless em escala inteira. patternStyle() devolve o mesmo estilo para usar em qualquer elemento."
          code={`<PatternSurface pattern="damasco_carmim" scale={3} />
<div style={patternStyle('trelica_dourada', 2)} />`}
          stage="plain"
        >
          <div className="sc-patterns-mini">
            <PatternSurface pattern="damasco_carmim" scale={2} />
            <PatternSurface pattern="trelica_dourada" scale={3} />
            <PatternSurface pattern="tracado_arquiteto" scale={2} />
          </div>
        </Specimen>

        <Specimen
          name="RoomBackdrop"
          wide
          stage="plain"
          summary="Usa uma sala do castelo como fundo de seção, com véu ajustável para o texto continuar legível."
          code={`<RoomBackdrop room="torre_relogio" veil="linear-gradient(90deg, #07060bee, #07060b55)">
  <h2>Sobre mim</h2>
</RoomBackdrop>`}
        >
          <RoomBackdrop room="torre_relogio" className="sc-room-demo" veil="linear-gradient(90deg, rgba(7,6,11,.92) 30%, rgba(7,6,11,.25))">
            <span className="sc-kicker">Capítulo I</span>
            <h3>Sobre mim</h3>
            <p>Texto sempre sobre o véu escuro, nunca direto na cena.</p>
          </RoomBackdrop>
        </Specimen>
      </div>
    </section>
  );
}

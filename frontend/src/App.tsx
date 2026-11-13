import { GothicNav, OrnateDivider } from './ui';
import { Hero } from './showcase/Hero';
import { ComponentsSection } from './showcase/ComponentsSection';
import { AssetsSection } from './showcase/AssetsSection';
import { PortfolioDemo } from './showcase/PortfolioDemo';
import { ApiSection } from './showcase/ApiSection';

export default function App() {
  return (
    <>
      <a className="sc-skip" href="#conteudo">
        Pular para o conteúdo
      </a>
      <GothicNav
        brand="Ateliê Gótico"
        items={[
          { href: '#componentes', label: 'Componentes', sigil: 'flor_de_lis' },
          { href: '#assets', label: 'Assets', sigil: 'quadrifolio' },
          { href: '#portfolio', label: 'Demo', sigil: 'olho' },
          { href: '#api', label: 'API', sigil: 'rosa_dos_ventos' },
        ]}
      />
      <main id="conteudo" className="sc-wrap">
        <Hero />
        <ComponentsSection />
        <OrnateDivider />
        <AssetsSection />
        <OrnateDivider />
        <PortfolioDemo />
        <ApiSection />
      </main>
      <footer className="sc-footer">
        Assets originais · inspirados na estética dos metroidvanias góticos 16-bit · React + TypeScript + Spring Boot
      </footer>
    </>
  );
}

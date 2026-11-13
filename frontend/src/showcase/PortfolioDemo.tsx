import { useState, type FormEvent } from 'react';
import { ContactError, sendContact, usePortfolio, type PortfolioData } from '../api/client';
import type { Project } from '../api/types';
import {
  Chip,
  DialogBox,
  Field,
  Frame,
  OrnateDivider,
  PixelButton,
  ProjectCard,
  RoomBackdrop,
  SectionHeading,
  StatBar,
  type ProjectLink,
} from '../ui';

const STATUS_LABEL: Record<Project['status'], string> = {
  PUBLISHED: 'Publicado',
  IN_PROGRESS: 'Em forja',
  PLANNED: 'Em breve',
};

function projectLinks(p: Project): ProjectLink[] {
  const links: ProjectLink[] = [];
  if (p.liveUrl) links.push({ label: 'Ver projeto', href: p.liveUrl, primary: true });
  if (p.repoUrl) links.push({ label: 'Código', href: p.repoUrl });
  if (links.length === 0) links.push({ label: STATUS_LABEL[p.status] });
  return links;
}

function SourceBadge({ source }: { source: PortfolioData['source'] }) {
  const text = source === 'api' ? 'Dados da API Spring Boot' : source === 'local' ? 'API offline · dados locais' : 'Consultando a API…';
  return (
    <p className={`sc-source sc-source--${source}`} role="status">
      <span aria-hidden="true" />
      {text}
    </p>
  );
}

export function PortfolioDemo() {
  const { profile, projects, skills, source } = usePortfolio();

  return (
    <section id="portfolio" className="sc-section" aria-labelledby="portfolio-title">
      <SectionHeading
        id="portfolio-title"
        kicker="Composição"
        sigil="olho"
        title="Demo de portfólio"
        lede="Os mesmos componentes montados numa landing real. Os dados vêm de GET /api/profile, /api/projects e /api/skills."
      />
      <SourceBadge source={source} />

      <Frame variant="gotica" className="sc-demo">
        {/* Hero do portfólio */}
        <RoomBackdrop room="torre_relogio" as="header" className="sc-demo__hero" veil="linear-gradient(90deg, rgba(7,6,11,.94) 35%, rgba(7,6,11,.35))">
          <div className="sc-demo__hero-copy">
            <span className="sc-kicker">{profile.role}</span>
            <h3 className="sc-demo__name">{profile.name}</h3>
            <p className="sc-lede">{profile.tagline}</p>
            <div className="sc-row">
              <PixelButton href="#demo-projetos" variant="primary" sigil="estrela">
                Ver projetos
              </PixelButton>
              <PixelButton href="#contato" sigil="pena">
                Falar comigo
              </PixelButton>
            </div>
          </div>
        </RoomBackdrop>

        <div className="sc-demo__body">
          <DialogBox speaker={profile.name.split(' ')[0].toUpperCase()} text={`Bem-vindo ao meu ateliê. ${profile.tagline}`} />

          <OrnateDivider />

          <h4 id="demo-projetos" className="sc-demo__h">
            Projetos
          </h4>
          <div className="sc-cards sc-cards--3">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                headingLevel="h4"
                title={p.title}
                description={p.description}
                room={p.room}
                tags={p.tags}
                featured={p.featured}
                badge={p.featured ? <Chip>Destaque</Chip> : undefined}
                links={projectLinks(p)}
              />
            ))}
          </div>

          <OrnateDivider />

          <div className="sc-demo__split">
            <div>
              <h4 className="sc-demo__h">Atributos</h4>
              <div className="sc-col">
                {skills.map((s) => (
                  <StatBar key={s.name} label={s.name} value={s.level} tone={s.tone} />
                ))}
              </div>
            </div>
            <ContactForm />
          </div>
        </div>
      </Frame>
    </section>
  );
}

type FormState = { status: 'idle' | 'sending' | 'sent' | 'error'; message?: string; errors: Record<string, string> };

function ContactForm() {
  const [state, setState] = useState<FormState>({ status: 'idle', errors: {} });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body = { name: String(fd.get('name') ?? ''), email: String(fd.get('email') ?? ''), message: String(fd.get('message') ?? '') };
    setState({ status: 'sending', errors: {} });
    try {
      await sendContact(body);
      form.reset();
      setState({ status: 'sent', errors: {}, message: 'Mensagem selada e enviada. Respondo em breve.' });
    } catch (err) {
      const ce = err instanceof ContactError ? err : new ContactError('Algo deu errado. Tente de novo.');
      setState({ status: 'error', errors: ce.fieldErrors, message: ce.message });
    }
  };

  return (
    <form id="contato" className="sc-contact" onSubmit={onSubmit} noValidate>
      <h4 className="sc-demo__h">Contato</h4>
      <Field label="Nome" name="name" autoComplete="name" required maxLength={80} error={state.errors.name} />
      <Field label="E-mail" name="email" type="email" autoComplete="email" required maxLength={120} error={state.errors.email} />
      <Field label="Mensagem" name="message" multiline rows={4} required minLength={10} maxLength={2000} error={state.errors.message} />
      <div className="sc-row">
        <PixelButton type="submit" variant="primary" sigil="pena" disabled={state.status === 'sending'}>
          {state.status === 'sending' ? 'Enviando…' : 'Enviar'}
        </PixelButton>
      </div>
      <p className={`sc-form-msg sc-form-msg--${state.status}`} role="status" aria-live="polite">
        {state.message}
      </p>
    </form>
  );
}

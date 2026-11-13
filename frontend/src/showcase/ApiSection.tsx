import { Frame, SectionHeading } from '../ui';

const ENDPOINTS = [
  { method: 'GET', path: '/api/profile', desc: 'Nome, cargo, tagline e links.' },
  { method: 'GET', path: '/api/projects', desc: 'Projetos em destaque primeiro. Filtro opcional ?tag=React.' },
  { method: 'GET', path: '/api/projects/{id}', desc: 'Um projeto pelo id; 404 se não existir.' },
  { method: 'GET', path: '/api/skills', desc: 'Habilidades com nível 0–100 e tom da barra.' },
  { method: 'POST', path: '/api/contact', desc: 'Valida nome, e-mail e mensagem. Erros em ProblemDetail (400).' },
];

export function ApiSection() {
  return (
    <section id="api" className="sc-section" aria-labelledby="api-title">
      <SectionHeading
        id="api-title"
        kicker="backend/ · Java 21 · Spring Boot 3"
        sigil="rosa_dos_ventos"
        title="API Spring Boot"
        lede="O Vite encaminha /api para localhost:8080 em desenvolvimento. Sem o backend, a demo usa os dados de src/api/seed.ts."
      />
      <div className="sc-api">
        <Frame variant="filigrana">
          <table className="sc-table">
            <caption className="gx-sr-only">Endpoints da API</caption>
            <thead>
              <tr>
                <th scope="col">Método</th>
                <th scope="col">Rota</th>
                <th scope="col">O que faz</th>
              </tr>
            </thead>
            <tbody>
              {ENDPOINTS.map((e) => (
                <tr key={e.method + e.path}>
                  <td>
                    <span className={`sc-method sc-method--${e.method.toLowerCase()}`}>{e.method}</span>
                  </td>
                  <td>
                    <code>{e.path}</code>
                  </td>
                  <td>{e.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Frame>
        <Frame variant="carmim" className="sc-run">
          <h3>Rodando local</h3>
          <pre>
            <code>{`# terminal 1 — API (porta 8080)
cd backend
mvn spring-boot:run

# terminal 2 — front (porta 5173)
cd frontend
npm install
npm run dev`}</code>
          </pre>
        </Frame>
      </div>
    </section>
  );
}

# Ateliê Gótico: portfólio do Tiago Alves

Portfólio em forma de **castelo jogável em pixel art** (metroidvania gótico), com front-end em
**React + TypeScript** e API em **Java / Spring Boot**. Cada sala é uma seção:
Entrada (início) → Biblioteca (sobre) → Torre do Relógio (experiência) → Galeria (projetos) →
Capela do Vitral (stack) → Sala do Portal (contato). Em telas estreitas o castelo troca sozinho
para a versão de celular.

```
frontend/   Vite + React 18 + TypeScript
  src/castle/          o castelo: CastleDesktop, CastleMobile, Loading e os estilos de cada um
  src/api/             cliente da API (contato) e dados locais de fallback
  src/ui/, src/showcase/   o UI kit "Ateliê Gótico" e seu catálogo, em /kit
  public/assets/castelo/   as imagens do castelo (salas, sprites, molduras)
backend/    Spring Boot 3.3 + Java 21
  .../service/ContactService.java        recebe o formulário do cristal
  .../service/ResendContactNotifier.java envia cada mensagem por e-mail (Resend)
render.yaml   blueprint do Render para a API
```

Os componentes do castelo saíram dos protótipos feitos no canvas de design e foram convertidos
para React/TypeScript; o comportamento (salas, sequências, sons sintetizados, acessibilidade) é o mesmo.

## Rodando

```bash
# API (porta 8080). Usa o JDK 21 e o Maven de %USERPROFILE%\tools
backend\run-local.cmd
# ou, com Java/Maven no PATH: cd backend && mvn spring-boot:run
# testes: cd backend && mvn test

# Front (porta 5173). /api é encaminhado para a 8080.
cd frontend
npm install
npm run dev
```

Sem `RESEND_API_KEY`, a API aceita as mensagens e só registra no log que elas chegaram.

## Publicando (Vercel + Render)

1. **API no Render**: crie um Blueprint a partir deste repositório (ele lê o `render.yaml`).
   No painel, preencha:
   - `RESEND_API_KEY`: a chave da sua conta no [Resend](https://resend.com).
   - `CORS_ALLOWED_ORIGINS`: o endereço do site, por exemplo `https://seu-dominio`.
   O remetente padrão (`onboarding@resend.dev`) só entrega para o e-mail dono da conta do Resend;
   com um domínio verificado, defina `CONTACT_FROM`.
2. **Site no Vercel**: importe o repositório com **Root Directory** `frontend` e defina
   `VITE_API_URL=https://<sua-api>.onrender.com/api`.
3. No plano gratuito do Render a API dorme quando fica parada; o site a acorda em segundo plano
   assim que alguém abre o castelo.

## API

| Método | Rota | |
|---|---|---|
| GET | `/api/profile` | Perfil (também usado para acordar a API) |
| GET | `/api/projects?tag=` | Projetos (destaques primeiro) |
| GET | `/api/projects/{id}` | Um projeto, 404 se não existir |
| GET | `/api/skills` | Habilidades 0–100 |
| POST | `/api/contact` | Mensagem do cristal: 201, 400 com `errors` por campo, 502 se o e-mail não sair |

## UI kit

O kit de componentes pixel art que deu origem ao visual continua no projeto, com catálogo em `/kit`
(`src/ui/`: `PixelButton`, `Frame`, `DialogBox`, `StatBar`, `Field`, `Sigil`, `RoomBackdrop`...).
Todos respeitam `prefers-reduced-motion`. Use sempre escalas inteiras para o pixel art não borrar.

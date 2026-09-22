# Cardápio Digital

Plataforma reutilizável de **catálogo/cardápio digital para restaurantes**, com
site público e painel administrativo. Foi feita para que o gerente do
restaurante consiga mudar praticamente todo o conteúdo do site sozinho, sem
mexer em código e sem precisar de um novo deploy.

- **Site público:** página inicial montada em blocos, cardápio com busca e
  layout adaptativo, delivery, eventos, unidades e contato.
- **Painel (`/admin`):** produtos, categorias, seções da home, páginas, mídia,
  aparência, SEO, redes sociais e configurações gerais.
- **Hospedagem:** preparado para a Vercel (100% serverless, sem dependência de
  disco local).

---

## Sumário

1. [Stack](#stack)
2. [Começando](#começando)
3. [Banco de dados](#banco-de-dados)
4. [Usuário administrador](#usuário-administrador)
5. [Imagens e uploads](#imagens-e-uploads)
6. [Deploy na Vercel](#deploy-na-vercel)
7. [Domínio personalizado](#domínio-personalizado)
8. [Comandos disponíveis](#comandos-disponíveis)
9. [Estrutura do projeto](#estrutura-do-projeto)
10. [Decisões de arquitetura](#decisões-de-arquitetura)
11. [Como usar o painel](#como-usar-o-painel)

---

## Stack

| Camada         | Escolha                                              |
| -------------- | ---------------------------------------------------- |
| Framework      | Next.js 16 (App Router) + React 19 + TypeScript       |
| Estilos        | Tailwind CSS 3 + tokens CSS controlados pelo painel   |
| Componentes    | Radix UI (diálogos, switch, tooltip) + base própria   |
| Animações      | Framer Motion (respeitando `prefers-reduced-motion`)  |
| Banco de dados | PostgreSQL + Prisma ORM                               |
| Autenticação   | Sessão JWT (jose) em cookie httpOnly + bcrypt         |
| Validação      | Zod (sempre no servidor)                              |
| Uploads        | Vercel Blob                                           |
| Ordenação      | dnd-kit (arrastar e soltar, com suporte a teclado)    |
| Testes         | Vitest                                                |

---

## Começando

Pré-requisitos: **Node.js 20+** e um banco **PostgreSQL** acessível.

```bash
# 1. instalar as dependências
npm install

# 2. configurar as variáveis de ambiente
cp .env.example .env
#    edite o .env com a sua DATABASE_URL e um AUTH_SECRET

# 3. criar as tabelas e popular com conteúdo de demonstração
npm run setup

# 4. rodar o projeto
npm run dev
```

O site fica em <http://localhost:3000> e o painel em
<http://localhost:3000/admin>.

Gerar um `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

---

## Banco de dados

Qualquer PostgreSQL serve. Para a Vercel, as opções mais simples são:

### Neon (recomendado)

1. Crie um projeto em <https://neon.tech>.
2. Copie a *connection string* (ela já vem com `?sslmode=require`).
3. Cole em `DATABASE_URL`.
4. Se o Neon oferecer uma URL "direct" (sem pooler), coloque em `DIRECT_URL` —
   ela é usada apenas pelas migrations.

### Supabase

1. Crie um projeto em <https://supabase.com>.
2. Em **Project Settings → Database → Connection string → URI**, copie a URL.
3. Use a porta `6543` (pooler) em `DATABASE_URL` e a `5432` em `DIRECT_URL`.

### Vercel Postgres

1. No painel da Vercel: **Storage → Create Database → Postgres**.
2. Conecte ao projeto — a Vercel injeta as variáveis automaticamente.
3. Renomeie/aponte `DATABASE_URL` para a variável gerada (`POSTGRES_URL`).

Na Vercel as migrations são aplicadas sozinhas durante o build. Na sua máquina,
rode uma vez:

```bash
npm run db:deploy
```

---

## Usuário administrador

**No site publicado você não precisa de nada disso:** a tela `/admin` oferece a
criação do primeiro acesso enquanto não existir nenhum usuário.

Na sua máquina, o `npm run setup` já cria um administrador usando
`ADMIN_EMAIL` / `ADMIN_PASSWORD`. Para criar ou trocar a senha pelo terminal:

```bash
npm run create:admin
# ou informando direto:
npm run create:admin -- gerente@restaurante.com "uma-senha-boa" "Maria"
```

> **Importante:** troque a senha padrão antes de colocar o site no ar. Isso
> também pode ser feito pelo próprio painel, em **Sistema → Minha conta**.

A senha é guardada apenas como hash bcrypt (12 rounds). A sessão é um JWT
assinado (HS256) guardado em cookie `httpOnly`, `sameSite=lax` e `secure` em
produção.

---

## Imagens e uploads

O projeto roda em ambiente serverless, então **nada é gravado no disco local**.
Os envios vão para o **Vercel Blob**:

1. No painel da Vercel: **Storage → Create Database → Blob**.
2. Conecte o store ao projeto.
3. A Vercel cria a variável `BLOB_READ_WRITE_TOKEN` automaticamente.
4. Em desenvolvimento, copie esse token para o seu `.env`.

Sem o token o painel continua funcionando: em todo campo de imagem existe a
opção **“Usar um endereço”**, na qual o administrador cola a URL de uma imagem
já hospedada (Cloudinary, Imgur, o próprio Instagram etc.).

Limites e validações (server-side):

- formatos aceitos: JPG, PNG, WebP, AVIF, GIF e SVG;
- tamanho máximo: `UPLOAD_MAX_MB` (padrão 8 MB);
- somente usuários autenticados podem enviar arquivos.

As imagens do site são servidas via `next/image` (AVIF/WebP, lazy loading e
tamanhos responsivos).

> As imagens em `public/demo` são apenas ilustrativas — composições abstratas
> geradas localmente por `scripts/generate-demo-assets.mjs` para o projeto já
> nascer "cheio". Substitua-as em **Identidade → Mídia**.

---

## Deploy na Vercel

São **duas variáveis** e nada de linha de comando. As tabelas são criadas
durante o build e o primeiro acesso ao painel é criado pelo navegador.

### 1. Crie o banco de dados

Qualquer PostgreSQL serve. O caminho mais curto é pelo próprio painel da
Vercel: **Storage → Create Database → Postgres** (ou Neon/Supabase, veja
[Banco de dados](#banco-de-dados)). Copie a *connection string*.

### 2. Importe o repositório

Na Vercel: **Add New → Project**, escolha o repositório e siga. Ela detecta o
Next.js sozinha — não mexa no *build command*.

### 3. Configure as variáveis

Em **Settings → Environment Variables** (marque Production, Preview e
Development):

| Variável                | Obrigatória | Para que serve                                  |
| ----------------------- | ----------- | ----------------------------------------------- |
| `DATABASE_URL`          | **sim**     | Conexão com o PostgreSQL                        |
| `AUTH_SECRET`           | **sim**     | Assina a sessão do painel                       |
| `DIRECT_URL`            | recomendada | Conexão sem pooler, usada pelas migrations      |
| `BLOB_READ_WRITE_TOKEN` | recomendada | Envio de imagens pelo painel                    |
| `NEXT_PUBLIC_SITE_URL`  | ao usar domínio próprio | Metadados, OpenGraph e sitemap      |
| `AUTH_SESSION_DAYS`     | não         | Duração da sessão (padrão 7 dias)               |
| `UPLOAD_MAX_MB`         | não         | Limite de tamanho de upload (padrão 8 MB)       |

Gere o `AUTH_SECRET` com:

```bash
openssl rand -base64 32
```

> **Neon e Supabase:** eles dão duas URLs. A com *pooler* vai em `DATABASE_URL`
> e a direta em `DIRECT_URL` — o pooler não aceita os comandos de migration.

#### Conectou o banco por uma integração da Vercel?

Então você não precisa criar variável nenhuma. As integrações criam a conexão
com nomes próprios — e algumas obrigam a escolher um prefixo (`MEUBANCO_URL`,
`STORAGE_URL`...). O projeto procura a conexão nesta ordem:

1. `DATABASE_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL`;
2. qualquer variável de ambiente cujo valor seja uma URL de PostgreSQL.

O mesmo vale para a conexão direta das migrations (`DIRECT_URL`,
`DATABASE_URL_UNPOOLED`, `POSTGRES_URL_NON_POOLING` ou qualquer nome terminado
em `_UNPOOLED` / `_NON_POOLING`). O nome escolhido aparece no log do build e do
servidor, para não ficar mágico.

> **Prisma Postgres:** essa integração entrega uma URL no formato
> `prisma+postgres://` (Prisma Accelerate), que o cliente Prisma deste projeto
> não abre. O build detecta e avisa. Prefira um PostgreSQL comum — Neon,
> Supabase ou Vercel Postgres.

### 4. Publique

Faça o deploy. Durante o build o projeto:

1. gera o Prisma Client;
2. **aplica as migrations** (`scripts/prepare-database.mjs`);
3. compila o Next.js.

Se o banco ainda não estiver acessível, o build **não falha**: o site sobe com
o conteúdo padrão e a tela de login explica o que falta configurar.

### 5. Crie o seu acesso

Abra `https://seu-projeto.vercel.app/admin`. Como ainda não existe nenhum
usuário, a tela oferece **“Crie o seu acesso”**: informe nome, e-mail e senha.
Pronto — você entra direto no painel.

> Esse formulário só aparece enquanto não houver nenhum usuário cadastrado.
> A partir daí, a mesma tela passa a pedir e-mail e senha.

### 6. (Opcional) Carregue o conteúdo de demonstração

No primeiro acesso o painel oferece o botão **“Carregar demonstração”**, que
preenche o site com um cardápio de exemplo — categorias, produtos, fotos e a
página inicial já montada. Serve para ver como tudo fica antes de cadastrar o
cardápio real; depois é só editar ou apagar.

### Envio de imagens

Para o administrador poder enviar fotos pelo painel, crie um Blob Store em
**Storage → Create Database → Blob** e conecte ao projeto — a Vercel cria a
variável `BLOB_READ_WRITE_TOKEN` sozinha. Sem ela, todo campo de imagem oferece
a opção **“Usar um endereço”** para colar a URL de uma imagem já hospedada.

---

## Domínio personalizado

1. Na Vercel, abra o projeto e vá em **Settings → Domains**.
2. Clique em **Add** e informe o domínio (ex.: `meurestaurante.com.br`).
3. No seu provedor de DNS, crie os registros que a Vercel indicar:
   - domínio raiz: registro **A** apontando para o IP informado;
   - `www`: registro **CNAME** apontando para `cname.vercel-dns.com`.
4. Aguarde a propagação — o certificado HTTPS é emitido automaticamente.
5. Atualize `NEXT_PUBLIC_SITE_URL` para o domínio final e refaça o deploy, para
   que sitemap, `robots.txt` e as imagens de compartilhamento usem o endereço
   certo.

---

## Comandos disponíveis

| Comando                | O que faz                                         |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Ambiente de desenvolvimento                       |
| `npm run build`        | `prisma generate` + build de produção             |
| `npm start`            | Sobe o build de produção                          |
| `npm run lint`         | ESLint (zero aviso tolerado)                      |
| `npm run typecheck`    | TypeScript sem emitir arquivos                    |
| `npm test`             | Testes com Vitest                                 |
| `npm run db:migrate`   | Cria/aplica migrations em desenvolvimento         |
| `npm run setup`        | Cria as tabelas e carrega a demonstração          |
| `npm run db:deploy`    | Aplica migrations em produção                     |
| `npm run db:seed`      | Popula com conteúdo de demonstração               |
| `npm run db:studio`    | Abre o Prisma Studio                              |
| `npm run create:admin` | Cria ou atualiza o usuário administrador          |

---

## Estrutura do projeto

```
prisma/
  schema.prisma            modelagem do banco
  migrations/              migrations versionadas
  seed.ts                  conteúdo fictício de demonstração
scripts/
  create-admin.ts          criação do usuário do painel
  generate-demo-assets.mjs geração das imagens de demonstração
src/
  app/
    (site)/                site público (home, cardápio, delivery, ...)
    admin/                 painel administrativo
    api/upload/            recebimento de arquivos
    sitemap.ts robots.ts   SEO técnico
  components/
    site/                  cabeçalho, rodapé, blocos e animações
    home/                  seções configuráveis da página inicial
    menu/                  cardápio, cards, modal e busca
    admin/                 telas e formulários do painel
    ui/                    botões, campos, diálogos (base compartilhada)
  lib/
    auth/                  senha e sessão
    data/                  leituras do banco (com valores padrão)
    menu-layout.ts         algoritmo da grade adaptativa do cardápio
    validators.ts          schemas Zod
    theme.ts               variáveis CSS geradas pela Aparência
  server/actions/          Server Actions (todas as escritas)
tests/                     testes com Vitest
```

---

## Decisões de arquitetura

**Renderização dinâmica.** Todas as páginas do site usam
`dynamic = "force-dynamic"`. O conteúdo muda a qualquer momento pelo painel, e
essa escolha garante que o que o gerente salva aparece na hora, sem precisar de
um novo deploy ou de invalidação de cache. As consultas são deduplicadas por
requisição com o `cache()` do React.

**O site não quebra sem banco.** Todas as leituras passam por `safeQuery()`, que
devolve valores padrão se o banco não responder. Assim o `npm run build` roda
sem `DATABASE_URL` e o primeiro deploy na Vercel nunca falha.

**Server Actions para tudo que escreve.** Cada ação valida a sessão por conta
própria (o `proxy.ts` é a primeira barreira, não a única), valida a entrada com
Zod e registra a alteração no histórico de atividades.

**Layout adaptativo do cardápio.** `src/lib/menu-layout.ts` decompõe a
quantidade de produtos em fileiras completas (de 4 e de 3 no computador, de 3 e
2 no tablet), de forma que nunca sobre um card sozinho na última linha. Casos
especiais: 1 produto vira um card largo em destaque; 2 ficam lado a lado; 5 usam
a composição 2 + 3. É a parte mais testada do projeto.

**Páginas opcionais.** Ligar/desligar uma página em **Site → Páginas** some com
ela do menu, do rodapé, dos links internos e das seções da home que dependem
dela. O acesso direto ao endereço devolve **404 de verdade** (por isso o site
não usa `loading.tsx` na raiz: um boundary de streaming ali faria o Next
responder 200 antes de descobrir que a página está desligada).

**Aparência como variáveis CSS.** As cores, fontes e formatos escolhidos no
painel viram um bloco `:root { --brand-* }` injetado no layout do site. Nenhum
componente precisa saber de tema — tudo lê das variáveis.

**Exclusão suave.** Produtos e categorias apagados recebem `deletedAt`: somem do
site na hora, mas continuam recuperáveis no banco.

**Acessibilidade e movimento.** HTML semântico, foco visível, textos
alternativos configuráveis, navegação por teclado (inclusive no arrastar e
soltar) e respeito total a `prefers-reduced-motion`.

---

## Como usar o painel

| Tela                      | Para quê                                                      |
| ------------------------- | ------------------------------------------------------------- |
| **Dashboard**             | Resumo do cardápio e histórico das últimas alterações          |
| **Cardápio → Produtos**   | Cadastrar itens, fotos, preços, ingredientes e disponibilidade |
| **Cardápio → Categorias** | Seções do cardápio, com capa e ordem                           |
| **Site → Página inicial** | Adicionar, ordenar e editar os blocos da home                  |
| **Site → Páginas**        | Ligar/desligar páginas e editar textos e SEO de cada uma       |
| **Site → Delivery**       | Canais de pedido (WhatsApp, aplicativos, entrega própria)      |
| **Site → Eventos**        | Agenda da casa e o que fazer com eventos passados              |
| **Site → Unidades**       | Endereços, horários, telefones e mapas                         |
| **Aparência → Imagens**   | Logo, ícone do navegador e capas das páginas — cada um num lugar só |
| **Aparência → Cores e fontes** | Cores, fontes, cards, botões, cabeçalho e rodapé          |
| **Aparência → Google e buscadores** | Título, descrição e indexação no Google          |
| **Aparência → Redes sociais** | Instagram, TikTok, Facebook e outras redes                |
| **Sistema → Configurações** | Nome, contatos, WhatsApp, moeda e fuso horário               |
| **Sistema → Usuários**    | Criar, desativar e remover acessos ao painel                   |
| **Sistema → Minha conta** | Ver os próprios dados e trocar a senha                         |

Dicas rápidas:

- todo bloco da home pode ser **arrastado** pela alça à esquerda;
- nada é excluído sem uma confirmação explícita;
- cada imagem tem **um lugar só**: a logo, o ícone do navegador e a imagem de
  compartilhamento ficam em **Aparência → Imagens**; as fotos das seções da
  home ficam na própria seção, em **Site → Página inicial**;
- endereço e telefone ficam só em **Sistema → Configurações** — o rodapé e a
  página de contato usam os mesmos;
- o botão **“Visualizar site”**, no topo do painel, abre o site em outra aba;
- a tela de **Aparência** mostra uma prévia em tempo real antes de salvar;
- a seção do cardápio na página inicial tem dois formatos: **vitrine de
  categorias** (com fotos) ou **cardápio simples**, uma lista de preços; no
  formato simples você escolhe ali mesmo qual categoria exibir;
- em **Sistema → Usuários** você cria um acesso para cada pessoa da equipe;
  o *Administrador* faz tudo, o *Editor* cuida do conteúdo mas não mexe nos
  acessos. O painel nunca fica sem um administrador ativo;
- um produto salvo **sem categoria** continua aparecendo no cardápio, numa
  seção **“Outros”** no fim da página — nenhum item publicado fica invisível;
- para encher o cardápio de uma vez, sem cadastrar item por item, use
  `npm run cardapio:seed` (veja abaixo).

### Preencher o cardápio de uma vez

`scripts/seed-cardapio.mjs` cadastra uma lista de hambúrgueres e entradas
direto no banco. Edite a lista dentro do arquivo e rode:

```bash
npm run cardapio:seed                     # usa a DATABASE_URL do .env
DATABASE_URL="postgresql://..." npm run cardapio:seed   # outro banco
```

O script é **aditivo e idempotente**: identifica cada item pelo `slug`, pula
os que já existem e nunca apaga nem altera o que você cadastrou pelo painel.
O campo `imageUrl` de cada produto pode ficar vazio — a foto é enviada depois
pelo painel, em **Produtos → o item → Foto principal**.

Sem acesso à linha de comando? Crie a variável de ambiente `SEED_CARDAPIO=1`
na Vercel e refaça o deploy: o build cadastra os produtos sozinho, logo depois
das migrations. Remova a variável em seguida — ela só é útil uma vez.

# 🩺 Revalida Tracker — Preparação OSCE / INEP (Full-Stack + 100% Offline PWA)

Aplicação completa para médicos e estudantes de medicina se preparando para a **2ª Etapa (Prova Prática de Habilidades Clínicas — OSCE)** do **Revalida / INEP**.

O aplicativo funciona tanto **conectado ao servidor SQLite (`server/`)** quanto em **Modo 100% Offline Autônomo (PWA + banco de dados local no navegador)** — permitindo praticar estações, cronometrar 10 minutos, corrigir o **Padrão Esperado de Procedimento (PEP)**, criar novas estações e visualizar gráficos mesmo **sem internet (Modo Avião)**.

---

## 📁 Estrutura Organizada do Projeto

```text
checklist/
├── package.json                 # Scripts unificados (setup, build, start, seed)
├── iniciar-offline.bat          # Inicializador de 1 clique para Windows
├── iniciar-offline.sh           # Inicializador de 1 clique para Linux / macOS
├── README.md                    # Documentação completa
├── server/                      # Backend Node.js + Express + SQLite (better-sqlite3)
│   ├── package.json
│   ├── index.js                 # Servidor API (:3001) + servidor estático do PWA
│   ├── db.js                    # Schema SQLite (WAL + foreign_keys = ON)
│   ├── auth.js                  # JWT + middleware de autenticação
│   ├── seed.js                  # Dados iniciais (7 áreas, 16 estações, 8 tentativas)
│   └── routes/
│       ├── auth.js              # /api/auth (login, register, me)
│       ├── specialties.js       # /api/specialties (lista e detalhes por slug)
│       ├── stations.js          # /api/stations (CRUD de estações e itens PEP)
│       └── attempts.js          # /api/attempts (tentativas, analytics, export/import)
└── client/                      # Frontend React 18 + Vite + Tailwind + PWA Offline
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── public/
    │   ├── manifest.webmanifest # Manifesto PWA instalável
    │   ├── sw.js                # Service Worker para cache offline
    │   └── icon.svg             # Ícone do app
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── lib/
        │   ├── api.js           # Cliente híbrido (API SQLite + Fallback Offline automático)
        │   ├── offlineDb.js     # Motor de banco de dados 100% local (localStorage)
        │   ├── seedData.js      # Todas as 7 especialidades e 16 estações embutidas
        │   └── auth.jsx         # Contexto de autenticação
        ├── components/
        │   ├── Layout.jsx
        │   ├── Sidebar.jsx      # Menu + seletor Online/Offline + botão Instalar PWA
        │   └── ui.jsx           # Componentes visuais reutilizáveis
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── Specialty.jsx
            ├── Station.jsx
            ├── Attempt.jsx      # Simulador com cronômetro e salvamento automático de rascunho
            ├── History.jsx
            ├── Analytics.jsx    # 4 gráficos Recharts + Top 10 erros recorrentes
            └── Settings.jsx     # Perfil, painel de banco Offline e Backup JSON
```

---

## 📴 Como Rodar o App Offline

### Opção 1: Pelo computador com 1 clique (Windows / Mac / Linux)
1. Baixe ou clone este repositório:
   ```bash
   git clone https://github.com/LucasRangel89/checklist.git
   cd checklist
   ```
2. **No Windows:** dê dois cliques em `iniciar-offline.bat`.
3. **No Mac / Linux:** execute `./iniciar-offline.sh`.
4. O aplicativo abrirá em `http://localhost:3001` e você poderá clicar em **"Instalar Aplicativo"** na barra do navegador (Chrome/Edge) para criar um atalho na Área de Trabalho que funciona sem internet.

### Opção 2: Modo Desenvolvimento (2 terminais)
```bash
# Terminal 1 — Backend API (:3001)
cd server
npm install
node seed.js
npm run dev

# Terminal 2 — Frontend Vite (:5173)
cd client
npm install
npm run dev
```

### Opção 3: Deploy Estático / PWA no Celular (Vercel, Netlify, GitHub Pages, Render)
Como o cliente possui o motor `offlineDb.js` + `seedData.js` embutido:
- Mesmo hospedando apenas a pasta `client` (Build: `cd client && npm install && npm run build`, Output: `client/dist`), o aplicativo funciona **100% completo sem precisar de servidor backend**!
- Ao abrir no celular (Safari no iOS ou Chrome no Android) e escolher **"Adicionar à Tela de Início"**, todas as 7 especialidades, 16 estações do PEP e gráficos ficam disponíveis **100% offline** no aparelho.

---

## 🔑 Credenciais de Demonstração (Funcionam Online e Offline)

- **E-mail:** `demo@revalida.app`
- **Senha:** `demo1234`
- **Usuária:** Dra. Ana Beatriz

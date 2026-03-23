# ☀ SolarMap AI — Plataforma de Inteligência Geoespacial Solar

> **SaaS premium de análise solar com visão global · 2027**
> Interface completa construída em HTML5 · CSS3 · JavaScript puro — sem frameworks, sem dependências obrigatórias.

---

## 🗂 Arquivos do projeto

| Arquivo | Descrição | Status |
|---|---|---|
| `index.html` | Landing page pública — apresentação da plataforma | ✅ Completo |
| `dashboard.html` | Dashboard principal — centro de inteligência solar | ✅ Completo |
| `simulacao.html` | Tela de simulação solar — formulário + resultados | ✅ Completo |
| `mapa-solar.html` | Mapeamento geoespacial — satélite + seleção de telhado | ✅ Completo |
| `orcamento.html` | Orçamento inteligente — comparação de kits + financiamento | ✅ Completo |
| `navegacao.html` | Arquitetura de navegação — sistema completo + fluxos | ✅ Completo |

---

## 🚀 Como usar

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/solarmap-ai.git

# Abra qualquer arquivo diretamente no navegador
# Não é necessário servidor, build ou dependências

open index.html        # Landing page
open dashboard.html    # Dashboard principal
open simulacao.html    # Tela de simulação
open mapa-solar.html   # Mapa geoespacial
open orcamento.html    # Orçamento inteligente
open navegacao.html    # Arquitetura de navegação
```

---

## 🎨 Stack de design

| Recurso | Detalhe |
|---|---|
| **Linguagem** | HTML5 · CSS3 · JavaScript ES2022 (puro) |
| **Fontes** | Sora · Figtree · Manrope · Satoshi · Outfit · DM Mono · Fira Code · Berkeley Mono · JetBrains Mono · Instrument Serif · Cabinet Grotesk · Clash Display · Geist Mono |
| **Sem frameworks** | Zero React · Zero Vue · Zero Angular |
| **Sem build** | Abre direto no browser |
| **Sem dependências** | Tudo inline ou via Google Fonts CDN |

### Paleta de cores

```css
/* Fundos */
--bg-base: #03080E  /* Void black */

/* Acentos */
--gold:  #D4A843   /* Solar gold */
--green: #1FD8A4   /* Energy green */
--blue:  #3B9EFF   /* Tech blue */

/* Texto */
--text:  #EEF4FF   /* Arctic chrome */
```

---

## 📋 Funcionalidades por tela

### `index.html` — Landing Page
- Hero cinematográfico com orb solar animado e painéis simulados
- Seção "Como funciona" (4 passos)
- Cards de benefícios com glassmorphism
- Seção "Para quem é" (5 perfis)
- Roadmap de módulos futuros
- Números de credibilidade
- Dashboard mockup com gráficos CSS
- FAQ com accordion
- Footer sofisticado

### `dashboard.html` — Dashboard Principal
- KPI cards com sparklines animadas (6 métricas)
- Mapa satelital simulado com telhado destacado piscante
- Gráfico de produção com 3 abas (Diária / Mensal / Anual)
- Grid de painéis solares (células on/off)
- Arco de trajetória solar em SVG
- Retorno financeiro com barras de ROI
- Tabela de projetos com badges e status
- Insights acionáveis de IA
- Módulos futuros

### `simulacao.html` — Tela de Simulação
- Formulário em 7 seções (localização → financiamento → opções avançadas)
- Sliders animados com gradient fill
- Segment controls e pill selectors
- Motor de cálculo funcional em JS
- Painel de resultados com animação staggerada
- Mapa mockup com zona de seleção
- Grid de painéis solares visual
- Gráfico de geração mensal
- Barras de retorno acumulado por período
- Donut chart de payback
- Recomendação de IA com texto dinâmico
- 11 pontos de integração futura documentados

### `mapa-solar.html` — Mapeamento Geoespacial
- Canvas procedural para imagery satelital (PRNG Mulberry32)
- 3 modos de visualização: Satélite · Mapa · Híbrido
- Polígono de seleção draggável em SVG vetorial
- Pattern fill de painéis solares individuais
- 5 nós de ancoragem + handles intermediários arrastáveis
- Painel com painéis solares
- HUD com: análise geoespacial, bússola SVG, barra de coordenadas, escala, mini-mapa canvas, tooltip dinâmico
- 8 camadas de análise com toggles
- 12 pontos de integração documentados

### `orcamento.html` — Orçamento Inteligente
- Banner de projeto (7 KPIs)
- 4 cards comparativos de kits solares
- Tabela detalhada de 9 linhas com badges
- 6 regiões de preço (BR, PT, ES, USA)
- Análise de instalação com fases e complexidade
- Seção de retorno com donut chart animado
- 4 opções de financiamento
- Bloco de comissão da plataforma
- Recomendação de IA
- 6 tabs de parceiros (fornecedores, instaladores, etc.)
- 10 integrações futuras documentadas

### `navegacao.html` — Arquitetura de Navegação
- Sidebar completa: 10 grupos · 60+ itens · colapso inteligente
- Topbar global: busca · país · idioma · moeda · notificações
- Profile switcher: Cliente / Integrador / Empresa / Admin
- 6 views navegáveis por tabs:
  1. **Visão geral** — 10 cards de módulos
  2. **Mapa do sistema** — SVG 1100×680px com conexões
  3. **Hierarquia de páginas** — 60+ páginas em accordion
  4. **Fluxo do usuário** — 13 etapas end-to-end clicáveis
  5. **Expansão global** — 12 países + 6 módulos globais
  6. **Perfis e permissões** — Tabela RBAC 27×4
- 12 integrações futuras documentadas

---

## 🔌 Integrações futuras documentadas no código

Cada arquivo contém comentários `/* INTEGRAÇÃO FUTURA */` detalhando:

- **Mapas**: Google Maps JS API · Mapbox GL JS · Google Earth Engine
- **Análise solar**: Google Solar API · NASA POWER API · PVGIS · SunCalc.js
- **Financiamento**: BV Solar · Santander Solar · BNDES ProGiro
- **Tarifas**: ANEEL Open Data API · tarifas por distribuidora
- **Auth**: Supabase Auth · Auth0 · JWT + RBAC
- **i18n**: i18next · Intl.NumberFormat · multi-moeda
- **PDF**: Puppeteer · jsPDF · html2canvas
- **CRM**: HubSpot · RD Station · DocuSign/D4Sign
- **Analytics**: Google Analytics 4 · Mixpanel · Hotjar
- **Mobile**: React Native · Expo · Firebase Cloud Messaging

---

## 🌍 Roadmap de países

| País | Status | Previsão |
|---|---|---|
| 🇧🇷 Brasil | ✅ Ativo | — |
| 🇵🇹 Portugal | 🔄 Em dev. | Q3 2025 |
| 🇪🇸 Espanha | 🔄 Em dev. | Q3 2025 |
| 🇺🇸 EUA | 📅 Roadmap | 2026 |
| 🇲🇽 México | 📅 Roadmap | 2026 |
| 🇦🇷 Argentina | 📅 Roadmap | 2026 |
| 🌍 +41 países | 📅 Roadmap | 2026–2027 |

---

## 📁 Estrutura de navegação

```
SolarMap AI
├── index.html              ← Landing pública
├── dashboard.html          ← /dashboard
├── simulacao.html          ← /simulacoes/nova
├── mapa-solar.html         ← /mapa-solar
├── orcamento.html          ← /orcamento
└── navegacao.html          ← /arquitetura (documentação visual)
```

---

## 🛣 Próximos passos de desenvolvimento

- [ ] Backend API (Node.js / Supabase)
- [ ] Autenticação real (Supabase Auth)
- [ ] Integração Google Maps / Mapbox
- [ ] Integração Google Solar API
- [ ] Integração NASA POWER API
- [ ] Motor financeiro real
- [ ] Geração de PDF de proposta
- [ ] Sistema de usuários e RBAC
- [ ] Multi-idioma (i18next)
- [ ] Marketplace de parceiros
- [ ] App Mobile (React Native)

---

## 📄 Licença

Projeto privado — SolarMap AI Technologies © 2027. Todos os direitos reservados.

---

*Construído com HTML5 · CSS3 · JavaScript puro · sem frameworks · sem dependências obrigatórias*

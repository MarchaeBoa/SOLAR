# Análise Estratégica — SolarMap AI Landing Page

**Data:** 23/03/2026
**Analista:** Product Design & Growth Specialist
**Nível:** Análise brutalmente honesta com foco em escala e conversão

---

## 1. PROPOSTA DE VALOR

### O que funciona
A headline "Seu telhado. Seu potencial. Seu futuro." é poética, mas **não comunica o que o produto faz em 3 segundos**. Um visitante que nunca ouviu falar de SolarMap AI vai ler isso e pensar: "bonito, mas o que exatamente isso faz por mim?"

O subtítulo salva parcialmente: *"Descubra em minutos quanto energia solar seu imóvel pode gerar"* — isso sim é claro. Mas está enterrado abaixo da headline decorativa.

### Diagnóstico
- **Clareza em 3s:** ❌ Falha. A headline é emocional demais e genérica demais.
- **Benefício vs. técnico:** O subtítulo mistura benefício ("independência energética") com feature ("análise geoespacial por satélite"). Funciona, mas pode ser mais afiado.
- **Tag "Inteligência Geoespacial Solar · 2027":** Confusa. O que é "2027"? Ano de lançamento? Visão? Parece WIP exposto ao usuário.

### Sugestões (prioridade alta)

**Nova headline orientada a conversão:**
```
"Descubra quanto seu telhado pode economizar com energia solar"
```
Ou mais agressiva:
```
"Seu telhado pode gerar R$ 4.820/ano em economia. Descubra em 2 minutos."
```

**Regra:** Colocar o número (economia) direto na headline. Dinheiro economizado é o driver #1 de conversão em solar.

**Subtítulo reformulado:**
```
"Análise por satélite + cálculo financeiro instantâneo.
Sem instalar nada. Sem falar com vendedor."
```

A frase "sem falar com vendedor" remove a maior fricção do mercado solar: o medo de ser pressionado por um integrador.

---

## 2. UX E CONVERSÃO

### O que funciona
- O CTA "Iniciar simulação gratuita ↗" é forte e claro.
- O fluxo "4 passos" (Localização → Análise → Cálculo → Retorno) é simples.
- Floating cards com "R$ 4.820/ano" criam urgência.

### Onde trava

1. **O CTA primário leva para #mockup (uma seção da própria página), não para o produto real.** Isso é o maior problema de conversão. O usuário clica "Iniciar simulação" e cai num mockup estático. A frustração é instantânea. Expectativa ≠ Realidade = bounce.

2. **Sem input de endereço no hero.** A maioria dos concorrentes (Project Sunroof, EnergySage, Otovo) coloca um campo de endereço direto no hero. O usuário digita o endereço → vê resultado → fica preso no funil. Aqui, o hero tem 2 botões genéricos.

3. **Excesso de seções antes do CTA final:** Hero → Como funciona → Benefícios → Para quem → Roadmap → Números → Mockup → FAQ → CTA. São **9 seções** entre o primeiro contato e a conversão final. O usuário médio não vai rolar tudo isso.

4. **Seção Roadmap na landing page:** Mostrar "o que vem pela frente" numa página de vendas comunica "o produto não está pronto". Isso é material para blog/changelog, não para landing page.

5. **Stats inflados sem credibilidade:** "+47 países", "2.8M telhados analisados", "12 GW capacidade simulada" — mas não há menção de clientes reais, logos, depoimentos ou case studies. Números sem prova social parecem fabricados.

### Sugestões (prioridade alta → baixa)

| Prioridade | Ação | Impacto esperado |
|-----------|------|-----------------|
| 🔴 Crítica | Adicionar campo de endereço no hero (como Google Sunroof) | +40-60% engajamento |
| 🔴 Crítica | CTA deve abrir simulação real, não scroll para mockup | +30% conversão |
| 🟡 Alta | Remover seção Roadmap da landing page | Elimina percepção de produto incompleto |
| 🟡 Alta | Adicionar depoimentos/logos de clientes reais | +20-30% trust |
| 🟢 Média | Reduzir para 5-6 seções máximo | Menor drop-off |
| 🟢 Média | Sticky CTA bar após scroll do hero | +15% conversão |

---

## 3. DESIGN E PERCEPÇÃO

### O que funciona (muito)
O design visual é **genuinamente premium**. Isso não é elogio casual — o sistema de design está no nível de empresas como Linear, Vercel e Raycast:

- **Paleta:** Midnight Navy + Solar Gold + Energy Green é sofisticada e memorável.
- **Glassmorphism:** Usado com contenção (não exagerado como em templates genéricos).
- **Tipografia:** Syne + DM Sans é uma combinação excelente — moderna sem ser fria.
- **Micro-interações:** Hover states com translateY, gradient text, glow effects — tudo coeso.
- **Noise overlay:** Sutil e correto (0.022 opacity). Dá textura sem interferir.
- **Scrollbar customizada:** Dourada. Detalhe pequeno, impacto grande na percepção de cuidado.

### O que precisa melhorar

1. **Hero visual é CSS puro (mock), não imagem real.** Uma foto aérea real de uma casa com painéis solares transmitiria muito mais confiança do que uma grid CSS simulando painéis. O comentário no código confirma: `<!-- SUBSTITUIR: inserir foto aérea real -->`. Isso é crítico.

2. **Sem imagens reais em nenhum lugar da página.** Todo o visual é abstrações CSS e gradients. Para um produto que lida com satélite e geolocalização, a ausência de imagens reais de satélite é um gap de credibilidade enorme.

3. **Dashboard mockup é HTML/CSS estático.** Funciona como demonstração visual, mas um GIF/vídeo do produto real em uso seria 10x mais persuasivo.

4. **Hierarquia de informação no hero:** O tag "Inteligência Geoespacial Solar · 2027" compete com a headline. O ícone de sol orbitante, embora bonito, distrai do conteúdo principal.

### Sugestões específicas de UI

| Elemento | Estado atual | Sugestão |
|---------|-------------|---------|
| Hero image | CSS grid simulando painéis | Foto aérea real ou screenshot do mapa com painéis detectados |
| Dashboard demo | HTML estático | Vídeo curto (15-30s) ou GIF animado do produto real |
| Social proof | Números sem contexto | Logos de empresas + 2-3 depoimentos com foto |
| Hero tag | "Inteligência Geoespacial Solar · 2027" | Remover ou trocar por "Usado por +500 empresas" (quando real) |
| Floating cards | Estáticas | Animação suave de contador (countUp.js) |
| CTA button | Só texto | Adicionar micro-ícone de raio/sol antes do texto |

---

## 4. DIFERENCIAL COMPETITIVO

### Análise do mercado
Concorrentes diretos: Google Project Sunroof, Aurora Solar, Otovo, EnergyToolbase, Helioscope, PVsyst.

### O que parece igual a qualquer SaaS solar
- "Análise por satélite" → Google Sunroof faz isso grátis
- "Cálculo financeiro" → Qualquer calculadora solar online faz isso
- "Dashboard de gestão" → Aurora Solar já domina esse espaço

### O que PODE ser diferencial real

1. **Multi-país nativo (47 países).** Aurora Solar é focada em USA. Se SolarMap AI realmente funcionar em Brasil, Portugal, Espanha e LatAm, isso é um moat legítimo. **Mas a landing page não comunica isso com força suficiente.**

2. **B2B2C: plataforma para integradores.** O modelo de conectar integrador → consumidor → financiamento é mais plataforma que ferramenta. Isso é o diferencial, mas está escondido na página de orçamento, não na landing.

3. **Comissão de 3% no financiamento.** Modelo de negócio tipo marketplace financeiro. Isso é poderoso mas completamente invisível na landing.

### Sugestões para amplificar diferencial

1. **Posicionar como "a Stripe do solar"** — a infraestrutura que conecta consumidores, integradores e financiadores. Isso é 10x mais poderoso que "mais uma calculadora solar".

2. **Hero alternativo para integradores (B2B):** Landing page separada para integradores com foco em "gerencie 100 projetos solares simultaneamente" e "feche financiamentos 3x mais rápido".

3. **Mapa global interativo** na landing page mostrando cobertura real por país. Isso demonstra escala e diferenciação visual imediata.

---

## 5. OPORTUNIDADES DE CRESCIMENTO

### Features que aumentam retenção

| Feature | Impacto na retenção | Esforço |
|---------|-------------------|---------|
| **Alertas de economia mensal** — email/push com "seu sistema gerou R$ X este mês" | 🔥 Alto | Médio |
| **Comparativo com vizinhos** — "Seu bairro já tem 23 sistemas instalados" | 🔥 Alto | Alto |
| **Monitoramento pós-instalação** — integração com inversores (Fronius, Growatt, etc.) | 🔥🔥 Muito alto | Alto |
| **Marketplace de integradores** — rating, reviews, comparativo de preços | 🔥🔥 Muito alto | Alto |
| **Simulação de valorização do imóvel** — "Painéis solares aumentam o valor do seu imóvel em X%" | 🔥 Alto | Baixo |
| **Comunidade solar** — fórum de proprietários compartilhando economia real | 🔥 Médio | Médio |

### Automações inteligentes (AI-powered)

1. **Auto-detecção de telhado:** O usuário digita o endereço e a IA já detecta a área do telhado, inclinação e orientação automaticamente (via Google Solar API + visão computacional). Zero input manual.

2. **Proposta automática:** Após a simulação, gerar PDF profissional de proposta automaticamente, com financiamento pré-aprovado do parceiro bancário.

3. **Lead scoring para integradores:** Classificar leads automaticamente por probabilidade de conversão (tamanho do telhado, renda estimada da região, tarifa elétrica local).

4. **Alertas de oportunidade:** Notificar integradores quando um novo lead está na área de atuação deles.

### Como tornar indispensável

O caminho é **efeito de rede**: quanto mais integradores usarem, mais dados de preço/qualidade existem → melhor a experiência do consumidor → mais consumidores → mais integradores. Isso é o flywheel.

---

## 6. MONETIZAÇÃO

### Modelo atual (implícito no código)
- Comissão de 3% no financiamento intermediado
- Sem pricing page visível
- Sem planos definidos

### Modelo de pricing sugerido

#### Para Consumidores (B2C)
| Plano | Preço | Inclui |
|-------|-------|--------|
| **Grátis** | R$ 0 | 1 simulação, resultado básico (economia anual estimada) |
| **Completo** | R$ 49 único | Relatório PDF detalhado, 3 propostas de integradores, comparativo de financiamentos |

**Justificativa:** O consumidor está pesquisando um investimento de R$ 15.000-80.000. Pagar R$ 49 por uma análise profissional é irrelevante no contexto da decisão. Mas o free tier é essencial para captura de lead.

#### Para Integradores (B2B SaaS)
| Plano | Preço | Inclui |
|-------|-------|--------|
| **Starter** | R$ 197/mês | 20 simulações/mês, propostas com marca própria, 1 usuário |
| **Pro** | R$ 497/mês | Simulações ilimitadas, CRM básico, 5 usuários, API access |
| **Enterprise** | R$ 1.497/mês | White-label completo, CRM avançado, leads exclusivos, API ilimitada |

#### Revenue share (adicional)
- 2-3% sobre financiamentos fechados via plataforma
- 5-8% sobre instalações agendadas via marketplace

### O que justifica plano premium
- **White-label:** Integrador usa a plataforma com sua própria marca
- **Leads exclusivos por região:** Acesso prioritário a consumidores da área
- **API para integração com CRM/ERP existente**
- **Relatórios avançados de mercado:** Demanda solar por bairro, ticket médio, etc.
- **Suporte prioritário + onboarding dedicado**

---

## 7. FEEDBACK BRUTAL

### ❌ O que está FRACO

1. **Não existe produto real acessível.** A landing page é linda mas todos os CTAs levam a mockups ou seções internas. Nenhum link para um produto funcional. Isso é o problema #1. Uma landing page sem produto por trás é um folheto, não uma ferramenta.

2. **Stats sem credibilidade.** "+47 países" e "2.8M telhados" para um produto que ainda não foi lançado (tag diz "2027") é perigoso. Se um investidor ou cliente sofisticado investigar, perde toda a confiança.

3. **Sem social proof real.** Zero depoimentos, zero logos de clientes, zero case studies. Para um produto B2B, isso é eliminatório. Empresas não compram de quem não tem referências.

4. **Seção Roadmap é autodestrutiva.** Mostrar "módulos futuros" numa landing page de vendas comunica "não estamos prontos". Remova imediatamente.

5. **Código indica produto não funcional.** Comentários como `<!-- INTEGRAÇÃO FUTURA -->`, `<!-- SUBSTITUIR: inserir foto aérea real -->`, `<!-- EDITAR: trocar por dados reais -->` confirmam que é um protótipo de alta fidelidade, não um produto.

### 😐 O que está CONFUSO

1. **Público-alvo indefinido na landing page.** A mesma página tenta falar com consumidores residenciais, empresas ESG, fazendeiros, integradores e investidores. Isso dilui a mensagem. Cada persona precisa de uma narrativa diferente.

2. **Posicionamento ambíguo.** É uma calculadora solar? Uma plataforma de gestão? Um marketplace? Um CRM para integradores? Tenta ser tudo ao mesmo tempo.

3. **Navegação do header mistura produto e marketing.** Links como "Como funciona", "Benefícios", "FAQ" são típicos de landing page. Mas "Dashboard" e "Simulação" sugerem um produto real — que ainda não existe.

### ✅ O que está BOM (mas pode ser EXCELENTE)

1. **Design system é world-class.** A qualidade visual está no top 1% de startups brasileiras. Isso é um asset enorme. Com conteúdo real (fotos, dados, depoimentos), essa landing page seria excepcional.

2. **Arquitetura de navegação é impressionante.** O arquivo `navegacao.html` mostra um sistema com 60+ páginas planejadas, RBAC, fluxos por persona, expansão por país. A visão é ambiciosa e bem estruturada.

3. **Modelo de monetização implícito é forte.** A comissão sobre financiamento + SaaS para integradores é um modelo comprovado. Só falta comunicar isso.

4. **Scope das simulações é profundo.** O formulário em `simulacao.html` tem 7 seções com parâmetros reais de engenharia solar. Isso demonstra domínio do assunto.

5. **Multi-país desde o dia 1.** A maioria dos concorrentes nasce local. Nascer com arquitetura global é uma vantagem se executada corretamente.

---

## PLANO DE AÇÃO PRIORIZADO

### Sprint 1 — Fundação (Semanas 1-2)
1. ~~Landing page bonita~~ → Landing page que converte
   - Trocar headline para foco em economia/dinheiro
   - Adicionar campo de endereço no hero
   - Remover seção Roadmap
   - Remover stats inflados (ou trocar por métricas reais, mesmo que menores)
   - CTA primário deve abrir simulação funcional (nem que seja simplificada)

### Sprint 2 — MVP funcional (Semanas 3-6)
2. Integrar Google Solar API + Maps para simulação real de endereço
3. Resultado: economia estimada + recomendação de sistema + 1-2 propostas de integradores
4. Formulário simples: endereço → conta de luz mensal → resultado

### Sprint 3 — Social proof e confiança (Semanas 7-8)
5. Conseguir 5-10 integradores beta (mesmo grátis) para validar
6. Adicionar depoimentos reais
7. Adicionar logos de parceiros

### Sprint 4 — Monetização (Semanas 9-12)
8. Implementar plano free + paid para consumidores
9. Implementar SaaS para integradores
10. Pricing page dedicada

---

## RESUMO EM 1 FRASE

**O SolarMap AI tem o design de um produto de $100M e a maturidade de produto de um protótipo em Figma — a prioridade #1 é fechar o gap entre a promessa visual e a entrega funcional.**

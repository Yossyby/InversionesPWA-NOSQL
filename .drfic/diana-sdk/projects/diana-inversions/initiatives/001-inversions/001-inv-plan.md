# Plan Tecnico Canonico
## Plataforma de Inversiones con IA

Identificador: 001-INV-PLAN
Proyecto: DIANA Inversions
Iniciativa: 001-inversions
Version de regeneracion: 2026-04-28
Accion: /diana.plan action="regenerate" scope="project" project="diana-inversions"

Especificacion implementada:
- 001-DIANA-INVERSIONS-SPEC
- specs/001-plataforma-inversiones-ia/spec.md (operativa)

Autoridad:
Este plan tecnico esta subordinado a:
1. inv-constitution.md
2. 001-inv-spec.md
3. spec.md (operativa derivada)

Ante conflicto, prevalece la constitucion y la especificacion canonica.

## 0. Entradas Oficiales Consumidas

Fuentes de negocio y canon:
- .drfic/diana-sdk/projects/knowledge/indexes/projects-knowledge-radar.yaml
- .drfic/diana-sdk/projects/diana-inversions/inv-constitution.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-spec.md
- specs/001-plataforma-inversiones-ia/spec.md
- .drfic/diana-sdk/projects/diana-inversions/governance/change-requests/001-inv-ucc.md
- .drfic/diana-sdk/projects/diana-inversions/governance/tickets/001-inv-tkt.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/meta.md

Skills y knowledge first:
- .drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/skills-manifest.yaml
- .drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/agent-skill-matrix.yaml
- .drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/sdd-engine-matrix.yaml
- .drfic/diana-sdk/projects/knowledge/indexes/master-index.md
- .drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/master-index.md
- .drfic/diana-sdk/sdk/diana/knowledge/indexes/master-index.md

## 1. Objetivo del Plan

Definir el como tecnico para implementar una plataforma de inversion asistida por IA, con control humano obligatorio, trazabilidad completa y ejecucion asistida en IBKR y Alpaca, sin introducir nuevos requisitos fuera de FR-001..FR-019 y SC-001..SC-008.

## 2. Alcance y Exclusiones

Incluye:
- Arquitectura modular PWA + REST API.
- Orquestacion de cores analiticos y motor de confluencia.
- Flujo operativo de propuesta, aprobacion y ejecucion asistida.
- Seguridad, observabilidad, resiliencia y cumplimiento.
- Base de trazabilidad para /speckit.plan.

Excluye:
- Auto-trading.
- IA como unica fuente de decision.
- Nuevos mercados fuera de acciones/opciones US.
- Redefinicion funcional de la especificacion.

## 3. Skills Requeridas para Etapa Plan

Required skills (speckit.plan):
- 001-inv-technical-analysis-structure
- 002-inv-indicator-signal-logic
- 004-inv-options-strategy-engine
- 005-inv-institutional-options-flow
- 006-inv-realtime-news-impact
- 007-inv-ai-confluence-orchestration
- 008-inv-market-data-and-realtime
- 010-inv-broker-integration-ibkr-alpaca
- 011-inv-portfolio-and-performance-analytics

Cobertura actual: completa en skills-manifest.yaml.
Politica de fallback: si un skill/knowledge faltara en futuras ejecuciones, continuar con metodologia estandar y reportar gap.

## 4. Arquitectura Tecnica Objetivo

### 4.1 Vista de capas

1. Capa Frontend (PWA):
- Dashboard, watchlists, detalle de senales, historial.
- Flujo de aprobacion humana explicita.
- Visualizacion de evidencia y disclaimers.

2. Capa API (Node.js/Express):
- AuthN JWT Bearer.
- AuthZ RBAC (viewer, trader, admin).
- Politicas MFA para aprobacion/ejecucion sensible.
- Orquestacion de analisis, propuestas y ejecucion asistida.

3. Capa Dominio:
- Entidades: Usuario, Fuente Analitica, Senal, Propuesta Operativa, Decision Humana, Intento de Ejecucion, Registro de Auditoria.
- Maquina de estados de orden y control de concurrencia por version.

4. Capa Integraciones:
- Brokers: IBKR y Alpaca por adaptadores desacoplados.
- Market data en tiempo real con objetivo p95 <= 1s.
- Servicio IA para confluencia/explicabilidad (sin autonomia de ejecucion).

5. Capa Datos:
- Supabase como store operacional primario.
- MongoDB opcional para historicos y contexto IA.
- Retencion minima de evidencia: 365 dias.

### 4.2 Controles tecnicos obligatorios

- Fail-fast en fallas de broker: estado FALLIDA y nueva aprobacion humana para reintento.
- Optimistic locking por version de orden para concurrencia.
- Rate limiting por usuario y endpoint sensible con 429 y cooldown.
- RTO <= 30 min y RPO <= 5 min para servicios criticos.
- Trazabilidad de aprobacion/ejecucion con MFA para trader/admin.

## 5. Fases Tecnicas de Implementacion

### Fase 1: Fundacion de Plataforma

Objetivo:
Establecer bases de arquitectura, seguridad y observabilidad.

Entregables:
- Estructura backend/frontend y contratos base.
- Middleware JWT, RBAC y hooks de MFA.
- Health checks, logging estructurado y metricas base.

Trazabilidad:
- FR-012, FR-017, FR-019, SC-005

#### Project Structure

##### Documentacion de la feature

```text
C:.
+---.drfic
|   |   readme.md
|   \---diana-sdk
|       +---memory
|       +---projects
|       |   +---diana-inversions
|       |   |   |   inv-constitution.md
|       |   |   |   README.md
|       |   |   +---governance
|       |   |   |   |   decision-log.md
|       |   |   |   +---change-requests
|       |   |   |   |       001-inv-ucc.md
|       |   |   |   \---tickets
|       |   |   |           001-inv-tkt.md
|       |   |   +---initiatives
|       |   |   |   \---001-inversions
|       |   |   |       |   001-inv-plan.md
|       |   |   |       |   001-inv-spec.md
|       |   |   |       |   meta.md
|       |   |   |       \---speckit
|       |   |   \---knowledge
|       |   |       |   README.md
|       |   |       +---indexes
|       |   |       |       agent-skill-matrix.yaml
|       |   |       |       by-topic.md
|       |   |       |       master-index.md
|       |   |       |       sdd-engine-matrix.yaml
|       |   |       |       skills-manifest.yaml
|       |   |       |       skills-traceability.md
|       |   |       +---local
|       |   |       |   +---brokers
|       |   |       |   |       001-ibkr-tws-api.md
|       |   |       |   |       002-ibkr-client-portal.md
|       |   |       |   |       003-alpaca-api.md
|       |   |       |   +---compliance
|       |   |       |   |       001-non-advisory-disclaimer.md
|       |   |       |   |       002-data-retention-mx.md
|       |   |       |   +---cores
|       |   |       |   |       001-technical-analysis-core.md
|       |   |       |   |       002-fundamental-analysis-core.md
|       |   |       |   |       003-buy-sell-signals-core.md
|       |   |       |   |       004-options-strategies-core.md
|       |   |       |   |       005-institutional-options-flow-core.md
|       |   |       |   |       006-realtime-news-core.md
|       |   |       |   |       007-ai-confluence-orchestrator-core.md
|       |   |       |   +---domain
|       |   |       |   |       001-order-lifecycle.md
|       |   |       |   |       002-market-data.md
|       |   |       |   |       003-portfolio-analytics.md
|       |   |       |   \---patterns
|       |   |       |           001-jwt-supabase-auth.md
|       |   |       |           002-realtime-market-feed.md
|       |   |       +---remote
|       |   |       |   |   sources.md
|       |   |       |   |
|       |   |       |   +---evernote
|       |   |       |   |       .gitkeep
|       |   |       |   |
|       |   |       |   +---notebooklm
|       |   |       |   |       .gitkeep
|       |   |       |   |
|       |   |       |   \---notion
|       |   |       |           .gitkeep
|       |   |       +---skills
|       |   |       |       001-inv-technical-analysis-structure.md
|       |   |       |       002-inv-indicator-signal-logic.md
|       |   |       |       003-inv-fundamental-analysis.md
|       |   |       |       004-inv-options-strategy-engine.md
|       |   |       |       005-inv-institutional-options-flow.md
|       |   |       |       006-inv-realtime-news-impact.md
|       |   |       |       007-inv-ai-confluence-orchestration.md
|       |   |       |       008-inv-market-data-and-realtime.md
|       |   |       |       009-inv-execution-governance-human-control.md
|       |   |       |       010-inv-broker-integration-ibkr-alpaca.md
|       |   |       |       011-inv-portfolio-and-performance-analytics.md
|       |   |       |       012-inv-compliance-audit-retention.md
|       |   |       |       README.md
|       |   |       \---snapshots
|       |   |               .gitkeep
|       |   +---diana-sdk-core
|       |   |   |   dianacore-constitution.md
|       |   |   +---governance
|       |   |   |   |   decision-log.md
|       |   |   |   |
|       |   |   |   +---change-requests
|       |   |   |   |       001-dianacore-cc.md
|       |   |   |   |
|       |   |   |   \---tickets
|       |   |   |           001-dianacore-tkt.md
|       |   |   +---initiatives
|       |   |   |   \---001-dianacore
|       |   |   |           001-dianacore-plan.md
|       |   |   |           001-dianacore-spec.md
|       |   |   |           meta.md
|       |   |   \---knowledge
|       |   |       |   README.md
|       |   |       +---indexes
|       |   |       |       master-index.md
|       |   |       +---local
|       |   |       |   +---dev
|       |   |       |   |       001-developing-with-diana.md
|       |   |       |   +---domain
|       |   |       |   |       001-sdk-dashboard-overview.md
|       |   |       |   |
|       |   |       |   \---ui-patterns
|       |   |       |           001-admin-panel-patterns.md
|       |   |       \---remote
|       |   |               sources.md
|       |   \---knowledge
|       |       |   README.md
|       |       +---indexes
|       |       |       command-routing.md
|       |       |       master-index.md
|       |       |       projects-knowledge-radar.yaml
|       |       +---local
|       |       |   \---cores
|       |       |           001-technical-analysis-baseline.md
|       |       |           002-fundamental-analysis-baseline.md
|       |       |           003-buy-sell-signals-baseline.md
|       |       |           004-options-strategies-baseline.md
|       |       |           005-institutional-options-flow-baseline.md
|       |       |           006-realtime-news-impact-baseline.md
|       |       |           007-ai-confluence-baseline.md
|       |       +---remote
|       |       |       sources.md
|       |       |
|       |       +---skills
|       |       |       001-fin-risk-taxonomy-baseline.md
|       |       |       002-fin-human-approval-trade-governance.md
|       |       |       003-fin-realtime-market-data-slo.md
|       |       |       README.md
|       |       \---snapshots
|       |               .gitkeep
|       \---sdk
|           \---diana
|               |   constitution.md
|               +---checklists
|               |       checklists.md
|               |       initiative-audit-checklist.md
|               |       plan-quality-checklist.md
|               |       sdd-quality-gate.md
|               |       spec-quality-checklist.md
|               |       tasks-quality-checklist.md
|               +---knowledge
|               |   |   README.md
|               |   +---indexes
|               |   |       by-agent.md
|               |   |       master-index.md
|               |   |       shared-skills-manifest.yaml
|               |   +---local
|               |   |   +---agents
|               |   |   |       001-agent-roles-deep.md
|               |   |   +---glossaries
|               |   |   |       001-diana-terms.md
|               |   |   +---methodology
|               |   |   |       001-sdd-lifecycle.md
|               |   |   \---patterns
|               |   |           001-speckit-integration-patterns.md
|               |   +---remote
|               |   |       sources.md
|               |   \---skills
|               |           001-SDK-SDDCORE.md
|               |           002-SDK-TSSTACK.md
|               |           README.md
|               +---prompts
|               |       agent-copilot.md
|               |       agent-plan-architect.md
|               |       agent-qa-validator.md
|               |       agent-reviewer.md
|               |       agent-spec-writer.md
|               |       agent-task-generator.md
|               +---rules
|               |       agents.md
|               |       governance-and-naming.md
|               |       lifecycle.md
|               |       naming-conventions.md
|               |       sdd-quality-metrics.md
|               |       spec-versioning.md
|               |       speckit-integration.md
|               \---templates
|                       constitution.md
|                       initiative-readme.md
|                       meta.md
|                       spec.md
+---.github
|   |   copilot-instructions.md
|   +---agents
|   |       diana.knowledge.agent.md
|   |       diana.plan.agent.md
|   |       diana.skills.agent.md
|   |       speckit.analyze.agent.md
|   |       speckit.checklist.agent.md
|   |       speckit.clarify.agent.md
|   |       speckit.constitution.agent.md
|   |       speckit.git.commit.agent.md
|   |       speckit.git.feature.agent.md
|   |       speckit.git.initialize.agent.md
|   |       speckit.git.remote.agent.md
|   |       speckit.git.validate.agent.md
|   |       speckit.implement.agent.md
|   |       speckit.plan.agent.md
|   |       speckit.specify.agent.md
|   |       speckit.tasks.agent.md
|   |       speckit.taskstoissues.agent.md
|   +---instructions
|   |       speckit-knowledge-enrichment.instructions.md
|   \---prompts
|           diana.knowledge.prompt.md
|           diana.plan.prompt.md
|           diana.skills.prompt.md
|           speckit.analyze.prompt.md
|           speckit.checklist.prompt.md
|           speckit.clarify.prompt.md
|           speckit.constitution.prompt.md
|           speckit.git.commit.prompt.md
|           speckit.git.feature.prompt.md
|           speckit.git.initialize.prompt.md
|           speckit.git.remote.prompt.md
|           speckit.git.validate.prompt.md
|           speckit.implement.prompt.md
|           speckit.plan.prompt.md
|           speckit.specify.prompt.md
|           speckit.tasks.prompt.md
|           speckit.taskstoissues.prompt.md
+---.specify
|   |   extensions.yml
|   |   feature.json
|   |   init-options.json
|   |   integration.json
|   +---extensions
|   |   |   .registry
|   |   \---git
|   |       |   config-template.yml
|   |       |   extension.yml
|   |       |   git-config.yml
|   |       |   README.md
|   |       +---commands
|   |       |       speckit.git.commit.md
|   |       |       speckit.git.feature.md
|   |       |       speckit.git.initialize.md
|   |       |       speckit.git.remote.md
|   |       |       speckit.git.validate.md
|   |       \---scripts
|   |           +---bash
|   |           |       auto-commit.sh
|   |           |       create-new-feature.sh
|   |           |       git-common.sh
|   |           |       initialize-repo.sh
|   |           \---powershell
|   |                   auto-commit.ps1
|   |                   create-new-feature.ps1
|   |                   git-common.ps1
|   |                   initialize-repo.ps1
|   +---integrations
|   |   |   copilot.manifest.json
|   |   |   speckit.manifest.json
|   |   \---copilot
|   |       \---scripts
|   |               update-context.ps1
|   |               update-context.sh
|   +---memory
|   |       constitution.md
|   +---scripts
|   |   \---powershell
|   |           check-prerequisites.ps1
|   |           common.ps1
|   |           create-new-feature.ps1
|   |           setup-plan.ps1
|   |           update-agent-context.ps1
|   +---templates
|   |       agent-file-template.md
|   |       checklist-template.md
|   |       constitution-template.md
|   |       plan-template.md
|   |       spec-template.md
|   |       tasks-template.md
|   \---workflows
|       |   workflow-registry.json
|       \---speckit
|               workflow.yml
+---.vscode
|       settings.json
\---specs
    \---001-plataforma-inversiones-ia
        |   data-model.md
        |   plan.md
        |   quickstart.md
        |   research.md
        |   spec.md
        +---checklists
        |       requirements.md
        \---contracts
                auth-context.md
                broker-adapter.md
                signal-lifecycle.md
```

##### Estructura de codigo (repo)

│
├── packages/                    # Librerías compartidas (design system, utils, etc.)
│   ├── ui-library/              # Librería interna de componentes UI
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── utils/                   # Funciones utilitarias compartidas
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── types/                   # Tipos globales compartidos
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
|
└── projects/                       # Proyectos organizados por categoría
    ├── pwa/                        # Proyectos PWA
    │   ├── inversions_app/         # Proyecto: Plataforma de Inversiones IA
    │   │   ├── public/
    │   │   ├── data/               # Contratos/modelos de referencia por base de datos
    │   │   │   ├── supabase/
    │   │   │   │   ├── models/
    │   │   │   │   ├── schema/
    │   │   │   │   └── data/
    │   │   │   ├── mongodb/
    │   │   │   │   ├── models/
    │   │   │   │   ├── schema/
    │   │   │   │   └── data/
    │   │   │   └── ...
    │   │   ├── src/                 # Código ejecutable de la PWA
    │   │   │   ├── assets/          # Recursos estáticos (imágenes, fuentes, estilos globales)
    │   │   │   ├── components/      # Componentes reutilizables
    │   │   │   │   └── ui/          # Atomic design: atoms, molecules, organisms
    │   │   │   ├── features/        # Módulos funcionales
    │   │   │   │   ├── dashboard/           # Dashboard principal
    │   │   │   │   ├── market-scanner/      # Escáner de mercado
    │   │   │   │   ├── options-chain/       # Cadena de opciones
    │   │   │   │   ├── signals/             # Motor de señales
    │   │   │   │   ├── portfolio/           # Gestión de portafolio
    │   │   │   │   ├── broker-connect/      # Conexión con brokers
    │   │   │   │   ├── backtesting/         # Backtesting de estrategias
    │   │   │   │   └── alerts/              # Sistema de alertas
    │   │   │   ├── hooks/           # Hooks globales
    │   │   │   ├── layouts/         # Layouts generales
    │   │   │   ├── pages/           # Páginas principales
    │   │   │   ├── routes/          # Configuración de rutas
    │   │   │   ├── services/        # Servicios externos
    │   │   │   │   ├── broker/                # Integración con brokers (IBKR, etc.)
    │   │   │   │   ├── market-data/           # Feeds de datos (TradingView, etc.)
    │   │   │   │   ├── indicators/            # Motor de indicadores técnicos
    │   │   │   │   ├── technical-analysis/    # Análisis Tecnico (datos para graficar soportes, resistencias y tendencias)
    │   │   │   │   ├── fundamental-analysis/  # Análisis Fundamental (datos financieros de los instrumentos/empresas)
    │   │   │   │   └── ai-analysis/            # Análisis con IA (Claude API)
    │   │   │   │   └── institutional-analysis/ # Análisis de las inversiones de los Institucionales
    │   │   │   │   └── news/                   # Servicio de noticias financieras
    │   │   │   │   └── strategies/             # Motor de estrategias de trading
    │   │   │   ├── store/           # Estado global (Zustand/Redux)
    │   │   │   ├── styles/          # Estilos globales
    │   │   │   ├── utils/           # Funciones utilitarias
    │   │   │   ├── types/           # Tipos globales
    │   │   │   ├── App.tsx          # Componente raíz
    │   │   │   ├── main.tsx         # Punto de entrada
    │   │   │   └── vite-env.d.ts    # Tipos generados por Vite
    │   │   ├── tests/               # Pruebas unitarias e integración
    │   │   │   └── e2e/             # Pruebas end-to-end
    │   │   ├── index.html
    │   │   ├── package.json
    │   │   ├── tsconfig.json
    │   │   └── vite.config.ts
    │
    └── api/                             # Proyectos backend / APIs REST
      └── rest_api_inversions_drfic/     # Persistencia real y exposición de endpoints
        ├── src/
        │   ├── routes/
        │   ├── controllers/
        │   ├── services/
        │   ├── models/
        │   ├── migrations/
        │   └── config/
        ├── DATABASE_CONFIG.yaml
        ├── .env.example
        ├── package.json
        └── tsconfig.json
```


### Fase 2: Core de Analisis y Confluencia

Objetivo:
Construir pipeline analitico multi-core y salida explicable.

Entregables:
- Evaluacion de fuentes activas.
- Motor de confluencia con evidencia trazable.
- Definicion de propuesta operativa asociada a senal.

Trazabilidad:
- FR-001, FR-002, FR-003, FR-010, SC-001, SC-004

### Fase 3: Flujo Operativo Human-in-the-loop

Objetivo:
Implementar ciclo de vida operativo con aprobacion humana estricta.

Entregables:
- Estados de propuesta/orden e historial.
- Bloqueo de ejecucion sin aprobacion valida.
- Fail-fast y reintento controlado post-falla.
- Optimistic locking en acciones concurrentes.

Trazabilidad:
- FR-004, FR-005, FR-006, FR-009, FR-016, SC-002

### Fase 4: Integracion Broker y Market Data

Objetivo:
Habilitar ejecucion asistida y datos de mercado en tiempo real.

Entregables:
- Adaptadores IBKR y Alpaca para Market/Limit.
- Normalizacion de estados broker -> dominio.
- Telemetria de latencia y frescura de market data.

Trazabilidad:
- FR-008, FR-014, SC-006

### Fase 5: Auditoria, Cumplimiento y Resiliencia

Objetivo:
Completar requisitos de cumplimiento, evidencia y recuperacion.

Entregables:
- Registro de auditoria inmutable.
- Politicas de retencion 365 dias y evidencia operativa.
- Disclaimer explicito en puntos de decision/ejecucion.
- Estrategia operativa para RTO/RPO objetivos.

Trazabilidad:
- FR-007, FR-011, FR-013, FR-018, SC-003, SC-007, SC-008

### Fase 6: Endurecimiento y Readiness Speckit

Objetivo:
Dejar artefactos listos para descomposicion en /speckit.plan y /speckit.tasks.

Entregables:
- Matriz final FR/SC -> componentes -> pruebas.
- Lista de riesgos residuales y mitigaciones activas.
- Criterios de salida por fase y checkpoints.

## 6. Matriz de Trazabilidad Minima

- Analisis y confluencia: FR-001/002/003/010 -> Fase 2.
- Control humano y ciclo de orden: FR-004/005/006/009/016 -> Fase 3.
- Integracion de brokers y tipos de orden: FR-008/014 -> Fase 4.
- Seguridad y acceso: FR-012/017/019 -> Fase 1.
- Cumplimiento y auditoria: FR-007/011/013/015/018 -> Fases 5 y 1.
- Resultados medibles: SC-001..SC-008 -> Fases 2..5.

## 7. Riesgos Tecnicos y Mitigaciones

1. Deriva entre estados internos y broker.
Mitigacion: reconciliacion periodica, idempotencia y mapeo canonico de estados.

2. Degradacion de market data en alta volatilidad.
Mitigacion: buffering, fallback de feed y alertas de p95.

3. Riesgo de bypass de controles de aprobacion.
Mitigacion: enforce server-side de aprobacion, RBAC y MFA.

4. Falla de servicios criticos fuera de objetivos RTO/RPO.
Mitigacion: runbooks, backups, restauracion probada y simulacros.

5. Ambiguedad futura por cambios no trazados al canon.
Mitigacion: gate de trazabilidad obligatorio previo a tareas/implementacion.

## 8. Validacion de Consistencia Plan/Spec

Resumen de validacion actual:
- OK: 9
- GAPS: 0

Chequeos OK:
1. El plan no contradice constitucion ni especificacion canonica.
2. El plan mantiene modelo semi-automatico y control humano obligatorio.
3. Cada fase mapea a FR/SC verificables.
4. Se consideran skills requeridas para etapa plan.
5. Se contempla seguridad minima (JWT, RBAC, MFA).
6. Se contempla resiliencia minima (RTO/RPO).
7. Se contempla observabilidad para operaciones criticas.
8. Se contempla cumplimiento (disclaimer, auditoria, retencion).
9. El resultado es apto como entrada de /speckit.plan.

## 9. Cambios Significativos vs Version Previa

1. Se alineo el plan a FR-016..FR-019 y SC-006..SC-008.
2. Se reemplazo enfoque generico por trazabilidad explicita a canon operativo.
3. Se incorporaron controles operativos obligatorios:
- optimistic locking
- fail-fast con nueva aprobacion
- RBAC
- MFA
- RTO/RPO
4. Se adiciono matriz de skills requeridas para etapa plan.
5. Se formalizo resumen de consistencia OK/GAPS.

## 10. Salida

Este documento queda listo como plan tecnico canonico regenerado para consumo en:
- /diana.plan action="validate"
- /speckit.plan

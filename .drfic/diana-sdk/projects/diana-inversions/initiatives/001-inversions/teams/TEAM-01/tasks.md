# Backlog de Equipo: TEAM-01

**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Equipo**: TEAM-01
**Fuente**: 001-inv-tasks.md + team-task-allocation.md

## Tareas (literal del canon, con checkbox)

- [ ] T000 Definir y documentar la estructura canónica del monorepo bajo `projects/packages`, `projects/pwa` y `projects/rest-api`, incluyendo criterios de reutilización y ownership por categoría
- [x] T001 Crear carpetas base y README inicial en frontend/README.md y backend/README.md
- [x] T003 [P] Inicializar workspace backend y scripts en backend/package.json
- [x] T005 [P] Crear plantilla compartida de entorno en backend/.env.example
- [ ] T059 Definir y generar esquema inicial de base de datos operativa en Supabase (tablas, índices y relaciones para Usuario, ActivoInversion, FuenteAnalitica, SenalInversion, EvidenciaAnalitica, PropuestaOperativa, DecisionHumana, IntentoEjecucion y RegistroAuditoria), incluyendo migración baseline y política de versionado de cambios en backend/src/database/supabase/
- [x] T006 Implementar middleware JWT y contexto de autenticación en backend/src/middleware/authContext.ts
- [x] T007 [P] Implementar guard RBAC en backend/src/middleware/rbac.ts
- [x] T008 [P] Implementar guard MFA en backend/src/middleware/mfaGuard.ts
- [x] T012 Implementar rate limiting para endpoints sensibles en backend/src/middleware/rateLimit.ts
- [x] T013 [P] Implementar optimistic locking en backend/src/domain/versioning.ts
- [x] T015 Crear configuración de retención y partición en backend/src/config/dataGovernance.ts
- [x] T016 Crear política de resiliencia de dependencias en backend/src/config/dependencySlo.ts
- [x] T022 [P] [US1] Página frontend de evaluación en frontend/src/features/signals/SignalEvaluationPage.tsx
- [x] T023 [P] [US1] Panel frontend de evidencia en frontend/src/features/signals/SignalEvidencePanel.tsx
- [x] T024 [US1] Servicios frontend de señales en frontend/src/services/signals/signalApi.ts
- [x] T026 [P] [US2] Servicio de aprobación MFA en backend/src/modules/execution/approvalService.ts
- [x] T027 [P] [US2] Orquestador de ejecución asistida en backend/src/modules/execution/executionService.ts
- [x] T028 [P] [US2] Contrato adaptador broker en backend/src/modules/brokers/brokerAdapter.ts
- [x] T031 [US2] Endpoint de aprobación en backend/src/routes/execution/approve.ts
- [x] T032 [US2] Endpoint de ejecución en backend/src/routes/execution/execute.ts
- [x] T033 [US2] Recuperación fail-fast en backend/src/modules/execution/failureRecovery.ts
- [x] T034 [P] [US2] Flujo UI de aprobación en frontend/src/features/execution/ApprovalFlow.tsx
- [x] T035 [P] [US2] Panel UI de ejecución en frontend/src/features/execution/ExecutionPanel.tsx
- [x] T036 [US2] Eventos de auditoría de ejecución en backend/src/modules/execution/executionAudit.ts
- [x] T041 [P] [US3] Dashboard frontend de historial en frontend/src/features/audit/AuditHistoryPage.tsx
- [x] T042 [P] [US3] Timeline operativo en frontend/src/features/audit/OperationTimeline.tsx
- [x] T044 [P] Actualizar contrato broker en specs/001-plataforma-inversiones-ia/contracts/broker-adapter.md
- [x] T046 [P] Actualizar contrato de auth en specs/001-plataforma-inversiones-ia/contracts/auth-context.md
- [x] T047 Agregar matriz de trazabilidad en specs/001-plataforma-inversiones-ia/plan.md
- [x] T048 Ejecutar validación de quickstart en specs/001-plataforma-inversiones-ia/quickstart.md
- [x] T056 Gate de no-regresión estructural en scripts/validate-structure.ps1
- [x] T057 [P] Normalizar redacción a español técnico en specs/001-plataforma-inversiones-ia/tasks.md
- [ ] T060 Configurar cliente de Supabase en backend/src/database/supabase/client.ts y crear base repositories pattern en backend/src/repositories/
- [ ] T061 Crear migraciones versionadas de esquema baseline (Usuario, ActivoInversion, FuenteAnalitica, SenalInversion, etc.) en backend/src/database/supabase/migrations/ con changelog y rollback scripts
- [ ] T062 Validador de .env en backend/src/config/envValidator.ts que asegure credenciales obligatorias (SUPABASE_URL, SUPABASE_KEY, IBKR_ACCOUNT, ALPACA_API_KEY) están presentes en startup
- [ ] T063 Integrar dashboard frontend principal en frontend/src/features/dashboard/MainDashboard.tsx con selector de instrumentos, temporalidad y rango de fechas
- [ ] T064 Panel de activación de cores en frontend/src/features/dashboard/CoreSelector.tsx (Technical, News, Fundamental, Institutional, AI Advisor, Strategies) con toggle por core
- [ ] T065 Overlay de señales en gráfico en frontend/src/features/dashboard/SignalOverlay.tsx mostrando señales por core y confluencia con controles de visibilidad
- [ ] T066 Tabla de explicabilidad en frontend/src/features/dashboard/ExplainabilityTable.tsx listando atributos de detonación, desglose de cálculo, score/confidence/source
- [ ] T067 API orchestrador en backend/src/routes/dashboard/orchestrator.ts que consume resultados de otros equipos y consolida en vista única
- [ ] T068 Wiring de integración broker en backend/src/modules/brokers/brokerIntegration.ts cableando IBKR + Alpaca APIs y validación en sandbox
- [ ] T170 Definir estándar transversal de contratos y outputs de estrategias en backend/src/modules/strategies/standards/strategyOutputStandard.ts (request envelope, payoff_data, scenario_table, risk_metrics, signals, audit)

## Matriz de Sincronizacion Speckit -> Diana (Feature 002, espejo canónico)

Regla:
- Speckit puede ampliar/optimizar con tareas adicionales y NO se eliminan del feature.
- Diana solo sincroniza estado contra IDs canónicos existentes del team (T000-T177).
- Para cierre de un ID canónico por sync, se requiere que todas las tareas Speckit mapeadas a ese ID estén en [x].

Mapeo explícito TEAM-01:
- Speckit T039 -> Diana T063
- Speckit T040 -> Diana T064, T065, T066
- Speckit T041 -> Diana T026
- Speckit T042 -> Diana T031, T032
- Speckit T043 -> Diana T041
- Speckit T044 -> Diana T042
- Speckit T045 -> Diana T056
- Speckit T046 -> Diana T027, T033
- Speckit T047 -> Diana T036
- Speckit T048 -> Diana T061
- Speckit T049 -> Diana T057

## Ciclo Operativo de Sync (TEAM-01)

1. Ejecutar /diana.sync action="tasks" mode="dry-run" team="TEAM-01" feature="002-team-01-dashboard-brokers".
2. Resolver conflictos de mapeo si aparecen.
3. Ejecutar /diana.sync action="tasks" mode="apply" team="TEAM-01" feature="002-team-01-dashboard-brokers".
4. Al completar implementaciones en specs/002-team-01-dashboard-brokers/tasks.md, volver a ejecutar dry-run y apply para reflejar checkboxes cerrados en este backlog de TEAM-01.

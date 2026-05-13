# Especificacion de Funcionalidad: Dashboard de Brokers TEAM-01

**Feature Branch**: `002-team-01-dashboard-brokers`  
**Created**: 2026-05-12  
**Status**: Draft  
**Input**: Especificacion canonica en `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/teams/TEAM-01/spec.md`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Monitorear confluencia operativa (Priority: P1)

Como operador humano, necesito ver en un solo tablero la confluencia de senales por activo y broker para decidir con rapidez si una recomendacion requiere aprobacion, ajuste o descarte.

**Why this priority**: Es el flujo de mayor valor porque habilita la toma de decision diaria y concentra la visibilidad operacional del equipo.

**Independent Test**: Se valida de forma independiente cuando un operador puede abrir el tablero, revisar estado y evidencia de una recomendacion y emitir una decision humana trazable sin depender de otras historias.

**Acceptance Scenarios**:

1. **Given** que existen recomendaciones activas con evidencia, **When** el operador abre el tablero principal, **Then** visualiza confluencia de senales y estado operativo por broker en una vista consolidada.
2. **Given** que una recomendacion incluye riesgo y explicacion, **When** el operador selecciona el detalle, **Then** puede revisar la evidencia completa antes de decidir.

---

### User Story 2 - Aprobar o rechazar con control humano (Priority: P2)

Como aprobador, necesito aprobar o rechazar recomendaciones de forma explicita para mantener el modelo semi-automatico y evitar ejecuciones no autorizadas.

**Why this priority**: Garantiza cumplimiento constitucional del control humano explicito y reduce riesgo operativo.

**Independent Test**: Se valida cuando un aprobador completa una decision de aprobacion o rechazo y queda registro auditable con motivo y sello temporal.

**Acceptance Scenarios**:

1. **Given** una recomendacion pendiente de decision, **When** el aprobador la autoriza o rechaza, **Then** el estado cambia y queda registro trazable de la decision.
2. **Given** una recomendacion ya decidida, **When** otro usuario intenta volver a decidir sin permisos, **Then** el sistema bloquea la accion e informa la restriccion.

---

### User Story 3 - Auditar ciclo de vida de senal a intento de ejecucion (Priority: P3)

Como auditor operativo, necesito consultar el historial completo desde la senal hasta el intento de ejecucion para verificar cumplimiento, trazabilidad y consistencia.

**Why this priority**: Refuerza la auditabilidad de extremo a extremo y facilita revisiones internas o regulatorias.

**Independent Test**: Se valida cuando el auditor puede recuperar una recomendacion historica y confirmar cadena completa de eventos y responsables.

**Acceptance Scenarios**:

1. **Given** una operacion con historial registrado, **When** el auditor consulta su detalle historico, **Then** obtiene secuencia cronologica completa de senal, evidencia, decision e intento de ejecucion.

---

### Edge Cases

- Que ocurre cuando llega una recomendacion sin evidencia suficiente para justificar la accion propuesta.
- Como se comporta el tablero cuando hay inconsistencia temporal entre estado de broker y estado de decision humana.
- Que sucede si dos aprobadores intentan actuar sobre la misma recomendacion en la misma ventana operativa: se aplica optimistic lock por campo `version`; el segundo intento con version desfasada falla con error de concurrencia y no altera el estado terminal.
- Como se gestiona una recomendacion vencida que no recibio decision dentro del tiempo operativo esperado.
- Como se comporta el dashboard ante caida o latencia critica de broker: activar modo degradado visible, bloquear decisiones nuevas sobre senales afectadas, reintentar sincronizacion automaticamente y emitir alerta operativa.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE presentar un tablero principal del equipo con confluencia de senales por activo y broker.
- **FR-002**: El sistema DEBE mostrar para cada recomendacion su estado operativo, nivel de riesgo y evidencia asociada.
- **FR-003**: El sistema DEBE permitir que un aprobador autorizado emita una decision humana explicita de aprobacion o rechazo.
- **FR-004**: El sistema DEBE registrar toda decision humana con responsable, motivo y marca temporal.
- **FR-005**: El sistema DEBE mantener trazabilidad completa entre senal, evidencia, decision humana e intento de ejecucion.
- **FR-006**: El sistema DEBE bloquear cualquier intento de ejecucion que no cuente con decision humana valida.
- **FR-007**: El sistema DEBE exponer el estado operativo de integracion con brokers de forma desacoplada del flujo de visualizacion.
- **FR-008**: El sistema DEBE permitir consulta historica por recomendacion para auditoria operacional.
- **FR-009**: El sistema DEBE conservar versionado del contexto de recomendacion para poder reconstruir decisiones pasadas.
- **FR-010**: El sistema DEBE informar de forma clara cuando una accion no puede completarse por restricciones operativas o de permisos.
- **FR-011**: El sistema DEBE conservar evidencia operativa y de auditoria por al menos 365 dias para revisiones de cumplimiento.
- **FR-012**: El sistema DEBE mostrar de forma visible la naturaleza no asesora de las recomendaciones en puntos criticos de decision.
- **FR-013**: El control de acceso por rol (operador, aprobador, auditor) DEBE implementarse mediante Supabase RLS con JWT claims; ninguna logica de permisos custom se duplicara en el frontend ni en middleware separado.
- **FR-014**: El sistema DEBE aplicar control de concurrencia optimistic lock sobre `SenalConfluente` mediante campo `version`; cualquier decision con version no vigente DEBE rechazarse de forma atomica, registrar evento de auditoria y devolver mensaje explicito de conflicto.
- **FR-015**: El sistema DEBE emitir observabilidad estructurada por transicion con `trace_id` y `senal_id`, incluyendo metricas minimas `decision_latency_ms`, `decision_conflict_count` y `broker_sync_lag_ms`.
- **FR-016**: Ante degradacion de integracion con broker (caida, timeout o lag critico), el sistema DEBE entrar en modo degradado visible, bloquear temporalmente decisiones nuevas sobre senales afectadas, ejecutar reintentos automaticos y registrar/emitir alerta operativa.
- **FR-017**: El equipo DEBE implementar tests automatizados (unit e integration) para cada servicio backend critico, endpoint y componente React del tablero, con cobertura minima del 80% en rutas de decision, concurrencia y auditoria.
- **FR-018**: Todo codigo nuevo generado en esta feature (servicios, endpoints, componentes React, middlewares y modulos de observabilidad) DEBE incluir comentarios con prefijo `FIC:` en formato bilingue ingles/espanol, cubriendo modulos, hooks publicos, logica critica e integraciones con broker. La ausencia de este estandar bloquea el cierre de cualquier tarea.

### Key Entities *(include if feature involves data)*

- **SenalConfluente**: Representa una recomendacion consolidada con activo, prioridad operativa, nivel de riesgo y evidencia de soporte. Ciclo de vida: `pendiente` -> `en_revision` -> `aprobada` / `rechazada` -> `ejecutada` / `fallida`; transicion lateral a `vencida` desde `pendiente` o `en_revision` al expirar la ventana operativa. Solo un aprobador puede transicionar de `en_revision` a estado terminal (bloqueo de concurrencia).
- **DecisionHumana**: Representa la aprobacion o rechazo emitido por un responsable con motivo, fecha y estado de validez.
- **IntentoEjecucion**: Representa el intento operativo posterior a la decision humana, con resultado y contexto de broker.
- **EvidenciaOperacion**: Representa los datos de explicacion y respaldo usados para justificar una recomendacion y su decision.
- **EventoAuditoria**: Representa un registro cronologico inmutable de cada accion relevante del ciclo de vida.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 95% de los operadores completa la revision de una recomendacion prioritaria y emite decision en menos de 3 minutos.
- **SC-002**: El 100% de las recomendaciones decididas conserva trazabilidad verificable desde senal hasta intento de ejecucion.
- **SC-003**: Al menos el 90% de las revisiones de auditoria interna concluye sin hallazgos de informacion faltante en la cadena de eventos.
- **SC-004**: Las incidencias por decisiones no autorizadas se mantienen en 0 por periodo mensual.
- **SC-005**: El 100% de las transiciones de estado de recomendacion registra `trace_id` y `senal_id`, y el tablero operativo expone las metricas `decision_latency_ms`, `decision_conflict_count` y `broker_sync_lag_ms` con actualizacion maxima de 60 segundos.
- **SC-006**: El 100% de eventos de degradacion de broker muestra estado visible en menos de 30 segundos y bloquea decisiones nuevas en senales afectadas hasta recuperacion o timeout operacional definido.

## Assumptions

- TEAM-01 actua como equipo integrador del dominio operativo principal para este slice.
- Las recomendaciones operativas llegan con identificador unico y metadatos minimos de contexto.
- Existen roles definidos para operador, aprobador y auditor dentro del entorno del proyecto.
- La ejecucion automatica sin aprobacion humana permanece fuera de alcance por politica constitucional.
- El alcance de esta especificacion se limita al dashboard principal y su trazabilidad operativa, sin invadir responsabilidades de otros equipos.

## Cobertura de Knowledge Aplicado

- Investigado con knowledge local: gobernanza de ejecucion humana, compliance y retencion, ciclo de vida de orden, frescura de market data, contratos de broker IBKR/Alpaca y confluencia IA.
- Resuelto con metodologia estandar: detalles de metricas UX del tablero y definicion de prioridades de historias para TEAM-01.
- No se detectaron skills requeridas faltantes para la etapa speckit.specify.

## Recomendaciones de Knowledge

Los siguientes temas mejorarian el knowledge base con /diana.knowledge:
- /diana.knowledge topic="sdd-lifecycle-sdk" scope="sdk" - El indice SDK muestra estado esqueleto para metodologia SDD y puede mejorar la consistencia inter-proyecto.
- /diana.knowledge topic="speckit-integration-patterns-sdk" scope="sdk" - El patron generico de integracion Speckit en SDK aun aparece como esqueleto y limita estandarizacion transversal.

## Clarifications

### Session 2026-05-12

- Q: ¿Cómo se enforcea la distinción de roles (operador, aprobador, auditor) a nivel técnico? → A: Roles via Supabase RLS + JWT claims, sin tabla de permisos custom.
- Q: ¿Cuáles son los estados del ciclo de vida de SenalConfluente? → A: `pendiente` -> `en_revision` -> `aprobada` / `rechazada` -> `ejecutada` / `fallida`; estado `vencida` alcanzable desde `pendiente` o `en_revision` por expiración de ventana operativa.
- Q: ¿Cómo se resuelve la concurrencia si dos aprobadores deciden la misma señal al mismo tiempo? → A: Optimistic lock con campo `version` en `SenalConfluente`; el segundo intento con version desactualizada falla con conflicto y no sobrescribe la decision valida.
- Q: ¿Cuál es el baseline de observabilidad para operar y auditar el dashboard? → A: Metricas obligatorias (`decision_latency_ms`, `decision_conflict_count`, `broker_sync_lag_ms`), logs estructurados por evento y correlacion por `trace_id`/`senal_id` en cada transicion.
- Q: ¿Cuál es la politica ante caida o latencia critica de broker? → A: Modo degradado visible con bloqueo temporal de decisiones nuevas en senales afectadas, reintento automatico y alerta operativa.
# Diana Initiative Plan Template
## <nombre-de-la-iniciativa>

Identificador: <NNN-INV-PLAN>
Proyecto:
Iniciativa:
Version de generacion:
Accion: /diana.plan action="generate"

---

## Autoridad

Este plan tecnico canónico está subordinado a:
1. inv-constitution.md
2. 001-inv-spec.md
3. spec.md (operativa derivada, cuando aplique)

Ante conflicto, prevalece la constitución.

---

## Entradas Oficiales Consumidas

Fuentes canónicas:
- projects-knowledge-radar.yaml
- inv-constitution.md
- 001-inv-spec.md
- meta.md
- UCC y ticket vinculados

Fuentes operativas derivadas (si existen):
- specs/.../spec.md
- specs/.../plan.md previo

Skills y knowledge first:
- skills-manifest.yaml
- agent-skill-matrix.yaml
- sdd-engine-matrix.yaml
- master-indexes (general, proyecto y SDK)

---

## Objetivo del Plan

Definir el como técnico para implementar la iniciativa sin introducir requisitos nuevos fuera de la especificación canónica.

---

## Alcance y Exclusiones

Incluye:
- Arquitectura objetivo
- Fases técnicas
- Riesgos y mitigaciones
- Criterios de validación técnica

Excluye:
- Cambios funcionales no aprobados en especificación
- Decisiones fuera del scope constitucional

---

## Skills Requeridas para Etapa de Plan

- required_skills de speckit.plan (o etapa equivalente por engine)
- estado de cobertura por skill
- política de fallback si falta skill/knowledge

---

## Arquitectura Técnica Objetivo

### Vista de capas
- Capa de experiencia
- Capa de API y seguridad
- Capa de dominio
- Capa de integraciones
- Capa de datos y retención

### Controles técnicos obligatorios
- Seguridad
- Resiliencia
- Observabilidad
- Cumplimiento

---

## Fases Técnicas de Implementación

### Fase 1
- objetivo
- entregables
- trazabilidad a requisitos

### Fase 2
- objetivo
- entregables
- trazabilidad a requisitos

### Fase N
- objetivo
- entregables
- trazabilidad a requisitos

---

## Riesgos, Supuestos y Mitigaciones

- riesgo
- impacto
- probabilidad
- mitigación
- owner

---

## Criterios de Validación Técnica

- checklist de consistencia con constitución
- checklist de consistencia con especificación
- cobertura de seguridad/resiliencia/observabilidad/cumplimiento
- readiness para descomposición en tareas

---

## Integración con Speckit

- estado_readiness_para_speckit_plan:
- estado_readiness_para_speckit_tasks:
- recomendaciones:

---

## Estado

Este documento constituye el Plan Técnico Canónico de la iniciativa.

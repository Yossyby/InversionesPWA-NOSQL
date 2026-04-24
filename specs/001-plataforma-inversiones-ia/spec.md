# Feature Specification: Plataforma de Inversiones con IA (DR.FIC)

**Feature Branch**: `[001-plataforma-inversiones-ia]`  
**Created**: 2026-04-23  
**Status**: Draft  
**Input**: Canonical registration from `.drfic/diana-sdk/specs/001-spec-drfic.md`

## Canonical Registration

- **Tipo de SPEC:** FUNDACIONAL (SPEC-001)
- **Nivel:** Sistema / Vision
- **Fuente canonica:** `.drfic/diana-sdk/specs/001-spec-drfic.md`
- **Regla de registro:** Se alinea el encabezado al formato Speckit y se normaliza Markdown sin alterar contenido ni sentido.
- **Nota:** Se conserva la numeracion canonica original, incluyendo secciones omitidas en la fuente.

## Clarifications

### Session 2026-04-23

- Q: Cual sera el mecanismo de autenticacion oficial para v1, reemplazando el contexto transicional x-user-id? -> A: JWT firmado (Bearer) validado en backend.
- Q: Como se define el control humano obligatorio justo antes de enviar una orden al broker? -> A: Aprobacion manual obligatoria por cada orden (sin excepcion en v1).
- Q: Como debe manejar v1 una falla del broker durante la ejecucion asistida (por ejemplo timeout o rechazo tecnico)? -> A: Marcar orden como FALLIDA y exigir nueva aprobacion manual para reintentar.
- Q: Cual sera el objetivo minimo de disponibilidad operativa del backend en v1? -> A: 99.5% mensual.
- Q: Cual sera la politica minima de retencion de evidencia operativa y trazas de auditoria en v1? -> A: 365 dias.

---

# SPEC-001-TKT-HD-DRFIC-001 - PLATAFORMA DE INVERSIONES CON IA (DR.FIC)

Framework: Spec-Driven Development (GitHub Copilot Spec-Kit)  
Estado: Activa  
Autoridad: Subordinada estrictamente a constitution.md

- **Control de Cambios:** 001-ucc-drfic
- **Ticket de Usuario:** 001-tkt-drfic

---

## 0. AUTORIDAD CONSTITUCIONAL

Esta especificacion deriva directamente de la Constitucion del Proyecto y esta subordinada a ella como fuente de verdad primaria.

Reglas no negociables:
- Modelo semi-automatico obligatorio
- La IA no ejecuta operaciones
- Control humano explicito en toda ejecucion
- Arquitectura por cores desacoplados
- Senales explicables y trazables

Ante cualquier conflicto, prevalece constitution.md.

---

## 1. OBJETIVO GENERAL

Disenar, construir y operar una Plataforma Web Profesional de Inversiones asistida por Inteligencia Artificial, enfocada en acciones y opciones del mercado estadounidense, que:

- Genere senales BUY / SELL / HOLD de alta confianza
- Combine multiples fuentes de verdad especializadas (cores)
- Utilice IA unicamente como confirmador y evaluador de riesgo
- Integre brokers profesionales reales
- Mantenga control humano obligatorio sobre toda ejecucion

---

## 2. FILOSOFIA DEL SISTEMA

### 2.1 Modelo Semi-Automatico

- No existe auto-trading en la version 1.0
- La IA no ejecuta ni decide
- El usuario aprueba o rechaza manualmente cada orden, sin excepcion en v1
- La automatizacion se limita a analisis, correlacion y recomendacion

### 2.2 Arquitectura por Cores Desacoplados

El sistema se compone de cores independientes, activables por el usuario:

- Market Data
- Technical Indicators
- Technical Structure
- Institutional Flow
- News & Events
- Options Analysis
- Confluence Engine
- AI Advisor (confirmador)

Cada core representa una fuente de verdad explicable.

---

## 3. ALCANCE FUNCIONAL (VERSION 1.0)

### Incluye

- Senales en acciones y opciones US
- Dashboard profesional
- Integracion con IBKR y Alpaca
- Persistencia y trazabilidad
- Evidencia operativa por ticket

### Excluye

- Auto-trading
- IA como unica fuente
- Senales black-box
- Crypto

---

## 4. ARQUITECTURA GENERAL

- PWA (React + TypeScript)
- Backend REST API (Node.js + Express)
- Supabase como base principal
- MongoDB opcional para logs y senales historicas
- Integracion con IBKR y Alpaca
- AI Advisor (Claude API)

---

## 5. STACK TECNOLOGICO OBLIGATORIO

### PWA

- Vite
- React 18
- TypeScript
- Zustand
- TailwindCSS
- TradingView Lightweight Charts

### Backend

- Node.js
- Express
- Supabase
- MongoDB (opcional)
- Interactive Brokers API
- Alpaca Trading API
- Claude API

---

## 6. BACKEND REST API - RESPONSABILIDADES

- Conectividad con brokers
- Sincronizacion de portafolio
- Persistencia server-side
- Ingesta de market data
- Ejecucion asistida
- Bloqueo de envio a broker sin aprobacion humana explicita por orden
- Ante timeout o rechazo tecnico del broker, marcar la orden como FALLIDA y requerir nueva aprobacion manual para cualquier reintento
- Seguridad y observabilidad

---

## 7. AUTH CONTEXT (V1 OFICIAL)

Mecanismo oficial requerido:
- Authorization: Bearer <JWT firmado>

Reglas de validacion:
- 401 AUTH_CONTEXT_MISSING
- 401 AUTH_CONTEXT_INVALID_TOKEN
- 404 AUTH_CONTEXT_USER_NOT_FOUND
- 403 AUTH_CONTEXT_USER_INACTIVE

---

## 9. PERSISTENCIA DE DATOS

Fuentes:
- Supabase: usuarios, cuentas, posiciones, ordenes
- MongoDB (opcional): senales historicas, reasoning IA, logs

Reglas:
- Persistencia unicamente server-side
- Sincronizacion idempotente
- Evidencia tecnica obligatoria por ticket
- Retencion minima de evidencia operativa y trazas de auditoria: 365 dias

---

## 10. INTELIGENCIA ARTIFICIAL (AI ADVISOR)

Rol constitucional:
- Core adicional
- Confirmador de confluencia
- Evaluador de riesgo
- Nunca ejecutor
- Nunca fuente unica

Capacidades:
- Ajuste de score de confianza
- Explicacion de senales
- Identificacion de riesgos
- Justificacion de no-operacion

---

## 11. GOBIERNO DE AGENTES

Agentes oficiales:
- Picoro: arquitectura y especificacion
- Goku: implementacion
- Vegeta: optimizacion y seguridad
- Krilin: REST API y bases de datos
- Bulma: testing y validacion
- Dr.FIC: aprobacion humana

Orden obligatorio:
Picoro -> (Goku || Krilin) -> (Vegeta || Bulma) -> Dr.FIC

---

## 12. CRITERIOS DE ACEPTACION GLOBALES

- Respeto total a la Constitucion
- IA no ejecuta operaciones
- Senales explicables
- Brokers desacoplados
- Credenciales solo en .env
- Evidencia funcional por ticket
- Logs y trazabilidad activos
- Disponibilidad operativa del backend >= 99.5% mensual

---

## 14. DECLARACION FINAL

Este documento:
- Es un unico archivo Markdown
- Esta listo para ejecutarse con /speckit.specification
- Es constitucionalmente valido
- Es ejecutable por agentes IA
- Representa fielmente el estado actual del proyecto
# Contract: Auth Context

## Purpose

Define the v1 authentication contract between the web frontend and the backend API.

## Request Contract

- Protected requests must include `Authorization: Bearer <JWT>`.
- Identity is validated only by the backend.
- Client-provided identity headers are not authoritative in v1.

## Validation Outcomes

| Condition | Result |
|-----------|--------|
| Missing bearer token | `401 AUTH_CONTEXT_MISSING` |
| Invalid or expired token | `401 AUTH_CONTEXT_INVALID_TOKEN` |
| Unknown user | `404 AUTH_CONTEXT_USER_NOT_FOUND` |
| Inactive user | `403 AUTH_CONTEXT_USER_INACTIVE` |

## Invariants

- Approval and execution actions require an authenticated active user.
- Security-relevant auth events must be auditable.
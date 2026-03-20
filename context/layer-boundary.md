# LAYER BOUNDARY SPECIFICATION

---

# 1. SYSTEM CONTEXT

Internet
↓
Nginx
├── NextJS (UI Layer)
├── Spring Boot (Core Domain)

Spring Boot
↓
PostgreSQL (Source of Truth)
Redis (Cache Only)
Object Storage (MinIO/S3-compatible, blob only)

REST Path:
Client ⇄ Spring Boot (HTTP)

---

# 2. GLOBAL PRINCIPLES

1. Spring Boot = Single Source of Truth
2. Elysia = No Business Logic
3. NextJS = No Business Logic
4. Cross-module communication must go through Service layer only
5. Entity must NEVER leak outside backend

---

# 3. BACKEND BOUNDARY (SPRING BOOT)

Folder structure remains unchanged. (but can have more modules)

src/main/java/capstone/ms/api
├── common
└── modules
├── auth
├── email
├── google_maps
├── itinerary
├── typhoon
└── user

---

## 3.1 Internal Layer Flow (Per Module)

controller
↓
service
↓
repository
↓
entity

---

## 3.2 Allowed Dependency Rules

Controller:

- May call Service
- Must NOT call Repository
- Must NOT return Entity

Service:

- May call Repository (same module)
- May call Service (other module via interface only)
- Must NOT call Repository from other module

Repository:

- Only handles persistence
- No business logic

Entity:

- No dependency outward
- No REST annotations

---

## 3.3 Cross-Module Rules

ALLOWED:
userService → itineraryService (via interface)

FORBIDDEN:
userService → itineraryRepository
userService → itineraryEntity

If cross-module data needed:
→ expose method in Service layer
→ inject service only

---

## 3.4 DTO & Mapping Rules

- Controller returns DTO only
- MapStruct mapping happens in Service layer
- Entity must NEVER be serialized directly
- No bidirectional entity exposure

---

## 3.5 Transaction Rules

@Transactional allowed ONLY in Service layer.
Never in Controller.

---

## 3.6 Logging Rules

Allowed:

- Business events
- External API result
- Security events

Forbidden:

- Logging full entity graph
- Logging sensitive data
- Logging inside repository

---

# 4. REDIS RULES

Redis is currently used for:

- User search cache only

Redis must NOT:

- Store domain truth
- Handle pub/sub for now
- Be used for distributed coordination

# 5. FRONTEND BOUNDARY (NEXTJS)

Folder structure remains unchanged.

frontend/src
├── api
├── app
├── components
├── constants
├── lib
├── providers
├── store

---

## 5.1 State Rules

TanStack Query:

- Server state only
- API response storage
- Must use invalidation after mutation

Redux:

- UI state only
- Modal state
- Selected entity
- Local filters

Forbidden:

- Storing API response in Redux
- Manual cache mutation without invalidation

---

## 5.2 Component Rules

- Page must not contain business logic
- API calls must live in api/ or custom hook
- Component >300 LOC must be refactored
- Service-like logic inside component is forbidden

---

## 5.3 Media Rendering Boundary

For image/video retrieval:

- Backend returns metadata + signed URL
- Frontend controls progressive rendering behavior
- Do not route media bytes through Spring Boot by default

---

## 5.4 Global Components Rule

components/ should contain:

- Truly reusable UI components only

Feature-specific component:
→ must stay inside its feature folder

Do NOT add new global components unless reused 3+ times.

---

# 6. FILE SIZE LIMITS

Service: max 250 LOC
Controller: max 150 LOC
React Component: max 300 LOC
Hook: max 150 LOC

Exceeding limit requires refactor before merge.

---

# 7. ARCHITECTURE SUMMARY

REST:
NextJS → Spring Boot → PostgreSQL (+ Object Storage for blob files)

Spring Boot remains the only source of domain truth.

No microservices.
No distributed transaction.
No event-driven complexity.
No Redis pub/sub (for now).

---

# 8. TEAM AGREEMENT

This document is enforceable.
Any violation must be justified in PR discussion.
Repeated violation = architecture refactor required.

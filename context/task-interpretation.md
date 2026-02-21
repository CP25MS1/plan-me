# Task Interpretation Protocol

## Objective

Transform Acceptance Criteria (AC) into a complete technical implementation plan
before creating a development branch.

---

# Step 1: Feature Classification

- Feature Type:
  - [ ] Create
  - [ ] Update
  - [ ] Delete
  - [ ] Read
  - [ ] Validation Change
  - [ ] Refactor
  - [ ] Bug Fix

- Affected Module:

---

# Step 2: Domain Impact

- Affected Entity:
- New field required? (Y/N)
- Business rule added/changed?
- Cross-entity dependency?

If business rule exists:
→ Describe rule in 1 precise sentence.

---

# Step 3: Database Impact

- Schema change required?
- Migration file required?
- Data backfill required?
- New FK?
- New index? (Explain why)

Performance risk?

- Large dataset?
- Potential N+1?

---

# Step 4: API Contract Decision (MANDATORY)

## Endpoint

METHOD /path

## Request DTO

Fields:

- name: type (required/optional)

## Response DTO

Fields:

- id: type
- ...

## Error Scenarios

- Validation error
- Unauthorized
- Not found
- Conflict

---

# Step 5: Layer Responsibility Validation

Confirm:

- No business logic in Controller
- No DB access outside Repository
- BFF does not contain business rule
- Frontend does not implement business logic

If violated → redesign.

---

# Step 6: Frontend Impact

- New component?
- New page?
- Existing component modified?
- New state required?
- Loading state?
- Empty state?
- Error state?

---

# Step 7: Edge Case & Risk Analysis

- Null input
- Invalid input
- Unauthorized
- Duplicate data
- Concurrent update
- Timezone issue
- Date boundary issue

---

# Step 8: Manual Test Plan (Required since no unit test)

List exact test scenarios:

1.
2.
3.

---

# Definition of Ready

- API contract finalized
- DB decision finalized
- Edge cases listed

---

# Definition of Done

- AC fully implemented
- API matches contract
- Migration applied locally
- Manual test scenarios passed
- No unused code
- Follows project pattern guide

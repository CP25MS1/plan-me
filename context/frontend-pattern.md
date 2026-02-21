# FRONTEND IMPLEMENTATION PATTERN

This document defines HOW frontend code must be written.
Architecture constraints are in layer-boundary.md.

---

# 1. DATA OWNERSHIP RULE

TanStack Query:

- Server state only
- API data only
- Must use invalidation after mutation

Redux:

- UI state only
- Modal state
- Temporary selection
- Local filters

Forbidden:

- Store API response in Redux
- Duplicate server state

---

# 2. API PATTERN (src/api)

Each feature folder must contain:

api.ts → actual axios call
type.ts → request/response types
index.ts → exported hooks

Example:

export const getUser = (id: number) =>
client.get<UserResponse>(`/users/${id}`);

Custom hook:

export const useUser = (id: number) =>
useQuery({
queryKey: ["user", id],
queryFn: () => getUser(id)
});

Never call axios directly inside component.

---

# 3. MUTATION PATTERN

export const useCreateUser = () =>
useMutation({
mutationFn: createUser,
onSuccess: () => {
queryClient.invalidateQueries(["users"]);
}
});

Never manually mutate query cache without invalidation.

---

# 4. COMPONENT PATTERN

Page file:

- Layout + composition only
- No business logic

Split rule:

> 300 LOC → split into subcomponents

Bad:

- API call in useEffect directly
- Data transformation inside JSX

Good:

- Custom hook handles data
- Component receives clean props

---

# 5. CUSTOM HOOK PATTERN

Hook structure:

useFeatureName.ts

Responsibilities:

- Data fetching
- Derived state
- Mutation handling

Hook must:

- Not render JSX
- Not access DOM

---

# 6. GLOBAL COMPONENT RULE

src/components:

- Only reusable components
- Must be used in 3+ places

Feature-specific UI:

- Must stay inside feature folder

Reject PR if:

- Feature UI placed in global components

---

# 7. TYPESCRIPT ENFORCEMENT

Forbidden:

- any
- @ts-ignore
- Disabling eslint rule in file

If needed:

- Must justify in PR

All API response types must match backend DTO.

---

# 8. FILE SIZE RULE

Component: max 300 LOC
Hook: max 150 LOC
Redux slice: max 200 LOC

Exceeding requires refactor.

---

# 9. ERROR HANDLING PATTERN

All API calls must:

- Handle error state
- Display fallback UI

No silent failure.

---

# 10. FORM PATTERN

Form logic:

- Keep validation inside form layer
- Do not mix server mutation logic inside JSX

Use mutation hook.

---

# 11. VIBE-CODE PREVENTION RULE

Before merge:
Developer must state:

- Is this server state or UI state?
- Which hook owns the data?
- Which queryKey will be invalidated?

If cannot answer clearly → reject.

---

# 12. TECH DEBT PREVENTION

Forbidden:

- Disabling TypeScript during build
- Disabling ESLint
- Massive page.tsx containing everything

If legacy file is messy:

- Touch only related part
- Refactor incrementally

---

# 13. REVIEW CHECKLIST

Reject PR if:

- API call inside component body
- Duplicate server state
- any usage
- Global component misuse
- Component >300 LOC
- Business logic inside page.tsx

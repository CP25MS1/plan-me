# Flyway Migration Naming Convention

We use the following convention for naming Flyway migration files:

V\<version_number>**<description>.sql
R**<description>.sql

---

## Versioned Migrations

V\<version_number>\_\_<description>.sql

### Rules

- Start with `V` (stands for _Versioned_ migration).
- Follow with a number (e.g., `1`, `2`, `3` …) to indicate the migration order.
- Use double underscores `__` as a separator.
- Add a short, meaningful description in **snake_case** or **kebab-case**.
- File extension must be `.sql`.

### Examples

V1\_\_create_users_table.sql
V2\_\_add_email_column_to_users.sql
V3\_\_create_orders_table.sql

---

## Repeatable Migrations

R\_\_<description>.sql

### Rules

- Start with `R` (stands for _Repeatable_ migration).
- Use double underscores `__` as a separator.
- Add a short, meaningful description in **snake_case** or **kebab-case**.
- File extension must be `.sql`.
- These run every time the file changes (checksum differs).

### Examples

R\_\_refresh_materialized_views.sql
R\_\_update_reference_data.sql

---

## Notes

- Version numbers must increase sequentially (`V1`, `V2`, `V3`, ...).
- Keep descriptions short but clear.
- Avoid spaces; use `_` or `-`.
- Use **Versioned** migrations for schema changes.
- Use **Repeatable** migrations for data refreshes, views, functions, or procedures.

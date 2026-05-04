# authorization

Provides JWT-based request authorization for the expense management service.

## Overview

The module intercepts every incoming HTTP request via `JwtInterceptor`, decodes the Asgardeo JWT assertion from the `x-jwt-assertion` header (falling back to `Authorization: Bearer` for local development), and validates that the caller belongs to at least one of the configured authorized roles before allowing the request to proceed.

Role names are supplied through the configurable `authorizedRoles` record (set in `Config.toml`) and matched against the `groups` claim in the decoded JWT payload.

## Components

### Service class

| Name | Description |
|---|---|
| `JwtInterceptor` | `http:RequestInterceptor` that decodes the JWT, populates `user-info` in the request context, and returns `403 Forbidden` when the caller has no matching role. |

### Types

| Name | Description |
|---|---|
| `CustomJwtPayload` | Subset of the Asgardeo JWT payload — holds `email` and `groups`. |
| `AppRoles` | Configurable record that maps logical role names (`employeeRole`, `financeAdminRole`) to the actual Asgardeo group strings. |

### Functions

| Name | Description |
|---|---|
| `checkPermissions` | Returns `true` when the user's roles contain every role in the required list. Used by resource functions for fine-grained privilege checks after the interceptor has already validated coarse-grained access. |

### Constants

| Name | Value | Description |
|---|---|---|
| `JWT_ASSERTION_HEADER` | `"x-jwt-assertion"` | Header name carrying the encoded JWT from the Choreo gateway. |
| `HEADER_USER_INFO` | `"user-info"` | Request-context key under which the decoded `CustomJwtPayload` is stored. |
| `EMPLOYEE_ROLE_PRIVILEGE` | `987` | Numeric privilege code assigned to standard employees. |
| `FINANCE_ADMIN_PRIVILEGE` | `762` | Numeric privilege code assigned to finance administrators. |

## Configuration

```toml
[authorizedRoles]
employeeRole     = "Employee"
financeAdminRole = "FinanceAdmin"
```

## Authorization flow

```
Request
  └─► JwtInterceptor
        ├─ decode x-jwt-assertion (or Authorization: Bearer)
        ├─ cloneWithType → CustomJwtPayload
        ├─ check groups ∩ authorizedRoles → at least one match?
        │     yes → ctx.set("user-info", payload) → next()
        │     no  → 403 Forbidden
        └─ decode / clone errors → 500 Internal Server Error
```

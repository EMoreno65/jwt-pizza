# Security Assessment Report  
**Ethan Moreno / Trent Welling**

---

# Self Attacks (Ethan Moreno)

## Attack 1: Client-Side Price Manipulation
| Field | Details |
|------|--------|
| Date | April 10, 2026 |
| Target | pizza.ethanm.click |
| Classification | Client-Side Price Manipulation |
| Severity | 1 |
| Description | The price was sent in the client-side request and could be modified using Burp Suite before payment, allowing pizzas to be ordered for free. |
| Evidence | ![Price Change](./PriceChangeImage.png) |
| Mitigation | Implemented server-side validation to verify menu items instead of trusting client input. |

---

## Attack 2: JWT Exposure
| Field | Details |
|------|--------|
| Date | April 11, 2026 |
| Target | pizza.ethanm.click |
| Classification | Information Disclosure |
| Severity | 1 |
| Description | JWT token was exposed in the UI, creating potential for token misuse. |
| Evidence | N/A |
| Mitigation | Removed JWT from UI responses. |

---

## Attack 3: Duplicate Order Submission
| Field | Details |
|------|--------|
| Date | April 11, 2026 |
| Target | pizza.ethanm.click |
| Classification | Insecure Design |
| Severity | 1 |
| Description | The `/api/order` endpoint allowed duplicate requests, enabling rapid repeated order submissions. |
| Evidence | ![Order Duplicate](./IAttack1.png), ![Order Duplicate](./IAttack2.png) |
| Mitigation | Added a database check preventing duplicate orders within a 20-second window. |

---

## Attack 4: Auth Token Manipulation Attempt
| Field | Details |
|------|--------|
| Date | April 11, 2026 |
| Target | pizza.ethanm.click |
| Classification | Injection |
| Severity | 0 |
| Description | Attempted to manipulate authentication tokens in intercepted requests; attack failed. |
| Evidence | ![Auth Attack](./FailedAuthAttack.png) |
| Mitigation | No changes required. |

---

## Attack 5: Franchise ID Tampering
| Field | Details |
|------|--------|
| Date | April 11, 2026 |
| Target | pizza.ethanm.click |
| Classification | Insecure Design |
| Severity | 1 |
| Description | Modified franchise ID in requests, allowing redirection of payments to different franchises. |
| Evidence | ![Franchise ID Attack](./FranchiseIDAttack.png) |
| Mitigation | Added validation to ensure franchise IDs exist and match database records. |

---

## Attack 6: Default Credentials
| Field | Details |
|------|--------|
| Date | April 11, 2026 |
| Target | pizza.ethanm.click |
| Classification | Authentication Failures |
| Severity | 4 |
| Description | Default admin credentials were unchanged, allowing unauthorized access. |
| Evidence | ![Default credential POST returns 200](./images/default-credentials.png) |
| Mitigation | Updated default credentials. |

---

## Attack 7: SQL Injection (User Update)
| Field | Details |
|------|--------|
| Date | April 11, 2026 |
| Target | pizza.ethanm.click |
| Classification | Injection |
| Severity | 4 |
| Description | SQL injection successfully overwrote all emails in the database. |
| Evidence | ![Malicious injection](./images/malicious-injection.png), ![Unusable accounts](./images/unusable-account.png) |
| Mitigation | Sanitized inputs and parameterized queries in `/api/user/:userId`. |

---

## Attack 8: Stack Trace Exposure
| Field | Details |
|------|--------|
| Date | April 11, 2026 |
| Target | pizza.ethanm.click |
| Classification | Security Misconfiguration |
| Severity | 3 |
| Description | API responses exposed internal stack traces and file paths. |
| Evidence | ![User-facing stack trace](./images/user-facing-stack-trace.png) |
| Mitigation | Implemented sanitized error handling in production. |

---

## Attack 9: User Enumeration
| Field | Details |
|------|--------|
| Date | April 11, 2026 |
| Target | pizza.ethanm.click |
| Classification | Security Misconfiguration |
| Severity | 3 |
| Description | `/api/user` endpoint returned all users without proper role filtering. |
| Evidence | ![User enumeration](./images/user-enumeration-script.png) |
| Mitigation | Added admin authorization checks (403 for unauthorized users). |

---

## Attack 10: Pagination Injection
| Field | Details |
|------|--------|
| Date | April 11, 2026 |
| Target | pizza.ethanm.click |
| Classification | Injection |
| Severity | 3 |
| Description | Malformed pagination inputs caused SQL errors and exposed internal behavior. |
| Evidence | ![Malformed pagination](./images/malformed-pagination-script-results.png) |
| Mitigation | Sanitized and constrained `page` and `limit`, parameterized queries. |

---

# Attacks on Trent's Site

## Attack 11: Client-Side Price Manipulation
| Field | Details |
|------|--------|
| Date | April 12, 2026 |
| Target | pizza.trentwelling.site |
| Classification | Client-Side Price Manipulation |
| Severity | 1 |
| Description | Price could be modified in intercepted requests, allowing free orders. |
| Evidence | ![Price Change](./PriceChangeImage.png) |
| Mitigation | Implement server-side price validation using trusted menu data. |

---

## Attack 12: Login SQL Injection Attempt
| Field | Details |
|------|--------|
| Date | April 12, 2026 |
| Target | pizza.trentwelling.site |
| Classification | Injection |
| Severity | 0 |
| Description | SQL injection attempt failed due to use of parameterized queries. |
| Evidence | ![Failed Login Injection](./FailedLoginInjection.png) |
| Mitigation | No action needed. |

---

## Attack 13: Update User Injection Attempt
| Field | Details |
|------|--------|
| Date | April 12, 2026 |
| Target | pizza.trentwelling.site |
| Classification | Injection |
| Severity | 0 |
| Description | Injection attempt unsuccessful; parameters treated safely. |
| Evidence | N/A |
| Mitigation | Continue using parameterized queries. |

---

## Attack 14: Role Manipulation Attempt
| Field | Details |
|------|--------|
| Date | April 12, 2026 |
| Target | pizza.trentwelling.site |
| Classification | Insecure Design |
| Severity | 0.5 |
| Description | Attempted to change role to admin; system ignored change but gave no error feedback. |
| Evidence | ![Admin Attempt](./AdminPart1.png), ![Admin Attempt](./AdminPart2.png) |
| Mitigation | Return explicit error responses for invalid role modification attempts. |

---

## Attack 15: Unauthorized Endpoint Access Attempt
| Field | Details |
|------|--------|
| Date | April 12, 2026 |
| Target | pizza.trentwelling.site |
| Classification | Authentication Failures |
| Severity | 0 |
| Description | Attempt to access admin endpoint failed with proper 403 response. |
| Evidence | ![Forbidden](./ForbiddenUser.png) |
| Mitigation | No changes required. |

---

# Peer Attacks

## Attack 16: Default Credentials
| Field | Details |
|------|--------|
| Date | April 13, 2026 |
| Classification | Authentication Failures |
| Severity | 4 |
| Description | Admin credentials were unchanged, allowing unauthorized access. |
| Evidence | ![Logged into admin](./images/unchanged-admin.png) |

---

## Attack 17: Franchise Deletion Authorization Bypass
| Field | Details |
|------|--------|
| Date | April 13, 2026 |
| Classification | Security Misconfiguration |
| Severity | 3 |
| Description | `DELETE /api/franchise/:franchiseId` allowed deletion without proper role validation. |
| Evidence | ![Deletion](./images/successful-franchise-deletion.png), ![No franchises](./images/all-franchises-deleted.png) |

---

## Attack 18: User Data Exposure
| Field | Details |
|------|--------|
| Date | April 13, 2026 |
| Classification | Security Misconfiguration |
| Severity | 3 |
| Description | `/api/user` exposed all users, including sensitive data. |
| Evidence | ![Users enumerated](./images/user-enumeration.png) |

---

## Attack 19: Stack Trace Exposure
| Field | Details |
|------|--------|
| Date | April 13, 2026 |
| Classification | Security Misconfiguration |
| Severity | 3 |
| Description | API responses exposed internal stack traces. |
| Evidence | ![Stack trace](./images/stack-trace-exposed.png) |

---

## Attack 20: SQL Injection
| Field | Details |
|------|--------|
| Date | April 13, 2026 |
| Classification | Injection |
| Severity | 5 |
| Description | SQL injection allowed arbitrary queries and overwrote all emails. |
| Evidence | ![SQL injection](./images/SQL-injection.png), ![Deleted admin](./images/deleted-admin.png) |

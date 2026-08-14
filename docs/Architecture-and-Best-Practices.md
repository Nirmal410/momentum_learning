# 🏛️ Software Architecture, Maintainability & Best Practices Guide

This document establishes the official engineering guidelines, architectural standards, clean code practices, and maintainability protocols for the **Momentum Learning** project.

---

## 🎯 1. Architectural Philosophy & Layered Separation

The project enforces a strict **Layered Architecture** pattern in both the backend and frontend to ensure high cohesion, low coupling, testability, and long-term readability.

```
       ┌────────────────────────────────────────────────────────┐
       │                 PRESENTATION LAYER                     │
       │   - Controllers (@RestController)                      │
       │   - React Pages & Components                           │
       └───────────────────────────┬────────────────────────────┘
                                   │  DTOs / JSON Payloads
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │                   BUSINESS LAYER                       │
       │   - Service Interfaces & Implementations (@Service)   │
       │   - Business Validation & Analytics Logic              │
       └───────────────────────────┬────────────────────────────┘
                                   │  Entities / Domain Models
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │                 PERSISTENCE LAYER                      │
       │   - JPA Repositories (@Repository)                     │
       │   - Relational Database Schemas                        │
       └────────────────────────────────────────────────────────┘
```

### Key Rules of Segregation:
1. **Controllers must never execute business logic**: Controllers ONLY parse HTTP requests, invoke services, and wrap responses in `ApiResponse<T>`.
2. **DTO (Data Transfer Object) Isolation**: Database JPA entities MUST NOT be exposed directly to REST endpoints. Always convert entities to clean response DTOs using dedicated mappers or mapping helper functions.
3. **Service Layer Boundaries**: All transactional operations (`@Transactional`) and multi-entity orchestrations belong strictly inside service implementation classes (`com.nirmal.momentum.service.impl`).
4. **Interface-Driven Design**: Services expose interface contracts (e.g. `TopicService`), allowing implementations (`TopicServiceImpl`) to be modified, mocked, or swapped without breaking dependencies.

---

## ☕ 2. Java & Spring Boot Coding Best Practices

### 2.1 Dependency Injection
- **Avoid Field Injection (`@Autowired` on fields)**.
- **Use Constructor Injection**: Annotate Spring components with `@RequiredArgsConstructor` (Lombok) and declare dependencies as `private final`.

```java
// ✅ RECOMMENDED: Constructor injection via Lombok
@Service
@RequiredArgsConstructor
public class TopicServiceImpl implements TopicService {
    private final TopicRepository topicRepository;
    private final SecurityUtil securityUtil;
    // ...
}
```

---

### 2.2 Domain Entity Best Practices
- **Lombok Annotations**: Use `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`, and `@Builder`.
- **Relationship Fetch Types**: Always set relationships to `FetchType.LAZY` to prevent N+1 query performance degradations.
- **Cascading & Orphan Removal**: Use `CascadeType.ALL` and `orphanRemoval = true` on parent-child relationships (e.g., `Topic` -> `Subtopic`) so child entity lifecycles are automatically managed by the aggregate root.

---

### 2.3 Exception Handling Strategy
- Centralize all exception processing using a `@RestControllerAdvice` global handler.
- Map custom application exceptions (e.g., `ResourceNotFoundException`, `UnauthorizedAccessException`) to specific HTTP status codes.
- Do not catch exceptions silently or return dummy/empty responses without logging.

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldError().getDefaultMessage();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(errorMessage));
    }
}
```

---

### 2.4 Self-Documenting Code & Javadoc
- Write descriptive class, method, and variable names that reveal intent.
- Annotate non-trivial methods with clear Javadoc describing parameters, return values, and thrown exceptions.
- Keep methods short, concise, and focused on doing one thing well (Single Responsibility Principle).

---

## ⚛️ 3. React & Frontend Best Practices

### 3.1 Component Organization & Modularization
- Structure the application into clean, single-responsibility components:
  - `pages/`: Full views rendered by the router.
  - `components/`: Modular, reusable UI components (Buttons, Modals, Cards, Navbars).
  - `context/`: Global application state (e.g., `AuthContext`).
  - `api/`: Centralized HTTP Axios request functions.

---

### 3.2 Axios Interceptors & Auth Management
- Attach JWT bearer tokens dynamically via Axios request interceptors rather than manually adding authorization headers in individual components.
- Intercept HTTP `401 Unauthorized` responses to clear invalid tokens and cleanly redirect users to `/login`.

```javascript
// Example Axios Interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

---

### 3.3 State Management & Hooks Guidelines
- Keep component local state minimal. Use custom custom React hooks (`useAuth`, `useFetch`) to extract stateful side-effects and data loading logic.
- Always provide clear visual loading spinners and error state indicators in the UI to optimize User Experience (UX).

---

## 🔒 4. Security & Authentication Guidelines

1. **Password Hashing**: Passwords MUST be encrypted using `BCryptPasswordEncoder` prior to storage. Plaintext passwords MUST NEVER be logged or saved.
2. **Stateless JWT Authorization**: Requests are authenticated statelessly per HTTP call. The JWT filter (`JwtAuthenticationFilter`) validates the token and populates the `SecurityContextHolder`.
3. **Role Enforcement**: Protect sensitive endpoints using `@PreAuthorize("hasRole('ADMIN')")` or Spring Security's `.requestMatchers("/api/admin/**").hasRole("ADMIN")`.
4. **File Upload Security**: Validate file MIME types (`FileValidator`) and impose strict maximum file sizes (20MB limit) to prevent denial-of-service (DoS) or arbitrary file upload vulnerabilities.

---

## 🧪 5. Testing & Verification Strategy

Maintain high software quality with multi-layered automated testing:

1. **Backend Unit Tests**:
   - Use JUnit 5 and Mockito to test service layer logic (`@ExtendWith(MockitoExtension.class)`).
   - Mock repositories and external utilities to isolate business logic.
2. **Integration & API Tests**:
   - Use `@SpringBootTest` and `@AutoConfigureMockMvc` to verify REST endpoints, payload validation, and HTTP status codes.
3. **Frontend Component & UI Testing**:
   - Test React components with Vitest or React Testing Library.

---

## 📝 6. Maintenance & Version Control Conventions

- **Git Commit Messages**: Use clear, structured imperative commit messages (e.g., `feat: add subtopic document upload endpoint`, `fix: recalculate active streak logic`).
- **Code Reviews**: Verify that all PRs follow clean code guidelines, contain no dead code or unhandled exceptions, and pass test builds.

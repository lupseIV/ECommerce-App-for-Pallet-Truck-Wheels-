# E-Commerce PTW — Implementation Iterations

This document describes the three delivery iterations for the E-Commerce Pallet Truck Wheels application. Each iteration is fully vertical (backend + frontend) and maps directly to its own class diagrams and sequence diagrams.

---

## Summary

| Iteration | Theme                              | Status         |
|-----------|------------------------------------|----------------|
| 1         | Authentication & Product Catalog   | Implemented    |
| 2         | Shopping Cart, Checkout & Account  | Planned        |
| 3         | Admin Dashboard & Support          | Planned        |

---

## Iteration 1 — Authentication & Product Catalog

**Use Cases:** UC-2 (Login), UC-3 (Logout), UC-4 (Browse Products), UC-5 (Filter Products)

**Goal:** A working, secured product catalogue behind JWT authentication. Users can log in, browse and filter products, and log out.

### Backend classes (`cd1-backend.puml`)
| Layer      | Class                  | Role                                    |
|------------|------------------------|-----------------------------------------|
| Entity     | `User`                 | Registered user with role and lock info |
| Entity     | `Product`              | Abstract base for purchasable items     |
| Entity     | `Wheel`                | Concrete product — pallet wheel         |
| Entity     | `Bearing`              | Concrete product — bearing              |
| Entity     | `UserRole`             | Enum: ADMIN / DEFAULT                   |
| DTO        | `LoginRequest`         | Username + password payload             |
| DTO        | `LoginResponse`        | JWT token + role + username             |
| DTO        | `ProductDTO`           | Flattened product for API responses     |
| DTO        | `ProductFilterRequest` | Filter parameters from client           |
| Boundary   | `AuthController`       | POST /api/auth/login, logout            |
| Boundary   | `ProductController`    | GET /api/products (with filter params)  |
| Boundary   | `UserRepository`       | JPA access to users                     |
| Boundary   | `ProductRepository`    | JPA access to products (spec filtering) |
| Boundary   | `JwtTokenProvider`     | Generate / validate JWT tokens          |
| Boundary   | `JwtAuthFilter`        | Servlet filter — inject JWT into context|
| Boundary   | `SecurityConfig`       | Spring Security chain + CORS            |
| Control    | `AuthService`          | Authenticate, lock on repeated failures |
| Control    | `ProductService`       | Build specs, fetch & map products       |

### Frontend classes (`cd2-frontend.puml`)
| Layer    | Class                   | Role                                    |
|----------|-------------------------|-----------------------------------------|
| Entity   | `User`                  | Logged-in user (token + role + name)    |
| Entity   | `Product`               | Product model (supports Wheel/Bearing)  |
| Entity   | `ProductFilter`         | Filter form model                       |
| Entity   | `LoginRequest`          | Form → API payload                      |
| Entity   | `LoginResponse`         | API → local session                     |
| Boundary | `AuthGuard`             | Route guard — redirect if not logged in |
| Boundary | `JwtInterceptor`        | Attach Bearer token to every request    |
| Boundary | `LoginComponent`        | Login form + error display              |
| Boundary | `NavbarComponent`       | Topbar with logout action               |
| Boundary | `ProductListComponent`  | Data table with filter integration      |
| Boundary | `ProductFilterComponent`| Filter form, emits `filterChange` event |
| Boundary | `AppRoutes`             | /login, /products → auth-guarded        |
| Control  | `AuthService`           | Signals for login state + token storage |
| Control  | `ProductService`        | GET /api/products with filter params    |

### Sequence diagrams
- `SD-BrowsingToChekoutFlow.puml` — UC-4 & UC-5 section (browsing/filtering note)

---

## Iteration 2 — Shopping Cart, Checkout & Account Management

**Use Cases:** UC-6 (Add to Cart), UC-7 (View Cart), UC-8 (Modify Cart), UC-9 (Checkout), UC-10 (View Orders), UC-11 (Cancel Order), UC-12 (Payment), UC-13 (Update Profile)

**Goal:** Authenticated users can add products to a persistent cart, proceed through checkout with payment, view their order history, cancel orders, and update their profile data.

### Backend classes (`cd4-backend-iter2.puml`)
| Layer    | Class                  | Role                                             |
|----------|------------------------|--------------------------------------------------|
| Entity   | `Cart`                 | Per-user cart aggregate                          |
| Entity   | `CartItem`             | Single line in a cart                            |
| Entity   | `Order`                | Placed order with status lifecycle               |
| Entity   | `OrderItem`            | Snapshot of a product at purchase time           |
| Entity   | `OrderState`           | Enum: REGISTERED, CONFIRMED, ON_GOING, DELIVERED, CANCELED |
| DTO      | `CartItemRequest`      | Add-to-cart payload                              |
| DTO      | `CartDTO`              | Cart view (items + total)                        |
| DTO      | `CartItemDTO`          | Single cart line for the API response            |
| DTO      | `CheckoutRequest`      | Cart ID + payment details                        |
| DTO      | `PaymentDetails`       | Card number, expiry, CVV                         |
| DTO      | `PaymentResponse`      | Authorization flag + transaction ID              |
| DTO      | `OrderDTO`             | Full order view for order history                |
| DTO      | `OrderItemDTO`         | Single order line for the API response           |
| DTO      | `OrderConfirmationDTO` | Post-checkout confirmation                       |
| DTO      | `UserUpdateRequest`    | Email + billing address update payload           |
| DTO      | `UserDTO`              | User profile for API responses                   |
| Boundary | `CartController`       | POST/GET /api/cart, DELETE /api/cart/items/{id}  |
| Boundary | `OrderController`      | POST /api/orders/checkout, GET/PUT /api/orders/* |
| Boundary | `UserController`       | GET/PUT /api/users/profile                       |
| Boundary | `CartRepository`       | JPA access to cart and cart items                |
| Boundary | `OrderRepository`      | JPA access to orders and order items             |
| Boundary | `PaymentGateway`       | External payment processor                       |
| Control  | `CartService`          | Add, retrieve, remove cart items                 |
| Control  | `OrderService`         | Checkout (pay + create order + clear cart)       |
| Control  | `AccountService`       | Fetch and update user profile                    |

### Frontend classes (`cd5-frontend-iter2.puml`)
| Layer    | Class                   | Role                                          |
|----------|-------------------------|-----------------------------------------------|
| Entity   | `Cart`                  | Cart state (items + total)                    |
| Entity   | `CartItem`              | Cart line model                               |
| Entity   | `Order`                 | Order with status and items                   |
| Entity   | `OrderItem`             | Order line model                              |
| Entity   | `OrderState`            | Enum mirroring backend OrderState             |
| Entity   | `PaymentDetails`        | Payment form model                            |
| Entity   | `CheckoutRequest`       | Checkout API payload                          |
| Entity   | `OrderConfirmation`     | Post-checkout response model                  |
| Entity   | `UserUpdateRequest`     | Profile update payload                        |
| Entity   | `UserDTO`               | Profile API response                          |
| Boundary | `CartComponent`         | Cart view, remove items, navigate to checkout |
| Boundary | `CheckoutComponent`     | Payment form + order submission               |
| Boundary | `OrderHistoryComponent` | List ongoing/finished orders, cancel action   |
| Boundary | `ProfileComponent`      | View & update profile form                    |
| Boundary | `AppRoutes`             | Adds /cart, /checkout, /orders, /profile      |
| Control  | `CartService`           | GET/POST/DELETE /api/cart/*                   |
| Control  | `OrderService`          | POST /api/orders/checkout, GET/PUT orders     |
| Control  | `AccountService`        | GET/PUT /api/users/profile                    |

### Sequence diagrams
- `SD-BrowsingToChekoutFlow.puml` — UC-6 through UC-12
- `SD-AccountManagement&SupportFlow.puml` — UC-10, UC-11, UC-13

---

## Iteration 3 — Admin Dashboard & Help Desk Support

**Use Cases:** UC-1 (Import Products), UC-14 (Contact Help Desk), UC-15 (Review & Modify Orders), UC-16 (Review Stock Levels)

**Goal:** Admin users gain a dashboard for inventory management (view stock, import products via CSV/JSON, manage all orders). Any user can contact the help desk via a contact form that triggers an email to the admin queue.

### Backend classes (`cd6-backend-iter3.puml`)
| Layer    | Class               | Role                                                |
|----------|---------------------|-----------------------------------------------------|
| DTO      | `HelpDeskRequest`   | Contact form payload (name, email, message)         |
| DTO      | `InventoryReportDTO`| Aggregated stock report with low-stock warnings     |
| DTO      | `ProductStockDTO`   | Per-product stock view with low-stock flag          |
| DTO      | `ImportResultDTO`   | CSV/JSON import outcome (success count + errors)    |
| Boundary | `AdminController`   | GET /api/admin/inventory, POST /api/admin/products/import, GET/PUT /api/admin/orders/* |
| Boundary | `SupportController` | POST /api/support/contact                           |
| Boundary | `EmailService`      | Sends emails via SMTP / third-party mail provider   |
| Control  | `AdminLogicService` | Stock calculation, file import, order management    |
| Control  | `SupportService`    | Validates request and delegates to EmailService     |

### Frontend classes (`cd7-frontend-iter3.puml`)
| Layer    | Class              | Role                                             |
|----------|--------------------|--------------------------------------------------|
| Entity   | `InventoryReport`  | Stock data + low-stock warnings                  |
| Entity   | `ProductStock`     | Per-product stock entry                          |
| Entity   | `ImportResult`     | Import outcome (successes + errors)              |
| Entity   | `HelpDeskRequest`  | Contact form model                               |
| Boundary | `AdminDashboard`   | Tabbed admin view: Inventory / Import / Orders   |
| Boundary | `ContactComponent` | Public contact form with submission feedback     |
| Boundary | `AppRoutes`        | Adds /admin (admin-guarded), /contact (public)   |
| Control  | `AdminService`     | All /api/admin/* calls                           |
| Control  | `SupportService`   | POST /api/support/contact                        |

### Sequence diagrams
- `SD-Inventory&OrderManagementFlow.puml` — UC-1, UC-15, UC-16
- `SD-AccountManagement&SupportFlow.puml` — UC-14

---

## Cross-iteration class diagram overview

| Diagram                   | Scope                                           |
|---------------------------|-------------------------------------------------|
| `cd1-backend.puml`        | Iteration 1 — Backend (auth + products)         |
| `cd2-frontend.puml`       | Iteration 1 — Frontend (login + product list)   |
| `cd3-overview.puml`       | Iteration 1 — Full-stack overview (BCE)         |
| `cd4-backend-iter2.puml`  | Iteration 2 — Backend (cart + orders + account) |
| `cd5-frontend-iter2.puml` | Iteration 2 — Frontend (cart + checkout + profile) |
| `cd6-backend-iter3.puml`  | Iteration 3 — Backend (admin + support)         |
| `cd7-frontend-iter3.puml` | Iteration 3 — Frontend (admin dashboard + contact) |

---

## Sequence diagram ↔ class diagram traceability

| Sequence Diagram                             | Classes from Iter 1 | Classes from Iter 2 | Classes from Iter 3 |
|----------------------------------------------|---------------------|---------------------|---------------------|
| `SD-BrowsingToChekoutFlow.puml`              | `ProductListComponent`, `ProductController`, `ProductService`, `ProductRepository` | `CartComponent`, `CheckoutComponent`, `CartService` (FE+BE), `OrderService` (FE+BE), `CartController`, `OrderController`, `CartRepository`, `OrderRepository`, `PaymentGateway` | — |
| `SD-AccountManagement&SupportFlow.puml`      | `UserRepository` | `OrderHistoryComponent`, `ProfileComponent`, `OrderService` (FE+BE), `AccountService` (FE+BE), `OrderController`, `UserController`, `OrderRepository` | `ContactComponent`, `SupportService` (FE+BE), `SupportController`, `EmailService` |
| `SD-Inventory&OrderManagementFlow.puml`      | `ProductRepository` | `OrderRepository` | `AdminDashboard`, `AdminService`, `AdminController`, `AdminLogicService` |

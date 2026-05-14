# E-Commerce PTW - Documentation Index

## Project Documentation

- [Specification](./specification.md) - Functional specifications and project requirements
- [Feature Flow Diagram](./flow_diagram.svg) - Visual representation of feature interactions and user flow
- [UML model](./model.svg) - UML class diagram illustrating the main entities and their relationships
- [Non-Functional Requirements](./nfr.md) - Performance, security, and other non-functional requirements
- [Use cases](./use-case.md) - Detailed use cases for each feature
- [Iterations](../ITERATIONS.md) - Iteration breakdown, class–sequence traceability, and implementation status
- [Stitch Design](https://stitch.withgoogle.com/projects/11596752008884500939) - UI/UX design mockups and prototypes
- [API Documentation]() - REST API endpoints and data models (to be added)
- [Database Schema]() - ER diagrams and database design (to be added)
- [Testing Strategy]() - Unit, integration, and end-to-end testing plans (to be added)

## Class Diagrams

### Iteration 1 — Authentication & Product Catalog
- [CD-1: Backend](./cd1-backend.puml) - Spring Boot: Auth, Product, JWT security
- [CD-2: Frontend](./cd2-frontend.puml) - Angular: Login, Product list & filter
- [CD-3: Full-stack Overview](./cd3-overview.puml) - BCE-style end-to-end view

### Iteration 2 — Shopping Cart, Checkout & Account Management
- [CD-4: Backend](./cd4-backend-iter2.puml) - Spring Boot: Cart, Order, Account, Payment
- [CD-5: Frontend](./cd5-frontend-iter2.puml) - Angular: Cart, Checkout, Order history, Profile

### Iteration 3 — Admin Dashboard & Help Desk Support
- [CD-6: Backend](./cd6-backend-iter3.puml) - Spring Boot: Admin, Support, Email
- [CD-7: Frontend](./cd7-frontend-iter3.puml) - Angular: Admin dashboard, Contact form

## Sequence Diagrams

- [Browsing to Checkout Flow](./sequence-diagrams/SD-BrowsingToChekoutFlow.puml) - UC-4 through UC-12 (Iterations 1 & 2)
- [Account Management & Support Flow](./sequence-diagrams/SD-AccountManagement&SupportFlow.puml) - UC-10, UC-11, UC-13, UC-14 (Iterations 2 & 3)
- [Inventory & Order Management Flow](./sequence-diagrams/SD-Inventory&OrderManagementFlow.puml) - UC-1, UC-15, UC-16 (Iteration 3)

## About E-Commerce PTW

E-Commerce PTW (E-Commerce Pallet Truck Wheels) has a pretty self-explanatory name :)

For contribution guidelines and setup instructions, see the [main README](../README.md).


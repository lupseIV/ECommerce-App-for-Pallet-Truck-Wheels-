# E-Commerce Web App - Project Specification

## Overview

An e-commerce web app designed for pallet truck wheels selling and comapny management allowing for basic e-commerce app functions : catalog browsing, cart adding and removing, role based authentication including specific role based functionalities. The focus will be directed towards creating a secure and functional e-commerce app.

## Scope

Understanding web app logic including security risks involved in creating a web app that handles sensitive information, role based authentication and management of real-time data

## Features

For a visual representation of how features interact and the user flow, see the [Feature Flow Diagram](./flow_diagram.svg).

### F1. Product browsing

- **View all available products** : Users can see a table like view with all available products
- **Search Product by Name/Characteristic** : Users can search products based on the name and/or specific product characteristic
- **Product filtering** : Users can filter products based on:
    - Maximum load
    - Material
    - Bearing Diameter
    - Bearing Material
    - Size

### F2. Help desk for custom solutions

- **Email based** : Users will have an option for contacting the company for custom wheels 

### F3. Role Based Authentication

- **Login** : Users authenticate with their credentials to access the system designated to their role
- **Logout**: Users can securely log out of their session

#### Roles

1. USER

    - **Order placement** : Users can place orders based on what cart items they included
    - **Order cancellation** : Users can cancel orders
    - **Order Visualization** : Users can see an overview of all their previous finished and current on going orders
    - **Personal profile data** : Users can update personal data

2. ADMIN

    - **Adding products** : Admins can manually add products or can import a product list
    - **Stock Review** : Admins can view current stock levels
    - **Order Review** : Admins can view all orders and modify orders accordingly 

### F4. Payment Processing

- **In App Card Payment** : Users ,once they finalized their order, have the option for in app payment

### Optional Features

- **Track orders** : Users can see real-time status of their orders
- **Recurring Orders** : Users can set orders to be recurring
- **Monitor stock levels** : Admins ca asses stock levels and generate supply orders

## Non-Functional Requirements

- **Usability**: Simple and intuitive interface for users
- **Data Integrity**: Proper validation of imported data
- **Availability Tracking**: Accurate real-time tracking of stock for products
- **Date Management**: Reliable tracking of orders
- **Testing**: Unit tests must be created to validate core functionality and business logic
- **Optional Enhancements**:
  - Run tests in a CI/CD pipeline for automated validation
  - Containerization using Docker/Docker Compose for simplified deployment and development environment setup

  ## Technical Constraints

- Simple architecture suitable for a university project
- Focus on core functionality: authentication, browsing, filtering, order management and payment processing
- Clear business rules enforcement between roles
- **UML Modeling**: A [UML (Unified Modeling Language)](https://www.omg.org/spec/UML/) model must be created before implementation
  - The model must be created using a tool that has a [UML metamodel](https://www.omg.org/spec/UML/2.5.1/About-UML/) behind it
  - The model should include class diagrams, sequence diagrams, and other relevant UML diagrams
- **ORM Usage**: Implementation must use an Object-Relational Mapping (ORM) framework for database interactions
- **Layered Architecture**: Application must be structured with separate layers:
  - Presentation layer (UI/interface)
  - Business layer (business logic and rules)
  - Data layer (database access and persistence)
- **OOP Language**: Implementation must use an Object-Oriented Programming language

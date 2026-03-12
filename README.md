# ECommerce App for Pallet Truck Wheels

## Documentation

All functional specifications and technical documentation can be found in [docs](./docs/index.md).

## Development Environment Setup

**Prerequisites**
- [ ] Install [Java JDK 25+](https://www.oracle.com/java/technologies/downloads/) 
- [ ] Install [Node.js and npm](https://nodejs.org/)
- [ ] Install Angular CLI globally: `npm install -g @angular/cli`
- [ ] Install and run your database (e.g., PostgreSQL, MySQL, or Docker) / docker container (to be decided)

**Backend Setup (Spring Boot)**
- [ ] Clone the repository: `git clone <repo-url>`
- [ ] Open the project in your IDE (IntelliJ / Eclipse)
- [ ] Update database credentials in `src/main/resources/application.properties` (or `.yml`)
- [ ] Sync Gradle to download dependencies
- [ ] Run the Spring Boot application (Server starts on `localhost:8080`)

**Frontend Setup (Angular)**
- [ ] Open a terminal and navigate to the frontend folder: `cd frontend`
- [ ] Install frontend dependencies: `npm install`
- [ ] Start the Angular development server: `ng serve`
- [ ] Open your browser and navigate to `http://localhost:4200`

## Contribution Guidelines

- **Pull Requests**: All contributions must be made via pull requests
- **Commit Format**: Follow [Conventional Commits](https://www.conventionalcommits.org/) specification
- **Signed Commits**: All commits must be signed with GPG/SSH keys
- **Pre-commit Hooks**: Run pre-commit hooks before submitting (`pre-commit run --all-files`)
- **Squash Commits**: Squash all commits into a single commit before merging
- **Stay Updated**: Keep your branch up to date with the main branch
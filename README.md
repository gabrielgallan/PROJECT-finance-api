# Description

Backend API for financial management, designed with a strong focus on scalability, maintainability, and security. Built following **SOLID** principles, **Clean Architecture**, and **Domain-Driven Design (DDD)** to ensure clear separation of concerns, and a robust domain model.

# Domain

### Finances

Responsible for the core financial logic of the system.
This subdomain handles transactions, balances, categories, financial summaries, analytics, and all business rules related to money flow.

### Identity

Responsible for user identity and access control.

This subdomain manages users, accounts, authentication, and credential handling.  
It defines how users authenticate within the system, supports authentication with external providers, and handles profile management.

# Infrastructure

### Stacks

- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" width="25"/> Node
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-plain.svg" width="25"/> TypeScript
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/prisma/prisma-original.svg" width="25"/> Prisma
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nestjs/nestjs-original.svg" width="25"/> Nest.js
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitest/vitest-original.svg" width="25"/> Vitest
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/swagger/swagger-original.svg" width="25"/> Swagger

### Integrations

- Resend (email services)
- Cloudinary (storage services)
- Github OAuth (github auth provider)

### Security

The application implements security best practices to protect financial data and ensure controlled access.

Authentication is based on **JWT (JSON Web Tokens)**, enabling stateless and secure user sessions.  
Additionally, a global **API rate limiting** mechanism is configured to prevent abuse, brute-force attempts, and excessive requests.  

# Running tests

The project uses Vitest to write and execute unit and E2E tests.

To run units:
```bash
pnpm test:unit
```

To run E2E:
```bash
pnpm test:e2e
```

# Running locally
1. Clone the repository
```bash
git clone 
```

2. Install dependencies
```bash
pnpm i
```

3. Create and configure .env based on .env.example
4. Run prisma migrations
```bash
pnpm prisma migrate dev --name <name>
```

5. Start server
```bash
pnpm start:dev
```

# Documentations

The API is currently documented with Swagger, and can be accessed by the route `/docs`
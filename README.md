# Event Ticket Booking System

## Overview

This is an Event Ticket Booking System built with Node.js, Express, and TypeScript. The application enables you to:

- Initialize events with a specific number of tickets.
- Book tickets concurrently while handling race conditions.
- Manage waiting lists when tickets are sold out.
- Cancel bookings and automatically reassign tickets to waiting list users.
- View current event status (available tickets and waiting list count).

In addition, the application implements bonus features:

- **Rate Limiting:** Limits the number of API requests per IP using `express-rate-limit`.
- **Basic Authentication:** Protects sensitive endpoints using a simple basic-auth middleware.
- **Logging:** Uses Winston to track operations.

## Design Choices

- **Controller-Service-Repository Pattern:**  
  The application is organized into controllers (handling HTTP requests), services (containing business logic and database transaction handling), and repositories (managed by TypeORM). This separation improves maintainability, testability, and scalability.

- **TypeORM & PostgreSQL:**  
  TypeORM is used for data persistence, schema migrations, and leveraging features like transactions and pessimistic locking. These ensure that concurrent operations (e.g., booking tickets) are processed safely and without race conditions.

- **Dependency Injection:**  
  TypeDI is used to manage dependencies across controllers and services. This decoupling makes the code more modular and easier to test.

- **Test-Driven Development (TDD):**  
  The project includes both unit tests and integration tests using Jest. This approach helps ensure high test coverage and reliability.

- **Bonus Features:**
  - **Rate Limiting:** Prevents abuse by limiting the number of requests per IP.
  - **Basic Authentication:** Secures sensitive endpoints.
  - **Logging:** Provides detailed logs for monitoring and debugging.

## Prerequisites

- **Node.js** (v14 or above)
- **npm** (v6 or above)
- **PostgreSQL** (Ensure you have a PostgreSQL database set up)

## Setup and Installation

1. **Clone the Repository:**

   ```bash
   git clone <repository-url>
   cd event-ticket-booking-system
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Run Database Migrations:**
   ```bash
   npm run migrate-up
   ```

## Running the Application

1. **Development Mode:**

   ```bash
   npm run start:dev
   ```

2. **Production Build:**

   ```bash
   npm run build
   ```

   ```bash
   npm start
   ```

## Testing

1. **Run All Tests:**

   ```bash
   npm run test
   ```

2. **Run Only Unit Tests:**

   ```bash
   npm run test:unit
   ```

3. **Run Only Integration Tests:**

   ```bash
   npm run test:integration
   ```

4. **Generate Test Coverage Report:**
   ```bash
   npm run test:coverage
   ```

## API Documentation
    https://documenter.getpostman.com/view/25115132/2sAYX8J1KD
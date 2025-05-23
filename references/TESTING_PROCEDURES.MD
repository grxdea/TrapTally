# TrapTally Testing Procedures

This document outlines the setup, procedures, and best practices for automated testing in the TrapTally project. Effective testing is crucial for ensuring code quality, stability, and maintainability.

## General Testing Principles

- **Test What Matters:** Focus tests on critical functionality, business logic, and potential failure points.
- **AAA Pattern (Arrange, Act, Assert):**
    - **Arrange:** Set up the necessary preconditions and inputs.
    - **Act:** Execute the code or function being tested.
    - **Assert:** Verify that the outcome matches the expected result.
- **Independent Tests:** Each test should be independent and not rely on the state or outcome of other tests.
- **Fast Tests:** Tests should run quickly to provide rapid feedback.
- **Readable Tests:** Write tests that are easy to understand, clearly stating what is being tested and what the expected outcome is.

## Backend (NestJS & Jest)

The backend uses Jest for unit, integration, and end-to-end (E2E) testing.

### Setup
- Jest is configured in `backend/package.json` and `backend/test/jest-e2e.json`.
- Test files are typically co-located with the source files (for unit tests) or in a dedicated `test/` directory (for E2E tests).

### Running Tests
Navigate to the `backend/` directory to run these commands:

- **Run all unit tests:**
  ```bash
  npm run test
  ```
  This command typically looks for `*.spec.ts` files.

- **Run all E2E tests:**
  ```bash
  npm run test:e2e
  ```
  This command uses the configuration in `backend/test/jest-e2e.json` and looks for `*.e2e-spec.ts` files.

- **Run tests in watch mode (reruns on file changes):**
  - For unit tests: `npm run test:watch`

- **Generate test coverage report:**
  ```bash
  npm run test:cov
  ```
  Coverage reports are usually output to a `coverage/` directory in `backend/`.

### Writing Tests

- **Unit Tests (`.spec.ts`):
  - Focus on testing individual units of code (e.g., services, helper functions) in isolation.
  - Mock dependencies to ensure isolation and predictability.
  - Example structure for a service unit test:
    ```typescript
    // src/my-feature/my-feature.service.spec.ts
    import { Test, TestingModule } from '@nestjs/testing';
    import { MyFeatureService } from './my-feature.service';

    describe('MyFeatureService', () => {
      let service: MyFeatureService;

      beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          providers: [MyFeatureService],
        }).compile();

        service = module.get<MyFeatureService>(MyFeatureService);
      });

      it('should be defined', () => {
        expect(service).toBeDefined();
      });

      it('should perform an action correctly', () => {
        // Arrange
        const input = 'test';
        const expectedOutput = 'TEST';

        // Act
        const result = service.processInput(input);

        // Assert
        expect(result).toEqual(expectedOutput);
      });
    });
    ```

- **E2E Tests (`.e2e-spec.ts`):
  - Test the application's behavior through its external API endpoints.
  - Typically involve making HTTP requests to the running application (or a test instance) and asserting the responses.
  - NestJS provides utilities like `supertest` for E2E testing.
  - Example structure for an E2E test:
    ```typescript
    // test/app.e2e-spec.ts or test/my-feature.e2e-spec.ts
    import { Test, TestingModule } from '@nestjs/testing';
    import { INestApplication } from '@nestjs/common';
    import * as request from 'supertest';
    import { AppModule } from './../src/app.module'; // Adjust path as needed

    describe('AppController (e2e)', () => {
      let app: INestApplication;

      beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
      });

      it('/ (GET)', () => {
        return request(app.getHttpServer())
          .get('/')
          .expect(200)
          .expect('Hello World!'); // Or your actual root response
      });

      afterAll(async () => {
        await app.close();
      });
    });
    ```

### Mocking Dependencies
- Use Jest's mocking capabilities (`jest.fn()`, `jest.spyOn()`, `jest.mock()`) to mock modules and functions.
- For NestJS providers, you can override them during module setup for testing.

## Frontend (React, Vite)

### Current Status
- As of the creation of this document, the `frontend/package.json` does not have a dedicated test runner (like Jest, Vitest, or React Testing Library) explicitly configured in its scripts.

### Recommendations & Setup
- **Vitest:** Given that the frontend uses Vite, Vitest is a natural choice as it's designed to work seamlessly with Vite projects and offers a Jest-compatible API.
- **React Testing Library:** Regardless of the test runner, use React Testing Library (`@testing-library/react`) for writing tests that interact with components in a way similar to how users do.

#### Setting up Vitest with React Testing Library (Example):
1.  **Install dependencies:**
    ```bash
    cd frontend
    npm install --save-dev vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
    ```
2.  **Configure Vite (`vite.config.ts` or `vite.config.js`):
    ```typescript
    // vite.config.ts
    /// <reference types="vitest" />
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react-swc';

    export default defineConfig({
      plugins: [react()],
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts', // Optional setup file
        css: true, // If you need to process CSS
      },
    });
    ```
3.  **(Optional) Create `src/setupTests.ts`:**
    ```typescript
    // src/setupTests.ts
    import '@testing-library/jest-dom';
    ```
4.  **Add test scripts to `frontend/package.json`:**
    ```json
    "scripts": {
      // ... other scripts
      "test": "vitest",
      "test:ui": "vitest --ui",
      "coverage": "vitest run --coverage"
    },
    ```

### Writing Frontend Tests
- **Component Tests:** Test individual React components.
  - Verify rendering based on props.
  - Test user interactions (clicks, input changes) using `@testing-library/user-event`.
  - Assert changes in the DOM.
- **Hook Tests:** If you have custom hooks, test their logic in isolation.
- **File Naming:** Typically `MyComponent.test.tsx` or `MyComponent.spec.tsx`.

- Example component test with Vitest & React Testing Library:
  ```tsx
  // src/components/MyButton/MyButton.test.tsx
  import { render, screen, fireEvent } from '@testing-library/react';
  import MyButton from './MyButton';
  import { describe, it, expect, vi } from 'vitest';

  describe('MyButton', () => {
    it('renders with correct text', () => {
      render(<MyButton>Click Me</MyButton>);
      expect(screen.getByRole('button', { name: /Click Me/i })).toBeInTheDocument();
    });

    it('calls onClick prop when clicked', () => {
      const handleClick = vi.fn();
      render(<MyButton onClick={handleClick}>Click Me</MyButton>);
      fireEvent.click(screen.getByRole('button', { name: /Click Me/i }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
  ```

---
*This document is a living document and may be updated as the project evolves and testing capabilities are enhanced, especially for the frontend.*

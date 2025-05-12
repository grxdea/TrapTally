# TrapTally Coding Guidelines

This document outlines the coding standards and best practices to be followed when working on the TrapTally project. Adhering to these guidelines will help maintain code quality, consistency, and readability across the codebase.

## General Principles

- **Readability:** Write code that is easy to understand. Use clear variable and function names. Add comments where necessary to explain complex logic.
- **Simplicity (KISS - Keep It Simple, Stupid):** Prefer simple solutions over complex ones. Avoid premature optimization.
- **DRY (Don't Repeat Yourself):** Avoid duplicating code. Use functions, components, and modules to reuse logic.
- **Consistency:** Follow the established patterns and styles within the project.

## Frontend (React, TypeScript, Vite)

The frontend is built with React, TypeScript, and Vite.

### Linting
- **ESLint:** The project is configured with ESLint. Run `npm run lint` in the `frontend/` directory to check for linting errors.
- Ensure your code adheres to the ESLint rules defined in the project (typically in `.eslintrc.js`, `.eslintrc.json`, or `package.json`).

### Formatting
- **Prettier (Recommended):** While not explicitly configured in `frontend/package.json` scripts, using Prettier is highly recommended for consistent code formatting.
  - To add Prettier:
    ```bash
    cd frontend
    npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
    # Create/update .prettierrc.json with your preferred settings (see example below)
    # Update ESLint config to integrate with Prettier
    ```
  - Example `.prettierrc.json`:
    ```json
    {
      "semi": true,
      "trailingComma": "es5",
      "singleQuote": true,
      "printWidth": 80,
      "tabWidth": 2
    }
    ```
  - Add a format script to `frontend/package.json`:
    ```json
    "scripts": {
      // ... other scripts
      "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"
    },
    ```
- Run `npm run format` (once configured) to automatically format files.

### Naming Conventions
- **Components:** PascalCase (e.g., `UserProfile.tsx`, `HeaderComponent.tsx`).
- **Functions/Variables:** camelCase (e.g., `getUserData`, `isLoading`).
- **Interfaces/Types:** PascalCase (e.g., `interface UserProfile`, `type AuthState`).
- **CSS/Tailwind Classes:** Use descriptive, lowercase, hyphenated class names if creating custom CSS. Follow Tailwind's utility-first approach primarily.

### Component Structure
- Keep components small and focused on a single responsibility.
- Organize files logically, e.g., by feature or component type.
- Example structure for a component:
  ```tsx
  // src/components/MyComponent/MyComponent.tsx
  import React from 'react';
  import './MyComponent.css'; // Or use Tailwind classes directly

  interface MyComponentProps {
    title: string;
  }

  const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
    return (
      <div className="my-component">
        <h1>{title}</h1>
      </div>
    );
  };

  export default MyComponent;
  ```

### State Management
- **Zustand:** The project uses Zustand for global state management. Follow Zustand's patterns for creating and using stores.
- For local component state, use React's `useState` and `useReducer` hooks.

### Styling
- **Tailwind CSS:** Utilize Tailwind CSS utility classes for styling as much as possible.
- For custom styles that cannot be achieved with Tailwind, create separate CSS files or use CSS-in-JS if preferred (though Tailwind is primary).

## Backend (NestJS, TypeScript)

The backend is built with NestJS and TypeScript.

### Linting & Formatting
- **ESLint & Prettier:** The backend is pre-configured with ESLint and Prettier for code linting and formatting.
  - To lint and automatically fix issues: `npm run lint` in the `backend/` directory.
  - To format code: `npm run format` in the `backend/` directory.
- It's recommended to configure your IDE to use these tools on save.

### Naming Conventions
- **Modules, Controllers, Services, Providers:** PascalCase (e.g., `AuthModule.ts`, `UsersController.ts`, `AuthService.ts`). Name files matching the class name.
- **Functions/Methods/Variables:** camelCase (e.g., `findAllUsers`, `currentUser`).
- **DTOs (Data Transfer Objects):** PascalCase, often suffixed with `Dto` (e.g., `CreateUserDto.ts`).
- **Database Entities (Prisma Models):** PascalCase as defined in `schema.prisma`.

### NestJS Best Practices
- Follow standard NestJS conventions for modules, controllers, services, DTOs, pipes, guards, and interceptors.
- Use dependency injection effectively.
- Keep controllers thin and delegate business logic to services.
- Use DTOs for request and response validation and shaping.

## TypeScript Best Practices (Both Frontend & Backend)

- **Strong Typing:** Strive for strong type safety. Avoid using `any` whenever possible. Define clear interfaces and types.
- **Interfaces vs. Types:** Use `interface` for defining the shape of objects and classes. Use `type` for primitives, unions, intersections, and more complex types.
- **Readonly and Immutability:** Use `readonly` for properties that should not be reassigned after initialization. Prefer immutable data structures where practical.

## Version Control (Git)

### Commit Messages
- Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This helps in generating changelogs and makes commit history more understandable.
  - Example: `feat: add user authentication endpoint`
  - Example: `fix: resolve issue with incorrect data display`
  - Example: `docs: update API documentation for /users`
  - Example: `style: format code with Prettier`
  - Example: `refactor: simplify order processing logic`
  - Example: `test: add unit tests for payment service`
  - Example: `chore: update dependencies`

### Branching Strategy
- **Feature Branches:** Create a new branch for each new feature or bug fix from the main development branch (e.g., `main` or `develop`).
  - Branch naming: `feature/feature-name` (e.g., `feature/user-profile-page`)
  - Branch naming: `fix/bug-description` (e.g., `fix/login-error`)
  - Branch naming: `chore/task-description` (e.g., `chore/update-ci-config`)
- **Pull Requests (PRs):** Once work on a branch is complete, open a PR to merge it into the main development branch. Ensure PRs are reviewed before merging.
- Keep the main branch (`main` or `master`) stable and deployable.

---
*This document is a living document and may be updated as the project evolves.*

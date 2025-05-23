# TrapTally Unified Style Guide

This document serves as the single source of truth for code style, formatting, and best practices for the TrapTally project. It combines guidance from previous style guides while aligning with the current implementation.

## Table of Contents

- [Formatting Standards](#formatting-standards)
- [Naming Conventions](#naming-conventions)
- [TypeScript Guidelines](#typescript-guidelines)
- [React Component Structure](#react-component-structure)
- [CSS and Styling](#css-and-styling)
- [State Management](#state-management)
- [Error Handling](#error-handling)
- [API Interactions](#api-interactions)
- [Performance Considerations](#performance-considerations)

## Formatting Standards

### Indentation and Spacing

- Use **2 spaces** for indentation, not tabs
- Add spaces around operators (`= + - * / < > <=` etc.)
- Add spaces after commas in arrays and objects
- Use a space after keywords like `if`, `for`, `while`, etc.
- No spaces inside parentheses or brackets

```typescript
// ✅ Good
if (condition) {
  doSomething();
}

const array = [1, 2, 3];
const object = { key: 'value' };

// ❌ Bad
if(condition){
  doSomething();
}

const array=[1,2,3];
const object={key:'value'};
```

### Line Breaks and Length

- Maximum line length: 100 characters
- Use line breaks after opening brackets for multi-line statements
- Place closing brackets on a new line aligned with the opening statement
- Use semicolons at the end of each statement

```typescript
// ✅ Good
function longFunctionName(
  longParameterName1: string,
  longParameterName2: number,
  longParameterName3: boolean
) {
  // Function body
}

// ❌ Bad
function longFunctionName(longParameterName1: string, longParameterName2: number, longParameterName3: boolean) { 
  // Function body
}
```

## Naming Conventions

### Variable and Function Naming

- Use **camelCase** for variables, functions, and methods
- Boolean variables should start with `is`, `has`, `should`, etc.
- Function names should be verbs describing the action
- Ref variables should be suffixed with `Ref` (e.g., `lastAttemptTimeRef`)

```typescript
// ✅ Good
const isAuthenticated = true;
const hasPermission = checkPermission();
function fetchUserData() { /* ... */ }
const lastAttemptTimeRef = useRef(0);

// ❌ Bad
const authenticated = true;
const permission = checkPermission();
function userData() { /* ... */ }
const lastAttemptTime = useRef(0);
```

### Component and Type Naming

- Use **PascalCase** for React components, interfaces, types, enums, and classes
- React components should have clear, descriptive names
- Interface names should describe the entity they represent

```typescript
// ✅ Good
interface UserProfile {
  id: string;
  name: string;
}

const UserProfileCard: React.FC<UserProfileProps> = ({ user }) => {
  // Component implementation
};

// ❌ Bad
interface userdata {
  id: string;
  name: string;
}

const userCard = ({ user }) => {
  // Component implementation
};
```

### File Naming

- Use **PascalCase** for React component files matching the component name (e.g., `SpotifyPlayer.tsx`)
- Use **camelCase** for hook files with `use` prefix (e.g., `useAuth.ts`)
- Use **camelCase** for utility files (e.g., `formatUtils.ts`)

## TypeScript Guidelines

### Type Definitions

- Always define types for props, state, and function parameters
- Use interfaces for objects representing entities
- Use type aliases for unions, intersections, and simpler types
- Avoid using `any` type; use `unknown` when type is truly unknown

```typescript
// ✅ Good
interface TrackInfo {
  name: string;
  artists: string[];
  albumArt: string;
  isPlaying: boolean;
}

type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

// ❌ Bad
function processTrack(track: any) {
  // Implementation
}
```

### Optional Properties and Nullability

- Use optional chaining (`?.`) for properties that might be undefined
- Use nullish coalescing (`??`) for fallback values
- Use non-null assertion (`!`) only when you are absolutely certain a value exists

```typescript
// ✅ Good
const artistName = track?.artists?.[0]?.name ?? 'Unknown Artist';

// ❌ Bad
const artistName = track && track.artists && track.artists[0] && track.artists[0].name ? track.artists[0].name : 'Unknown Artist';
```

## React Component Structure

### Functional Components

- Use functional components with hooks instead of class components
- Destructure props in the function parameter
- Follow a consistent ordering of code:

```typescript
import React, { useState, useEffect, useCallback, useRef } from 'react';
// Other imports...

interface ComponentProps {
  // Props definition
}

const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // 1. State declarations
  const [state, setState] = useState<Type>(initialValue);
  
  // 2. Refs
  const someRef = useRef<Type>(initialValue);
  
  // 3. Derived state/calculations
  const derivedValue = useMemo(() => calculateValue(prop1), [prop1]);
  
  // 4. Event handlers and callbacks
  const handleEvent = useCallback(() => {
    // Implementation
  }, [dependencies]);
  
  // 5. Effects
  useEffect(() => {
    // Side effect implementation
    
    return () => {
      // Cleanup function
    };
  }, [dependencies]);
  
  // 6. Helper functions
  const helperFunction = () => {
    // Implementation
  };
  
  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

### Component Organization

- Group related components in the same directory
- Extract reusable logic into custom hooks
- Keep components focused on a single responsibility
- Split large components into smaller, more manageable pieces

## CSS and Styling

### Tailwind CSS Usage

- Use Tailwind utility classes for styling whenever possible
- Group Tailwind classes in a logical order:
  1. Layout (display, position)
  2. Sizing (width, height)
  3. Spacing (margin, padding)
  4. Typography (font, text)
  5. Visual (colors, background)
  6. Interactive states (hover, focus)

```jsx
// ✅ Good
<button 
  className="flex items-center justify-center w-10 h-10 p-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50"
  onClick={handleClick}
>
  {children}
</button>
```

### Custom CSS

- When Tailwind doesn't meet needs, use CSS modules
- Follow BEM naming convention for custom CSS classes
- Keep selector specificity as low as possible

## State Management

### Local Component State

- Use `useState` for component-specific state
- Use `useReducer` for complex state logic within a component
- Initialize state with proper TypeScript types

```typescript
// ✅ Good
const [isLoading, setIsLoading] = useState<boolean>(false);
const [error, setError] = useState<string | null>(null);

// ❌ Bad
const [loading, setLoading] = useState(false);
const [error, setError] = useState();
```

### Global State

- Use the store (Zustand) for truly global state:
  - Authentication state
  - User preferences
  - Shared application state
- Keep store structure flat and organized by domain
- Define clear selectors for accessing store state

```typescript
// ✅ Good
const accessToken = usePlaybackStore(selectSpotifyAccessToken);
const isPlaying = usePlaybackStore(selectIsPlaying);

// ❌ Bad
const store = usePlaybackStore();
const token = store.spotifyUserTokens?.accessToken;
```

## Error Handling

### API Error Handling

- Use try/catch blocks for all async operations
- Provide specific, user-friendly error messages
- Log technical errors to the console for debugging
- Handle different error types appropriately

```typescript
try {
  await apiRequest();
} catch (err) {
  console.error('Technical details for debugging:', err);
  
  if (err instanceof AuthenticationError) {
    setError('Your session has expired. Please log in again.');
  } else if (err instanceof NetworkError) {
    setError('Unable to connect to the server. Please check your internet connection.');
  } else {
    setError('An unexpected error occurred. Please try again later.');
  }
}
```

### Fallbacks and Loading States

- Always provide loading indicators for async operations
- Use fallback UI for error states
- Handle empty states gracefully

## API Interactions

### Request Pattern

- Use consistent patterns for API requests
- Handle response status codes appropriately
- Parse JSON responses safely with error handling
- Set and clear loading state for all API calls

```typescript
const apiRequest = async <T = any>(url: string, options: RequestInit): Promise<T> => {
  setLoading(true);
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }
    
    return await response.json() as T;
  } catch (err) {
    console.error('API request failed:', err);
    throw err;
  } finally {
    setLoading(false);
  }
};
```

## Performance Considerations

### React Optimizations

- Use `useCallback` for event handlers passed as props
- Use `useMemo` for expensive calculations
- Use `React.memo` for components that render often with the same props
- Avoid unnecessary re-renders by using proper dependency arrays

### Async Operations

- Clean up effects that create subscriptions or timeouts
- Use `AbortController` to cancel fetch requests when components unmount
- Debounce or throttle rapidly firing events (e.g., scroll, resize, input)

```typescript
// ✅ Good
useEffect(() => {
  const controller = new AbortController();
  
  const fetchData = async () => {
    try {
      const response = await fetch(url, { signal: controller.signal });
      // Process response
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Fetch error:', err);
      }
    }
  };
  
  fetchData();
  
  return () => {
    controller.abort();
  };
}, [url]);
```

---

This style guide reflects the current implementation patterns in the TrapTally project and should be used as the authoritative reference for code style and organization. By following these guidelines, we ensure consistency and maintainability across the codebase.

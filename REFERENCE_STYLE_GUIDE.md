
# Spotify Playlist Application Style Guide

This document serves as a comprehensive style guide from the TrapTally project when it was created using Lovable.dev before migrating the project and switching to Windsurf to complete the project. THe Lovable version of TrapTally had the frontend and style and overall design very close to how I envisioned it and as such I'm providing it as reference to use for our version of TrapTally in Windsurf. It outlines the coding standards, design patterns, and practices that were used in Lovable and should likely be followed to ensure consistency across the codebase and that the project materializes into what I envisioned.

## Table of Contents

- [Formatting Guidelines](#formatting-guidelines)
- [Naming Conventions](#naming-conventions)
- [TypeScript Guidelines](#typescript-guidelines)
- [React Component Structure](#react-component-structure)
- [Tailwind CSS Usage](#tailwind-css-usage)
- [State Management](#state-management)
- [Error Handling](#error-handling)
- [Testing Standards](#testing-standards)
- [Performance Considerations](#performance-considerations)
- [Design System](#design-system)

## Formatting Guidelines

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

### Line Breaks

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

### General Rules

- Use **camelCase** for variables, functions, and methods
- Use **PascalCase** for classes, interfaces, types, enums, and React components
- Use **UPPER_SNAKE_CASE** for constants
- Use **PascalCase** for component file names (e.g., `Button.tsx`, `PlaylistCard.tsx`)
- Use **kebab-case** for utility files (e.g., `format-date.ts`, `api-helpers.ts`)
- Use **camelCase** for custom hook files (e.g., `useSpotifyAuth.ts`, `usePlaylistData.ts`)

### Specific Naming Guidelines

#### Variables and Functions

- Be descriptive with names
- Boolean variables should start with `is`, `has`, `should`, etc.
- Function names should start with verbs

```typescript
// ✅ Good
const isAuthenticated = true;
const hasPermission = checkPermission();
function fetchUserData() { /* ... */ }

// ❌ Bad
const authenticated = true;
const permission = checkPermission();
function userData() { /* ... */ }
```

#### Components and Files

- Component files should use PascalCase, matching the component name: `PlaylistCard.tsx`
- Utility files should use kebab-case: `format-utils.ts`
- Custom hooks should use camelCase and be prefixed with `use`: `usePlaylistData.ts`
- Higher-order components should be prefixed with `with`: `withAuthentication.tsx`

```
// File naming examples
PlaylistCard.tsx        // Component file
usePlaylistData.ts      // Custom hook file
withAuthentication.tsx  // Higher-order component
format-date.ts          // Utility file
```

## TypeScript Guidelines

- Always define types for props, state, function parameters, and return values
- Use interfaces for objects that represent entities and types for simpler structures
- Avoid using `any` type; use `unknown` instead when type is truly unknown
- Use type assertions sparingly, preferring type guards instead
- Leverage TypeScript's utility types where appropriate (Pick, Omit, Partial, etc.)

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

type UserWithoutEmail = Omit<User, 'email'>;
type OptionalUser = Partial<User>;

function processUser(user: User): string {
  return `${user.name} (${user.email})`;
}

// ❌ Bad
function processUser(user: any): any {
  return `${user.name} (${user.email})`;
}
```

## React Component Structure

### Functional Components

- Use functional components with hooks instead of class components
- Destructure props in the function parameter
- Define prop types using TypeScript interfaces
- Follow a consistent ordering of code within components:
  1. Interfaces/Types
  2. Prop destructuring
  3. Hooks (useState, useEffect, etc.)
  4. Helper functions
  5. Return statement (JSX)

```typescript
import React, { useState, useEffect } from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  disabled = false 
}) => {
  // Hooks
  const [isHovered, setIsHovered] = useState(false);
  
  // Effects
  useEffect(() => {
    // Effect code
  }, []);
  
  // Helper functions
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  
  // JSX
  return (
    <button 
      className="..."
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {label}
    </button>
  );
};
```

### Component Organization

- Split large components into smaller, reusable ones
- Place related components in the same directory
- Create index files to export multiple components from a directory
- Group common components under a `common` or `shared` directory
- Use lazy loading for route-level components

## Tailwind CSS Usage

### Class Organization

- Order Tailwind classes consistently:
  1. Layout (display, position, etc.)
  2. Sizing (width, height)
  3. Spacing (margin, padding)
  4. Typography (font, text)
  5. Visual (colors, backgrounds, borders)
  6. Interactive (hover, focus states)

```jsx
// ✅ Good
<div className="flex flex-col w-full h-48 p-4 m-2 font-medium text-white bg-gray-800 rounded hover:bg-gray-700">
  ...
</div>

// ❌ Bad (inconsistent ordering)
<div className="text-white p-4 bg-gray-800 flex w-full rounded m-2 hover:bg-gray-700 h-48 font-medium flex-col">
  ...
</div>
```

### Component-Specific Classes

- Extract repeated class combinations into components
- Use `cn()` utility for conditional classes

```typescript
// Utility for combining classes
import { cn } from "@/lib/utils";

// Using cn() for conditional classes
<button 
  className={cn(
    "px-4 py-2 rounded",
    isActive ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800",
    className
  )}
>
  {children}
</button>
```

### Color Scheme

- Use Tailwind's color palette consistently
- Follow a consistent naming scheme for custom colors
- Stick to application's theme defined in tailwind.config.js
- Use CSS variables for dynamic theming

Primary colors:
- Background: Dark mode (`bg-background`, dark theme)
- Text: White/Light gray on dark backgrounds (`text-white`, `text-gray-200`)
- Accents: Green for Spotify-related elements (`bg-[#1DB954]` or custom Spotify green)
- Secondary: Gray tones for cards and containers (`bg-white/5` for subtle container backgrounds)

## State Management

### Local State

- Use React's `useState` hook for component-level state
- Use `useReducer` for complex state logic

```typescript
// Simple state
const [isPlaying, setIsPlaying] = useState(false);

// Complex state
const [state, dispatch] = useReducer(playerReducer, initialState);
```

### Global State

- Use React Context API for sharing state between components
- Structure context files consistently:
  1. Create a types file for context-related types
  2. Define the context
  3. Create a provider component
  4. Create a custom hook to access the context

```typescript
// SpotifyContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { SpotifyContextState, SpotifyAction } from './types/spotify';

const initialState: SpotifyContextState = {
  // Initial state
};

const SpotifyContext = createContext<{
  state: SpotifyContextState;
  dispatch: React.Dispatch<SpotifyAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const SpotifyProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(spotifyReducer, initialState);
  
  return (
    <SpotifyContext.Provider value={{ state, dispatch }}>
      {children}
    </SpotifyContext.Provider>
  );
};

export const useSpotify = () => useContext(SpotifyContext);
```

### API State

- Use React Query for API calls and state management
- Follow a consistent pattern for query keys
- Handle loading, error, and success states

```typescript
// Query
const {
  data,
  isLoading,
  error
} = useQuery({
  queryKey: ['playlist', playlistId],
  queryFn: () => fetchPlaylist(playlistId),
});

// Query key structure
// ['resourceType', 'resourceId', { additionalParams }]
```

### Import Order

- Group imports in the following order, separated by a blank line:
  1. External libraries (React, Tailwind, etc.)
  2. Internal components
  3. Internal hooks, contexts
  4. Types, utilities, constants

```typescript
// External libraries
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// Internal components
import { Button } from '@/components/ui/button';
import { PlaylistCard } from '@/components/PlaylistCard';

// Internal hooks, contexts
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth';
import { useToast } from '@/hooks/use-toast';

// Types, utilities, constants
import { Playlist } from '@/types/spotify';
import { formatDate } from '@/utils/format';
import { PLAYLIST_IDS } from '@/config/playlistIds';
```

## Error Handling

### API Errors

- Always handle errors from API calls
- Use try/catch blocks for async/await
- Provide meaningful error messages to users
- Log detailed errors for debugging

```typescript
try {
  const data = await fetchPlaylistTracks(playlistId);
  return data;
} catch (error) {
  console.error('Error fetching playlist tracks:', error);
  toast({
    title: 'Failed to load tracks',
    description: 'Please try again later',
    variant: 'destructive',
  });
  throw error; // Re-throw if needed for error boundaries
}
```

### UI Error States

- Implement error boundaries for React components
- Display appropriate UI for error states
- Allow users to retry failed operations when possible

## Loading and Empty States

### Loading States

- Show loading indicators during async operations
- Keep loading states consistent across the application

```tsx
{isLoading ? (
  <div className="flex flex-col gap-4 w-full">
    {Array(5).fill(0).map((_, i) => (
      <Skeleton key={i} className="h-16 w-full" />
    ))}
  </div>
) : (
  // Content
)}
```

### Empty States

- Display meaningful empty states
- Provide clear calls-to-action when applicable
- Maintain consistent design for empty states

```tsx
{tracks.length === 0 && !isLoading && (
  <div className="flex flex-col items-center justify-center py-12">
    <MusicOff className="h-16 w-16 text-gray-400" />
    <p className="mt-4 text-gray-400">No tracks found</p>
    {canAddTracks && (
      <Button onClick={handleAddTracks} className="mt-4">
        Add Tracks
      </Button>
    )}
  </div>
)}
```

## Testing Standards

### Unit Tests

- Test components in isolation
- Mock external dependencies
- Test both success and failure paths
- Use meaningful test descriptions

```typescript
describe('PlaylistCard', () => {
  it('should render the playlist title', () => {
    // Test code
  });

  it('should call onPlay when the play button is clicked', () => {
    // Test code
  });

  it('should show error state when error prop is provided', () => {
    // Test code
  });
});
```

### Integration Tests

- Test component interactions
- Mock API responses
- Verify UI updates correctly based on state changes

## Performance Considerations

### React Optimization

- Use memoization with `useMemo` and `useCallback` for expensive calculations and callbacks
- Use `React.memo` for components that render often but with the same props
- Implement virtualization for long lists

```typescript
// Memoize expensive calculations
const sortedTracks = useMemo(() => {
  return [...tracks].sort((a, b) => a.name.localeCompare(b.name));
}, [tracks]);

// Memoize callbacks
const handleTrackSelect = useCallback((trackId: string) => {
  dispatch({ type: 'SELECT_TRACK', payload: trackId });
}, [dispatch]);
```

### Lazy Loading

- Implement lazy loading for images
- Use React's lazy loading for code splitting
- Defer non-critical data fetching

```typescript
// Lazy component loading
const ArtistPage = React.lazy(() => import('./pages/ArtistPage'));

// In router
<Suspense fallback={<Loading />}>
  <ArtistPage />
</Suspense>
```

## Design System

### Typography

- Use a consistent type scale
- Main font: 'Outfit' (Google Fonts)
- Heading sizes:
  - h1: text-3xl font-bold (32px)
  - h2: text-2xl font-bold (24px)
  - h3: text-xl font-semibold (20px)
  - h4: text-lg font-medium (18px)
- Body text: text-base (16px)
- Small text: text-sm (14px)

### Spacing

- Use a consistent spacing scale from Tailwind
- Common values:
  - Tight spacing: p-2, m-2 (0.5rem, 8px)
  - Default spacing: p-4, m-4 (1rem, 16px)
  - Loose spacing: p-6, m-6 (1.5rem, 24px)
  - Section spacing: p-8, m-8 (2rem, 32px)
  - Page margins: px-12 (3rem, 48px)

### Borders & Shadows

- Rounded corners: rounded (0.25rem), rounded-md (0.375rem)
- Border colors: border-white/10 for subtle borders on dark backgrounds
- Shadows: shadow-md for cards, shadow-lg for modals and dropdowns

### Component Patterns

#### Buttons

```jsx
<button className="flex h-10 items-center justify-center px-6 py-2 rounded-full text-sm font-medium tracking-[0.1px] bg-[rgba(203,203,203,1)] text-black">
  Button Text
</button>

<button className="flex h-10 items-center justify-center px-6 py-2 rounded-full text-sm font-medium tracking-[0.1px] bg-transparent text-white hover:bg-white/10 border border-white/10">
  Secondary Button
</button>
```

#### Cards

```jsx
<div className="rounded-lg bg-white/5 p-4 hover:bg-white/10 transition-colors">
  {/* Card content */}
</div>
```

#### Tables

```jsx
<div className="w-full">
  <div className="flex w-full items-center text-base text-white font-bold leading-none px-12 py-4">
    {/* Table headers */}
  </div>
  
  {/* Table rows */}
  <div className="flex w-full items-center px-12 py-4 hover:bg-white/5 text-base">
    {/* Table cells */}
  </div>
</div>
```

#### Form Controls

```jsx
<div className="space-y-2">
  <label className="block text-sm font-medium">Label</label>
  <input 
    className="w-full rounded-md border border-input bg-background px-3 py-2" 
    type="text" 
  />
</div>
```

### Conditional Rendering

- Use ternary operators for simple conditions
- Use logical AND (`&&`) for conditional rendering
- Extract complex conditions to variables or functions

```jsx
// Simple condition
{isAuthenticated ? <UserProfile /> : <LoginButton />}

// Conditional rendering with &&
{isLoading && <LoadingSpinner />}

// Extract complex conditions
const showEditButton = isOwner && !isReadOnly && hasPermission;

{showEditButton && <EditButton />}
```

### Advanced Styling

#### Hover States

```jsx
<button className="bg-white/10 hover:bg-white/20 transition-colors duration-200">
  Hover Me
</button>
```

#### Transitions

```jsx
<div className="transform transition-all duration-300 ease-in-out hover:scale-105">
  Animated Element
</div>
```

#### Responsive Design

```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {/* Grid items */}
</div>
```

## Conclusion

Adhering to this style guide will ensure consistency across the codebase and improve the maintainability of the application. It provides a solid foundation for developers to build upon and should be updated as new patterns emerge or requirements change.

Remember that the purpose of these guidelines is not to restrict creativity but to provide a framework that allows for efficient collaboration and a cohesive user experience.

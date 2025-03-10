# Frontend Architecture

## Technology Stack

### Core Libraries

- **Next.js 14+**: React framework with App Router
- **React 18+**: UI component library
- **TypeScript 5+**: Type-safe JavaScript
- **Tailwind CSS 3+**: Utility-first CSS framework
- **Shadcn UI**: Reusable component system built on Radix UI

### State Management

- **Zustand**: Lightweight state management
- **React Query**: Data fetching, caching, and state management for asynchronous data

### Data Management

- **Static Data**: Flag data stored as static JSON in the application
- **Local Storage**: Guest mode progress tracking
- **Database**: User authentication and progress tracking (via API)

### Form Handling

- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation library

## Project Structure

```
app/
├── (auth)/               # Authentication-related routes
├── api/                  # API routes
├── competition/          # Competition mode pages
├── learn/                # Learning mode pages
├── library/              # Flag library pages
├── settings/             # User settings pages
├── layout.tsx            # Root layout with providers
└── page.tsx              # Home page
components/
├── ui/                   # Shadcn UI components
├── core/                 # Core reusable components
│   ├── flag-card.tsx
│   ├── quiz-interface.tsx
│   ├── answer-option.tsx
│   └── ...
├── layout/              # Layout components
│   ├── navbar.tsx
│   ├── footer.tsx
│   └── ...
└── feature/             # Feature-specific components
    ├── learning/
    ├── competition/
    └── library/
data/
├── flags.ts             # Static flag data
└── constants.ts         # Application constants
lib/
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── validators/          # Zod schemas
└── store/               # Zustand stores
public/
└── flags/               # Flag images
styles/
└── globals.css          # Global styles (Tailwind imports)
```

## Static Data Management

### Flag Data Structure

```typescript
// data/flags.ts
export interface Flag {
  id: number;
  name: string;
  code: string;
  continent: string;
  population?: number;
  languages?: string;
  funFacts?: string;
  difficulty?: number;
  imageUrl: string;
}

export const flags: Flag[] = [
  {
    id: 1,
    name: "United States",
    code: "US",
    continent: "North America",
    population: 331002651,
    languages: "English",
    funFacts: JSON.stringify([
      "The 50 stars represent the 50 states",
      "The 13 stripes represent the original 13 colonies",
    ]),
    difficulty: 1,
    imageUrl: "/flags/us.svg",
  },
  // More flag data...
];
```

### Flag Data Utilities

```typescript
// lib/utils/flags.ts
import { flags, Flag } from "@/data/flags";

// Get a flag by its country code
export function getFlagByCode(code: string): Flag | undefined {
  return flags.find((flag) => flag.code.toUpperCase() === code.toUpperCase());
}

// Get flags by continent
export function getFlagsByContinent(continent: string): Flag[] {
  return flags.filter((flag) => flag.continent === continent);
}

// Get random set of flags
export function getRandomFlags(count: number = 10): Flag[] {
  const shuffled = [...flags].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Get a set of random flags excluding specific ones
export function getRandomFlagsExcept(
  count: number,
  excludeCodes: string[],
): Flag[] {
  const filteredFlags = flags.filter(
    (flag) => !excludeCodes.includes(flag.code),
  );
  const shuffled = [...filteredFlags].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
```

## Component Architecture

### Component Design Principles

1. **Atomic Design Methodology**:

   - **Atoms**: Buttons, inputs, icons
   - **Molecules**: Form fields, cards, menu items
   - **Organisms**: Forms, complex interactive components
   - **Templates**: Page layouts
   - **Pages**: Full pages with routing

2. **Component Composition**:

   - Favor composition over inheritance
   - Use React's children prop for flexible component APIs
   - Utilize render props pattern where appropriate

3. **Container/Presentation Pattern**:
   - Separate data logic from rendering
   - Keep presentation components pure

### Key Components

#### Flag Card Component

```tsx
interface FlagCardProps {
  flag: Flag;
  onClick?: (flag: Flag) => void;
  size?: "sm" | "md" | "lg";
  showInfo?: boolean;
}

export function FlagCard({
  flag,
  onClick,
  size = "md",
  showInfo = false,
}: FlagCardProps) {
  // Component implementation
}
```

#### Quiz Interface Component

```tsx
interface QuizInterfaceProps {
  flag: Flag;
  options: Flag[];
  onAnswer: (flag: Flag, isCorrect: boolean) => void;
  onNext: () => void;
  showHint?: boolean;
}

export function QuizInterface({
  flag,
  options,
  onAnswer,
  onNext,
  showHint = false,
}: QuizInterfaceProps) {
  // Component implementation
}
```

## State Management

### Zustand Store Design

```tsx
// User settings store
interface SettingsState {
  darkMode: boolean;
  soundEnabled: boolean;
  preferredDifficulty: "beginner" | "intermediate" | "expert";
  flagsPerSession: number;
  setDarkMode: (darkMode: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setPreferredDifficulty: (
    difficulty: "beginner" | "intermediate" | "expert",
  ) => void;
  setFlagsPerSession: (count: number) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  darkMode: false,
  soundEnabled: true,
  preferredDifficulty: "beginner",
  flagsPerSession: 10,
  setDarkMode: (darkMode) => set({ darkMode }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setPreferredDifficulty: (preferredDifficulty) => set({ preferredDifficulty }),
  setFlagsPerSession: (flagsPerSession) => set({ flagsPerSession }),
}));

// Progress tracking store
interface ProgressState {
  // Implementation details
}

export const useProgressStore = create<ProgressState>((set) => ({
  // Implementation details
}));
```

### Static Data Access Hooks

```tsx
// Custom hooks for accessing flag data
export function useFlags(filters?: {
  continent?: string;
  difficulty?: number;
  search?: string;
}) {
  // Filter flags from static data based on filters
  const filteredFlags = useMemo(() => {
    let result = [...flags];

    if (filters?.continent) {
      result = result.filter((flag) => flag.continent === filters.continent);
    }

    if (filters?.difficulty) {
      result = result.filter((flag) => flag.difficulty === filters.difficulty);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (flag) =>
          flag.name.toLowerCase().includes(searchLower) ||
          flag.code.toLowerCase().includes(searchLower),
      );
    }

    return result;
  }, [filters]);

  return {
    data: filteredFlags,
    isLoading: false,
    error: null,
  };
}

// Custom hook for quiz options
export function useQuizOptions(correctFlag: Flag, count = 4) {
  // Get random flags for quiz options, always including the correct one
  const options = useMemo(() => {
    const otherFlags = getRandomFlagsExcept(count - 1, [correctFlag.code]);
    return [...otherFlags, correctFlag].sort(() => 0.5 - Math.random());
  }, [correctFlag, count]);

  return {
    data: options,
    isLoading: false,
    error: null,
  };
}

// Custom hook for user progress (still uses API)
export function useUserProgress() {
  return useQuery({
    queryKey: ["user-progress"],
    queryFn: fetchUserProgress,
    // Only fetch if user is logged in
    enabled: !!useAuthStore((state) => state.user),
  });
}
```

## Responsive Design

- Mobile-first approach with Tailwind's responsive classes
- Breakpoints:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
  - `2xl`: 1536px

## Accessibility

- ARIA roles and attributes
- Keyboard navigation
- Color contrast compliance
- Screen reader support

## Performance Optimization

- Next.js Image component for optimized images
- Code splitting by route
- Dynamic imports for heavy components
- Memoization of expensive computations
- Debouncing user input
- Virtualized lists for long scrollable content

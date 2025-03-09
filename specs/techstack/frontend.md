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
   - Separate data fetching from rendering
   - Use React Query for data fetching containers
   - Keep presentation components pure

### Key Components

#### Flag Card Component

```tsx
interface FlagCardProps {
  flag: Flag
  onClick?: (flag: Flag) => void
  size?: 'sm' | 'md' | 'lg'
  showInfo?: boolean
}

export function FlagCard({ flag, onClick, size = 'md', showInfo = false }: FlagCardProps) {
  // Component implementation
}
```

#### Quiz Interface Component

```tsx
interface QuizInterfaceProps {
  flag: Flag
  options: Flag[]
  onAnswer: (flag: Flag, isCorrect: boolean) => void
  onNext: () => void
  showHint?: boolean
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
  darkMode: boolean
  soundEnabled: boolean
  preferredDifficulty: 'beginner' | 'intermediate' | 'expert'
  flagsPerSession: number
  setDarkMode: (darkMode: boolean) => void
  setSoundEnabled: (enabled: boolean) => void
  setPreferredDifficulty: (difficulty: 'beginner' | 'intermediate' | 'expert') => void
  setFlagsPerSession: (count: number) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  darkMode: false,
  soundEnabled: true,
  preferredDifficulty: 'beginner',
  flagsPerSession: 10,
  setDarkMode: (darkMode) => set({ darkMode }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setPreferredDifficulty: (preferredDifficulty) => set({ preferredDifficulty }),
  setFlagsPerSession: (flagsPerSession) => set({ flagsPerSession }),
}))

// Progress tracking store
interface ProgressState {
  // Implementation details
}

export const useProgressStore = create<ProgressState>((set) => ({
  // Implementation details
}))
```

### Data Fetching with React Query

```tsx
// Custom hook for fetching flags
export function useFlags(filters?: FlagFilters) {
  return useQuery({
    queryKey: ['flags', filters],
    queryFn: () => fetchFlags(filters),
  })
}

// Custom hook for quiz options
export function useQuizOptions(difficulty?: string, count = 4) {
  return useQuery({
    queryKey: ['quiz-options', difficulty, count],
    queryFn: () => fetchQuizOptions(difficulty, count),
  })
}

// Custom hook for user progress
export function useUserProgress() {
  return useQuery({
    queryKey: ['user-progress'],
    queryFn: fetchUserProgress,
    // Only fetch if user is logged in
    enabled: !!useAuthStore((state) => state.user),
  })
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

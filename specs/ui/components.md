# UI Components Specification

## Introduction

This document outlines the UI components needed for the Flag Trainer application, describing their purpose, functionality, and acceptance criteria.

## General UI Guidelines

1. All components should follow the design system using Tailwind CSS and Shadcn UI
2. Components should be responsive and work on devices from 320px width and up
3. Components should be accessible and follow WCAG 2.1 AA guidelines
4. Dark mode support should be implemented for all components

## Core Components

### 1. Flag Card

A card component displaying a flag with optional information.

#### Requirements

1. Display a flag image with proper aspect ratio
2. Show country name below the flag
3. Optional information display (continent, population, etc.)
4. Hover and focus states for interactive feedback
5. Support for different sizes (small, medium, large)

#### Acceptance Criteria

- Flag image loads correctly with fallback for loading/error states
- Text is readable against any background
- Interactive states (hover, focus) are visually distinct
- Component is keyboard accessible
- Component works in both light and dark mode

### 2. Quiz Interface

The main interface for the learning mode quiz.

#### Requirements

1. Display current flag prominently
2. Show 4 multiple-choice country name options
3. Visual feedback for correct/incorrect answers (green/red background)
4. "Next" button that appears after answering
5. Optional hint section that can be revealed
6. Progress indicator showing completion percentage

#### Acceptance Criteria

- Options are displayed in a randomized order
- Only one option can be selected
- Visual feedback is clear and immediate
- Next button is disabled until an answer is selected
- Component handles different screen sizes appropriately

### 3. Progress Tracker

A component showing the user's learning progress.

#### Requirements

1. Visual representation of overall progress (percentage complete)
2. Breakdown by continent/region
3. Indicator for mastery levels of different flags
4. Recent activity summary
5. Streaks and achievements display

#### Acceptance Criteria

- Progress calculations are accurate
- Visual elements scale appropriately on different devices
- Data is updated in real-time when progress changes
- Empty/loading states are handled gracefully

### 4. Navigation Bar

The main navigation component for the application.

#### Requirements

1. Links to main sections (Learning, Library, Competition, Settings)
2. Responsive design that collapses to a hamburger menu on small screens
3. Active state for current section
4. User account section (if logged in) or Sign In button (if not)
5. Dark mode toggle

#### Acceptance Criteria

- All navigation links work correctly
- Current section is clearly indicated
- Mobile menu opens and closes properly
- Authentication state is reflected correctly
- Component is fixed at the top across all pages

## Feature-specific Components

### 1. Flag Library Grid

A grid display of flags for the library section.

#### Requirements

1. Responsive grid layout (1-5 columns depending on screen size)
2. Quick-filter controls for continents/regions
3. Search input for finding specific flags
4. Lazy loading for performance
5. Sorting options (alphabetical, difficulty)

#### Acceptance Criteria

- Grid adapts to different screen sizes without layout issues
- Filters and search work correctly and update the display
- Performance remains good even with all flags loaded
- Focus management allows keyboard navigation through the grid

### 2. Competition Timer

A timer component for the competition mode.

#### Requirements

1. Countdown display showing remaining time
2. Visual indicator for time running low (< 30 seconds)
3. Animation effects for urgency
4. Sound effects (optional, respects sound settings)

#### Acceptance Criteria

- Timer accurately counts down from the starting time
- Visual changes occur at appropriate thresholds
- Component does not cause performance issues
- Timer stops appropriately when the competition ends

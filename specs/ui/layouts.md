# UI Layouts Specification

## Introduction

This document outlines the layout structure and requirements for the Flag Trainer application, defining the overall page organization and responsive behavior.

## Global Layout Requirements

1. All layouts should be fully responsive and work on devices from 320px width and up
2. Layouts should maintain consistent spacing according to the design system
3. Content should be accessible with proper semantic HTML structure
4. Dark mode support should be implemented for all layouts

## Base Layout

The base layout that wraps all pages of the application.

### Requirements

1. Fixed navigation bar at the top
2. Main content area with appropriate padding
3. Footer with application information, links, and legal text
4. Consistent max width and content centering
5. Support for toast notifications and modals

### Responsive Behavior

- **Mobile (320px-639px)**: Single column layout, compact navigation
- **Tablet (640px-1023px)**: Expanded navigation, moderate content width
- **Desktop (1024px+)**: Full navigation bar, optimized content width with max-width limit

## Page-specific Layouts

### 1. Home Page Layout

The landing page layout showcasing the application's main features.

#### Requirements

1. Hero section with application name, tagline, and call-to-action buttons
2. Features section with cards or icons for key application features
3. "Get Started" section with prominent button
4. Optional leaderboard or statistics display
5. Testimonials or information section (future)

#### Acceptance Criteria

- Key actions (Start Learning, View Library) are prominently displayed
- Visual hierarchy guides users to primary actions
- Layout adapts appropriately to different screen sizes
- Content is readable and accessible

### 2. Learning Mode Layout

Layout for the interactive learning experience.

#### Requirements

1. Quiz interface as the main focus
2. Progress tracker visible at top or side
3. Session controls (exit, restart, settings)
4. Hint toggle and information panel
5. Clear visual separation between question and answer areas

#### Responsive Behavior

- **Mobile**: Stacked layout with quiz on top, controls below
- **Tablet/Desktop**: Two-column layout with quiz on left, information/progress on right

### 3. Flag Library Layout

Layout for browsing all flags.

#### Requirements

1. Filter controls at the top (search, continent filters, sorting)
2. Flag grid as the main content
3. Sidebar with optional advanced filters (desktop only)
4. Detail view that can be opened without leaving the page
5. Pagination or infinite scroll controls

#### Responsive Behavior

- **Mobile**: Filter dropdown, 1-2 column flag grid, full-screen detail view
- **Tablet**: 3-4 column flag grid, slide-in detail view
- **Desktop**: Sidebar with filters, 5+ column flag grid, side panel detail view

### 4. Settings Page Layout

Layout for user settings and preferences.

#### Requirements

1. Settings categories in a sidebar or tab navigation
2. Form controls for each setting grouped by category
3. Save/Cancel buttons consistently positioned
4. Feedback for saved changes
5. Account information section (if logged in)

#### Responsive Behavior

- **Mobile**: Stacked layout with collapsible sections
- **Tablet/Desktop**: Two-column layout with navigation on left, settings on right

## Component Placement Guidelines

1. **Navigation Components**:

   - Primary navigation at the top of the page
   - Secondary navigation in a sidebar or as tabs below primary navigation
   - Breadcrumbs below primary navigation on applicable pages

2. **Action Components**:

   - Primary actions on the right or at the bottom of content areas
   - Secondary actions adjacent to primary but visually less prominent
   - Destructive actions separated and with confirmation dialogs

3. **Information Components**:
   - Notifications appear at the top center or top right
   - Contextual help adjacent to related content
   - Error messages directly below related input fields

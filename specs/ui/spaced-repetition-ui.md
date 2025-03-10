# Spaced Repetition User Interface Specification

## Overview

This document outlines the user interface and experience design for the spaced repetition learning mode in the Flag Trainer application. This learning mode adapts to the user's knowledge level, showing flags at optimal intervals for maximum retention with minimum time spent.

## User Flow

### Spaced Learning Entry Point

1. User navigates to the Learn page
2. Among learning options, user selects "Spaced Repetition"
3. System checks for:
   - Existing progress data (in localStorage for anonymous users or server for authenticated users)
   - Due reviews and new flags
4. User is presented with session configuration options:
   - Number of flags to study (5, 10, 15, 20)
   - New flag ratio (Low: 20%, Medium: 30%, High: 40%)
   - Specific continent filter (optional)
5. User clicks "Start Session" to begin

### Learning Session Flow

1. System generates a mixed set of due reviews and new flags based on user's configuration
2. For each flag:
   - Flag image is displayed with multiple choice options
   - User selects an answer
   - System provides immediate feedback (correct/incorrect)
   - System records result and calculates next review date (using SuperMemo-2 algorithm)
   - User clicks "Next" to continue
3. After completing all flags in the session:
   - System displays session summary
   - Progress data is saved to localStorage
   - If online and authenticated, data is synced to server

### Session Summary

1. Shows completed session statistics:
   - Total flags reviewed
   - Correct vs. incorrect answers
   - Current streak (consecutive correct answers)
   - Next review times for flags in the session
2. Provides options to:
   - Start another session
   - View progress dashboard
   - Return to learning menu

## UI Components

### Spaced Learning Dashboard

```
+---------------------------------------+
|          Spaced Learning              |
+---------------------------------------+
|                                       |
|  Progress Overview                    |
|  +---------+ +---------+ +---------+ |
|  | Review   | | Learning | | Mastered | |
|  | 12 flags | | 35 flags | | 25 flags | |
|  +---------+ +---------+ +---------+ |
|                                       |
|  Due for Review: 8 flags              |
|                                       |
|  Session Options                      |
|  +---------------------------------+  |
|  | Number of flags:                |  |
|  | [5] [10] [15] [20]              |  |
|  |                                 |  |
|  | New flag ratio:                 |  |
|  | [Low] [Medium] [High]           |  |
|  |                                 |  |
|  | Filter by continent:            |  |
|  | [All] [Dropdown▼]               |  |
|  +---------------------------------+  |
|                                       |
|  [     Start Spaced Learning     ]    |
|                                       |
+---------------------------------------+
```

### Learning Session Interface

Reuses the existing quiz interface with additions:

```
+---------------------------------------+
|  Flag 3 of 10       Score: 2/2        |
|  [===========------------------]      |
+---------------------------------------+
|                                       |
|          [Flag Image Display]         |
|                                       |
+---------------------------------------+
|  Which country does this flag belong to? |
|                                       |
|  O Australia                          |
|  O New Zealand                        |
|  O Fiji                               |
|  O Papua New Guinea                   |
|                                       |
+---------------------------------------+
|  [ Check Answer ]                     |
+---------------------------------------+
```

After answering:

```
+---------------------------------------+
|  Flag 3 of 10       Score: 3/3        |
|  [=============----------------]      |
+---------------------------------------+
|                                       |
|          [Flag Image Display]         |
|                                       |
+---------------------------------------+
|  Which country does this flag belong to? |
|                                       |
|  O Australia                          |
|  O New Zealand ✓                      |
|  O Fiji                               |
|  O Papua New Guinea                   |
|                                       |
|  Next review: in 6 days               |
|                                       |
+---------------------------------------+
|  [ Next Flag ]                        |
+---------------------------------------+
```

### Session Completion Screen

```
+---------------------------------------+
|        Session Completed!             |
+---------------------------------------+
|                                       |
|  Your Results                         |
|  8/10                                 |
|                                       |
|  Great job! Keep practicing to        |
|  improve your retention.              |
|                                       |
|  [=============================]      |
|                                       |
|  Learning Status                      |
|  - New flags learned: 3               |
|  - Reviews completed: 7               |
|  - Current streak: 5                  |
|                                       |
|  Upcoming Reviews                     |
|  - Tomorrow: 2 flags                  |
|  - In 3 days: 3 flags                 |
|  - In 6 days: 5 flags                 |
|                                       |
+---------------------------------------+
|  [ Try Again ]    [ Back to Learn ]   |
+---------------------------------------+
```

### Progress Dashboard

```
+---------------------------------------+
|        Learning Progress              |
+---------------------------------------+
|                                       |
|  Knowledge Level                      |
|  [==============-------------] 65%    |
|                                       |
|  By Continent                         |
|  Africa [======------] 60%            |
|  Asia [=========---] 75%              |
|  Europe [============] 90%            |
|  N. America [====--------] 40%        |
|  Oceania [==-----------] 20%          |
|  S. America [========----] 70%        |
|                                       |
|  Upcoming Reviews                     |
|  Today: 5 flags                       |
|  Tomorrow: 8 flags                    |
|  This week: 25 flags                  |
|                                       |
|  Statistics                           |
|  Total flags: 223                     |
|  Flags seen: 72                       |
|  Mastered (>90d): 15                  |
|  Average accuracy: 73%                |
|                                       |
+---------------------------------------+
|  [ Review Due Flags ]   [ Back ]      |
+---------------------------------------+
```

## Responsive Design

### Mobile View (< 640px)

- Single column layout
- Scrollable interface
- Touch-optimized answer selection (larger targets)
- Simplified progress visualizations

### Tablet View (640px - 1024px)

- Flag image takes 50% of width in learning interface
- Dashboard uses responsive grid layout
- Optimized for touch and mouse interaction

### Desktop View (> 1024px)

- Full dashboard with all metrics visible
- Larger flag images
- Keyboard shortcut support (1-4 for answer options, space/enter for next)

## Feedback and Notifications

### Review Reminders

- Browser notifications (if permitted) for due reviews
- Visual indicator in the main navigation when flags are due for review
- Counter showing number of due flags

### Progress Milestones

Celebrations for significant milestones:

1. First 10 flags learned
2. 50% of flags seen
3. First flag reaching 90+ day interval ("mastered")
4. 100% of flags seen at least once
5. 90%+ accuracy on a full session

## Accessibility Considerations

1. **Color contrast**: Use of success/error colors has sufficient contrast
2. **Keyboard navigation**: Full support for tab navigation and keyboard shortcuts
3. **Screen reader support**: ARIA labels and semantic HTML for all interactive elements
4. **Reduced motion**: Option to disable animations for users who prefer reduced motion
5. **Text scaling**: UI remains functional when text is scaled up to 200%

## Offline Functionality

- Clear indication when working in offline mode
- Automatic sync when connection is restored
- Visual confirmation when data is successfully synced

## Implementation Notes

1. Use React's `useState` and `useEffect` hooks for session state management
2. Implement progress dashboard with responsive charts using Recharts or Chart.js
3. Store review data in localStorage with sync functionality for authenticated users
4. Use service workers for offline capability and background sync

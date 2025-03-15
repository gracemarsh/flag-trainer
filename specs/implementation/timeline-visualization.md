# Timeline Visualization Specification

## Overview

This document outlines the specifications for the learning timeline visualization on the stats page. The timeline visualization will provide users with a graphical representation of their learning journey, including when flags were learned, reviewed, and mastered over time.

## Objectives

1. Visualize the user's learning progress over time
2. Show patterns in learning behavior and engagement
3. Provide insight into the effectiveness of the spaced repetition system
4. Motivate users by showing their learning consistency

## Data Sources

The timeline visualization will use data from the spaced repetition system, specifically:

- Flag learning events (when a flag was first encountered)
- Review events (when a flag was reviewed)
- Performance metrics (accuracy on reviews)
- Session data (when learning sessions occurred)

## Visualization Components

### 1. Activity Timeline

```
+---------------------------------------+
|                                       |
|  Mar     Apr     May     Jun     Jul  |
|  |       |       |       |       |    |
|  ●●●● ●  ●●  ●●● ●●●●●●● ●●  ●●●● ●●   |
|                                       |
+---------------------------------------+
```

- Shows dots representing learning activity days
- Denser clusters indicate higher activity
- X-axis shows time progression (past 90 days by default)

### 2. Learning Metrics Chart

```
+---------------------------------------+
|                                       |
|  100% |                   ___         |
|       |              ____/            |
|   75% |         ____/                 |
|       |     ___/                      |
|   50% |____/                          |
|       |                               |
|   25% |                               |
|       |                               |
|    0% +---------------------------    |
|        Mar  Apr  May  Jun  Jul        |
|                                       |
+---------------------------------------+
```

- Line chart showing progress metrics over time
- Metrics include:
  - Percentage of total flags learned
  - Percentage of learned flags mastered
  - Average accuracy

### 3. Daily Flag Count Breakdown

```
+---------------------------------------+
|                                       |
|  30 |                                 |
|     |                                 |
|  25 |                                 |
|     |                                 |
|  20 |                 █              |
|     |                 █              |
|  15 |        █        █       █      |
|     |        █        █       █      |
|  10 |   █    █    █   █    █  █   █  |
|     |   █    █    █   █    █  █   █  |
|   5 |   █    █    █   █    █  █   █  |
|     |   █    █    █   █    █  █   █  |
|   0 +-------------------------------- |
|      Sun Mon Tue Wed Thu Fri Sat      |
|                                       |
+---------------------------------------+
```

- Bar chart showing flags learned/reviewed by day of week
- Shows pattern of user engagement
- Helps identify optimal learning days

## User Interactions

1. **Time Range Selection**

   - Dropdown to select time period (Last 7 days, Last 30 days, Last 90 days, All time)
   - Default: Last 30 days

2. **Metric Selection**

   - Toggle between different metrics to display on the charts
   - Options: Flags Learned, Flags Reviewed, Accuracy

3. **Hover Information**

   - Hover over data points to see detailed information
   - Shows date, number of flags learned/reviewed, and accuracy

4. **Granularity Toggle**
   - Toggle between daily, weekly, and monthly views
   - Affects how data is aggregated and displayed

## Responsive Behavior

### Mobile View (< 640px)

- Stack charts vertically
- Simplified time range selection
- Limited hover information

### Tablet View (640px - 1024px)

- Two-column layout for smaller charts
- Full hover information
- All time range options available

### Desktop View (> 1024px)

- Full-width charts with detailed information
- Enhanced hover information with tooltips
- All interactive elements available

## Implementation Details

### Technologies

- React for component structure
- Recharts for data visualization
- Tailwind CSS for styling
- Integration with existing spaced repetition hooks

### Data Processing

- Aggregate learning events by day/week/month
- Calculate running averages for smoothed metrics
- Cache processed data to improve performance

### Accessibility Considerations

- Ensure color contrast meets WCAG AA standards
- Provide alternative text descriptions for charts
- Ensure keyboard navigation support
- Include screen reader-friendly data tables as alternatives to visual charts

## Success Criteria

The timeline visualization implementation will be considered successful if:

1. Users can clearly understand their learning patterns
2. The visualization accurately reflects learning data
3. Performance is maintained (render time < 1s)
4. The visualization is accessible and responsive
5. Users engage with the visualization features

## Future Enhancements (Out of Scope for Initial Implementation)

1. **Export Functionality**: Allow users to download their progress data
2. **Goal Setting**: Overlay learning goals on timeline
3. **Comparative Analysis**: Compare personal progress to average user
4. **Predictive Insights**: Project future mastery based on current pace
5. **Social Sharing**: Generate shareable progress images

# User Flows

## Home Page Navigation

1. User lands on the home page
2. User sees:
   - Learning Mode button
   - Competition Mode button (future feature)
   - Library button
   - Leaderboard section (live updates)
   - Settings button
   - Sign In/Sign Up buttons (if not logged in)
   - User profile button (if logged in)

## Learning Mode Flow

1. User clicks "Learning Mode" from the home page
2. System retrieves flags based on spaced repetition algorithm (or introduces new flags for new users)
3. User is presented with a flag image and four country name options
4. User selects an answer:
   - If correct: background turns green, stats update, "Next" button appears
   - If incorrect: background turns red, correct answer is highlighted, stats update, "Next" button appears
5. User clicks "Next" to proceed to the next flag
6. After a set number of flags (e.g., 10), a progress summary is displayed
7. User can choose to continue or return to home page

## Learn by Continent Flow

1. User clicks "Learn" from the home page
2. User selects "By Continent" from the learning options
3. User is presented with a selection of continents:
   - Africa
   - Asia
   - Europe
   - North America
   - Oceania
   - South America
4. Each continent is displayed with a representative flag and brief description
5. User selects a continent
6. System retrieves flags specific to the selected continent
7. User is presented with flags from the chosen continent in a learning session:
   - Four multiple-choice options for each flag
   - Immediate feedback after answering
   - "Next" button to proceed
8. After all flags in the session, a summary is displayed showing:
   - Score
   - Time taken
   - Accuracy percentage
9. User can choose to retry with the same continent, select a different continent, or return to home page

## Flag Library Flow

1. User clicks "Library" from the home page
2. User sees a grid/gallery of all world flags, organized by continent/region
3. User can:
   - Filter flags by continent using tabs/dropdown
   - Search for specific flags/countries using the search bar
   - Sort flags alphabetically or by other criteria
4. User clicks on a flag:
   - Detailed view appears with country information
   - Fun facts and statistics are displayed
   - "Practice this flag" button allows direct learning of the selected flag
5. User can navigate back to library or home page

## Settings Flow

1. User clicks "Settings" from the home page
2. User can toggle:
   - Dark/Light mode
   - Sound effects
   - Difficulty level preferences
   - Language preferences (future feature)
3. User clicks "Save" to apply changes
4. System confirms settings update
5. User is returned to previous screen

## Authentication Flow

1. User clicks "Sign Up" button
2. User enters email and password
3. System validates inputs and creates account
4. User receives confirmation and is logged in
5. Alternatively, user clicks "Sign In" and enters credentials
6. System authenticates and redirects to home page with personalized content

## Competition Mode Flow (Future Feature)

1. User clicks "Competition Mode" from the home page
2. User selects difficulty level:
   - Beginner
   - Intermediate
   - Expert
3. System loads appropriate flag set based on difficulty
4. Timer starts (1.5 minutes)
5. User is rapidly presented with flags and must select answers:
   - Immediate feedback after each answer
   - Next flag appears automatically
6. When timer ends, score summary is displayed:
   - Total correct answers
   - Accuracy percentage
   - Longest streak
   - Comparison to previous attempts
7. User can share score, retry, or return to home page

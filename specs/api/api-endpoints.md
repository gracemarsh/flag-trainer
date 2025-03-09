# API Endpoints

This document outlines the API endpoints for the Flag Trainer application. The application uses a REST API built with Next.js API routes.

## Authentication Endpoints

These endpoints handle user authentication and are managed by NextAuth.js:

```
/api/auth/signin            - GET, POST: Handle sign-in requests
/api/auth/signup            - POST: Register new user
/api/auth/signout           - GET, POST: Handle sign-out requests
/api/auth/session           - GET: Get current session information
```

## Flag Endpoints

```
/api/flags                  - GET: Get all flags with optional filtering
                              Parameters:
                              - continent (string, optional): Filter by continent
                              - search (string, optional): Search by name
                              - sort (string, optional): Sort field (name, difficulty)
                              - order (string, optional): Sort order (asc, desc)
                              - limit (number, optional): Limit results
                              - offset (number, optional): Offset for pagination

/api/flags/:id              - GET: Get a specific flag by ID

/api/flags/random           - GET: Get a random flag
                              Parameters:
                              - difficulty (string, optional): Filter by difficulty
                              - continent (string, optional): Filter by continent

/api/flags/quiz             - GET: Get a flag with incorrect options for a quiz
                              Parameters:
                              - count (number, optional): Number of options to provide
                              - difficulty (string, optional): Filter by difficulty
```

## Learning Progress Endpoints

```
/api/progress               - GET: Get current user's learning progress
                              Parameters:
                              - limit (number, optional): Limit results
                              - offset (number, optional): Offset for pagination

/api/progress/:flagId       - GET: Get progress for a specific flag
                              POST: Update progress for a specific flag
                              Body:
                              {
                                "isCorrect": boolean,     // Whether the answer was correct
                                "timeSpent": number       // Time spent in milliseconds
                              }

/api/progress/next          - GET: Get next flag to review based on spaced repetition algorithm
                              Parameters:
                              - count (number, optional): Number of flags to return
```

## Competition Endpoints

```
/api/competition/scores     - GET: Get leaderboard scores
                              Parameters:
                              - difficulty (string, optional): Filter by difficulty
                              - limit (number, optional): Limit results
                              - offset (number, optional): Offset for pagination
                              POST: Submit a new score
                              Body:
                              {
                                "score": number,         // Total score
                                "difficulty": string,    // "beginner", "intermediate", "expert"
                                "streak": number,        // Highest streak
                                "accuracy": number,      // Percentage correct (0-100)
                                "totalAnswered": number, // Total flags answered
                                "timeSpent": number      // Total time in seconds
                              }

/api/competition/scores/:id - GET: Get a specific score by ID
```

## User Settings Endpoints

```
/api/settings               - GET: Get current user's settings
                              PUT: Update user settings
                              Body:
                              {
                                "darkMode": boolean,         // Dark mode preference
                                "soundEnabled": boolean,     // Sound effects toggle
                                "preferredDifficulty": string, // Default difficulty
                                "flagsPerSession": number    // Number of flags per learning session
                              }
```

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "error": {
    "code": string,         // Error code (e.g., "NOT_FOUND", "UNAUTHORIZED")
    "message": string,      // Human-readable error message
    "details": object       // Optional additional error details
  }
}
```

Standard HTTP status codes are used:

- 200: Success
- 201: Resource created
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Internal server error

## Authentication

Except for public endpoints (e.g., `/api/flags`), all API requests require authentication via:

1. Session cookie (for browser clients)
2. JWT token in the Authorization header (for potential future mobile clients)

For guest users, a guest ID should be provided in the request header:

```
X-Guest-ID: {uuid}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- 100 requests per minute for authenticated users
- 30 requests per minute for guest users (based on IP address)

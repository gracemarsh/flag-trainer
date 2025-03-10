# Spaced Repetition API Specification

## Overview

This document specifies the API endpoints necessary to support the spaced repetition learning system in the Flag Trainer application. These endpoints enable synchronization of learning progress, management of review schedules, and seamless transitions between anonymous and authenticated usage.

## Endpoints

### Progress Synchronization

#### `POST /api/progress/sync`

Synchronizes user progress data between client and server.

**Authentication:** Optional (supports both anonymous and authenticated users)

**Request:**

```json
{
  "guestId": "f8d7e6c5-b4a3-2c1d-0e9f-8g7h6i5j4k3l2m1n",
  "userId": "auth0|1234567890", // Optional, present for authenticated users
  "lastSyncedAt": 1652847362000, // Timestamp of last sync, optional for first sync
  "flags": [
    {
      "code": "US",
      "correctCount": 3,
      "incorrectCount": 1,
      "lastSeen": 1652847360000,
      "nextReviewDate": 1653452160000,
      "easeFactor": 2.36,
      "interval": 7
    }
    // More flag progress entries...
  ]
}
```

**Response:**

```json
{
  "success": true,
  "syncedAt": 1652847390000,
  "conflictResolved": false, // Indicates if server resolved any conflicts
  "stats": {
    "flagsUpdated": 12,
    "totalFlags": 45
  }
}
```

**Error Responses:**

- `400 Bad Request`: Invalid request format
- `401 Unauthorized`: Invalid authentication
- `500 Server Error`: Server processing error

#### `GET /api/progress`

Retrieves user's current progress data.

**Authentication:** Required (JWT token)

**Parameters:**

- `limit` (optional): Maximum number of flag progress records to return
- `offset` (optional): Offset for pagination
- `continent` (optional): Filter by continent

**Response:**

```json
{
  "userId": "auth0|1234567890",
  "stats": {
    "totalFlags": 223,
    "flagsSeen": 48,
    "correctCount": 87,
    "incorrectCount": 35,
    "averageEaseFactor": 2.41,
    "masteredCount": 5 // Flags with interval > 90 days
  },
  "flags": [
    {
      "code": "US",
      "name": "United States",
      "correctCount": 3,
      "incorrectCount": 1,
      "lastSeen": 1652847360000,
      "nextReviewDate": 1653452160000,
      "easeFactor": 2.36,
      "interval": 7
    }
    // More flag progress entries...
  ]
}
```

### Review Management

#### `GET /api/progress/due`

Retrieves flags due for review.

**Authentication:** Required (JWT token)

**Parameters:**

- `count` (optional): Maximum number of flags to return (default: 10)
- `includeNew` (optional): Whether to include new flags (default: true)
- `newRatio` (optional): Ratio of new flags to include (default: 0.3)
- `continent` (optional): Filter by continent

**Response:**

```json
{
  "dueCount": 5,
  "newCount": 3,
  "flags": [
    {
      // Due flag
      "id": 42,
      "code": "FR",
      "name": "France",
      "continent": "Europe",
      "imageUrl": "/flags/fr.svg",
      "progress": {
        "correctCount": 2,
        "incorrectCount": 1,
        "lastSeen": 1652847360000,
        "nextReviewDate": 1652847360000, // Due date in the past
        "easeFactor": 2.36,
        "interval": 7
      }
    },
    // More due flags...
    {
      // New flag (no progress data)
      "id": 78,
      "code": "KE",
      "name": "Kenya",
      "continent": "Africa",
      "imageUrl": "/flags/ke.svg"
    }
    // More new flags...
  ]
}
```

#### `POST /api/progress/update`

Updates progress for a specific flag after a review.

**Authentication:** Required (JWT token)

**Request:**

```json
{
  "flagCode": "FR",
  "isCorrect": true,
  "answerTime": 2500, // Time in milliseconds to answer
  "reviewedAt": 1652847360000
}
```

**Response:**

```json
{
  "success": true,
  "flagCode": "FR",
  "newProgress": {
    "correctCount": 3,
    "incorrectCount": 1,
    "lastSeen": 1652847360000,
    "nextReviewDate": 1653452160000,
    "easeFactor": 2.5,
    "interval": 7
  },
  "nextReview": "in 7 days"
}
```

### User Management

#### `POST /api/auth/signup`

Creates a new user account with optional progress migration from anonymous usage.

**Authentication:** None

**Request:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "progressData": {
    "guestId": "f8d7e6c5-b4a3-2c1d-0e9f-8g7h6i5j4k3l2m1n",
    "flags": {
      "US": {
        "correctCount": 3,
        "incorrectCount": 1,
        "lastSeen": 1652847360000,
        "nextReviewDate": 1653452160000,
        "easeFactor": 2.36,
        "interval": 7
      }
      // More flag progress entries...
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "auth0|1234567890",
    "email": "user@example.com"
  },
  "migrationStatus": {
    "success": true,
    "flagsImported": 12
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### `POST /api/auth/login`

Authenticates user and provides migration option for anonymous progress.

**Authentication:** None

**Request:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "progressData": {
    "guestId": "f8d7e6c5-b4a3-2c1d-0e9f-8g7h6i5j4k3l2m1n",
    "flags": {
      // Flag progress entries...
    }
  }
}
```

**Response:**

Same as `/api/auth/signup` response.

## Data Models

### Progress Record

```typescript
interface ProgressRecord {
  // User identification
  userId?: string; // For authenticated users
  guestId?: string; // For anonymous users

  // Flag identification
  flagCode: string; // ISO country code

  // Progress tracking
  correctCount: number; // Number of correct responses
  incorrectCount: number; // Number of incorrect responses
  lastSeen: number; // Timestamp of last review

  // Spaced repetition data
  nextReviewDate: number; // Timestamp of next scheduled review
  easeFactor: number; // Current ease factor (min 1.3)
  interval: number; // Current interval in days

  // Metadata
  createdAt: number; // Timestamp of first review
  updatedAt: number; // Timestamp of last update
}
```

## Authentication

This API uses JSON Web Tokens (JWT) for authentication. For authenticated endpoints:

1. Include token in Authorization header: `Authorization: Bearer <token>`
2. Token is obtained through the login or signup endpoints
3. Token expiration is handled by the auth service

## Error Handling

All endpoints return structured error responses:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAM",
    "message": "Invalid flag code provided",
    "details": {
      "param": "flagCode",
      "value": "XX"
    }
  }
}
```

Common error codes:

- `INVALID_PARAM`: Invalid parameter value
- `MISSING_PARAM`: Required parameter missing
- `AUTH_REQUIRED`: Authentication required
- `INVALID_AUTH`: Invalid authentication credentials
- `SERVER_ERROR`: Internal server error

## Implementation Considerations

### Performance Optimization

- Batch synchronization to reduce API calls
- Index database on `userId`, `flagCode`, and `nextReviewDate` for efficient queries
- Consider caching frequently accessed data with Redis

### Security Considerations

- All requests should use HTTPS
- Validate user permissions for all data access
- Rate limit API endpoints to prevent abuse
- Sanitize and validate all input data

### Offline Support

- Client should queue update requests when offline
- Implement conflict resolution strategy for data synced from multiple devices
- Store timestamp of last successful sync for comparison during future syncs

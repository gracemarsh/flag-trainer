# Authentication Specification

## Introduction

This document outlines the authentication requirements for the Flag Trainer application, detailing how users will sign up, sign in, and manage their authentication state.

## User Stories

1. As a guest user, I want to use the application without creating an account so I can try the features before committing.
2. As a new user, I want to create an account with email and password so I can save my progress across devices.
3. As a registered user, I want to sign in to access my saved progress and settings.
4. As a registered user, I want to reset my password if I forget it.
5. As a user, I want my session to persist across visits so I don't have to sign in every time.

## Functional Requirements

### 1. Authentication Methods

- Email and password authentication (primary method)
- Guest mode with local storage data persistence
- Future consideration: OAuth providers (Google, GitHub, etc.)

### 2. Registration Process

- Registration form with email and password fields
- Password requirements: minimum 8 characters, at least one uppercase letter, one lowercase letter, one number
- Email verification via sent link
- Terms of service and privacy policy acceptance
- Protection against automated registrations (rate limiting)

### 3. Sign-in Process

- Sign-in form with email and password fields
- "Remember me" option for extended session duration
- "Forgot password" link for password reset
- Rate limiting for failed attempts (security)

### 4. Guest Mode

- Automatic assignment of guest ID stored in local storage
- Progress data saved to local storage
- Clear option to upgrade to full account
- Data migration from guest to authenticated user upon registration

### 5. Session Management

- JWT-based authentication using NextAuth.js
- Session timeout after 30 days (with "remember me")
- Session timeout after 24 hours (without "remember me")
- Ability to sign out from all devices

### 6. Security Measures

- Passwords hashed and salted (never stored in plain text)
- CSRF protection on all authentication endpoints
- Rate limiting on sign-in and registration endpoints
- Input validation and sanitization
- HTTPS enforcement for all authentication operations

## Technical Implementation

### NextAuth.js Configuration

```typescript
// Basic NextAuth.js configuration
export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  pages: {
    signIn: '/sign-in',
    signUp: '/sign-up',
    error: '/auth-error',
    verifyRequest: '/verify-request',
  },
  session: {
    strategy: 'jwt',
  },
}
```

### Database Schema Integration

- Authentication tables managed by NextAuth.js with DrizzleAdapter
- Custom extensions for Flag Trainer-specific user data
- Guest user data migration process

### Client-Side Integration

- Authentication state management with React Context or Zustand
- Protected route handling with Next.js middleware
- Conditional UI based on authentication state

## Acceptance Criteria

- Users can successfully register with email and password
- Registration enforces password requirements and validates email format
- Users can sign in with valid credentials
- Invalid credentials result in appropriate error messages
- Password reset flow allows users to regain access to their account
- Guest users can use the application without registration
- Guest users can convert to registered accounts with data preservation
- Session persistence works as expected with "remember me" option
- Rate limiting prevents brute force attacks

## Related Specifications

- [Data Models](data-models.md) - User and session data models
- [API Endpoints](../api/api-endpoints.md) - Authentication endpoints

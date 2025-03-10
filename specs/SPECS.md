# Flag Trainer Application Specifications

## Project Overview

Flag Trainer is a web application designed to help users learn all the flags of the world through interactive gameplay and educational content. The app uses spaced repetition learning techniques to optimize memory retention and provide an engaging experience for users of all ages.

## Architecture

Flag Trainer uses a hybrid data approach:

- **Static Flag Data**: All flag information is stored as static JSON data in the application code, reducing database requests and improving performance
- **Database for User Data**: Turso (SQLite) is used exclusively for user session tracking and progress data
- **Client-side Processing**: Flag filtering, quiz generation, and other operations are performed client-side using the static data

## Core Features

- **Learning Mode**: Flashcard-style gameplay with spaced repetition
- **Flag Library**: Browse all flags with detailed country information
- **Competition Mode** (Future): Timed rounds with difficulty levels
- **User Accounts**: Progress tracking with optional authentication

## Specification Documents

### Core Application

- [Data Models](core/data-models.md): Database schema and data structures
- [Authentication](core/auth.md): User authentication and session management
- [Product Requirements](../product-requirements.md): Core product requirements and features
- [Spaced Repetition System](core/spaced-repetition.md): Detailed algorithm and implementation

### User Interface

- [User Flows](ui/user-flows.md): User journey descriptions and navigation flows
- [Components](ui/components.md): UI component specifications
- [Layouts](ui/layouts.md): Page layout specifications
- [Spaced Repetition UI](ui/spaced-repetition-ui.md): Spaced learning interface specifications

### API

- [API Endpoints](api/api-endpoints.md): REST API structure and documentation
- [Spaced Repetition API](api/spaced-repetition-api.md): API for spaced repetition synchronization

### Implementation

- [Spaced Repetition Client](implementation/spaced-repetition-client.md): Client-side implementation details

### Planning and Implementation

- [MVP Definition](plan/mvp.md): Minimum viable product specification
- [Roadmap](plan/roadmap.md): Development phases and timeline
- [Implementation Strategy](plan/implementation-strategy.md): Development workflow and methodologies
- [Testing Strategy](plan/testing-strategy.md): Testing approach and best practices

### Technology Stack

- [Overview](../techstack/overview.md): Technology stack summary
- [Frontend](../techstack/frontend.md): Frontend architecture
- [Backend](../techstack/backend.md): Backend architecture
- [Database](../techstack/database.md): Database architecture
- [Deployment](../techstack/deployment.md): Deployment strategy

## Project Progress

| Feature             | Specification | Implementation | Testing     | Status      |
| ------------------- | ------------- | -------------- | ----------- | ----------- |
| Learning Mode       | Complete      | Complete       | Complete    | Implemented |
| Flag Library        | Complete      | Complete       | Complete    | Implemented |
| Continent Learning  | Complete      | Complete       | Complete    | Implemented |
| Static Flag Data    | Complete      | Not Started    | Not Started | Planning    |
| Spaced Repetition   | Complete      | Not Started    | Not Started | Planning    |
| User Authentication | Complete      | Not Started    | Not Started | Planning    |
| Competition Mode    | Future        | Not Planned    | Not Planned | Future      |

## Development Timeline

Please refer to the [Roadmap](plan/roadmap.md) document for detailed development timeline and milestones.

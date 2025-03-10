# Flag Trainer Application Specifications

## Project Overview

Flag Trainer is a web application designed to help users learn all the flags of the world through interactive gameplay and educational content. The app uses spaced repetition learning techniques to optimize memory retention and provide an engaging experience for users of all ages.

## Architecture

Flag Trainer uses a hybrid data approach:

- **Static Flag Data**: All flag information is stored as static JSON data in the application code, reducing database requests and improving performance
- **Database for User Data**: Turso (SQLite) is used exclusively for user session tracking and progress data
- **Client-side Processing**: Flag filtering, quiz generation, and other operations are performed client-side using the static data
- **Local Storage for Guest Mode**: Anonymous users have progress tracked in local storage, which can be synchronized to the server upon account creation

## Core Features

- **Learning Mode**: Flashcard-style gameplay with spaced repetition
- **Flag Library**: Browse all flags with detailed country information
- **User Authentication**: Optional account creation with guest-to-authenticated data synchronization
- **Competition Mode** (Future): Timed rounds with difficulty levels

## Directory Structure

This specifications directory is organized according to domain and purpose:

```
specs/
├── SPECS.md                  # This file - main specification index
├── core/                     # Core domain functionality specifications
│   ├── auth.md               # Authentication specification
│   ├── data-models.md        # Data models and schema
│   ├── data-sync.md          # Data synchronization between client/server
│   ├── requirements.md       # Core requirements specification
│   └── spaced-repetition.md  # Spaced repetition algorithm specification
├── ui/                       # User interface specifications
│   ├── components.md         # UI component specifications
│   ├── layouts.md            # Page layout specifications
│   ├── spaced-repetition-ui.md # Spaced learning interface specifications
│   └── user-flows.md         # User journey descriptions and flows
├── api/                      # API specifications
│   ├── api-endpoints.md      # REST API structure and documentation
│   └── spaced-repetition-api.md # API for spaced repetition synchronization
├── implementation/           # Implementation specifications
│   ├── feature-name/         # Each feature has its own implementation directory
│   │   ├── 01-planning.md    # Planning document
│   │   ├── 02-design.md      # Design document
│   │   └── README.md         # Feature status tracking
│   ├── README.md             # Implementation directory overview
│   └── stateful-tracking.md  # Implementation status tracking
├── plan/                     # Project planning documents
│   ├── implementation-strategy.md # Development workflow
│   ├── mvp.md                # Minimum viable product definition
│   ├── README.md             # Planning directory overview
│   ├── roadmap.md            # Development timeline
│   └── testing-strategy.md   # Testing approach
└── techstack/                # Technology stack specifications
    ├── backend.md            # Backend architecture
    ├── database.md           # Database architecture
    ├── deployment.md         # Deployment strategy
    ├── frontend.md           # Frontend architecture
    ├── overview.md           # Technology overview
    └── README.md             # Technology stack directory overview
```

## Specification Documents

### Core Application

- [Requirements](core/requirements.md): Core product requirements and features
- [Data Models](core/data-models.md): Database schema and data structures
- [Authentication](core/auth.md): User authentication and session management
- [Data Synchronization](core/data-sync.md): Synchronization between local storage and server
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

- [Implementation Overview](implementation/README.md): Implementation approach and tracking
- [Spaced Repetition Client](implementation/spaced-repetition-client.md): Client-side implementation details
- [Data Synchronization](implementation/data-sync/README.md): Data sync implementation status

### Planning and Implementation

- [MVP Definition](plan/mvp.md): Minimum viable product specification
- [Roadmap](plan/roadmap.md): Development phases and timeline
- [Implementation Strategy](plan/implementation-strategy.md): Development workflow and methodologies
- [Testing Strategy](plan/testing-strategy.md): Testing approach and best practices

### Technology Stack

- [Technology Overview](techstack/README.md): Technology stack documentation overview
- [Frontend](techstack/frontend.md): Frontend architecture
- [Backend](techstack/backend.md): Backend architecture
- [Database](techstack/database.md): Database architecture
- [Deployment](techstack/deployment.md): Deployment strategy

## Project Progress

| Feature              | Specification | Implementation | Testing     | Status      |
| -------------------- | ------------- | -------------- | ----------- | ----------- |
| Learning Mode        | Complete      | Complete       | Complete    | Implemented |
| Flag Library         | Complete      | Complete       | Complete    | Implemented |
| Continent Learning   | Complete      | Complete       | Complete    | Implemented |
| Static Flag Data     | Complete      | Not Started    | Not Started | Planning    |
| Spaced Repetition    | Complete      | Not Started    | Not Started | Planning    |
| Data Synchronization | Complete      | Not Started    | Not Started | Planning    |
| User Authentication  | Complete      | Not Started    | Not Started | Planning    |
| Competition Mode     | Future        | Not Planned    | Not Planned | Future      |

## Development Timeline

Please refer to the [Roadmap](plan/roadmap.md) document for detailed development timeline and milestones.

# Deployment Strategy

## Hosting Platform

Flag Trainer will be deployed on Vercel for the frontend and serverless API, with Turso providing the globally distributed database. This combination offers several advantages for our application:

### Why Vercel?

1. **Next.js Integration**: Vercel is built by the creators of Next.js, ensuring optimal performance and compatibility
2. **Serverless Architecture**: Vercel's serverless model handles scaling automatically, with no server management required
3. **Edge Network**: Global CDN with edge locations worldwide for fast content delivery
4. **Preview Deployments**: Automatic preview deployments for each pull request, facilitating code review and testing
5. **Build Caching**: Intelligent caching of build artifacts to speed up deployments
6. **Analytics and Monitoring**: Built-in analytics and monitoring tools

### Why Turso?

1. **Edge-first Architecture**: Data is stored close to users for minimal latency
2. **Global Distribution**: Automatic replication across locations
3. **Free Tier Advantages**: 1 billion row reads per month for read-heavy applications
4. **Developer Experience**: Simple CLI tools for database management
5. **SQLite Compatibility**: Familiar SQL syntax with performance enhancements
6. **Serverless Friendly**: Designed for edge computing environments
7. **Low Operational Overhead**: No complex database infrastructure to manage

## Deployment Workflow

### CI/CD Pipeline

The application uses a continuous integration and deployment pipeline:

1. **Code Commit**: Developer commits code to a feature branch

2. **Automated Tests**: GitHub Actions runs:

   - Unit tests
   - Integration tests
   - End-to-end tests
   - Linting and type checking

3. **Pull Request**: Developer creates a PR to the main branch

4. **Preview Deployment**: Vercel automatically creates a preview deployment with a unique URL

5. **Database Sync**: Test database is automatically synced for the preview environment

6. **Code Review**: Team reviews code and tests the preview deployment

7. **Merge to Main**: After approval, code is merged to the main branch

8. **Production Deployment**: Vercel automatically deploys to production

9. **Post-Deployment Tests**: Automated smoke tests verify the deployment

```mermaid
graph TD
    A[Code Commit] --> B[Automated Tests]
    B --> C[Pull Request]
    C --> D[Preview Deployment]
    D --> E[Database Sync]
    E --> F[Code Review]
    F --> G[Merge to Main]
    G --> H[Production Deployment]
    H --> I[Post-Deployment Tests]
```

## Infrastructure as Code

The infrastructure is defined using configuration files:

### Vercel Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "regions": ["iad1", "sfo1", "cdg1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "NEXTAUTH_URL": "https://flag-trainer.vercel.app"
  }
}
```

### Environment Configuration

Environment variables are managed through the Vercel dashboard and included in the repository as `.env.example`:

```
# .env.example
# Authentication
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# Email Provider
EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=noreply@example.com

# Turso Database
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# Feature Flags
ENABLE_COMPETITION_MODE=false
```

## Environments

The application uses multiple environments for different stages of development:

1. **Development**: Local environment on developer machines

   - Local SQLite database file
   - Mock services where appropriate
   - Hot reloading for fast development

2. **Preview**: Temporary deployments for pull requests

   - Isolated Turso database branch per deployment
   - Seed data for testing
   - Access restricted to team members

3. **Staging**: Pre-production environment

   - Configuration mirroring production
   - Used for final testing before production release
   - Separate Turso database from production

4. **Production**: Live application
   - Maximum performance and reliability settings
   - Primary Turso database with redundancy
   - Analytics enabled

## Database Setup

### Turso Database Setup

1. **Create Database**:

   ```bash
   turso db create flag-trainer
   ```

2. **Create Auth Token**:

   ```bash
   turso db tokens create flag-trainer
   ```

3. **Enable Global Replication** (for production):

   ```bash
   turso db locations list             # List available locations
   turso db locations add fra flag-trainer  # Add Frankfurt location
   turso db locations add syd flag-trainer  # Add Sydney location
   ```

4. **Create Branches** (for development/staging):

   ```bash
   turso db branches create flag-trainer staging
   turso db branches create flag-trainer dev
   ```

5. **Database URL Format**:
   ```
   libsql://flag-trainer-[branch].[org-name].turso.io
   ```

### Schema Migration

Schema migrations are managed using Drizzle Kit:

```bash
# Generate migration
npx drizzle-kit generate:sqlite --schema=./lib/db/schema.ts --out=./drizzle

# Push migration to database
npx drizzle-kit push:sqlite --schema=./lib/db/schema.ts
```

In CI/CD pipeline, migrations are applied automatically during build:

```yaml
# Example GitHub Action step
- name: Apply database migrations
  run: npx drizzle-kit push:sqlite
  env:
    TURSO_DATABASE_URL: ${{ secrets.TURSO_DATABASE_URL }}
    TURSO_AUTH_TOKEN: ${{ secrets.TURSO_AUTH_TOKEN }}
```

## Resource Scaling

Vercel's serverless model handles scaling automatically, while Turso provides edge database capabilities:

### Serverless Function Configuration

```json
// .vercel/output/functions/api/flags.func/.vc-config.json
{
  "runtime": "nodejs18.x",
  "handler": "index.js",
  "maxDuration": 10,
  "memory": 1024
}
```

### Database Scaling

- **Development**: Local SQLite file or Free Turso tier (1 database, limited locations)
- **Production**: Turso Pro plan when needed
  - Multiple global locations for lower latency
  - Increased storage capacity (beyond 256MB)
  - Higher write limits (beyond 500,000/month)

## CDN and Caching Strategy

The application leverages Vercel's global CDN for static assets with the following caching strategy:

1. **Static Assets** (images, JS, CSS):

   - Long cache times (1 year)
   - Versioned file names for cache busting

2. **HTML Pages**:

   - Short cache times for dynamic pages
   - ISR (Incremental Static Regeneration) for semi-dynamic pages

3. **API Responses**:
   - No caching for user-specific data
   - Short-term caching for public data (flags, leaderboards)

## Monitoring and Logging

### Application Monitoring

- **Vercel Analytics**: Performance and usage metrics
- **Error tracking**: Integration with Sentry for error reporting
- **Custom logging**: Structured logs with correlation IDs

### Database Monitoring

- **Turso Dashboard**: Monitor database usage and performance
- **Query logs**: Enable for development and debugging
- **Custom metrics**: Track database operations in application code

### Alerting

- Slack notifications for:
  - Deployment success/failure
  - Error rate spikes
  - Performance degradation
  - Database usage thresholds

## Disaster Recovery

### Backup Strategy

- **Turso Automatic Backups**: Built-in backup functionality
- **Scheduled Exports**: Regular database dumps for additional safety
- **Point-in-time Recovery**: Through Turso dashboard when needed

### Recovery Process

1. **Database Recovery**:

   - Restore from Turso backups
   - Import from database dumps if needed

2. **Application Recovery**:
   - Rollback to previous deployment
   - Zero-downtime deployments for most updates

## Security Considerations

### Application Security

- HTTPS enforced for all connections
- CSP (Content Security Policy) headers
- Regular dependency updates

### Authentication Security

- JWT with appropriate expiration
- CSRF protection
- Rate limiting on auth endpoints

### Database Security

- Connection encryption with Turso
- Auth tokens with minimal necessary permissions
- Parameterized queries to prevent SQL injection

## Free Tier Considerations

Since we're using Turso's free tier, we need to be mindful of the following limitations:

1. **Database Size**: Limited to 256MB per database

   - Regularly monitor size usage
   - Implement data archiving strategy if needed

2. **Write Operations**: Limited to 500,000 row writes per month

   - Track write operations
   - Optimize by batching writes
   - Reduce unnecessary updates

3. **Number of Locations**: Limited on free tier

   - Strategically select locations based on user demographics
   - Monitor latency from different regions

4. **Database Count**: Limited to 3 databases on free tier
   - Use branches for different environments
   - Consolidate data where possible

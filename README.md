# Flag Trainer

A web application for learning and memorizing world flags using spaced repetition.

## Features

- **Flag Library**: Browse all flags of the world with detailed information about each country
- **Learning Modes**: Multiple ways to learn flags including quick sessions and spaced repetition
- **Progress Tracking**: Track your learning progress and see statistics about your performance
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: SQLite with Drizzle ORM
- **Authentication**: NextAuth.js (optional)
- **Package Manager**: pnpm for faster and efficient dependency management

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm (recommended over npm)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/flag-trainer.git
   cd flag-trainer
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` with your configuration.

4. Generate the database schema:

   ```bash
   pnpm db:generate
   ```

5. Push the schema to the database:

   ```bash
   pnpm db:push
   ```

6. Seed the database with initial flag data:

   ```bash
   pnpm db:seed
   ```

7. Start the development server:

   ```bash
   pnpm dev
   ```

8. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app` - Next.js app router pages and layouts
- `/components` - Reusable UI components
- `/lib` - Utility functions and database configuration
- `/public` - Static assets including flag images
- `/scripts` - Database seeding and other scripts

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

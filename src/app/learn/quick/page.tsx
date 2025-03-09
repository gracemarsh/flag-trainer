import { db } from '@/lib/db'
import { schema } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { QuickLearningSession } from '@/components/quick-learning-session'

export default async function QuickSessionPage() {
  // Get 10 random flags for the quick session
  const randomFlags = await db.query.flags.findMany({
    orderBy: sql`RANDOM()`,
    limit: 10,
  })

  return (
    <div className='container py-8'>
      <div className='flex flex-col items-start gap-4 mb-8'>
        <h1 className='text-3xl font-bold'>Quick Learning Session</h1>
        <p className='text-muted-foreground'>
          Test your knowledge with 10 random flags from around the world.
        </p>
      </div>

      <QuickLearningSession flags={randomFlags} />
    </div>
  )
}

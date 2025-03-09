import { db } from '@/lib/db'
import { schema } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function StatsPage() {
  // Get total count of flags
  const flagCount = await db.select({ count: db.fn.count() }).from(schema.flags)
  const totalFlags = flagCount[0].count

  return (
    <div className='container py-8'>
      <div className='flex flex-col items-start gap-4 mb-8'>
        <h1 className='text-3xl font-bold'>Your Statistics</h1>
        <p className='text-muted-foreground'>
          Track your progress and see how your knowledge improves over time.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle>Total Flags</CardTitle>
            <CardDescription>Available in the database</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{totalFlags}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle>Flags Learned</CardTitle>
            <CardDescription>Sign in to track progress</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle>Accuracy</CardTitle>
            <CardDescription>Your correct answer rate</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>0%</p>
          </CardContent>
        </Card>
      </div>

      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>Learning Progress</CardTitle>
          <CardDescription>
            Sign in to track your learning progress across all flags
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-64 flex items-center justify-center border rounded-md bg-muted/20'>
            <p className='text-muted-foreground'>Sign in to view your learning progress</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent learning sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='border rounded-md p-4 flex flex-col gap-2'>
              <p className='text-muted-foreground text-sm'>No recent activity</p>
              <p className='text-sm'>Sign in to track your learning sessions and progress.</p>
            </div>

            <div className='flex justify-center'>
              <Button asChild>
                <Link href='/login'>Sign In</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

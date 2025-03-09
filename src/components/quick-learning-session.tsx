'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { schema } from '@/lib/db'
import { InferSelectModel } from 'drizzle-orm'
import { getFlagUrl } from '@/lib/utils'
import { trackSessionStart, trackSessionComplete, trackAnswer } from '@/lib/analytics'

type Flag = InferSelectModel<typeof schema.flags>

interface QuickLearningSessionProps {
  flags: Flag[]
}

export function QuickLearningSession({ flags }: QuickLearningSessionProps) {
  // Always declare hooks at the top level
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [isSessionComplete, setIsSessionComplete] = useState(false)
  const [startTime] = useState(() => Date.now())
  const [answerStartTime, setAnswerStartTime] = useState(() => Date.now())

  // Track session start
  useEffect(() => {
    if (flags && flags.length > 0) {
      trackSessionStart('quick', flags.length)
    }
  }, [flags])

  // Guard clause for empty flags array
  if (!flags || flags.length === 0) {
    return (
      <Card className='max-w-2xl mx-auto'>
        <CardHeader>
          <CardTitle>No Flags Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-center mb-6'>There are no flags available for this session.</p>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <Button asChild>
            <Link href='/learn'>Back to Learn</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const currentFlag = flags[currentIndex]

  // Safety check to make sure currentFlag exists
  if (!currentFlag) {
    return (
      <Card className='max-w-2xl mx-auto'>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-center mb-6'>There was an error loading the current flag.</p>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <Button asChild>
            <Link href='/learn'>Back to Learn</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Generate 3 random incorrect options
  const generateOptions = () => {
    const options = [currentFlag.name]
    const otherFlags = [...flags].filter((f) => f.id !== currentFlag.id)

    // Shuffle and take 3
    for (let i = otherFlags.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[otherFlags[i], otherFlags[j]] = [otherFlags[j], otherFlags[i]]
    }

    options.push(...otherFlags.slice(0, 3).map((f) => f.name))

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[options[i], options[j]] = [options[j], options[i]]
    }

    return options
  }

  const options = generateOptions()

  const handleAnswer = () => {
    if (!selectedAnswer) return

    const isCorrect = selectedAnswer === currentFlag.name
    const responseTimeMs = Date.now() - answerStartTime

    setIsAnswered(true)
    if (isCorrect) {
      setScore(score + 1)
    }

    // Track the answer with analytics
    trackAnswer(currentFlag.code, isCorrect, responseTimeMs)
  }

  const handleNext = () => {
    // Reset the answer start time for the next question
    setAnswerStartTime(Date.now())

    if (currentIndex < flags.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
    } else {
      setIsSessionComplete(true)

      // Track session completion
      const sessionDurationSeconds = Math.floor((Date.now() - startTime) / 1000)
      trackSessionComplete(
        'quick',
        score + (selectedAnswer === currentFlag.name ? 1 : 0),
        flags.length,
        sessionDurationSeconds
      )
    }
  }

  if (isSessionComplete) {
    return (
      <Card className='max-w-2xl mx-auto'>
        <CardHeader>
          <CardTitle>Session Complete!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center mb-6'>
            <p className='text-4xl font-bold mb-2'>
              {score} / {flags.length}
            </p>
            <p className='text-muted-foreground'>
              You got {score} out of {flags.length} flags correct!
            </p>
          </div>

          <div className='flex flex-col gap-4'>
            <p className='text-center'>
              {score === flags.length
                ? "Perfect score! You're a flag expert!"
                : score >= flags.length / 2
                  ? 'Good job! Keep practicing to improve your score.'
                  : "Keep learning! You'll get better with practice."}
            </p>
          </div>
        </CardContent>
        <CardFooter className='flex justify-between'>
          <Button asChild variant='outline'>
            <Link href='/learn'>Back to Learn</Link>
          </Button>
          <Button asChild>
            <Link href='/learn/quick'>Try Again</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className='max-w-2xl mx-auto'>
      <CardHeader>
        <div className='flex justify-between items-center'>
          <CardTitle>
            Flag {currentIndex + 1} of {flags.length}
          </CardTitle>
          <div className='text-sm text-muted-foreground'>
            Score: {score}/{currentIndex}
          </div>
        </div>
        <Progress value={(currentIndex / flags.length) * 100} className='h-2' />
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='aspect-video relative overflow-hidden rounded-lg border'>
          <Image src={getFlagUrl(currentFlag.code, 640)} alt='Flag' fill className='object-cover' />
        </div>

        <div>
          <h3 className='text-lg font-medium mb-3'>Which country does this flag belong to?</h3>
          <RadioGroup value={selectedAnswer || ''} onValueChange={setSelectedAnswer}>
            {options.map((option, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 p-3 rounded-md border ${
                  isAnswered && option === currentFlag.name
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                    : isAnswered && option === selectedAnswer
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                      : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                <RadioGroupItem value={option} id={`option-${index}`} disabled={isAnswered} />
                <Label htmlFor={`option-${index}`} className='flex-grow cursor-pointer'>
                  {option}
                </Label>
                {isAnswered && option === currentFlag.name && (
                  <span className='text-green-600'>✓</span>
                )}
                {isAnswered && option === selectedAnswer && option !== currentFlag.name && (
                  <span className='text-red-600'>✗</span>
                )}
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className='flex justify-between'>
        {!isAnswered ? (
          <Button onClick={handleAnswer} disabled={!selectedAnswer}>
            Check Answer
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {currentIndex < flags.length - 1 ? 'Next Flag' : 'See Results'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

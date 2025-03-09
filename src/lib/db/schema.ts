import { relations } from 'drizzle-orm'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createId } from '@paralleldrive/cuid2'

// Flags table
export const flags = sqliteTable('flags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  continent: text('continent').notNull(),
  population: integer('population'),
  languages: text('languages'),
  funFacts: text('fun_facts'),
  difficulty: integer('difficulty').default(1),
  imageUrl: text('image_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: integer('email_verified', { mode: 'timestamp' }),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// User progress for each flag
export const userProgress = sqliteTable('user_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  flagId: integer('flag_id')
    .notNull()
    .references(() => flags.id, { onDelete: 'cascade' }),
  familiarity: integer('familiarity').default(0), // 0-5 scale
  correctCount: integer('correct_count').default(0),
  incorrectCount: integer('incorrect_count').default(0),
  lastReviewed: integer('last_reviewed', { mode: 'timestamp' }),
  nextReviewDate: integer('next_review_date', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// Learning sessions
export const learningSessions = sqliteTable('learning_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  startedAt: integer('started_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  endedAt: integer('ended_at', { mode: 'timestamp' }),
  flagsReviewed: integer('flags_reviewed').default(0),
  correctAnswers: integer('correct_answers').default(0),
  incorrectAnswers: integer('incorrect_answers').default(0),
})

// Session flags - which flags were reviewed in a session
export const sessionFlags = sqliteTable('session_flags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: integer('session_id')
    .notNull()
    .references(() => learningSessions.id, { onDelete: 'cascade' }),
  flagId: integer('flag_id')
    .notNull()
    .references(() => flags.id, { onDelete: 'cascade' }),
  wasCorrect: integer('was_correct', { mode: 'boolean' }),
  reviewedAt: integer('reviewed_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// Relations
export const flagsRelations = relations(flags, ({ many }) => ({
  userProgress: many(userProgress),
  sessionFlags: many(sessionFlags),
}))

export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
  sessions: many(learningSessions),
}))

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  flag: one(flags, {
    fields: [userProgress.flagId],
    references: [flags.id],
  }),
}))

export const learningSessionsRelations = relations(learningSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [learningSessions.userId],
    references: [users.id],
  }),
  flags: many(sessionFlags),
}))

export const sessionFlagsRelations = relations(sessionFlags, ({ one }) => ({
  session: one(learningSessions, {
    fields: [sessionFlags.sessionId],
    references: [learningSessions.id],
  }),
  flag: one(flags, {
    fields: [sessionFlags.flagId],
    references: [flags.id],
  }),
}))

// Schema for competition scores
export const scores = sqliteTable('scores', {
  id: text('id')
    .primaryKey()
    .notNull()
    .default(() => createId()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  guestId: text('guest_id'), // For guest users (stored in local storage)
  score: integer('score').notNull(), // Total score
  difficulty: text('difficulty').notNull(), // 'beginner', 'intermediate', 'expert'
  streak: integer('streak').notNull(), // Highest consecutive correct answers
  accuracy: real('accuracy').notNull(), // Percentage correct
  totalAnswered: integer('total_answered').notNull(), // Total flags attempted
  timeSpent: integer('time_spent'), // Time in seconds
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().defaultNow(),
})

// Schema for user settings
export const userSettings = sqliteTable('user_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  darkMode: integer('dark_mode', { mode: 'boolean' }).default(0), // SQLite doesn't have boolean
  soundEnabled: integer('sound_enabled', { mode: 'boolean' }).default(1),
  preferredDifficulty: text('preferred_difficulty').default('beginner'),
  flagsPerSession: integer('flags_per_session').default(10),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().defaultNow(),
})

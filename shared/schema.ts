import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table (instructors and patients)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'instructor' or 'patient'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Patients table (extended info for patients)
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  instructorId: integer("instructor_id").references(() => users.id).notNull(),
  dateOfBirth: timestamp("date_of_birth"),
  medicalConditions: text("medical_conditions"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Therapy types
export const therapyTypes = pgTable("therapy_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  targetCondition: text("target_condition").notNull(),
});

// Postures
export const postures = pgTable("postures", {
  id: serial("id").primaryKey(),
  sanskritName: text("sanskrit_name").notNull(),
  spanishName: text("spanish_name").notNull(),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  instructions: text("instructions").notNull(),
  benefits: text("benefits").notNull(),
  modifications: text("modifications"),
  duration: integer("duration").notNull(), // in seconds
  therapyTypeIds: integer("therapy_type_ids").array(),
});

// Series (therapy series)
export const series = pgTable("series", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  instructorId: integer("instructor_id").references(() => users.id).notNull(),
  therapyTypeId: integer("therapy_type_id").references(() => therapyTypes.id).notNull(),
  recommendedSessions: integer("recommended_sessions").notNull(),
  estimatedDuration: integer("estimated_duration").notNull(), // in minutes
  postureIds: integer("posture_ids").array().notNull(),
  postureDurations: integer("posture_durations").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Patient series assignments
export const patientSeries = pgTable("patient_series", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  seriesId: integer("series_id").references(() => series.id).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  completedSessions: integer("completed_sessions").default(0).notNull(),
});

// Sessions (individual session records)
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  seriesId: integer("series_id").references(() => series.id).notNull(),
  preIntensity: text("pre_intensity").notNull(), // 'none', 'moderate', 'intense'
  postIntensity: text("post_intensity").notNull(),
  comments: text("comments").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  duration: integer("duration"), // actual duration in minutes
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  patientsAsInstructor: many(patients, { relationName: "instructor" }),
  patientProfile: many(patients, { relationName: "patient" }),
  series: many(series),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, {
    fields: [patients.userId],
    references: [users.id],
    relationName: "patient",
  }),
  instructor: one(users, {
    fields: [patients.instructorId],
    references: [users.id],
    relationName: "instructor",
  }),
  assignments: many(patientSeries),
  sessions: many(sessions),
}));

export const therapyTypesRelations = relations(therapyTypes, ({ many }) => ({
  series: many(series),
}));

export const posturesRelations = relations(postures, ({ many }) => ({
  series: many(series),
}));

export const seriesRelations = relations(series, ({ one, many }) => ({
  instructor: one(users, {
    fields: [series.instructorId],
    references: [users.id],
  }),
  therapyType: one(therapyTypes, {
    fields: [series.therapyTypeId],
    references: [therapyTypes.id],
  }),
  assignments: many(patientSeries),
  sessions: many(sessions),
}));

export const patientSeriesRelations = relations(patientSeries, ({ one }) => ({
  patient: one(patients, {
    fields: [patientSeries.patientId],
    references: [patients.id],
  }),
  series: one(series, {
    fields: [patientSeries.seriesId],
    references: [series.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  patient: one(patients, {
    fields: [sessions.patientId],
    references: [patients.id],
  }),
  series: one(series, {
    fields: [sessions.seriesId],
    references: [sessions.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
});

export const insertTherapyTypeSchema = createInsertSchema(therapyTypes).omit({
  id: true,
});

export const insertPostureSchema = createInsertSchema(postures).omit({
  id: true,
});

export const insertSeriesSchema = createInsertSchema(series).omit({
  id: true,
  createdAt: true,
});

export const insertPatientSeriesSchema = createInsertSchema(patientSeries).omit({
  id: true,
  assignedAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  completedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type TherapyType = typeof therapyTypes.$inferSelect;
export type InsertTherapyType = z.infer<typeof insertTherapyTypeSchema>;
export type Posture = typeof postures.$inferSelect;
export type InsertPosture = z.infer<typeof insertPostureSchema>;
export type Series = typeof series.$inferSelect;
export type InsertSeries = z.infer<typeof insertSeriesSchema>;
export type PatientSeries = typeof patientSeries.$inferSelect;
export type InsertPatientSeries = z.infer<typeof insertPatientSeriesSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;

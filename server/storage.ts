import { 
  users, patients, therapyTypes, postures, series, patientSeries, sessions,
  type User, type InsertUser, type Patient, type InsertPatient,
  type TherapyType, type InsertTherapyType, type Posture, type InsertPosture,
  type Series, type InsertSeries, type PatientSeries, type InsertPatientSeries,
  type Session, type InsertSession
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Patients
  getPatient(id: number): Promise<Patient | undefined>;
  getPatientsByInstructor(instructorId: number): Promise<(Patient & { user: User })[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, updates: Partial<InsertPatient>): Promise<Patient>;
  
  // Therapy Types
  getTherapyTypes(): Promise<TherapyType[]>;
  createTherapyType(therapyType: InsertTherapyType): Promise<TherapyType>;
  
  // Postures
  getPostures(): Promise<Posture[]>;
  getPosturesByTherapyType(therapyTypeId: number): Promise<Posture[]>;
  getPosturesByIds(ids: number[]): Promise<Posture[]>;
  createPosture(posture: InsertPosture): Promise<Posture>;
  
  // Series
  getSeries(id: number): Promise<Series | undefined>;
  getSeriesByInstructor(instructorId: number): Promise<Series[]>;
  createSeries(series: InsertSeries): Promise<Series>;
  
  // Patient Series
  getPatientSeries(patientId: number): Promise<(PatientSeries & { series: Series })[]>;
  getActivePatientSeries(patientId: number): Promise<(PatientSeries & { series: Series }) | undefined>;
  assignSeriesToPatient(assignment: InsertPatientSeries): Promise<PatientSeries>;
  deactivatePatientSeries(patientId: number): Promise<void>;
  
  // Sessions
  createSession(session: InsertSession): Promise<Session>;
  getSessionsByPatient(patientId: number): Promise<Session[]>;
  getSessionsBySeriesAndPatient(seriesId: number, patientId: number): Promise<Session[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async getPatientsByInstructor(instructorId: number): Promise<(Patient & { user: User })[]> {
    return await db
      .select()
      .from(patients)
      .innerJoin(users, eq(patients.userId, users.id))
      .where(eq(patients.instructorId, instructorId))
      .then(rows => 
        rows.map(row => ({
          ...row.patients,
          user: row.users
        }))
      );
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const [newPatient] = await db
      .insert(patients)
      .values(patient)
      .returning();
    return newPatient;
  }

  async updatePatient(id: number, updates: Partial<InsertPatient>): Promise<Patient> {
    const [patient] = await db
      .update(patients)
      .set(updates)
      .where(eq(patients.id, id))
      .returning();
    return patient;
  }

  async getTherapyTypes(): Promise<TherapyType[]> {
    return await db.select().from(therapyTypes).orderBy(asc(therapyTypes.name));
  }

  async createTherapyType(therapyType: InsertTherapyType): Promise<TherapyType> {
    const [newType] = await db
      .insert(therapyTypes)
      .values(therapyType)
      .returning();
    return newType;
  }

  async getPostures(): Promise<Posture[]> {
    return await db.select().from(postures).orderBy(asc(postures.spanishName));
  }

  async getPosturesByTherapyType(therapyTypeId: number): Promise<Posture[]> {
    return await db
      .select()
      .from(postures)
      .where(eq(postures.therapyTypeIds, [therapyTypeId]))
      .orderBy(asc(postures.spanishName));
  }

  async getPosturesByIds(ids: number[]): Promise<Posture[]> {
    if (ids.length === 0) return [];
    return await db
      .select()
      .from(postures)
      .where(eq(postures.id, ids[0])) // Simplified for now
      .orderBy(asc(postures.spanishName));
  }

  async createPosture(posture: InsertPosture): Promise<Posture> {
    const [newPosture] = await db
      .insert(postures)
      .values(posture)
      .returning();
    return newPosture;
  }

  async getSeries(id: number): Promise<Series | undefined> {
    const [seriesData] = await db.select().from(series).where(eq(series.id, id));
    return seriesData || undefined;
  }

  async getSeriesByInstructor(instructorId: number): Promise<Series[]> {
    return await db
      .select()
      .from(series)
      .where(eq(series.instructorId, instructorId))
      .orderBy(desc(series.createdAt));
  }

  async createSeries(seriesData: InsertSeries): Promise<Series> {
    const [newSeries] = await db
      .insert(series)
      .values(seriesData)
      .returning();
    return newSeries;
  }

  async getPatientSeries(patientId: number): Promise<(PatientSeries & { series: Series })[]> {
    return await db
      .select()
      .from(patientSeries)
      .innerJoin(series, eq(patientSeries.seriesId, series.id))
      .where(eq(patientSeries.patientId, patientId))
      .orderBy(desc(patientSeries.assignedAt))
      .then(rows => 
        rows.map(row => ({
          ...row.patient_series,
          series: row.series
        }))
      );
  }

  async getActivePatientSeries(patientId: number): Promise<(PatientSeries & { series: Series }) | undefined> {
    const [assignment] = await db
      .select()
      .from(patientSeries)
      .innerJoin(series, eq(patientSeries.seriesId, series.id))
      .where(and(
        eq(patientSeries.patientId, patientId),
        eq(patientSeries.isActive, true)
      ));
    
    return assignment ? {
      ...assignment.patient_series,
      series: assignment.series
    } : undefined;
  }

  async assignSeriesToPatient(assignment: InsertPatientSeries): Promise<PatientSeries> {
    // First deactivate any existing active series
    await this.deactivatePatientSeries(assignment.patientId);
    
    const [newAssignment] = await db
      .insert(patientSeries)
      .values(assignment)
      .returning();
    return newAssignment;
  }

  async deactivatePatientSeries(patientId: number): Promise<void> {
    await db
      .update(patientSeries)
      .set({ isActive: false })
      .where(and(
        eq(patientSeries.patientId, patientId),
        eq(patientSeries.isActive, true)
      ));
  }

  async createSession(session: InsertSession): Promise<Session> {
    const [newSession] = await db
      .insert(sessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getSessionsByPatient(patientId: number): Promise<Session[]> {
    return await db
      .select()
      .from(sessions)
      .where(eq(sessions.patientId, patientId))
      .orderBy(desc(sessions.completedAt));
  }

  async getSessionsBySeriesAndPatient(seriesId: number, patientId: number): Promise<Session[]> {
    return await db
      .select()
      .from(sessions)
      .where(and(
        eq(sessions.seriesId, seriesId),
        eq(sessions.patientId, patientId)
      ))
      .orderBy(desc(sessions.completedAt));
  }
}

export const storage = new DatabaseStorage();

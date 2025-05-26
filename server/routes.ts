import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { loginSchema, registerSchema, insertPatientSchema, insertSeriesSchema, insertSessionSchema } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware for authentication
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET) as any;
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Middleware for instructor-only routes
const requireInstructor = (req: any, res: any, next: any) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Instructor access required' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default data
  await initializeDefaultData();

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: validatedData.role,
      });

      // Create patient profile if role is patient
      if (user.role === 'patient') {
        await storage.createPatient({
          userId: user.id,
          instructorId: 1, // Default to first instructor for now
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Instructor routes
  app.get("/api/patients", authenticateToken, requireInstructor, async (req: any, res) => {
    try {
      const patients = await storage.getPatientsByInstructor(req.user.id);
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/patients", authenticateToken, requireInstructor, async (req: any, res) => {
    try {
      const patientData = insertPatientSchema.parse({
        ...req.body,
        instructorId: req.user.id,
      });
      
      const patient = await storage.createPatient(patientData);
      res.json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/series", authenticateToken, requireInstructor, async (req: any, res) => {
    try {
      const seriesList = await storage.getSeriesByInstructor(req.user.id);
      res.json(seriesList);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/series", authenticateToken, requireInstructor, async (req: any, res) => {
    try {
      const seriesData = insertSeriesSchema.parse({
        ...req.body,
        instructorId: req.user.id,
      });
      
      const newSeries = await storage.createSeries(seriesData);
      res.json(newSeries);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/patients/:patientId/assign-series", authenticateToken, requireInstructor, async (req: any, res) => {
    try {
      const { patientId } = req.params;
      const { seriesId } = req.body;
      
      const assignment = await storage.assignSeriesToPatient({
        patientId: parseInt(patientId),
        seriesId: parseInt(seriesId),
        isActive: true,
        completedSessions: 0,
      });
      
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/therapy-types", authenticateToken, async (req, res) => {
    try {
      const therapyTypes = await storage.getTherapyTypes();
      res.json(therapyTypes);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/postures", authenticateToken, async (req, res) => {
    try {
      const postures = await storage.getPostures();
      res.json(postures);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Patient routes
  app.get("/api/my-series", authenticateToken, async (req: any, res) => {
    try {
      // Get patient profile
      const patients = await storage.getPatientsByInstructor(0); // This needs to be refactored
      const patient = patients.find(p => p.userId === req.user.id);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient profile not found" });
      }

      const assignment = await storage.getActivePatientSeries(patient.id);
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/sessions", authenticateToken, async (req: any, res) => {
    try {
      // Get patient profile
      const patients = await storage.getPatientsByInstructor(0); // This needs to be refactored
      const patient = patients.find(p => p.userId === req.user.id);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient profile not found" });
      }

      const sessionData = insertSessionSchema.parse({
        ...req.body,
        patientId: patient.id,
      });
      
      const session = await storage.createSession(sessionData);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function initializeDefaultData() {
  try {
    // Check if therapy types exist
    const existingTypes = await storage.getTherapyTypes();
    if (existingTypes.length === 0) {
      // Create default therapy types
      await storage.createTherapyType({
        name: "Ansiedad",
        description: "Terapia de yoga para reducir la ansiedad y promover la relajación",
        targetCondition: "anxiety"
      });

      await storage.createTherapyType({
        name: "Artritis",
        description: "Yoga suave para mejorar la movilidad articular",
        targetCondition: "arthritis"
      });

      await storage.createTherapyType({
        name: "Dolor de Espalda",
        description: "Fortalecimiento y estiramiento para aliviar el dolor de espalda",
        targetCondition: "back_pain"
      });

      // Create default postures
      const anxietyPostures = [
        {
          sanskritName: "Balasana",
          spanishName: "Postura del Niño",
          imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          instructions: "Siéntate sobre los talones, inclínate hacia adelante con los brazos extendidos. Respira profundamente.",
          benefits: "Calma la mente, reduce el estrés, estira la espalda baja",
          modifications: "Coloca una almohada bajo las rodillas si hay molestias",
          duration: 180,
          therapyTypeIds: [1]
        },
        {
          sanskritName: "Padmasana",
          spanishName: "Postura del Loto",
          imageUrl: "https://images.unsplash.com/photo-1591228127791-8e2eaef098d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          instructions: "Siéntate con las piernas cruzadas, mantén la columna erecta, manos sobre las rodillas.",
          benefits: "Mejora la concentración, calma la mente, fortalece la postura",
          modifications: "Usa un cojín bajo las caderas para mayor comodidad",
          duration: 300,
          therapyTypeIds: [1]
        }
      ];

      const arthritisPostures = [
        {
          sanskritName: "Marjaryasana",
          spanishName: "Postura del Gato",
          imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          instructions: "En cuatro patas, alterna entre arquear y redondear la espalda suavemente.",
          benefits: "Mejora la flexibilidad espinal, fortalece el core",
          modifications: "Realiza movimientos más pequeños si hay rigidez",
          duration: 120,
          therapyTypeIds: [2]
        }
      ];

      const backPainPostures = [
        {
          sanskritName: "Adho Mukha Svanasana",
          spanishName: "Perro boca abajo",
          imageUrl: "https://images.unsplash.com/photo-1588286840104-8957b019727f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          instructions: "Desde cuatro patas, levanta las caderas hacia arriba formando una V invertida.",
          benefits: "Fortalece brazos y piernas, estira la columna vertebral",
          modifications: "Flexiona las rodillas si hay tensión en las piernas",
          duration: 90,
          therapyTypeIds: [3]
        }
      ];

      for (const posture of [...anxietyPostures, ...arthritisPostures, ...backPainPostures]) {
        await storage.createPosture(posture);
      }
    }
  } catch (error) {
    console.error("Error initializing default data:", error);
  }
}

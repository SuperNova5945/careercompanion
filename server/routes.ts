import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage-minimal";
// import { seedDatabase } from "./seedData"; // Temporarily disabled due to schema issues
import { 
  generateResumeFromLinkedIn, 
  improveResume, 
  analyzeJobMatch, 
  generateLinkedInPost, 
  generateCareerAdvice 
} from "./services/openai";
import { pythonGaiService } from "./services/pythonGaiService";
import axios from 'axios';
import { exportResumeToPDF, exportResumeToDocx } from "./services/resumeExport";
import { insertResumeSchema, insertJobApplicationSchema, insertLinkedinPostSchema, insertChatMessageSchema } from "@shared/schema";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database with seed data on startup
  let mockUserId = "mock-user-id";
  
  try {
    // Try to seed the database, but don't fail if it already exists
    // const seedResult = await seedDatabase(); // Temporarily disabled due to schema issues
    // mockUserId = seedResult.user.id;
    console.log("Database seeding temporarily disabled - using mock user ID");
  } catch (error) {
    console.log("Database may already be seeded, continuing...");
    // Use default mock user ID if seed fails
    console.log("Using default mock user ID");
  }

  // Dashboard API
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const applications = await storage.getUserApplications(mockUserId);
      const learningPaths = await storage.getUserLearningPaths(mockUserId);
      const badges = await storage.getUserBadges(mockUserId);

      const stats = {
        applications: applications.length,
        interviews: applications.filter(app => app.status === 'interview').length,
        referrals: 8, // This would come from a referrals system
        badges: badges.length,
        learningStreak: 7, // This would be calculated from learning activity
        weeklyHours: 12 // This would be tracked from learning sessions
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Test endpoint to verify server is responding
  app.get("/api/test", (req, res) => {
    console.log("Test endpoint hit");
    res.json({ status: "Server is working", timestamp: new Date().toISOString() });
  });

  // Direct test endpoint for Python service connection
  app.post("/api/test/python-direct", async (req, res) => {
    try {
      console.log("Testing direct Python service connection...");
      
      const response = await axios.post('http://127.0.0.1:8000/api/linkedin/generate-resume', {
        linkedin_url: 'https://linkedin.com/in/test',
        target_role: 'Software Engineer',
        user_profile: { userId: 'test' }
      }, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log("Direct Python service test successful:", response.status);
      res.json({ 
        status: 'success', 
        pythonResponse: response.data,
        message: 'Direct Python service connection works'
      });
    } catch (error: any) {
      console.error("Direct Python service test failed:", error.message);
      res.status(500).json({ 
        status: 'error', 
        message: error.message,
        code: error.code
      });
    }
  });

  // Test endpoint
  app.get("/api/test", (req, res) => {
    console.log("TEST ENDPOINT HIT");
    res.json({ message: "Test endpoint working" });
  });

  // Resume API - Using Python GAI service
  app.post("/api/resume/generate", async (req, res) => {
    console.log("=== RESUME GENERATION ENDPOINT HIT (UPDATED VERSION) ===");
    
    try {
      const { linkedinUrl, targetRole } = req.body;
      console.log("Resume generation request:", { linkedinUrl, targetRole });
      
      if (!linkedinUrl) {
        return res.status(400).json({ message: "LinkedIn URL is required" });
      }

      // Call Python GAI service to generate resume
      console.log("Calling Python GAI service...");
      const pythonResponse = await pythonGaiService.generateResumeFromLinkedIn({
        linkedin_url: linkedinUrl,
        target_role: targetRole
      });

      console.log("Python GAI response content:", pythonResponse.resume_content);
      console.log("Python GAI response stringified content:", JSON.stringify(pythonResponse.resume_content));
      console.log("Python GAI response:", { success: pythonResponse.success });

      if (pythonResponse.success && pythonResponse.resume_content) {
        console.log("LinkedIn GAI resume generation successful - bypassing database save");
        
        // Bypass database save for now to test LinkedIn GAI integration
        res.json({ 
          success: true,
          content: pythonResponse.resume_content,
          message: "Resume generated successfully using LinkedIn GAI (database save bypassed)"
        });
      } else {
        // Fallback to mock resume if Python service fails
        console.log("Python GAI service failed, using fallback resume");
        const fallbackContent = {
          personalInfo: {
            name: "Professional User",
            email: "user@example.com",
            phone: "+1-555-0123",
            location: "San Francisco, CA",
            linkedinUrl: linkedinUrl
          },
          summary: `Experienced ${targetRole || "Software Engineer"} with a proven track record of delivering high-quality solutions.`,
          experience: [
            {
              title: targetRole || "Senior Software Engineer",
              company: "Tech Innovation Inc.",
              duration: "2022 - Present",
              achievements: [
                "Developed scalable web applications",
                "Improved system performance by 40%",
                "Led cross-functional teams"
              ]
            }
          ],
          skills: ["JavaScript", "Python", "React", "Node.js"],
          education: [
            {
              degree: "Bachelor of Science in Computer Science",
              institution: "University of Technology",
              year: "2020"
            }
          ]
        };

        const resume = await storage.createResume({
          userId: mockUserId,
          title: `Fallback Resume - ${targetRole || "Professional"}`,
          content: JSON.stringify(fallbackContent),
          format: "1-page"
        });

        res.json({ 
          success: true,
          resume,
          content: fallbackContent,
          message: "Resume generated using fallback method"
        });
      }
      
    } catch (error) {
      console.error("Error generating resume:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ message: "Failed to generate resume: " + errorMessage });
    }
  });

  app.post("/api/resume/upload", upload.single('resume'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // In a real implementation, you'd parse the uploaded file content
      // For now, we'll create a basic resume entry with file metadata
      const resume = await storage.createResume({
        userId: mockUserId,
        title: "Uploaded Resume",
        content: { 
          fileName: req.file.originalname,
          fileSize: req.file.size,
          uploadedAt: new Date().toISOString()
        },
        format: "uploaded"
      });

      res.json({ resume });
    } catch (error) {
      console.error("Error uploading resume:", error);
      res.status(500).json({ message: "Failed to upload resume: " + (error as Error).message });
    }
  });

  app.get("/api/resume/:id/export/:format", async (req, res) => {
    try {
      const { id, format } = req.params;
      const resume = await storage.getResume(id);

      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }

      if (!resume.content) {
        return res.status(400).json({ message: "Resume has no content to export" });
      }

      let buffer: Buffer;
      let contentType: string;
      let filename: string;

      if (format === 'pdf') {
        buffer = await exportResumeToPDF(resume.content as any);
        contentType = 'application/pdf';
        filename = 'resume.pdf';
      } else if (format === 'docx') {
        buffer = exportResumeToDocx(resume.content as any);
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        filename = 'resume.docx';
      } else {
        return res.status(400).json({ message: "Invalid format. Use 'pdf' or 'docx'" });
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error("Error exporting resume:", error);
      res.status(500).json({ message: "Failed to export resume: " + (error as Error).message });
    }
  });

  app.post("/api/resume/improve", async (req, res) => {
    try {
      const { resumeContent } = req.body;
      
      if (!resumeContent) {
        return res.status(400).json({ message: "Resume content is required" });
      }

      const suggestions = await improveResume(resumeContent);
      res.json({ suggestions });
    } catch (error) {
      console.error("Error improving resume:", error);
      res.status(500).json({ message: "Failed to improve resume: " + (error as Error).message });
    }
  });

  // Jobs API
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobsWithCompany();
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.post("/api/jobs/:id/analyze", async (req, res) => {
    try {
      const { id } = req.params;
      const job = await storage.getJob(id);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      const userSkills = await storage.getUserSkills(mockUserId);
      const skillNames = userSkills.map(us => us.skill.name);

      // Use Python GAI service for job matching analysis
      const pythonResponse = await pythonGaiService.analyzeJobMatch({
        user_skills: skillNames,
        job_requirements: job.requirements || "",
        job_description: job.description || ""
      });

      if (!pythonResponse.success) {
        // Fallback to OpenAI service
        console.log("Python GAI service failed for job analysis, falling back to OpenAI");
        const analysis = await analyzeJobMatch(
          skillNames,
          job.requirements || "",
          job.description || ""
        );
        return res.json(analysis);
      }

      res.json(pythonResponse.match_analysis);
    } catch (error) {
      console.error("Error analyzing job match:", error);
      res.status(500).json({ message: "Failed to analyze job match: " + (error as Error).message });
    }
  });

  // Applications API
  app.get("/api/applications", async (req, res) => {
    try {
      const applications = await storage.getUserApplications(mockUserId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post("/api/applications", async (req, res) => {
    try {
      const validatedData = insertJobApplicationSchema.parse({
        ...req.body,
        userId: mockUserId
      });
      
      const application = await storage.createApplication(validatedData);
      res.json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application: " + (error as Error).message });
    }
  });

  // Skills API
  app.get("/api/skills", async (req, res) => {
    try {
      const userSkills = await storage.getUserSkills(mockUserId);
      res.json(userSkills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.get("/api/learning-paths", async (req, res) => {
    try {
      const paths = await storage.getUserLearningPaths(mockUserId);
      res.json(paths);
    } catch (error) {
      console.error("Error fetching learning paths:", error);
      res.status(500).json({ message: "Failed to fetch learning paths" });
    }
  });

  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getUserBadges(mockUserId);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  // LinkedIn Posts API
  app.post("/api/linkedin/generate", async (req, res) => {
    try {
      const { topic, details } = req.body;
      
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }

      const user = await storage.getUser(mockUserId);
      
      // Use Python GAI service for LinkedIn post generation
      const pythonResponse = await pythonGaiService.generateLinkedInPost({
        topic,
        details: details || "",
        user_profile: user
      });

      let content: string;
      if (!pythonResponse.success) {
        // Fallback to OpenAI service
        console.log("Python GAI service failed for LinkedIn post, falling back to OpenAI");
        content = await generateLinkedInPost(topic, details || "", user);
      } else {
        content = pythonResponse.post_content || "";
      }
      
      const post = await storage.createPost({
        userId: mockUserId,
        content,
        topic,
        status: 'draft'
      });

      res.json({ post, content });
    } catch (error) {
      console.error("Error generating LinkedIn post:", error);
      res.status(500).json({ message: "Failed to generate LinkedIn post: " + (error as Error).message });
    }
  });

  app.get("/api/linkedin/posts", async (req, res) => {
    try {
      const posts = await storage.getUserPosts(mockUserId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Chat API
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, type = 'general' } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const user = await storage.getUser(mockUserId);
      
      const response = await generateCareerAdvice(message, {
        user,
        context: type
      });

      const chatMessage = await storage.createChatMessage({
        userId: mockUserId,
        message,
        response,
        type
      });

      res.json({ response, chatMessage });
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ message: "Failed to process chat message: " + (error as Error).message });
    }
  });

  app.get("/api/chat/history", async (req, res) => {
    try {
      const messages = await storage.getUserChatMessages(mockUserId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

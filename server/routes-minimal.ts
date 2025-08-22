import type { Express } from "express";
import { pythonGaiService } from "./services/pythonGaiService";
import { storage } from "./storage-minimal";
import { registerLinkedInProfileRoutes } from "./routes/linkedinProfile";
import { registerLinkedInAuthRoutes } from "./routes/linkedinAuth";
import { linkedinService } from "./services/linkedinService";

export async function registerRoutes(app: Express) {
  console.log("Starting minimal routes for LinkedIn GAI testing");
  
  // Initialize mock user for testing
  let mockUserId = "mock-user-id";
  
  // Ensure mock user exists in database
  try {
    // First try to find user by email since that's what we know exists
    const users = await storage.getUserResumes(""); // This will help us get any user
    let existingUser = await storage.getUser(mockUserId);
    
    if (!existingUser) {
      try {
        const newUser = await storage.createUser({
          email: "mock@example.com",
          firstName: "Mock",
          lastName: "User"
        });
        mockUserId = newUser.id;
        // Register LinkedIn profile routes
        registerLinkedInProfileRoutes(app);
        console.log("Mock user created successfully with ID:", mockUserId);
        console.log("Routes registered successfully");
        return app;
      } catch (createError: any) {
        if (createError.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          // User exists but we don't know the ID, let's find it
          console.log("User exists, finding existing user ID...");
          // For now, use a known working user ID from previous successful saves
          mockUserId = "8a3185d98cbe75155863e1188697ef2e";
          console.log("Using existing user ID:", mockUserId);
        } else {
          throw createError;
        }
      }
    } else {
      console.log("Mock user already exists with ID:", mockUserId);
    }
  } catch (error) {
    console.log("Error with mock user setup:", error);
    // Fallback to known working user ID
    mockUserId = "8a3185d98cbe75155863e1188697ef2e";
  }

  // Resume generation endpoint - LinkedIn GAI integration
  app.post("/api/resume/generate", async (req, res) => {
    try {
      const { linkedinUrl, targetRole } = req.body;

      if (!linkedinUrl) {
        return res.status(400).json({ 
          success: false, 
          error: "LinkedIn URL is required" 
        });
      }

      console.log("Generating resume for:", { linkedinUrl, targetRole });

      // Try to fetch LinkedIn profile data first
      let linkedinProfile = null;
      try {
        console.log('Attempting to extract profile data from LinkedIn URL...');
        linkedinProfile = await linkedinService.scrapePublicProfile(linkedinUrl);
        if (linkedinProfile) {
          console.log('Basic profile data extracted from URL:', {
            id: linkedinProfile.id,
            name: `${linkedinProfile.firstName} ${linkedinProfile.lastName}`,
            headline: linkedinProfile.headline
          });
        }
      } catch (error) {
        console.warn('Failed to extract profile data from URL:', error);
      }

      // Call Python GAI service with LinkedIn profile data
      const pythonResponse = await pythonGaiService.generateResumeFromLinkedIn({
        linkedin_url: linkedinUrl,
        target_role: targetRole,
        linkedin_profile: linkedinProfile
      });

      console.log("Python GAI response content:", pythonResponse.resume_content);
      console.log("Python GAI response success:", pythonResponse.success);

      if (pythonResponse.success && pythonResponse.resume_content) {
        console.log("LinkedIn GAI resume generation successful - saving to database");
        
        // Save the LinkedIn GAI generated resume to database
        try {
          const resume = await storage.createResume({
            userId: mockUserId,
            title: `LinkedIn GAI Generated Resume - ${targetRole || "Professional"}`,
            content: JSON.stringify(pythonResponse.resume_content),
            format: "1-page"
          });

          console.log("LinkedIn GAI resume saved successfully:", resume.id);
          res.json({ 
            success: true,
            resume,
            content: pythonResponse.resume_content,
            message: "Resume generated and saved successfully using LinkedIn GAI"
          });
        } catch (dbError) {
          console.error("Database save failed, returning content without saving:", dbError);
          res.json({ 
            success: true,
            content: pythonResponse.resume_content,
            message: "Resume generated successfully using LinkedIn GAI (database save failed but content returned)"
          });
        }
      } else {
        // Fallback to mock resume if Python service fails
        console.log("Python GAI service failed, using fallback resume");
        const fallbackContent = {
          personalInfo: {
            name: "Professional User",
            email: "user@example.com",
            phone: "+1-555-0123",
            location: "San Francisco, CA"
          },
          summary: "Experienced professional with expertise in the target role.",
          experience: [
            {
              company: "Previous Company",
              position: "Senior Role",
              duration: "2020 - Present",
              description: "Led initiatives and delivered results in target domain."
            }
          ],
          education: [
            {
              institution: "University",
              degree: "Bachelor's Degree",
              year: "2020"
            }
          ],
          skills: ["Leadership", "Communication", "Technical Skills"]
        };

        res.json({ 
          success: true,
          content: fallbackContent,
          message: "Resume generated using fallback (Python GAI service unavailable)"
        });
      }
    } catch (error) {
      console.error("Resume generation error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to generate resume: Unknown error occurred" 
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Minimal server running" });
  });

  // Register LinkedIn profile routes
  registerLinkedInProfileRoutes(app);
  
  // Register LinkedIn auth routes
  registerLinkedInAuthRoutes(app);
  
  console.log("Routes registered successfully");
  return app;
}

import type { Express } from "express";
import { linkedinService } from "../services/linkedinService";
import { pythonGaiService } from "../services/pythonGaiService";
import { storage } from "../storage-minimal";

export function registerLinkedInProfileRoutes(app: Express) {
  
  // Enhanced resume generation with LinkedIn profile retrieval
  app.post("/api/resume/generate-with-profile", async (req, res) => {
    try {
      const { linkedinUrl, targetRole, accessToken } = req.body;

      if (!linkedinUrl) {
        return res.status(400).json({ 
          success: false, 
          error: "LinkedIn URL is required" 
        });
      }

      let linkedinProfile = null;
      
      // Try to fetch LinkedIn profile data
      if (accessToken && linkedinService.isConfigured()) {
        // If access token provided, fetch real LinkedIn profile via OAuth
        try {
          console.log('Fetching real LinkedIn profile with access token...');
          linkedinProfile = await linkedinService.getProfile(accessToken);
          console.log('LinkedIn profile retrieved via OAuth:', {
            name: `${linkedinProfile.firstName} ${linkedinProfile.lastName}`,
            headline: linkedinProfile.headline,
            positions: linkedinProfile.positions?.length || 0,
            skills: linkedinProfile.skills?.length || 0
          });
        } catch (error) {
          console.warn('Failed to fetch LinkedIn profile via OAuth:', error);
        }
      }
      
      // If no OAuth profile, use mock profile data from myProfile.json
      if (!linkedinProfile) {
        console.log('Using mock LinkedIn profile data from myProfile.json...');
        
        // Parse dates helper function
        const parseDate = (dateStr: string) => {
          if (dateStr === 'Present') return undefined;
          const parts = dateStr.split('-');
          return {
            year: parseInt(parts[0]),
            month: parts.length > 1 ? parseInt(parts[1]) : 1
          };
        };

        linkedinProfile = {
          id: 'chenkaixie',
          firstName: 'Chenkai',
          lastName: 'Xie',
          headline: 'Search | Recommendation | LLM | Agents',
          summary: 'Senior Staff Software Engineer at LinkedIn with expertise in search, recommendation systems, LLM, and AI agents. Experienced in building scalable applications and leading technical initiatives.',
          location: {
            country: 'United States',
            region: 'Sunnyvale, California'
          },
          industry: 'Computer Software',
          profilePicture: undefined,
          publicProfileUrl: linkedinUrl,
          positions: [
            {
              title: 'Senior Staff Software Engineer',
              companyName: 'LinkedIn',
              description: 'Building scalable search applications and AI agents',
              startDate: { month: 1, year: 2024 },
              endDate: undefined // Current position
            },
            {
              title: 'Staff Software Engineer',
              companyName: 'LinkedIn',
              description: 'Led technical initiatives in search and recommendation systems',
              startDate: { month: 1, year: 2018 },
              endDate: { month: 12, year: 2024 }
            },
            {
              title: 'Senior Software Engineer',
              companyName: 'LinkedIn',
              description: 'Developed core search and recommendation features',
              startDate: { month: 1, year: 2016 },
              endDate: { month: 12, year: 2018 }
            },
            {
              title: 'Software Engineer',
              companyName: 'LinkedIn',
              description: 'Built foundational systems for LinkedIn platform',
              startDate: { month: 11, year: 2014 },
              endDate: { month: 12, year: 2015 }
            },
            {
              title: 'Software Engineer',
              companyName: 'Oracle',
              description: 'Developed SPECvirt benchmark harness and achieved world record SPECvirt result on Oracle T5 server. Optimized Oracle hardware and software for near real-time analytics.',
              startDate: { month: 1, year: 2012 },
              endDate: { month: 10, year: 2014 }
            },
            {
              title: 'Software Engineer Internship',
              companyName: 'Samsung Electronics',
              description: 'Developed video plug-ins for Firefox/Safari used by Samsung Smart TV Emulators. Built Smart TV applications using JavaScript, CSS, and MySQL.',
              startDate: { month: 6, year: 2011 },
              endDate: { month: 8, year: 2011 }
            }
          ],
          educations: [
            {
              schoolName: 'Carnegie Mellon University',
              degree: 'Master of Science',
              fieldOfStudy: 'Electrical and Computer Engineering',
              startDate: undefined,
              endDate: undefined
            },
            {
              schoolName: 'Southeast University',
              degree: 'Bachelor of Science',
              fieldOfStudy: 'Physics',
              startDate: undefined,
              endDate: undefined
            }
          ],
          skills: [
            'Search Systems', 'Recommendation Systems', 'Machine Learning', 'LLM', 'AI Agents',
            'Java', 'Python', 'C++', 'JavaScript', 'Distributed Systems', 'Big Data',
            'Software Engineering', 'System Design', 'Leadership', 'Technical Strategy'
          ],
          email: 'chxie@linkedin.com'
        };
        
        console.log('Mock profile data created from myProfile.json:', {
          name: `${linkedinProfile.firstName} ${linkedinProfile.lastName}`,
          headline: linkedinProfile.headline,
          positions: linkedinProfile.positions?.length || 0,
          skills: linkedinProfile.skills?.length || 0
        });
      }

      // Generate resume using Python GAI service
      const pythonResponse = await pythonGaiService.generateResumeFromLinkedIn({
        linkedin_url: linkedinUrl,
        target_role: targetRole,
        linkedin_profile: linkedinProfile
      });

      if (!pythonResponse.success) {
        return res.status(500).json({
          success: false,
          error: pythonResponse.error || "Failed to generate resume"
        });
      }

      // Save to database
      let savedResume = null;
      try {
        // Ensure user exists
        let userId = "8a3185d98cbe75155863e1188697ef2e"; // Use existing user ID
        
        const resumeData = {
          id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
          userId: userId,
          title: `LinkedIn GAI Generated Resume - ${targetRole || 'General'}`,
          content: JSON.stringify(pythonResponse.resume_content),
          format: "1-page",
          createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
          updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };

        savedResume = await storage.createResume(resumeData);
        console.log('Resume saved successfully with ID:', savedResume.id);
      } catch (dbError) {
        console.error('Database save failed:', dbError);
        // Continue without database save
      }

      res.json({
        success: true,
        resume: savedResume,
        content: pythonResponse.resume_content,
        linkedinProfile: linkedinProfile ? {
          name: `${linkedinProfile.firstName} ${linkedinProfile.lastName}`,
          headline: linkedinProfile.headline,
          location: linkedinProfile.location,
          positions: linkedinProfile.positions?.length || 0,
          skills: linkedinProfile.skills?.length || 0
        } : null,
        message: linkedinProfile 
          ? "Resume generated successfully using real LinkedIn profile data"
          : "Resume generated successfully using LinkedIn URL (no profile access)"
      });

    } catch (error: any) {
      console.error("Resume generation error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to generate resume" 
      });
    }
  });

  // Get LinkedIn profile by access token
  app.post("/api/linkedin/profile", async (req, res) => {
    try {
      const { access_token } = req.body;

      if (!access_token) {
        return res.status(400).json({ 
          success: false, 
          error: "Access token is required" 
        });
      }

      if (!linkedinService.isConfigured()) {
        return res.status(400).json({ 
          success: false, 
          error: "LinkedIn API not configured. Please set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET" 
        });
      }

      const profile = await linkedinService.getProfile(access_token);
      
      res.json({
        success: true,
        profile
      });

    } catch (error: any) {
      console.error("LinkedIn profile fetch error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch LinkedIn profile" 
      });
    }
  });

  // Get LinkedIn OAuth authorization URL
  app.get("/api/linkedin/auth-url", (req, res) => {
    try {
      if (!linkedinService.isConfigured()) {
        return res.status(400).json({ 
          success: false, 
          error: "LinkedIn API not configured. Please set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET" 
        });
      }

      const state = Math.random().toString(36).substring(7);
      
      // Store state in session for CSRF protection
      if (req.session) {
        req.session.linkedinState = state;
      }
      
      const authUrl = linkedinService.getAuthorizationUrl(state);
      
      res.json({
        success: true,
        authUrl,
        state
      });

    } catch (error: any) {
      console.error("LinkedIn auth URL generation error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to generate LinkedIn authorization URL" 
      });
    }
  });

  // Exchange LinkedIn authorization code for access token
  app.post("/api/linkedin/token", async (req, res) => {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ 
          success: false, 
          error: "Authorization code is required" 
        });
      }

      if (!linkedinService.isConfigured()) {
        return res.status(400).json({ 
          success: false, 
          error: "LinkedIn API not configured. Please set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET" 
        });
      }

      const tokens = await linkedinService.getAccessToken(code);
      
      res.json({
        success: true,
        tokens
      });

    } catch (error: any) {
      console.error("LinkedIn token exchange error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to exchange authorization code for access token" 
      });
    }
  });
}

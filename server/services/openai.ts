import OpenAI from "openai";
import fetch from "node-fetch";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key",
  fetch: fetch as any
});

export interface ResumeGenerationRequest {
  linkedinUrl?: string;
  userProfile?: any;
  targetRole?: string;
}

export interface ResumeContent {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedinUrl: string;
  };
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    achievements: string[];
  }>;
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
}

export interface JobMatchAnalysis {
  matchScore: number;
  skillsMatch: Array<{
    skill: string;
    userLevel: "beginner" | "intermediate" | "advanced" | "expert";
    required: boolean;
    match: boolean;
  }>;
  gaps: string[];
  recommendations: string[];
}

export async function generateResumeFromLinkedIn(request: ResumeGenerationRequest): Promise<ResumeContent> {
  try {
    const prompt = `You are a professional resume writer. Generate a comprehensive resume based on the following information:
    
    ${request.linkedinUrl ? `LinkedIn URL: ${request.linkedinUrl}` : ''}
    ${request.userProfile ? `User Profile: ${JSON.stringify(request.userProfile)}` : ''}
    ${request.targetRole ? `Target Role: ${request.targetRole}` : ''}
    
    Create a professional resume with the following structure. Ensure all content is realistic and professional:
    - Personal Information (name, email, phone, location, LinkedIn)
    - Professional Summary (2-3 sentences highlighting key strengths)
    - Work Experience (with quantified achievements)
    - Skills (technical and soft skills)
    - Education
    
    Return the response as JSON with the exact structure specified.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional resume writer who creates compelling, ATS-optimized resumes. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result as ResumeContent;
  } catch (error) {
    throw new Error("Failed to generate resume: " + (error as Error).message);
  }
}

export async function improveResume(resumeContent: any): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a resume optimization expert. Analyze resumes and provide actionable improvement suggestions."
        },
        {
          role: "user",
          content: `Analyze this resume and provide 3-5 specific improvement suggestions: ${JSON.stringify(resumeContent)}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.suggestions || [];
  } catch (error) {
    throw new Error("Failed to improve resume: " + (error as Error).message);
  }
}

export async function analyzeJobMatch(userSkills: string[], jobRequirements: string, jobDescription: string): Promise<JobMatchAnalysis> {
  try {
    const prompt = `Analyze job match for a candidate with these skills: ${userSkills.join(', ')}
    
    Job Requirements: ${jobRequirements}
    Job Description: ${jobDescription}
    
    Provide a detailed match analysis including:
    - Skills assessment for each required skill
    - Identified gaps
    - Recommendations for improvement
    
    Return as JSON with the specified structure.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a career counselor who analyzes job fit and provides detailed assessments. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result as JobMatchAnalysis;
  } catch (error) {
    throw new Error("Failed to analyze job match: " + (error as Error).message);
  }
}

export async function generateLinkedInPost(topic: string, details: string, userProfile: any): Promise<string> {
  try {
    const prompt = `Create a professional LinkedIn post for:
    Topic: ${topic}
    Details: ${details}
    User Background: ${JSON.stringify(userProfile)}
    
    The post should be:
    - Professional and engaging
    - Include relevant hashtags
    - Be optimized for LinkedIn engagement
    - 150-300 words
    
    Return just the post content as a string.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a social media expert who creates engaging LinkedIn content for professionals."
        },
        {
          role: "user",
          content: prompt
        }
      ],
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    throw new Error("Failed to generate LinkedIn post: " + (error as Error).message);
  }
}

export async function generateCareerAdvice(message: string, userContext: any): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional career advisor with expertise in:
          - Resume optimization
          - Job search strategies
          - Interview preparation
          - Career development
          - Skill assessment
          
          Provide helpful, actionable advice. Keep responses concise but thorough.`
        },
        {
          role: "user",
          content: `User Context: ${JSON.stringify(userContext)}
          
          Question: ${message}`
        }
      ],
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response at this time.";
  } catch (error) {
    throw new Error("Failed to generate career advice: " + (error as Error).message);
  }
}

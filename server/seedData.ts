import { db } from "./db";
import { 
  users, 
  companies, 
  jobs, 
  skills, 
  userSkills, 
  learningPaths, 
  badges,
  jobApplications
} from "@shared/schema";

export async function seedDatabase() {
  try {
    console.log("Starting database seed...");

    // Insert sample user
    const [user] = await db.insert(users).values({
      email: "chenkai.xie@example.com",
      firstName: "Chenkai",
      lastName: "Xie",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b787?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150",
      linkedinUrl: "https://linkedin.com/in/chenkai-xie",
      location: "San Francisco, CA",
      title: "Senior Frontend Developer"
    }).returning();

    // Insert companies
    const companyData = [
      {
        name: "Google",
        industry: "Technology",
        location: "Mountain View, CA",
        size: "10000+",
        website: "https://google.com",
        description: "Search and advertising technology company"
      },
      {
        name: "Microsoft",
        industry: "Technology",
        location: "Redmond, WA",
        size: "10000+",
        website: "https://microsoft.com",
        description: "Software and cloud computing company"
      },
      {
        name: "Apple",
        industry: "Technology",
        location: "Cupertino, CA",
        size: "10000+",
        website: "https://apple.com",
        description: "Consumer electronics and software company"
      },
      {
        name: "Stripe",
        industry: "Fintech",
        location: "San Francisco, CA",
        size: "1000-5000",
        website: "https://stripe.com",
        description: "Payment processing platform"
      },
      {
        name: "Notion",
        industry: "Productivity",
        location: "San Francisco, CA",
        size: "100-500",
        website: "https://notion.so",
        description: "Productivity and collaboration software"
      },
      {
        name: "Figma",
        industry: "Design",
        location: "San Francisco, CA",
        size: "500-1000",
        website: "https://figma.com",
        description: "Design and prototyping platform"
      }
    ];

    const insertedCompanies = await db.insert(companies).values(companyData).returning();

    // Insert jobs
    const jobData = [
      {
        companyId: insertedCompanies[0].id, // Google
        title: "Senior Frontend Developer",
        description: "We're looking for an experienced frontend developer to join our team working on user-facing products that serve billions of users.",
        requirements: "5+ years of experience with React, TypeScript, and modern frontend technologies. Experience with large-scale applications and performance optimization.",
        salaryMin: 130000,
        salaryMax: 180000,
        location: "Mountain View, CA",
        type: "full-time",
        workMode: "hybrid",
        skills: ["React", "TypeScript", "JavaScript", "CSS", "Node.js"]
      },
      {
        companyId: insertedCompanies[1].id, // Microsoft
        title: "Senior Software Engineer",
        description: "Join our team building next-generation cloud services and developer tools.",
        requirements: "Strong background in software engineering with experience in C#, .NET, and cloud technologies.",
        salaryMin: 125000,
        salaryMax: 175000,
        location: "Redmond, WA",
        type: "full-time",
        workMode: "hybrid",
        skills: ["C#", ".NET", "Azure", "TypeScript", "React"]
      },
      {
        companyId: insertedCompanies[2].id, // Apple
        title: "Product Manager",
        description: "Lead product strategy and development for consumer-facing applications.",
        requirements: "MBA or equivalent experience, 5+ years in product management, experience with consumer products.",
        salaryMin: 140000,
        salaryMax: 190000,
        location: "Cupertino, CA",
        type: "full-time",
        workMode: "on-site",
        skills: ["Product Strategy", "Analytics", "Leadership", "User Research"]
      },
      {
        companyId: insertedCompanies[5].id, // Figma
        title: "UX Designer",
        description: "Design intuitive and beautiful user experiences for our design platform.",
        requirements: "3+ years of UX/UI design experience, proficiency in Figma, strong portfolio.",
        salaryMin: 120000,
        salaryMax: 160000,
        location: "San Francisco, CA",
        type: "full-time",
        workMode: "remote",
        skills: ["Figma", "Prototyping", "User Research", "Design Systems"]
      }
    ];

    const insertedJobs = await db.insert(jobs).values(jobData).returning();

    // Insert skills
    const skillsData = [
      { name: "React", category: "Frontend", description: "JavaScript library for building user interfaces" },
      { name: "TypeScript", category: "Language", description: "Typed superset of JavaScript" },
      { name: "JavaScript", category: "Language", description: "Programming language for web development" },
      { name: "Node.js", category: "Backend", description: "JavaScript runtime for server-side development" },
      { name: "Python", category: "Language", description: "High-level programming language" },
      { name: "SQL", category: "Database", description: "Query language for relational databases" },
      { name: "AWS", category: "Cloud", description: "Amazon Web Services cloud platform" },
      { name: "Docker", category: "DevOps", description: "Containerization platform" },
      { name: "Figma", category: "Design", description: "Design and prototyping tool" },
      { name: "Product Strategy", category: "Management", description: "Strategic product planning and execution" }
    ];

    const insertedSkills = await db.insert(skills).values(skillsData).returning();

    // Insert user skills
    const userSkillsData = [
      { userId: user.id, skillId: insertedSkills[0].id, level: "expert", verified: true }, // React
      { userId: user.id, skillId: insertedSkills[1].id, level: "advanced", verified: true }, // TypeScript
      { userId: user.id, skillId: insertedSkills[2].id, level: "expert", verified: true }, // JavaScript
      { userId: user.id, skillId: insertedSkills[3].id, level: "intermediate", verified: false }, // Node.js
      { userId: user.id, skillId: insertedSkills[5].id, level: "intermediate", verified: true }, // SQL
    ];

    await db.insert(userSkills).values(userSkillsData);

    // Insert learning paths
    const learningPathsData = [
      {
        userId: user.id,
        title: "Advanced React Development",
        description: "Master advanced React patterns and performance optimization",
        progress: 75,
        totalModules: 12,
        completedModules: 9,
        estimatedHours: 3,
        isActive: true
      },
      {
        userId: user.id,
        title: "System Design Fundamentals",
        description: "Learn to design scalable distributed systems",
        progress: 45,
        totalModules: 11,
        completedModules: 5,
        estimatedHours: 8,
        isActive: true
      }
    ];

    await db.insert(learningPaths).values(learningPathsData);

    // Insert badges
    const badgesData = [
      {
        userId: user.id,
        name: "React Expert",
        description: "Mastered React framework",
        icon: "fab fa-react",
        category: "Frontend"
      },
      {
        userId: user.id,
        name: "JS Advanced",
        description: "Advanced JavaScript skills",
        icon: "fab fa-js-square",
        category: "Language"
      },
      {
        userId: user.id,
        name: "Node.js Pro",
        description: "Backend development with Node.js",
        icon: "fab fa-node-js",
        category: "Backend"
      },
      {
        userId: user.id,
        name: "SQL Master",
        description: "Database query optimization",
        icon: "fas fa-database",
        category: "Database"
      },
      {
        userId: user.id,
        name: "AWS Basics",
        description: "Cloud infrastructure basics",
        icon: "fab fa-aws",
        category: "Cloud"
      },
      {
        userId: user.id,
        name: "Analytics",
        description: "Data analysis and insights",
        icon: "fas fa-chart-line",
        category: "Data"
      }
    ];

    await db.insert(badges).values(badgesData);

    // Insert sample job applications
    const applicationData = [
      {
        userId: user.id,
        jobId: insertedJobs[0].id, // Google Frontend
        status: "interview",
        notes: "Technical interview scheduled for next week"
      },
      {
        userId: user.id,
        jobId: insertedJobs[2].id, // Apple PM
        status: "in_review",
        notes: "Application under review by hiring manager"
      },
      {
        userId: user.id,
        jobId: insertedJobs[3].id, // Figma UX
        status: "applied",
        notes: "Portfolio submitted with application"
      }
    ];

    await db.insert(jobApplications).values(applicationData);

    console.log("Database seeded successfully!");
    
    return {
      user,
      companies: insertedCompanies,
      jobs: insertedJobs,
      skills: insertedSkills
    };

  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

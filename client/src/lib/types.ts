export interface DashboardStats {
  applications: number;
  interviews: number;
  referrals: number;
  badges: number;
  learningStreak?: number;
  weeklyHours?: number;
}

export interface JobWithCompany {
  id: string;
  title: string;
  description: string | null;
  requirements: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  location: string | null;
  type: string;
  workMode: string;
  skills: string[] | null;
  isActive: boolean;
  createdAt: Date;
  companyId: string;
  company: {
    id: string;
    name: string;
    industry: string | null;
    location: string | null;
    size: string | null;
    website: string | null;
    description: string | null;
  };
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

export interface ApplicationWithDetails {
  id: string;
  userId: string;
  jobId: string;
  status: string;
  notes: string | null;
  appliedAt: Date;
  updatedAt: Date;
  job: {
    id: string;
    title: string;
    description: string | null;
    requirements: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    location: string | null;
    type: string;
    workMode: string;
    skills: string[] | null;
    isActive: boolean;
    createdAt: Date;
    companyId: string;
  };
  company: {
    id: string;
    name: string;
    industry: string | null;
    location: string | null;
    size: string | null;
    website: string | null;
    description: string | null;
  };
}

export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  response: string | null;
  type: string;
  createdAt: Date;
}

export interface LinkedinPost {
  id: string;
  userId: string;
  content: string;
  topic: string | null;
  status: string;
  createdAt: Date;
  publishedAt: Date | null;
}

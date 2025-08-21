import {
  users,
  resumes,
  companies,
  jobs,
  jobApplications,
  skills,
  userSkills,
  learningPaths,
  badges,
  linkedinPosts,
  chatMessages,
  type User,
  type InsertUser,
  type Resume,
  type InsertResume,
  type Company,
  type Job,
  type JobApplication,
  type InsertJobApplication,
  type Skill,
  type UserSkill,
  type LearningPath,
  type InsertLearningPath,
  type Badge,
  type InsertBadge,
  type LinkedinPost,
  type InsertLinkedinPost,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;

  // Resume operations
  getUserResumes(userId: string): Promise<Resume[]>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResume(id: string, resume: Partial<InsertResume>): Promise<Resume>;
  getResume(id: string): Promise<Resume | undefined>;

  // Company operations
  getCompanies(): Promise<Company[]>;
  getCompany(id: string): Promise<Company | undefined>;

  // Job operations
  getJobs(): Promise<Job[]>;
  getJobsWithCompany(): Promise<Array<Job & { company: Company }>>;
  getJob(id: string): Promise<Job | undefined>;

  // Job Application operations
  getUserApplications(userId: string): Promise<Array<JobApplication & { job: Job; company: Company }>>;
  createApplication(application: InsertJobApplication): Promise<JobApplication>;
  updateApplication(id: string, application: Partial<InsertJobApplication>): Promise<JobApplication>;

  // Skills operations
  getSkills(): Promise<Skill[]>;
  getUserSkills(userId: string): Promise<Array<UserSkill & { skill: Skill }>>;

  // Learning Path operations
  getUserLearningPaths(userId: string): Promise<LearningPath[]>;
  createLearningPath(path: InsertLearningPath): Promise<LearningPath>;
  updateLearningPath(id: string, path: Partial<InsertLearningPath>): Promise<LearningPath>;

  // Badge operations
  getUserBadges(userId: string): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;

  // LinkedIn Post operations
  getUserPosts(userId: string): Promise<LinkedinPost[]>;
  createPost(post: InsertLinkedinPost): Promise<LinkedinPost>;
  updatePost(id: string, post: Partial<InsertLinkedinPost>): Promise<LinkedinPost>;

  // Chat operations
  getUserChatMessages(userId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Resume operations
  async getUserResumes(userId: string): Promise<Resume[]> {
    return await db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, userId))
      .orderBy(desc(resumes.updatedAt));
  }

  async createResume(resumeData: InsertResume): Promise<Resume> {
    const [resume] = await db.insert(resumes).values(resumeData).returning();
    return resume;
  }

  async updateResume(id: string, resumeData: Partial<InsertResume>): Promise<Resume> {
    const [resume] = await db
      .update(resumes)
      .set({ ...resumeData, updatedAt: new Date() })
      .where(eq(resumes.id, id))
      .returning();
    return resume;
  }

  async getResume(id: string): Promise<Resume | undefined> {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    return resume;
  }

  // Company operations
  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies).orderBy(companies.name);
  }

  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  // Job operations
  async getJobs(): Promise<Job[]> {
    return await db
      .select()
      .from(jobs)
      .where(eq(jobs.isActive, true))
      .orderBy(desc(jobs.createdAt));
  }

  async getJobsWithCompany(): Promise<Array<Job & { company: Company }>> {
    return await db
      .select()
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(jobs.isActive, true))
      .orderBy(desc(jobs.createdAt))
      .then(rows => rows.map(row => ({ ...row.jobs, company: row.companies })));
  }

  async getJob(id: string): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  // Job Application operations
  async getUserApplications(userId: string): Promise<Array<JobApplication & { job: Job; company: Company }>> {
    return await db
      .select()
      .from(jobApplications)
      .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(jobApplications.userId, userId))
      .orderBy(desc(jobApplications.appliedAt))
      .then(rows => rows.map(row => ({ ...row.job_applications, job: row.jobs, company: row.companies })));
  }

  async createApplication(applicationData: InsertJobApplication): Promise<JobApplication> {
    const [application] = await db.insert(jobApplications).values(applicationData).returning();
    return application;
  }

  async updateApplication(id: string, applicationData: Partial<InsertJobApplication>): Promise<JobApplication> {
    const [application] = await db
      .update(jobApplications)
      .set({ ...applicationData, updatedAt: new Date() })
      .where(eq(jobApplications.id, id))
      .returning();
    return application;
  }

  // Skills operations
  async getSkills(): Promise<Skill[]> {
    return await db.select().from(skills).orderBy(skills.name);
  }

  async getUserSkills(userId: string): Promise<Array<UserSkill & { skill: Skill }>> {
    return await db
      .select()
      .from(userSkills)
      .innerJoin(skills, eq(userSkills.skillId, skills.id))
      .where(eq(userSkills.userId, userId))
      .then(rows => rows.map(row => ({ ...row.user_skills, skill: row.skills })));
  }

  // Learning Path operations
  async getUserLearningPaths(userId: string): Promise<LearningPath[]> {
    return await db
      .select()
      .from(learningPaths)
      .where(and(eq(learningPaths.userId, userId), eq(learningPaths.isActive, true)))
      .orderBy(desc(learningPaths.updatedAt));
  }

  async createLearningPath(pathData: InsertLearningPath): Promise<LearningPath> {
    const [path] = await db.insert(learningPaths).values(pathData).returning();
    return path;
  }

  async updateLearningPath(id: string, pathData: Partial<InsertLearningPath>): Promise<LearningPath> {
    const [path] = await db
      .update(learningPaths)
      .set({ ...pathData, updatedAt: new Date() })
      .where(eq(learningPaths.id, id))
      .returning();
    return path;
  }

  // Badge operations
  async getUserBadges(userId: string): Promise<Badge[]> {
    return await db
      .select()
      .from(badges)
      .where(eq(badges.userId, userId))
      .orderBy(desc(badges.earnedAt));
  }

  async createBadge(badgeData: InsertBadge): Promise<Badge> {
    const [badge] = await db.insert(badges).values(badgeData).returning();
    return badge;
  }

  // LinkedIn Post operations
  async getUserPosts(userId: string): Promise<LinkedinPost[]> {
    return await db
      .select()
      .from(linkedinPosts)
      .where(eq(linkedinPosts.userId, userId))
      .orderBy(desc(linkedinPosts.createdAt));
  }

  async createPost(postData: InsertLinkedinPost): Promise<LinkedinPost> {
    const [post] = await db.insert(linkedinPosts).values(postData).returning();
    return post;
  }

  async updatePost(id: string, postData: Partial<InsertLinkedinPost>): Promise<LinkedinPost> {
    const [post] = await db
      .update(linkedinPosts)
      .set({ ...postData, publishedAt: postData.status === 'published' ? new Date() : undefined })
      .where(eq(linkedinPosts.id, id))
      .returning();
    return post;
  }

  // Chat operations
  async getUserChatMessages(userId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(chatMessages.createdAt);
  }

  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(messageData).returning();
    return message;
  }
}

export const storage = new DatabaseStorage();

import { db } from "./db";
import { users, resumes, chatMessages } from "@shared/schema-sqlite";
import type { User, InsertUser, Resume, InsertResume, ChatMessage, InsertChatMessage } from "@shared/schema-sqlite";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  createUser(userData: InsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<InsertUser>): Promise<User>;

  // Resume operations
  getUserResumes(userId: string): Promise<Resume[]>;
  createResume(resumeData: InsertResume): Promise<Resume>;
  updateResume(id: string, resumeData: Partial<InsertResume>): Promise<Resume>;
  getResume(id: string): Promise<Resume | undefined>;

  // Chat operations
  getChatHistory(userId: string): Promise<ChatMessage[]>;
  saveChatMessage(messageData: InsertChatMessage): Promise<ChatMessage>;

  // Stub methods for full routes compatibility
  getUserApplications(userId: string): Promise<any[]>;
  getUserLearningPaths(userId: string): Promise<any[]>;
  getUserBadges(userId: string): Promise<any[]>;
  getJobsWithCompany(): Promise<any[]>;
  getJob(id: string): Promise<any>;
  getUserSkills(userId: string): Promise<any[]>;
  createApplication(data: any): Promise<any>;
  createPost(data: any): Promise<any>;
  getUserPosts(userId: string): Promise<any[]>;
  createChatMessage(data: any): Promise<any>;
  getUserChatMessages(userId: string): Promise<any[]>;
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
      .set({ ...userData, updatedAt: new Date().toISOString() })
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
      .set({ ...resumeData, updatedAt: new Date().toISOString() })
      .where(eq(resumes.id, id))
      .returning();
    return resume;
  }

  async getResume(id: string): Promise<Resume | undefined> {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    return resume;
  }

  // Chat operations
  async getChatHistory(userId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt));
  }

  async saveChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values({
      ...messageData,
      createdAt: new Date().toISOString()
    }).returning();
    return message;
  }

  // Stub methods for full routes compatibility - return empty arrays/mock data
  async getUserApplications(userId: string): Promise<any[]> {
    return [];
  }

  async getUserLearningPaths(userId: string): Promise<any[]> {
    return [];
  }

  async getUserBadges(userId: string): Promise<any[]> {
    return [];
  }

  async getJobsWithCompany(): Promise<any[]> {
    return [];
  }

  async getJob(id: string): Promise<any> {
    return null;
  }

  async getUserSkills(userId: string): Promise<any[]> {
    return [];
  }

  async createApplication(data: any): Promise<any> {
    return { id: "mock-app-id", ...data };
  }

  async createPost(data: any): Promise<any> {
    return { id: "mock-post-id", ...data };
  }

  async getUserPosts(userId: string): Promise<any[]> {
    return [];
  }

  async createChatMessage(data: any): Promise<any> {
    return this.saveChatMessage(data);
  }

  async getUserChatMessages(userId: string): Promise<any[]> {
    return this.getChatHistory(userId);
  }
}

export const storage = new DatabaseStorage();

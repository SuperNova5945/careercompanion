import axios from 'axios';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000';
console.log('PYTHON_SERVICE_URL loaded as:', PYTHON_SERVICE_URL);

export interface PythonGaiRequest {
  linkedin_url: string;
  target_role?: string;
  linkedin_profile?: any; 
  user_profile?: any;
  user_skills?: string[];
  job_requirements?: string;
  job_description?: string;
  topic?: string;
  details?: string;
}

export interface PythonGaiResponse {
  success: boolean;
  resume_content?: any;
  match_analysis?: any;
  post_content?: string;
  error?: string;
}

class PythonGaiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = PYTHON_SERVICE_URL;
  }

  async generateResumeFromLinkedIn(request: PythonGaiRequest): Promise<PythonGaiResponse> {
    try {
      console.log('Python GAI Service - Making request to:', `${this.baseUrl}/api/linkedin/generate-resume`);
      console.log('Python GAI Service - Request payload:', { linkedin_url: request.linkedin_url, target_role: request.target_role, user_profile: request.linkedin_profile });
      
      const response = await axios.post(`${this.baseUrl}/api/linkedin/generate-resume`, {
        linkedin_url: request.linkedin_url,
        target_role: request.target_role,
        user_profile: request.linkedin_profile
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Python GAI Service - Response status:', response.status);
      console.log('Python GAI Service - Response success:', response.data.success);
      
      return response.data;
    } catch (error: any) {
      console.error('Python GAI Service - Error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data
      });
      return {
        success: false,
        error: `Failed to generate resume: ${error.message}`
      };
    }
  }

  async analyzeJobMatch(request: PythonGaiRequest): Promise<PythonGaiResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/linkedin/analyze-job-match`, {
        user_skills: request.user_skills,
        job_requirements: request.job_requirements,
        job_description: request.job_description
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error calling Python GAI service for job matching:', error.message);
      return {
        success: false,
        error: `Failed to analyze job match: ${error.message}`
      };
    }
  }

  async generateLinkedInPost(request: PythonGaiRequest): Promise<PythonGaiResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/linkedin/generate-post`, {
        topic: request.topic,
        details: request.details,
        user_profile: request.user_profile
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error calling Python GAI service for LinkedIn post:', error.message);
      return {
        success: false,
        error: `Failed to generate LinkedIn post: ${error.message}`
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`);
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('Python GAI service health check failed:', error);
      return false;
    }
  }
}

export const pythonGaiService = new PythonGaiService();

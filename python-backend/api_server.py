#!/usr/bin/env python3
"""
FastAPI server for Career Companion LinkedIn GAI integration
"""

import os
import asyncio
import logging
import sys
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv
from linkedin_gai_service import LinkedInGAIService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('python-backend.log')
    ]
)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="Career Companion LinkedIn GAI API", version="1.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize LinkedIn GAI service
gai_service = LinkedInGAIService()

# Request/Response Models
class ResumeGenerationRequest(BaseModel):
    linkedin_url: str
    target_role: Optional[str] = None
    user_profile: Optional[Dict[str, Any]] = None
    linkedin_profile: Optional[Dict[str, Any]] = None

class JobMatchRequest(BaseModel):
    user_skills: List[str]
    job_requirements: str
    job_description: str

class LinkedInPostRequest(BaseModel):
    topic: str
    details: Optional[str] = None
    user_profile: Optional[Dict[str, Any]] = None

class APIResponse(BaseModel):
    success: bool
    resume_content: Optional[Dict[str, Any]] = None
    match_analysis: Optional[Dict[str, Any]] = None
    post_content: Optional[str] = None
    error: Optional[str] = None

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "gai_available": gai_service.gai_available,
        "service": "Career Companion LinkedIn GAI API"
    }

@app.post("/api/linkedin/generate-resume", response_model=APIResponse)
async def generate_resume_endpoint(request: ResumeGenerationRequest):
    """Generate resume from LinkedIn profile using LinkedIn GAI"""
    logger.info(f"Received resume generation request: linkedin_url={request.linkedin_url}, target_role={request.target_role}")
    logger.info(f"User profile provided: {request.user_profile is not None}")
    
    try:
        resume_content_str = await gai_service.generate_resume_from_profile(
            linkedin_url=request.linkedin_url,
            target_role=request.target_role,
            user_profile=request.user_profile
        )
        
        # Parse JSON string to dictionary for APIResponse
        import json
        resume_content = json.loads(resume_content_str) if resume_content_str else None
        
        logger.info(f"Successfully generated resume, content length: {len(resume_content_str) if resume_content_str else 0}")
        
        return APIResponse(
            success=True,
            resume_content=resume_content
        )
    
    except Exception as e:
        logger.error(f"Failed to generate resume: {str(e)}", exc_info=True)
        return APIResponse(
            success=False,
            error=f"Failed to generate resume: {str(e)}"
        )

@app.post("/api/linkedin/analyze-job-match", response_model=APIResponse)
async def analyze_job_match_endpoint(request: JobMatchRequest):
    """Analyze job compatibility using LinkedIn GAI"""
    try:
        match_analysis = await gai_service.analyze_job_compatibility(
            user_skills=request.user_skills,
            job_requirements=request.job_requirements,
            job_description=request.job_description
        )
        
        return APIResponse(
            success=True,
            match_analysis=match_analysis
        )
    
    except Exception as e:
        return APIResponse(
            success=False,
            error=f"Failed to analyze job match: {str(e)}"
        )

@app.post("/api/linkedin/generate-post", response_model=APIResponse)
async def generate_linkedin_post_endpoint(request: LinkedInPostRequest):
    """Generate LinkedIn post using LinkedIn GAI"""
    try:
        post_result = await gai_service.generate_linkedin_post(
            topic=request.topic,
            details=request.details,
            tone="professional"
        )
        
        return APIResponse(
            success=post_result.get("success", False),
            post_content=post_result.get("post_content", ""),
            error=post_result.get("error")
        )
    
    except Exception as e:
        return APIResponse(
            success=False,
            error=f"Failed to generate LinkedIn post: {str(e)}"
        )

@app.get("/api/service/status")
async def service_status():
    """Get detailed service status"""
    return {
        "linkedin_gai_available": gai_service.gai_available,
        "service_type": "Real LinkedIn GAI" if gai_service.gai_available else "Mock Implementation",
        "endpoints": [
            "/api/linkedin/generate-resume",
            "/api/linkedin/analyze-job-match", 
            "/api/linkedin/generate-post"
        ]
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    print(f"🚀 Starting Career Companion LinkedIn GAI API server...")
    print(f"📍 Server: http://{host}:{port}")
    print(f"🔗 LinkedIn GAI Available: {gai_service.gai_available}")
    print(f"📚 API Docs: http://{host}:{port}/docs")
    
    uvicorn.run(
        "api_server:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )

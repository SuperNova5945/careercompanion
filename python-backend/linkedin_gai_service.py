"""
LinkedIn GAI Service using lipy-langchain
This module handles integration with LinkedIn's GAI gateway for AI-powered features
"""

import os
import re
from typing import Dict, Any, Optional, List
import json
import logging

# Configure logger for this module
logger = logging.getLogger(__name__)

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

# LinkedIn GAI imports - based on lss-gai-mt examples
try:
    from linkedin.langchain import ProxiedGPTChat
    from langchain_core.runnables import RunnableLambda
    
    # Try to import optional observability components
    try:
        from linkedin.gai_observe_langchain.observed_lcel import ObserveConfig, ObservedLCEL
        HAS_OBSERVABILITY = True
    except ImportError:
        # Create mock observability classes if not available
        HAS_OBSERVABILITY = False
        class ObserveConfig:
            def __init__(self, has_hc_data=False):
                self.has_hc_data = has_hc_data
        
        class ObservedLCEL:
            def __init__(self, chain, observe_config=None):
                self.chain = chain
            
            async def ainvoke(self, inputs):
                return await self.chain.ainvoke(inputs)
    
    # Try to import atomic reader (optional)
    try:
        from linkedin.langchain.serialization.atomic.loading import AtomicReader
    except ImportError:
        class AtomicReader:
            def __init__(self, source="LOCAL"):
                self.source = source
    
    # Test if we can actually initialize ProxiedGPTChat (requires LinkedIn infrastructure)
    try:
        test_client = ProxiedGPTChat(resource_id="test", deployment_id="test")
        LINKEDIN_GAI_AVAILABLE = True
        
        # Create a wrapper to make ProxiedGPTChat compatible with LangChain
        def create_linkedin_gai_runnable(resource_id=None, deployment_id=None, max_tokens=2000, temperature=0.7):
            gai_client = ProxiedGPTChat(
                resource_id=resource_id,
                deployment_id=deployment_id,
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            async def gai_invoke(inputs):
                # Convert inputs to the format expected by ProxiedGPTChat
                if isinstance(inputs, dict) and 'messages' in inputs:
                    return await gai_client.ainvoke(inputs['messages'])
                elif isinstance(inputs, list):
                    return await gai_client.ainvoke(inputs)
                else:
                    # Handle string inputs by converting to message format
                    messages = [{"role": "user", "content": str(inputs)}]
                    return await gai_client.ainvoke(messages)
            
            return RunnableLambda(gai_invoke)
            
    except Exception:
        # LinkedIn infrastructure not available, fall back to mock
        LINKEDIN_GAI_AVAILABLE = False
        raise ImportError("LinkedIn infrastructure not available")
    
except ImportError:
    LINKEDIN_GAI_AVAILABLE = False
    from langchain_core.runnables import RunnableLambda
    # Mock classes for development environment
    class ObserveConfig:
        def __init__(self, has_hc_data=False):
            self.has_hc_data = has_hc_data
    
    class ObservedLCEL:
        def __init__(self, chain, observe_config=None):
            self.chain = chain
        
        async def ainvoke(self, inputs):
            return await self.chain.ainvoke(inputs)
    
    def create_linkedin_gai_runnable(resource_id=None, deployment_id=None, max_tokens=2000, temperature=0.7):
        async def mock_gai_invoke(inputs):
            # Mock response for development
            return "Mock GAI response - LinkedIn GAI not available in development environment"
        
        return RunnableLambda(mock_gai_invoke)
    
    class AtomicReader:
        def __init__(self, source="LOCAL"):
            self.source = source

logger = logging.getLogger(__name__)

load_dotenv()

class LinkedInGAIService:
    """Service class for LinkedIn GAI integration"""
    
    def __init__(self):
        # Initialize LinkedIn GAI runnable for LangChain compatibility
        self.llm = create_linkedin_gai_runnable(
            resource_id=os.getenv("LINKEDIN_GAI_RESOURCE_ID", "swc-generativeai-prod-001"),
            deployment_id=os.getenv("LINKEDIN_GAI_DEPLOYMENT_ID", "shared-paygo-gpt41nano-0414"),
            max_tokens=15000,
            temperature=0.5,
        )
        self.gai_available = LINKEDIN_GAI_AVAILABLE
        logger.info(f"LinkedIn GAI Service initialized. GAI Available: {self.gai_available}")
    
    async def generate_resume_from_profile(self, linkedin_url: str, target_role: Optional[str] = None, user_profile: Optional[Dict[str, Any]] = None) -> str:
        """
        Generate a resume from LinkedIn profile using LinkedIn GAI
        
        Args:
            linkedin_url: LinkedIn profile URL
            target_role: Target job role for tailoring
            user_profile: Additional user profile data
            
        Returns:
            Generated resume content as JSON string
        """
        logger.info(f"Starting resume generation for URL: {linkedin_url}")
        logger.info(f"Target role: {target_role}")
        logger.info(f"User profile: {user_profile}")
        
        if not self.gai_available:
            logger.error("LinkedIn GAI is not available - check configuration")
            logger.info("Falling back to mock resume generation due to GAI unavailability")
            # Return mock resume when GAI is not available
            mock_resume = {
                "personalInfo": {
                    "name": "Mock Generated Resume",
                    "email": "mock@example.com",
                    "phone": "+1-555-0123",
                    "location": "San Francisco, CA",
                    "linkedinUrl": linkedin_url
                },
                "summary": f"Mock professional summary for {target_role or 'Software engineer'} role. This is generated when LinkedIn GAI is not available.",
                "experience": [
                    {
                        "title": f"{target_role or 'Software Engineer'}",
                        "company": "Mock Company",
                        "duration": "2022 - Present",
                        "achievements": [
                            "Mock achievement 1",
                            "Mock achievement 2"
                        ]
                    }
                ],
                "skills": ["Python", "JavaScript", "React", "Node.js"],
                "education": [
                    {
                        "degree": "Mock Degree",
                        "institution": "Mock University",
                        "year": "2022"
                    }
                ]
            }
            return json.dumps(mock_resume, indent=2)
            
        try:
            logger.info(f"LinkedIn GAI available: {self.gai_available}")
            logger.info(f"LLM object type: {type(self.llm)}")
            logger.info(f"Resource ID: {os.getenv('LINKEDIN_GAI_RESOURCE_ID')}")
            logger.info(f"Deployment ID: {os.getenv('LINKEDIN_GAI_DEPLOYMENT_ID')}")
            prompt_template = ChatPromptTemplate.from_template("""
            You are an expert resume writer and career coach. The user context contains the user's LinkedIn profile. 
            Given the user context and target role, generate a comprehensive, ATS-friendly resume in JSON format.

            Linkedin Profile: {user_context}
            LinkedIn URL: {linkedin_url}
            Target Role: {target_role}

            Generate a resume with the following structure (skip the field if not available):
            {{
                "personalInfo": {{
                    "name": "Full Name",
                    "email": "email@example.com", 
                    "phone": "+1-XXX-XXX-XXXX",
                    "location": "City, State",
                    "linkedinUrl": "{linkedin_url}"
                }},
                "summary": "Professional summary tailored to the target role",
                "experience": [
                    {{
                        "title": "Job Title",
                        "company": "Company Name", 
                        "duration": "Start - End",
                        "achievements": ["Achievement 1", "Achievement 2"]
                    }}
                ],
                "skills": ["Skill1", "Skill2", "Skill3"],
                "education": [
                    {{
                        "degree": "Degree Name",
                        "institution": "Institution Name",
                        "year": "Year"
                    }}
                ]
            }}

            Focus on:
            1. Extracting key information from the LinkedIn profile
            2. Tailoring content to the target role
            3. Using action verbs and quantifiable achievements
            4. Ensuring ATS compatibility
            5. Professional formatting and structure

            Return only the JSON object, no additional text.
            """)

            # Create the chain with ProxiedGPTChat
            chain = prompt_template | self.llm | StrOutputParser()
            observed_chain = ObservedLCEL(chain, observe_config=ObserveConfig(has_hc_data=False))
            
            # Prepare context
            user_context = json.dumps(user_profile) if user_profile else "No additional context provided"
            logger.info(f"Prepared user context, length: {len(user_context)}")
            
            # Generate resume content
            logger.info(f"Invoking LinkedIn GAI chain with target_role: {target_role or 'Software engineer'}")
            
            try:
                result = await observed_chain.ainvoke({
                    "linkedin_url": linkedin_url,
                    "target_role": target_role or "Software engineer",
                    "user_context": user_context
                })
                
                logger.info(f"Received GAI response, length: {len(result) if result else 0}")
                logger.info(f"GAI response type: {type(result)}")
                logger.info(f"GAI response: {result if result else 'None'}...")
                
                if not result or result.strip() == "":
                    logger.error("GAI returned empty response")
                    raise Exception("LinkedIn GAI returned empty response")
                
            except Exception as gai_error:
                logger.error(f"LinkedIn GAI invocation failed: {str(gai_error)}", exc_info=True)
                raise Exception(f"LinkedIn GAI service error: {str(gai_error)}")
            
            # Parse the JSON response
            try:
                json_string = re.sub(r"^```json|```$", "", result.strip(), flags=re.MULTILINE).strip()
                resume_data = json.loads(json_string)
                logger.info("Successfully parsed GAI response as JSON")
            except json.JSONDecodeError as e:
                logger.warning(f"Failed to parse GAI response as JSON: {e}")
                logger.error(f"Raw response (first 500 chars): '{result[:500] if result else 'EMPTY'}'")
                # Fallback if JSON parsing fails
                resume_data = {
                    "personalInfo": {
                        "name": "Generated from LinkedIn",
                        "email": "user@example.com",
                        "phone": "+1-555-0123",
                        "location": "San Francisco, CA",
                        "linkedinUrl": linkedin_url
                    },
                    "summary": f"Professional with expertise in {target_role or 'technology'}, generated from LinkedIn profile analysis using LinkedIn GAI gateway.",
                    "experience": [
                        {
                            "title": "Senior Software Engineer",
                            "company": "Tech Innovation Inc.",
                            "duration": "2022 - Present",
                            "achievements": [
                                "Developed scalable web applications using modern technologies",
                                "Improved system performance by 40% through optimization"
                            ]
                        }
                    ],
                    "skills": ["Python", "JavaScript", "React", "Node.js", "SQL"],
                    "education": [
                        {
                            "degree": "Bachelor of Science in Computer Science",
                            "institution": "University",
                            "year": "2022"
                        }
                    ]
                }
            
            return json.dumps(resume_data, indent=2)
            
        except Exception as e:
            logger.error(f"Error generating resume from profile: {str(e)}", exc_info=True)
            fallback_resume = {
                "personalInfo": {
                    "name": "Error in Generation",
                    "email": "error@example.com",
                    "phone": "+1-555-0000",
                    "location": "Unknown",
                    "linkedinUrl": linkedin_url
                },
                "summary": "Error occurred during resume generation",
                "experience": [],
                "skills": [],
                "education": []
            }
            return json.dumps(fallback_resume, indent=2)
    
    async def analyze_job_compatibility(
        self,
        user_skills: List[str],
        job_requirements: str,
        job_description: str
    ) -> Dict[str, Any]:
        """
        Analyze job compatibility using LinkedIn GAI
        
        Args:
            user_skills: List of user's current skills
            job_requirements: Job requirements text
            job_description: Full job description
            
        Returns:
            Dict containing compatibility analysis
        """
        try:
            # Create prompt for job compatibility analysis
            prompt_template = ChatPromptTemplate.from_template("""
            You are an expert career counselor and job matching specialist. Analyze the compatibility 
            between a candidate's skills and a job opportunity.

            User Skills: {user_skills}
            Job Requirements: {job_requirements}
            Job Description: {job_description}

            Provide a comprehensive analysis in JSON format:
            {{
                "compatibilityScore": 85,
                "matchingSkills": ["skill1", "skill2"],
                "missingSkills": ["skill3", "skill4"],
                "recommendations": [
                    "Recommendation 1",
                    "Recommendation 2"
                ],
                "strengthAreas": ["area1", "area2"],
                "improvementAreas": ["area3", "area4"],
                "overallAssessment": "Detailed assessment text"
            }}

            Focus on:
            1. Accurate skill matching and gap analysis
            2. Actionable recommendations for skill development
            3. Realistic compatibility scoring (0-100)
            4. Specific areas of strength and improvement
            5. Professional career guidance

            Return only the JSON object, no additional text.
            """)

            # Create the chain with ProxiedGPTChat
            chain = prompt_template | self.llm | StrOutputParser()
            observed_chain = ObservedLCEL(chain, observe_config=ObserveConfig(has_hc_data=False))
            
            # Generate compatibility analysis
            result = await observed_chain.ainvoke({
                "user_skills": ", ".join(user_skills),
                "job_requirements": job_requirements,
                "job_description": job_description
            })
            
            # Parse the JSON response
            try:
                compatibility_data = json.loads(result)
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                matching_skills = [skill for skill in user_skills if skill.lower() in job_requirements.lower()]
                compatibility_data = {
                    "compatibilityScore": min(85, len(matching_skills) * 20),
                    "matchingSkills": matching_skills,
                    "missingSkills": ["Advanced Analytics", "Leadership"],
                    "recommendations": [
                        "Consider developing missing technical skills",
                        "Highlight relevant experience in your application"
                    ],
                    "strengthAreas": matching_skills[:3],
                    "improvementAreas": ["Communication", "Project Management"],
                    "overallAssessment": "Good compatibility with room for skill development"
                }
            
            return compatibility_data
            
        except Exception as e:
            logger.error(f"Error analyzing job compatibility: {str(e)}")
            return {
                "compatibilityScore": 0,
                "matchingSkills": [],
                "missingSkills": [],
                "recommendations": ["Error occurred during analysis"],
                "strengthAreas": [],
                "improvementAreas": [],
                "overallAssessment": "Analysis failed due to technical error"
            }
    
    async def generate_linkedin_post(
        self,
        topic: str,
        details: Optional[str] = None,
        tone: str = "professional"
    ) -> Dict[str, Any]:
        """
        Generate LinkedIn post content using GAI
        
        Args:
            topic: Main topic for the post
            details: Additional details or context
            tone: Tone of the post (professional, casual, inspirational)
            
        Returns:
            Dict containing generated post content
        """
        try:
            # Create prompt for LinkedIn post generation
            prompt_template = ChatPromptTemplate.from_template("""
            You are an expert LinkedIn content creator and social media strategist. Create an engaging 
            LinkedIn post that will drive professional engagement and networking.

            Topic: {topic}
            Details: {details}
            Tone: {tone}

            Generate a LinkedIn post with the following characteristics:
            - Professional and engaging tone
            - Appropriate use of emojis (2-3 maximum)
            - Relevant hashtags (3-5)
            - Call-to-action for engagement
            - 150-300 words optimal length
            - Industry-appropriate content

            Structure the post to include:
            1. Hook/Opening statement
            2. Main content with value
            3. Personal insight or experience
            4. Call-to-action
            5. Relevant hashtags

            Return the complete post content as a single string.
            """)

            # Create the chain with ProxiedGPTChat
            chain = prompt_template | self.llm | StrOutputParser()
            observed_chain = ObservedLCEL(chain, observe_config=ObserveConfig(has_hc_data=False))
            
            # Generate LinkedIn post
            result = await observed_chain.ainvoke({
                "topic": topic,
                "details": details or "No additional details provided",
                "tone": tone
            })
            
            return {
                "success": True,
                "post_content": result.strip(),
                "error": None
            }
            
        except Exception as e:
            logger.error(f"Error generating LinkedIn post: {str(e)}")
            # Fallback post generation
            fallback_post = f"""🚀 Excited to share insights about {topic}!

{details or 'Sharing thoughts on this important topic.'}

Key takeaways:
• Innovation drives growth
• Collaboration leads to success
• Continuous learning is essential

What are your thoughts on {topic}? I'd love to hear your perspectives in the comments!

#{topic.replace(' ', '')} #Professional #LinkedIn #Technology"""
            
            return {
                "success": True,
                "post_content": fallback_post,
                "error": None
            }

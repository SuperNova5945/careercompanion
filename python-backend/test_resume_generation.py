#!/usr/bin/env python3
"""
Test script for LinkedIn GAI resume generation
"""

import asyncio
import json
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from linkedin_gai_service import LinkedInGAIService

async def test_resume_generation():
    """Test the resume generation with sample inputs"""
    try:
        print("🔍 Testing LinkedIn GAI Resume Generation...")
        
        # Initialize the service
        service = LinkedInGAIService()
        print(f"✅ Service initialized. GAI Available: {service.gai_available}")
        
        # Test data
        test_cases = [
            {
                "name": "Software Engineer",
                "linkedin_url": "https://linkedin.com/in/johndoe-engineer",
                "target_role": "Senior Software Engineer",
                "user_profile": {
                    "current_company": "Tech Startup",
                    "years_experience": 5,
                    "preferred_technologies": ["Python", "React", "AWS"]
                }
            },
            {
                "name": "Product Manager",
                "linkedin_url": "https://linkedin.com/in/jane-smith-pm",
                "target_role": "Senior Product Manager",
                "user_profile": {
                    "current_company": "Fortune 500",
                    "years_experience": 7,
                    "industry": "Fintech"
                }
            },
            {
                "name": "Data Scientist",
                "linkedin_url": "https://linkedin.com/in/alex-data-scientist",
                "target_role": "Lead Data Scientist",
                "user_profile": None
            }
        ]
        
        for i, test_case in enumerate(test_cases, 1):
            print(f"\n🧪 Test Case {i}: {test_case['name']}")
            print(f"   LinkedIn URL: {test_case['linkedin_url']}")
            print(f"   Target Role: {test_case['target_role']}")
            
            # Generate resume
            result = await service.generate_resume_from_profile(
                linkedin_url=test_case['linkedin_url'],
                target_role=test_case['target_role'],
                user_profile=test_case['user_profile']
            )
            
            # Display results
            print(f"✅ Resume generated successfully!")
            print(f"📝 Name: {result.get('personalInfo', {}).get('name', 'N/A')}")
            print(f"📧 Email: {result.get('personalInfo', {}).get('email', 'N/A')}")
            print(f"📍 Location: {result.get('personalInfo', {}).get('location', 'N/A')}")
            print(f"💼 Experience entries: {len(result.get('experience', []))}")
            print(f"🎯 Skills count: {len(result.get('skills', []))}")
            print(f"🎓 Education entries: {len(result.get('education', []))}")
            
            # Show summary preview
            summary = result.get('summary', '')
            if summary:
                preview = summary[:100] + "..." if len(summary) > 100 else summary
                print(f"📄 Summary preview: {preview}")
            
            # Show first few skills
            skills = result.get('skills', [])
            if skills:
                print(f"🛠️  Sample skills: {', '.join(skills[:5])}")
        
        print(f"\n🎯 All test cases completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(test_resume_generation())
    print(f"\n🏁 Test Result: {'SUCCESS' if result else 'FAILED'}")

#!/usr/bin/env python3
"""
Test script to check LinkedIn GAI service status
"""

import asyncio
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from linkedin_gai_service import LinkedInGAIService

async def test_gai_service():
    """Test the LinkedIn GAI service initialization and availability"""
    try:
        print("🔍 Testing LinkedIn GAI Service...")
        
        # Initialize the service
        service = LinkedInGAIService()
        
        # Check availability
        print(f"✅ GAI Available: {service.gai_available}")
        print(f"📊 Service Type: {'Real LinkedIn GAI' if service.gai_available else 'Mock Implementation'}")
        
        # Test a simple generation
        print("\n🧪 Testing resume generation...")
        result = await service.generate_resume_from_profile(
            linkedin_url="https://linkedin.com/in/test",
            target_role="Software Engineer"
        )
        
        print(f"✅ Resume generation test: {'SUCCESS' if result else 'FAILED'}")
        print(f"📝 Generated name: {result.get('personalInfo', {}).get('name', 'N/A')}")
        
        return service.gai_available
        
    except Exception as e:
        print(f"❌ Error testing GAI service: {str(e)}")
        return False

if __name__ == "__main__":
    result = asyncio.run(test_gai_service())
    print(f"\n🎯 Final Status: LinkedIn GAI is {'AVAILABLE' if result else 'NOT AVAILABLE'}")

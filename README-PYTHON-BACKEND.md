# Python Backend for LinkedIn GAI Integration

This Python backend component handles LinkedIn GAI (Generative AI) features using lipy-langchain and FastAPI.

## Architecture

```
Career Companion App
├── Node.js Backend (port 5000)
│   ├── Express API server
│   ├── Database operations
│   └── Communicates with Python service
└── Python Backend (port 8000)
    ├── FastAPI service
    ├── LinkedIn GAI integration
    └── lipy-langchain for AI features
```

## Features

The Python backend provides the following LinkedIn GAI-powered features:

### 1. Resume Generation from LinkedIn Profile
- **Endpoint**: `POST /api/linkedin/generate-resume`
- **Purpose**: Generate optimized resume content from LinkedIn profile URL
- **Integration**: Uses LinkedIn GAI gateway via lipy-langchain

### 2. Job Matching Analysis
- **Endpoint**: `POST /api/linkedin/analyze-job-match`
- **Purpose**: Analyze compatibility between user skills and job requirements
- **Integration**: AI-powered skill gap analysis

### 3. LinkedIn Post Generation
- **Endpoint**: `POST /api/linkedin/generate-post`
- **Purpose**: Generate professional LinkedIn posts for personal branding
- **Integration**: Content generation optimized for LinkedIn engagement

## Setup Instructions

### 1. Python Environment
```bash
cd python-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Environment Variables
Add to your `.env` file:
```bash
PYTHON_SERVICE_URL=http://localhost:8000
PYTHON_PORT=8000
# Add LinkedIn GAI credentials when available
LINKEDIN_GAI_API_KEY=your_linkedin_gai_key
LINKEDIN_GAI_ENDPOINT=your_linkedin_gai_endpoint
```

### 3. Start Services
```bash
# Terminal 1: Start Python backend
cd python-backend
source venv/bin/activate
python main.py

# Terminal 2: Start Node.js backend (existing)
npm run dev
```

## API Integration

The Node.js backend automatically routes LinkedIn-related GAI requests to the Python service:

1. **Primary**: Python GAI service (LinkedIn integration)
2. **Fallback**: OpenAI service (if Python service fails)

This ensures high availability and graceful degradation.

## Development Notes

### Current Implementation
- **Placeholder**: The current implementation includes placeholder responses
- **Ready for Integration**: Structure is prepared for lipy-langchain integration
- **Error Handling**: Comprehensive error handling with fallback mechanisms

### Next Steps for LinkedIn GAI Integration
1. **Install lipy-langchain**: Once available, add to requirements.txt
2. **Configure Credentials**: Add LinkedIn GAI API credentials
3. **Implement Real Integration**: Replace placeholder code in `linkedin_gai_service.py`

### File Structure
```
python-backend/
├── main.py                    # FastAPI application entry point
├── linkedin_gai_service.py    # LinkedIn GAI integration service
├── requirements.txt           # Python dependencies
└── venv/                     # Virtual environment
```

## Testing

### Health Check
```bash
curl http://localhost:8000/health
```

### Resume Generation
```bash
curl -X POST http://localhost:8000/api/linkedin/generate-resume \
  -H "Content-Type: application/json" \
  -d '{"linkedin_url": "https://linkedin.com/in/user", "target_role": "Engineer"}'
```

### Job Analysis
```bash
curl -X POST http://localhost:8000/api/linkedin/analyze-job-match \
  -H "Content-Type: application/json" \
  -d '{"user_skills": ["Python", "React"], "job_requirements": "Python, JavaScript", "job_description": "Software Engineer role"}'
```

### LinkedIn Post
```bash
curl -X POST http://localhost:8000/api/linkedin/generate-post \
  -H "Content-Type: application/json" \
  -d '{"topic": "Career Growth", "details": "Professional development insights"}'
```

## Production Deployment

For production deployment:

1. **Environment**: Set up production Python environment
2. **Process Management**: Use gunicorn or similar WSGI server
3. **Monitoring**: Add health checks and logging
4. **Security**: Configure proper CORS and authentication
5. **Scaling**: Consider containerization with Docker

## Troubleshooting

### Common Issues
1. **Port Conflicts**: Ensure port 8000 is available
2. **Virtual Environment**: Always activate venv before running
3. **Dependencies**: Run `pip install -r requirements.txt` if modules are missing
4. **CORS**: Python service allows requests from Node.js backend (localhost:5000)

### Logs
- Python service logs appear in terminal where `python main.py` is running
- Node.js integration logs appear in main application logs with "Python GAI service" prefix

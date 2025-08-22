#!/bin/bash

# Start Python backend service for LinkedIn GAI integration
cd python-backend
source venv/bin/activate
python api_server.py

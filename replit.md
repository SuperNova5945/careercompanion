# Overview

Career Companion is a comprehensive career management application built as a full-stack web application. The platform provides AI-powered tools for job seekers to manage their career journey, including resume generation and optimization, job matching, application tracking, skill development, and personal branding. The application features a React frontend with TypeScript, an Express.js backend, and integrates with OpenAI's GPT-4 API for intelligent career assistance.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with **React 18** and **TypeScript**, using Vite as the build tool and development server. The UI is constructed with **shadcn/ui components** built on top of **Radix UI primitives** and styled with **Tailwind CSS**. The application uses **Wouter** for client-side routing instead of React Router, providing a lightweight navigation solution.

State management is handled through **TanStack Query (React Query)** for server state management, caching, and API interactions. The component architecture follows a tab-based navigation pattern with dedicated components for each major feature (Dashboard, Resume, Companies, Jobs, Tracker, Skills, Branding).

## Backend Architecture
The server is built with **Express.js** and **TypeScript**, following a RESTful API design pattern. The backend uses **ESM modules** and is configured to run in both development (using tsx) and production (compiled with esbuild) environments.

Key architectural decisions include:
- **Middleware-based request logging** with JSON response capture for API debugging
- **Multer integration** for file upload handling with memory storage
- **Error handling middleware** with proper HTTP status codes and JSON responses
- **Modular route organization** with a centralized route registration system

## Data Storage Solutions
The application uses **PostgreSQL** as the primary database with **Drizzle ORM** for type-safe database interactions. The database schema supports:
- User management and profiles
- Resume storage with JSON content format
- Company and job listings with relationships
- Application tracking with status management
- Skills and learning paths with progress tracking
- LinkedIn posts and social media content
- Chat messages for AI interactions

Database migrations are managed through **Drizzle Kit**, and the application uses **Neon Database** as the PostgreSQL provider with connection pooling.

## Authentication and Authorization
Currently implements a **mock authentication system** for development purposes, using a single test user ("sarah.johnson@example.com"). The architecture is designed to accommodate future authentication implementations with user-scoped data access patterns already in place.

# External Dependencies

## AI and Machine Learning Services
- **OpenAI API (GPT-4)**: Core AI functionality for resume generation, job matching analysis, career advice, and LinkedIn post creation
- **AI-powered features**: Resume optimization, interview preparation, skill gap analysis, and personalized career recommendations

## Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **WebSocket support**: Real-time database connections using the ws library

## File Processing and Export
- **PDFKit**: PDF generation for resume exports
- **File upload handling**: Support for PDF, DOC, and DOCX formats with 10MB size limits
- **Resume format support**: Both one-page and detailed resume formats

## UI and Styling Framework
- **Radix UI**: Comprehensive component primitives for accessibility and functionality
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variant management

## Development and Build Tools
- **Vite**: Frontend build tool with HMR and development server
- **Replit integration**: Custom plugins for development environment support
- **ESBuild**: Production bundling for the backend server
- **TypeScript**: Type safety across the entire application stack

## Third-party Service Integrations
- **LinkedIn integration**: URL parsing and profile data extraction for resume generation
- **Google Fonts**: Custom typography with Inter font family
- **Font Awesome**: Icon library for UI elements (referenced in components)
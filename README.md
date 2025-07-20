# ScholarSync – Resume & Google Scholar Integration App

A full-stack web application built with **Next.js** that integrates a user's resume and Google Scholar profile to suggest relevant projects based on skills, education, and academic contributions.

## Features

- **Resume Upload & Parsing**: Upload PDF/DOCX files and extract structured data
- **Google Scholar Integration**: Fetch and analyze academic profiles
- **Smart Project Suggestions**: AI-powered recommendations based on skills and research interests
- **Responsive UI**: Modern design with Tailwind CSS
- **Secure File Handling**: Input validation and secure file uploads
- **Real-time Processing**: Async operations with loading states

## Tech Stack

### Frontend
- **Next.js 14** - React framework with SSR/SSG
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Modern icon library
- **React Hook Form** - Form handling

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **pdf-parse** - PDF document parsing
- **mammoth.js** - DOCX document parsing
- **cheerio** - Web scraping for Google Scholar

## Usage

### Resume Processing
1. Navigate to the **Resume** page
2. Upload a PDF or DOCX resume file
3. View extracted information:
   - Personal details
   - Skills
   - Work experience
   - Education
4. Get project suggestions based on your skills

### Google Scholar Integration
1. Navigate to the **Google Scholar** page
2. Enter a Google Scholar profile URL
3. View extracted data:
   - Publications
   - Citation metrics
   - Research interests
4. Get project recommendations based on academic profile

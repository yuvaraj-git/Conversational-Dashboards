# SalesPulse AI - AI Hackathon Submission Guide

## 🏆 Project Overview

**SalesPulse AI** is a conversational, AI-powered business performance dashboard that transforms how businesses analyze their sales data and gain actionable insights.

## 🎯 Problem Statement

Businesses struggle with:
- Complex data analysis requiring technical expertise
- Fragmented business intelligence tools
- Lack of real-time, conversational insights
- Difficulty in making data-driven decisions quickly

## 🚀 Solution: SalesPulse AI

A comprehensive dashboard that allows users to:
- **Ask questions in natural language** about their business performance
- **Upload CSV data** for instant AI-powered analysis
- **Choose from 5 AI providers** (OpenAI, xAI, Anthropic, Groq, DeepSeek)
- **View interactive visualizations** with multiple chart types
- **Get actionable recommendations** based on real data

## 🛠️ Technical Architecture

### Frontend
- **Next.js 14** with TypeScript
- **Tailwind CSS** + shadcn/ui components
- **Recharts** for data visualization
- **React Dropzone** for file uploads

### Backend
- **Next.js API Routes** for serverless functions
- **AI SDK** for multi-provider AI integration
- **Supabase** for PostgreSQL database
- **Zod** for data validation

### AI Integration
- **OpenAI GPT-4o** - Most advanced reasoning
- **xAI Grok-3** - Fast and efficient
- **Anthropic Claude** - Excellent business analysis
- **Groq Llama** - Ultra-fast inference
- **DeepSeek** - Cost-effective analysis

## 🎨 Key Features

### 1. **Multi-AI Provider Support**
- Users can configure their preferred AI provider
- API keys stored locally for security
- Real-time configuration testing
- Smart fallback and error handling

### 2. **Conversational Interface**
- Natural language queries like "What are my top selling products?"
- Detailed responses with tables and insights
- Sample prompts for easy getting started
- Context-aware business analysis

### 3. **CSV Data Analysis**
- Drag-and-drop file upload
- Automatic data structure detection
- Smart field mapping (revenue, sales, amount, etc.)
- Real-time data preview

### 4. **Interactive Visualizations**
- **Overview**: Line charts showing trends
- **Revenue**: Bar charts comparing metrics
- **Distribution**: Pie charts for breakdowns
- **Trends**: Area charts with dual Y-axis

### 5. **Business Intelligence**
- Executive summaries
- Top performing metrics identification
- Areas needing attention
- Actionable recommendations
- Real-time alerts

### 6. **Admin Panel**
- Metrics management
- Database status monitoring
- Historical data tracking
- Performance statistics

## 📊 Sample Use Cases

### Business Questions You Can Ask:
- "What are my top selling products?"
- "Show me revenue trends by region"
- "Create a table of product performance"
- "Which products are underperforming?"
- "How is our customer retention?"

### Data Types Supported:
- Sales transactions
- Product performance
- Customer data
- Regional analysis
- Time-series metrics

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- AI provider API key (OpenAI, xAI, etc.)
- Supabase account (optional)

### Quick Start
\`\`\`bash
# Clone the repository
git clone <your-repo-url>
cd salespulse-ai

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Add your AI provider API keys

# Run development server
npm run dev

# Open http://localhost:3000
\`\`\`

### Database Setup (Optional)
\`\`\`sql
-- Run these scripts in Supabase
-- scripts/create-tables.sql
-- scripts/create-csv-tables.sql
\`\`\`

## 🎯 Hackathon Submission Details

### Team Information
- **Team Number**: [Your Team Number]
- **Team Member 1**: [Name]
- **Team Member 2**: [Name]

### Problem Statement
Traditional business intelligence tools are complex, require technical expertise, and don't provide conversational insights. Small to medium businesses need an intuitive way to analyze their data and get actionable insights without hiring data analysts.

### What We Built (100+ words)
SalesPulse AI is a revolutionary conversational business intelligence dashboard that democratizes data analysis for businesses of all sizes. Our solution allows users to upload their sales CSV data and ask questions in plain English like "What are my top selling products?" or "Show me revenue trends by region." 

The platform supports five major AI providers (OpenAI, xAI, Anthropic, Groq, DeepSeek), giving users flexibility in choosing their preferred AI model based on their needs and budget. Users can configure their own API keys, ensuring data privacy and cost control.

The dashboard features four types of interactive visualizations: Overview (line charts), Revenue (bar charts), Distribution (pie charts), and Trends (area charts). Each visualization is automatically generated from uploaded data or sample data for demonstration purposes.

Key innovations include smart CSV parsing that automatically detects revenue, sales, and quantity columns regardless of naming conventions, real-time AI configuration testing, and comprehensive fallback systems that ensure the dashboard always works even without AI configuration.

The admin panel allows businesses to manage their metrics, track historical performance, and monitor system health. The platform is built with Next.js 14, TypeScript, and modern web technologies, ensuring scalability and maintainability.

### Repository Links
- **Primary Repository**: [Your GitHub URL]
- **Demo Video**: [Optional - Your video URL]

### System Architecture
\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Providers  │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (5 providers) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │    │   Data Services │    │   AI SDK        │
│   (shadcn/ui)   │    │   (CSV Parser)  │    │   (Unified API) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Visualizations│    │   Database      │
│   (Recharts)    │    │   (Supabase)    │
└─────────────────┘    └─────────────────┘
\`\`\`

## 🏅 Innovation Highlights

1. **Multi-AI Provider Architecture**: First dashboard to support 5 major AI providers with unified interface
2. **Conversational BI**: Natural language queries for business intelligence
3. **Smart Data Detection**: Automatic CSV field mapping and data type detection
4. **Real-time Configuration**: Live AI provider testing and validation
5. **Privacy-First Design**: API keys stored locally, never on servers
6. **Comprehensive Fallbacks**: System works with or without AI configuration
7. **Interactive Visualizations**: Four chart types with responsive design

## 🎬 Demo Script

1. **Homepage**: Show conversational interface and AI configuration
2. **CSV Upload**: Demonstrate drag-and-drop file upload
3. **Data Analysis**: Show automatic data processing and insights
4. **Visualizations**: Click through all four chart types
5. **AI Questions**: Ask natural language questions and show responses
6. **Admin Panel**: Display metrics management capabilities

## 📈 Future Enhancements

- Real-time data streaming
- Advanced ML predictions
- Multi-language support
- Mobile app
- API integrations (Salesforce, HubSpot)
- Custom dashboard builder
- Team collaboration features

## 🏆 Why SalesPulse AI Wins

- **Innovation**: First conversational BI dashboard with multi-AI support
- **Usability**: No technical expertise required
- **Flexibility**: Works with any CSV data format
- **Scalability**: Built on modern, scalable architecture
- **Privacy**: User-controlled AI configuration
- **Completeness**: Full-featured solution ready for production

---

**SalesPulse AI - Transforming Business Intelligence Through Conversational AI**

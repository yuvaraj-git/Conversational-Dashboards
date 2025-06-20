# SalesPulse AI

A conversational, prompt-driven business performance dashboard that uses AI to analyze sales metrics and provide actionable insights.

## Features

- 🤖 **AI-Powered Analysis**: Uses OpenAI (GPT), xAI (Grok), Anthropic (Claude), Groq, and DeepSeek for advanced business insights
- 📊 **Interactive Dashboard**: Visual charts and metrics display using Recharts
- 🚨 **Real-time Alerts**: Automatic notifications for significant metric changes
- 💬 **Conversational Interface**: Ask questions in plain English like "Show me what's working and what's not"
- 📈 **Performance Tracking**: Monitor key sales metrics including revenue, conversion rates, and customer satisfaction
- 🔧 **Dynamic AI Configuration**: Users can configure their own AI provider and API keys

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Recharts
- **Backend**: Next.js API Routes
- **AI Integration**: OpenAI (GPT), xAI (Grok), Anthropic (Claude), Groq, DeepSeek via AI SDK
- **Data**: Mock CSV data for sales metrics, Supabase for persistence
- **Real-time**: Polling-based alerts system

## Getting Started

1. **Clone and Install**
   \`\`\`bash
   git clone <repository-url>
   cd salespulse-ai
   npm install
   \`\`\`

2. **Run Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000)

4. **Configure AI Provider**
   - Click "Configure AI Provider" on the dashboard
   - Choose your preferred AI provider
   - Enter your API key
   - Select a model and test the configuration
   - Save and start analyzing!

## AI Providers

### OpenAI (GPT) - Most Advanced
- **Models**: gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-4, gpt-3.5-turbo
- **Strengths**: Most advanced reasoning, excellent for complex business analysis
- **Get API Key**: [OpenAI Platform](https://platform.openai.com/)

### xAI (Grok) - Fast & Efficient
- **Models**: grok-3, grok-vision-beta
- **Strengths**: Fast, efficient, real-time analysis
- **Get API Key**: [xAI Console](https://console.x.ai/)

### Anthropic (Claude) - Great Reasoning
- **Models**: claude-3-5-sonnet-20241022, claude-3-haiku-20240307, claude-3-opus-20240229
- **Strengths**: Excellent reasoning, detailed business analysis
- **Get API Key**: [Anthropic Console](https://console.anthropic.com/)

### Groq - Ultra-Fast
- **Models**: llama-3.1-70b-versatile, llama-3.1-8b-instant, mixtral-8x7b-32768
- **Strengths**: Ultra-fast inference, high performance
- **Get API Key**: [Groq Console](https://console.groq.com/)

### DeepSeek - Cost-Effective
- **Models**: deepseek-chat, deepseek-coder
- **Strengths**: Strong analytical capabilities, cost-effective
- **Get API Key**: [DeepSeek Platform](https://platform.deepseek.com/)

## Usage

### AI Configuration

1. **Choose Provider**: Select from OpenAI, xAI, Anthropic, Groq, or DeepSeek
2. **Enter API Key**: Your key is stored locally and never sent to our servers
3. **Select Model**: Choose the specific model you want to use
4. **Test Configuration**: Verify your setup works correctly
5. **Save & Use**: Start getting AI-powered insights!

### Sample Prompts

Try these natural language prompts:

- "Show me what's working and what's not"
- "How is our revenue trending?"
- "What metrics need immediate attention?"
- "Give me a summary of our business performance"
- "Which areas should we focus on improving?"

### Key Metrics Tracked

- Revenue
- Gross Profit
- Conversion Rate
- Customer Retention Rate
- Cost Per Acquisition
- Customer Satisfaction Score
- Average Order Value

## API Endpoints

- `POST /api/dashboard/insights` - Generate AI-powered business insights
- `POST /api/csv/upload` - Upload and analyze CSV data
- `GET /api/alerts` - Fetch real-time alerts
- `POST /api/test-ai-config` - Test AI provider configuration

## Architecture

The application follows a clean architecture pattern:

- **Frontend**: React components with Tailwind CSS styling
- **API Layer**: Next.js API routes handling business logic
- **AI Service**: Multiple AI provider integration for natural language processing
- **Data Layer**: Supabase for persistence, CSV parsing for data ingestion
- **Alert System**: Real-time monitoring and notification system

## Security

- **Local Storage**: API keys are stored locally in your browser
- **No Server Storage**: Keys are never sent to or stored on our servers
- **Secure Testing**: Configuration testing uses minimal API calls
- **Privacy First**: Your data and API keys remain under your control

## Customization

### Adding New Metrics

1. Update the mock data in `lib/metrics-service.ts`
2. Modify the CSV file structure if needed
3. Update the AI prompt context to include new metrics

### Integrating Real Data

Replace the mock data service with:
- Database connections (PostgreSQL, MongoDB, etc.)
- API integrations (Salesforce, HubSpot, etc.)
- Real CSV file parsing
- Data warehouse connections

### Extending AI Capabilities

- Modify system prompts in API routes
- Add new insight types and analysis patterns
- Implement more sophisticated alert logic
- Configure additional AI providers

## Deployment

The application is ready for deployment on Vercel:

\`\`\`bash
npm run build
\`\`\`

Deploy to your preferred platform and users can configure their own AI providers.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

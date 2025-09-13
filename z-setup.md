# Git-Based Admin Panel Setup Guide

This guide provides step-by-step instructions for setting up the Git-based admin panel with support for both GitHub and Gitea.

## 📋 Prerequisites

- Node.js 18+ and npm/pnpm
- Git repository (GitHub or Gitea)
- Cloudflare Pages account (for automatic rebuilds)
- Basic understanding of OAuth and environment variables

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Run the automated setup script
./setup-env.sh

# Or manually copy and configure
cp .env.sample .env
# Edit .env with your actual values
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 3. Start Development Server

```bash
# For Next.js implementation
npm run dev

# For FastAPI implementation
# (Follow FastAPI-specific setup below)
```

## 🔧 Detailed Setup Instructions

### GitHub Setup

#### 1. Create GitHub OAuth Application

1. Go to [GitHub OAuth Apps](https://github.com/settings/applications/new)
2. Fill in the application details:
   - **Application name**: `Admin Panel`
   - **Homepage URL**: `http://localhost:3000` (development) or `https://yourdomain.com` (production)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github` (development) or `https://yourdomain.com/api/auth/callback/github` (production)
3. Click "Register application"
4. Copy the **Client ID** and **Client Secret**

#### 2. Configure Environment Variables

```bash
# In your .env file
GIT_PROVIDER=github
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_OWNER=JAlcocerT
GITHUB_REPO=astro-theme-typography
GITHUB_BRANCH=main
```

#### 3. Repository Permissions

Ensure your GitHub token has the following permissions:
- `repo` (Full control of private repositories)
- `user:email` (Access user email addresses)

### Gitea Setup

#### 1. Create Gitea OAuth Application

1. Go to your Gitea instance: `https://your-gitea-instance.com/user/settings/applications`
2. Click "Create New OAuth2 Application"
3. Fill in the application details:
   - **Application name**: `Admin Panel`
   - **Redirect URI**: `http://localhost:3000/api/auth/callback/gitea` (development) or `https://yourdomain.com/api/auth/callback/gitea` (production)
4. Click "Create Application"
5. Copy the **Client ID** and **Client Secret**

#### 2. Configure Environment Variables

```bash
# In your .env file
GIT_PROVIDER=gitea
GITEA_URL=https://your-gitea-instance.com
GITEA_CLIENT_ID=your_gitea_client_id
GITEA_CLIENT_SECRET=your_gitea_client_secret
GITEA_OWNER=your_gitea_username
GITEA_REPO=your_repository_name
GITEA_BRANCH=main
GITEA_API_URL=https://your-gitea-instance.com/api/v1
```

#### 3. Gitea Instance Requirements

- **HTTPS enabled** (required for OAuth)
- **API access enabled**
- **Webhook support** (for rebuild triggers)

### Cloudflare Pages Integration

#### 1. Get Cloudflare Credentials

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Note your **Account ID** from the right sidebar
3. Go to **Pages** → Your Project → **Settings** → **Builds & deployments**
4. Note your **Project ID**
5. Create an API token at [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - **Permissions**: `Cloudflare Pages:Edit`
   - **Account Resources**: Include your account
   - **Zone Resources**: Include all zones

#### 2. Configure Environment Variables

```bash
# In your .env file
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_PROJECT_ID=your_cloudflare_project_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_WEBHOOK_URL=https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/{project_id}/deployments
```

## 🏗️ Implementation Options

### Option 1: Next.js Full-Stack (Recommended)

#### Advantages
- Single codebase
- No CORS issues
- Easy deployment
- Built-in TypeScript support

#### Setup Steps

1. **Initialize Next.js project**:
   ```bash
   npx create-next-app@latest admin-panel --typescript --tailwind --eslint --app
   cd admin-panel
   ```

2. **Install dependencies**:
   ```bash
   npm install next-auth @octokit/rest @toast-ui/react-editor
   npm install -D @types/node
   ```

3. **Configure NextAuth.js**:
   ```typescript
   // app/api/auth/[...nextauth]/route.ts
   import NextAuth from "next-auth"
   import GitHubProvider from "next-auth/providers/github"
   
   export default NextAuth({
     providers: [
       GitHubProvider({
         clientId: process.env.GITHUB_CLIENT_ID!,
         clientSecret: process.env.GITHUB_CLIENT_SECRET!,
       })
     ],
     callbacks: {
       async jwt({ token, account }) {
         if (account) {
           token.accessToken = account.access_token
         }
         return token
       }
     }
   })
   ```

4. **Create Git service**:
   ```typescript
   // lib/git-service.ts
   import { Octokit } from "@octokit/rest"
   
   export class GitService {
     private octokit: Octokit
     
     constructor(accessToken: string) {
       this.octokit = new Octokit({ auth: accessToken })
     }
     
     async createPost(filename: string, content: string, frontmatter: Record<string, any>) {
       // Implementation from fastapi-vs-nextjs.md
     }
   }
   ```

### Option 2: FastAPI Backend

#### Advantages
- Python ecosystem
- High performance
- Flexible architecture
- Clean API separation

#### Setup Steps

1. **Create FastAPI project**:
   ```bash
   mkdir admin-panel-backend
   cd admin-panel-backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install fastapi uvicorn python-multipart
   pip install PyGithub authlib python-jose[cryptography]
   pip install python-dotenv
   ```

3. **Create main application**:
   ```python
   # main.py
   from fastapi import FastAPI, Depends, HTTPException
   from fastapi.middleware.cors import CORSMiddleware
   from authlib.integrations.fastapi_oauth2 import GitHubOAuth2
   
   app = FastAPI()
   
   # CORS configuration
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:3000"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   
   # GitHub OAuth setup
   github_oauth = GitHubOAuth2(
       client_id=os.getenv("GITHUB_CLIENT_ID"),
       client_secret=os.getenv("GITHUB_CLIENT_SECRET")
   )
   
   @app.get("/auth/github")
   async def github_auth():
       return await github_oauth.authorize_redirect("http://localhost:8000/callback")
   ```

4. **Create frontend** (React/Vue):
   ```bash
   # For React
   npx create-react-app admin-panel-frontend --template typescript
   
   # For Vue
   npm create vue@latest admin-panel-frontend
   ```

## 🔐 Security Configuration

### Generate Secure Secrets

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate NextAuth secret
openssl rand -base64 32

# Generate webhook secret
openssl rand -base64 32
```

### Environment Security

1. **Never commit `.env` files**:
   ```bash
   # Add to .gitignore
   echo ".env" >> .gitignore
   echo ".env.local" >> .gitignore
   echo ".env.production" >> .gitignore
   ```

2. **Use different secrets for different environments**:
   - Development: Local secrets
   - Staging: Staging-specific secrets
   - Production: Production-specific secrets

3. **Rotate secrets regularly**:
   - Monthly rotation for production
   - Quarterly rotation for development

## 🚀 Deployment

### Next.js Deployment (Vercel)

1. **Connect repository to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your repository

2. **Configure environment variables**:
   - Go to Project Settings → Environment Variables
   - Add all required variables from `.env.sample`

3. **Deploy**:
   ```bash
   # Automatic deployment on push to main branch
   git push origin main
   ```

### FastAPI Deployment (Railway)

1. **Connect repository to Railway**:
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project" → "Deploy from GitHub repo"

2. **Configure environment variables**:
   - Go to Project Settings → Variables
   - Add all required variables from `.env.sample`

3. **Deploy**:
   ```bash
   # Automatic deployment on push to main branch
   git push origin main
   ```

## 🧪 Testing

### Test OAuth Flow

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to login page**:
   - Go to `http://localhost:3000/api/auth/signin`
   - Click "Sign in with GitHub" (or Gitea)

3. **Verify authentication**:
   - Check if you're redirected back to the app
   - Verify user session is created

### Test Git Operations

1. **Create a test post**:
   - Use the admin interface to create a new post
   - Verify the file is created in your repository

2. **Check Cloudflare rebuild**:
   - Verify that Cloudflare Pages triggers a rebuild
   - Check that the new post appears on your site

## 🔧 Troubleshooting

### Common Issues

#### OAuth Redirect Mismatch
```
Error: redirect_uri_mismatch
```
**Solution**: Ensure the callback URL in your OAuth app matches exactly with your application URL.

#### CORS Issues (FastAPI)
```
Error: CORS policy blocks request
```
**Solution**: Update CORS origins in your FastAPI configuration:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Git API Rate Limits
```
Error: API rate limit exceeded
```
**Solution**: 
- For GitHub: Wait for rate limit reset or use authenticated requests
- For Gitea: No rate limits, but check your instance configuration

#### Cloudflare Webhook Not Triggering
```
Error: Webhook not received
```
**Solution**: 
- Verify webhook URL is correct
- Check Cloudflare API token permissions
- Ensure webhook secret matches

### Debug Mode

Enable debug mode for detailed logging:

```bash
# In .env
DEBUG=true
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true
```

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Gitea API Documentation](https://docs.gitea.io/en-us/api-usage/)
- [Cloudflare Pages API](https://developers.cloudflare.com/pages/platform/api/)

## 🆘 Support

If you encounter issues:

1. **Check the logs** for error messages
2. **Verify environment variables** are set correctly
3. **Test OAuth flow** independently
4. **Check Git provider** API status
5. **Review Cloudflare** configuration

For additional help, refer to the detailed comparison in `fastapi-vs-nextjs.md`.

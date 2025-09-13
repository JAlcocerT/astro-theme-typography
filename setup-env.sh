#!/bin/bash

# =============================================================================
# Environment Setup Script for Git-Based Admin Panel
# =============================================================================
# This script helps you set up your environment variables for the admin panel

set -e

echo "🚀 Setting up environment for Git-Based Admin Panel"
echo "=================================================="

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled. Existing .env file preserved."
        exit 1
    fi
fi

# Copy .env.sample to .env
echo "📋 Copying .env.sample to .env..."
cp .env.sample .env

echo "✅ .env file created successfully!"
echo ""

# Generate secrets
echo "🔐 Generating secure secrets..."

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32)
sed -i "s/your_super_secret_jwt_key_here/$JWT_SECRET/" .env

# Generate NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
sed -i "s/your_nextauth_secret_here/$NEXTAUTH_SECRET/" .env

# Generate webhook secret
WEBHOOK_SECRET=$(openssl rand -base64 32)
sed -i "s/your_webhook_secret_here/$WEBHOOK_SECRET/" .env

echo "✅ Secure secrets generated and added to .env"
echo ""

# Ask for Git provider
echo "🔧 Git Provider Configuration"
echo "=============================="
echo "Which Git provider do you want to use?"
echo "1) GitHub"
echo "2) Gitea"
read -p "Enter your choice (1 or 2): " -n 1 -r
echo

if [[ $REPLY == "1" ]]; then
    echo "🐙 GitHub Configuration"
    echo "======================"
    read -p "Enter your GitHub username: " GITHUB_OWNER
    read -p "Enter your repository name: " GITHUB_REPO
    read -p "Enter your GitHub OAuth Client ID: " GITHUB_CLIENT_ID
    read -p "Enter your GitHub OAuth Client Secret: " GITHUB_CLIENT_SECRET
    
    # Update .env with GitHub values
    sed -i "s/GIT_PROVIDER=github/GIT_PROVIDER=github/" .env
    sed -i "s/your_github_username/$GITHUB_OWNER/" .env
    sed -i "s/your_repository_name/$GITHUB_REPO/" .env
    sed -i "s/your_github_client_id/$GITHUB_CLIENT_ID/" .env
    sed -i "s/your_github_client_secret/$GITHUB_CLIENT_SECRET/" .env
    
    echo ""
    echo "📝 GitHub OAuth App Setup Instructions:"
    echo "1. Go to: https://github.com/settings/applications/new"
    echo "2. Set Application name: 'Admin Panel'"
    echo "3. Set Homepage URL: http://localhost:3000"
    echo "4. Set Authorization callback URL: http://localhost:3000/api/auth/callback/github"
    echo "5. Copy the Client ID and Client Secret to your .env file"
    
elif [[ $REPLY == "2" ]]; then
    echo "🦊 Gitea Configuration"
    echo "====================="
    read -p "Enter your Gitea instance URL (e.g., https://git.yourdomain.com): " GITEA_URL
    read -p "Enter your Gitea username: " GITEA_OWNER
    read -p "Enter your repository name: " GITEA_REPO
    read -p "Enter your Gitea OAuth Client ID: " GITEA_CLIENT_ID
    read -p "Enter your Gitea OAuth Client Secret: " GITEA_CLIENT_SECRET
    
    # Update .env with Gitea values
    sed -i "s/GIT_PROVIDER=github/GIT_PROVIDER=gitea/" .env
    sed -i "s|https://your-gitea-instance.com|$GITEA_URL|" .env
    sed -i "s|https://your-gitea-instance.com/api/v1|$GITEA_URL/api/v1|" .env
    sed -i "s/your_gitea_username/$GITEA_OWNER/" .env
    sed -i "s/your_repository_name/$GITEA_REPO/" .env
    sed -i "s/your_gitea_client_id/$GITEA_CLIENT_ID/" .env
    sed -i "s/your_gitea_client_secret/$GITEA_CLIENT_SECRET/" .env
    
    echo ""
    echo "📝 Gitea OAuth App Setup Instructions:"
    echo "1. Go to: $GITEA_URL/user/settings/applications"
    echo "2. Click 'Create New OAuth2 Application'"
    echo "3. Set Application name: 'Admin Panel'"
    echo "4. Set Redirect URI: http://localhost:3000/api/auth/callback/gitea"
    echo "5. Copy the Client ID and Client Secret to your .env file"
    
else
    echo "❌ Invalid choice. Please run the script again."
    exit 1
fi

echo ""
echo "🎉 Environment setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Review your .env file and update any remaining values"
echo "2. Install dependencies: npm install (or pnpm install)"
echo "3. Start the development server: npm run dev"
echo ""
echo "⚠️  Important: Never commit your .env file to version control!"
echo ""
echo "🔗 Useful links:"
echo "- GitHub OAuth Apps: https://github.com/settings/applications"
echo "- Gitea OAuth Apps: $GITEA_URL/user/settings/applications (if using Gitea)"
echo "- Documentation: See fastapi-vs-nextjs.md for detailed setup instructions"

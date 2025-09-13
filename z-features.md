# Admin Panel Features & Usage Guide

This document provides a comprehensive overview of the Next.js admin panel features and instructions for running the application.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- GitHub account with access to the repository
- Environment variables configured (see setup guide)

### Running the Application

```bash
# Navigate to the admin panel directory
cd /home/jalcocert/Desktop/astro-admin-panel

# Install dependencies (if not already done)
npm install --legacy-peer-deps

# Start the development server
npm run dev

# The application will be available at:
# http://localhost:3000
```

## 🏗️ Architecture Overview

```
Next.js Admin Panel
├── Frontend (React + Tailwind CSS)
├── Authentication (NextAuth.js + GitHub OAuth)
├── API Routes (Next.js API)
├── Git Service (GitHub API via Octokit)
└── Toast UI Editor (Rich Text Editor)
```

## ✨ Features

### 🔐 Authentication & Security

**GitHub OAuth Integration**
- Secure authentication using NextAuth.js
- GitHub OAuth 2.0 flow
- Session management with JWT tokens
- Automatic token refresh
- Secure API endpoints with authentication checks

**Security Features**
- Environment variable protection
- CORS configuration
- Input validation and sanitization
- Error handling without sensitive data exposure

### 📝 Post Management

**Create New Posts**
- Rich text editor with WYSIWYG interface
- Automatic frontmatter generation
- Filename generation with timestamps
- Real-time content validation
- Auto-save functionality

**Edit Existing Posts**
- Load posts from GitHub repository
- Parse existing frontmatter
- Update content with proper Git SHA handling
- Preserve original formatting and metadata

**Delete Posts**
- Confirmation dialog for safety
- Proper Git file deletion
- Repository cleanup
- Audit trail maintenance

**Post List Management**
- Sidebar with all available posts
- Post metadata display (title, date, description)
- Quick selection and editing
- Visual indicators for selected posts

### 🎨 Toast UI Editor Features

**Rich Text Editing**
- WYSIWYG (What You See Is What You Get) mode
- Markdown source editing
- Live preview with vertical split
- Syntax highlighting for code blocks

**Formatting Options**
- Headers (H1-H6)
- Bold, italic, strikethrough text
- Bulleted and numbered lists
- Task lists with checkboxes
- Blockquotes
- Horizontal rules

**Advanced Features**
- Tables with full editing support
- Image insertion and management
- Link creation and editing
- Code blocks with syntax highlighting
- Scroll synchronization between editor and preview

**User Experience**
- Character and word count
- Auto-save indicators
- Keyboard shortcuts
- Responsive design
- Mobile-friendly interface

### 🔗 GitHub Integration

**Repository Operations**
- Direct integration with `JAlcocerT/astro-theme-typography`
- File operations in `src/content/posts/` directory
- Proper Git commit messages
- Branch management (main branch)

**API Operations**
- Create new markdown files
- Update existing files with SHA validation
- Delete files with proper Git operations
- List all posts with metadata parsing

**Frontmatter Handling**
- Automatic YAML frontmatter generation
- Parsing existing frontmatter
- Support for standard fields (title, date, description, tags)
- Custom field support

### 🎯 User Interface

**Responsive Design**
- Mobile-first approach
- Tablet and desktop optimization
- Touch-friendly controls
- Adaptive layouts

**Navigation**
- Intuitive post selection
- Clear action buttons
- Status indicators
- Loading states

**Visual Feedback**
- Success/error notifications
- Loading spinners
- Progress indicators
- Confirmation dialogs

## 📁 File Structure

```
astro-admin-panel/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts          # NextAuth configuration
│   │   │   └── posts/
│   │   │       ├── route.ts              # GET (list) & POST (create)
│   │   │       └── [filename]/
│   │   │           └── route.ts          # GET, PUT, DELETE individual posts
│   │   ├── auth/
│   │   │   └── signin/
│   │   │       └── page.tsx              # Custom sign-in page
│   │   ├── layout.tsx                    # Root layout with providers
│   │   └── page.tsx                      # Main admin interface
│   ├── components/
│   │   ├── SessionProvider.tsx           # NextAuth session wrapper
│   │   └── ToastEditor.tsx              # Toast UI Editor component
│   └── lib/
│       └── git-service.ts               # GitHub API service
├── .env                                 # Environment variables
├── package.json                         # Dependencies and scripts
└── README.md                           # Project documentation
```

## 🔧 Configuration

### Environment Variables

The application requires the following environment variables (configured in `.env`):

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Repository Configuration
GITHUB_OWNER=JAlcocerT
GITHUB_REPO=astro-theme-typography
GITHUB_BRANCH=main

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### GitHub OAuth App Setup

1. Go to [GitHub OAuth Apps](https://github.com/settings/applications/new)
2. Set Application name: `Admin Panel`
3. Set Homepage URL: `http://localhost:3000`
4. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copy Client ID and Client Secret to your `.env` file

## 🚀 Usage Instructions

### 1. Starting the Application

```bash
# Navigate to the admin panel directory
cd /home/jalcocert/Desktop/astro-admin-panel

# Start the development server
npm run dev
```

### 2. Accessing the Admin Panel

1. Open your browser and go to `http://localhost:3000`
2. Click "Sign in with GitHub"
3. Authorize the application to access your repository
4. You'll be redirected to the main admin interface

### 3. Creating a New Post

1. Click the "New Post" button in the posts sidebar
2. The Toast UI Editor will open with a blank document
3. Start writing your content using the rich text editor
4. The editor automatically generates frontmatter with:
   - Title (editable)
   - Date (current date)
   - Description (editable)
   - Tags (editable)
5. Click "Save Post" to commit to your repository

### 4. Editing an Existing Post

1. Click on any post in the sidebar to select it
2. The post content will load in the Toast UI Editor
3. Make your changes using the rich text interface
4. Click "Save Post" to update the repository

### 5. Deleting a Post

1. Select the post you want to delete
2. Click the "Delete" button next to the post title
3. Confirm the deletion in the dialog
4. The post will be removed from your repository

## 🎨 Editor Features

### Rich Text Formatting

**Text Formatting**
- **Bold**: Ctrl+B or use the toolbar
- *Italic*: Ctrl+I or use the toolbar
- ~~Strikethrough~~: Use the toolbar
- Headers: Use the heading dropdown (H1-H6)

**Lists**
- Bulleted lists: Use the bullet list button
- Numbered lists: Use the numbered list button
- Task lists: Use the task list button
- Indent/Outdent: Use the indent buttons

**Advanced Elements**
- Tables: Insert and edit tables
- Images: Upload and insert images
- Links: Create and edit hyperlinks
- Code blocks: Insert code with syntax highlighting
- Blockquotes: Use the quote button

### Editor Modes

**WYSIWYG Mode** (Default)
- Visual editing with formatted text
- Real-time preview
- Easy formatting with toolbar

**Markdown Mode**
- Direct markdown editing
- Syntax highlighting
- Source code view

**Preview Mode**
- Read-only preview
- Final rendered output
- Perfect for reviewing content

## 🔄 Git Operations

### Automatic Operations

The admin panel automatically handles all Git operations:

**Creating Posts**
- Generates unique filenames with timestamps
- Creates proper frontmatter structure
- Commits with descriptive messages
- Updates repository immediately

**Updating Posts**
- Uses Git SHA for proper version control
- Preserves file history
- Creates meaningful commit messages
- Handles merge conflicts gracefully

**Deleting Posts**
- Removes files from repository
- Creates deletion commit
- Maintains Git history
- Cleans up references

### Commit Messages

The system generates descriptive commit messages:
- `Add new post: post-1234567890`
- `Update post: existing-post-name`
- `Delete post: post-to-remove`

## 🛠️ Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking
npm run type-check
```

### Dependencies

**Core Dependencies**
- `next`: React framework
- `react`: UI library
- `next-auth`: Authentication
- `@octokit/rest`: GitHub API client
- `@toast-ui/react-editor`: Rich text editor

**Development Dependencies**
- `typescript`: Type checking
- `tailwindcss`: Styling
- `eslint`: Code linting

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🔍 Troubleshooting

### Common Issues

**Authentication Problems**
- Verify GitHub OAuth app configuration
- Check environment variables
- Ensure callback URL matches exactly

**Git Operations Fail**
- Verify repository permissions
- Check GitHub token scope
- Ensure repository exists and is accessible

**Editor Not Loading**
- Check browser console for errors
- Verify Toast UI Editor dependencies
- Clear browser cache

**Build Errors**
- Run `npm install --legacy-peer-deps`
- Check Node.js version (18+ required)
- Verify all environment variables are set

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=true
LOG_LEVEL=debug
```

## 📊 Performance

### Optimization Features

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js automatic optimization
- **Bundle Analysis**: Built-in bundle analyzer
- **Caching**: Intelligent API response caching
- **Lazy Loading**: Component lazy loading

### Performance Metrics

- **First Load**: ~2-3 seconds
- **Subsequent Loads**: ~500ms
- **Editor Load**: ~1 second
- **Save Operations**: ~2-3 seconds

## 🔒 Security

### Security Measures

- **OAuth 2.0**: Industry-standard authentication
- **JWT Tokens**: Secure session management
- **HTTPS**: Encrypted communication
- **Input Validation**: XSS and injection protection
- **CORS**: Cross-origin request protection

### Best Practices

- Never commit `.env` files
- Use strong, unique secrets
- Regularly rotate API tokens
- Monitor access logs
- Keep dependencies updated

## 🚀 Deployment

### Production Deployment

**Vercel (Recommended)**
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

**Other Platforms**
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

### Environment Variables for Production

```bash
NEXTAUTH_URL=https://yourdomain.com
GITHUB_CLIENT_ID=your_production_client_id
GITHUB_CLIENT_SECRET=your_production_client_secret
NEXTAUTH_SECRET=your_production_secret
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Toast UI Editor Documentation](https://ui.toast.com/tui-editor)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the console logs
3. Verify environment configuration
4. Check GitHub repository permissions

The admin panel provides a complete solution for managing your Astro theme typography posts with a modern, user-friendly interface and robust Git integration.

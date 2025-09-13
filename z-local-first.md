# Local-First Admin Panel Architecture

## Overview

This document describes the local-first editing approach implemented in the Next.js admin panel. 

The system allows users to edit posts locally in the browser's storage first, then synchronize changes with GitHub when ready.

## Architecture Principles

### 1. Local-First Philosophy
- **Immediate Editing**: All edits happen locally first, providing instant feedback
- **Offline Capability**: Users can edit posts without internet connection
- **Conflict Resolution**: Local changes take precedence, with manual sync control
- **Performance**: No API delays during editing sessions

### 2. Data Flow
```
User Edits → Local Storage → Manual Sync → GitHub API → Repository
     ↑                                                      ↓
     └─────────── Pull from GitHub ←─────────────────────────┘
```

## Core Components

### 1. Local Storage Service (`src/lib/local-storage.ts`)

Manages posts in the browser's localStorage:

```typescript
interface LocalPost {
  filename: string
  content: string
  frontmatter: Record<string, any>
  lastModified: string
  synced: boolean
}

// Key functions:
- getPosts(): LocalPost[]           // Retrieve all local posts
- savePosts(posts: LocalPost[])     // Save all posts to localStorage
- savePost(post: LocalPost)         // Save/update single post
- deletePost(filename: string)      // Remove post from local storage
```

**Features:**
- Automatic JSON serialization/deserialization
- Timestamp tracking for last modifications
- Sync status tracking
- Error handling for localStorage operations

### 2. Sync Service (`src/lib/sync-service.ts`)

Handles synchronization between local storage and GitHub:

```typescript
// Key functions:
- pullFromGitHub(): Promise<LocalPost[]>     // Fetch from GitHub, merge with local
- syncAllPosts(): Promise<void>              // Push all local changes to GitHub
```

**Pull Strategy:**
1. Fetch all posts from GitHub repository
2. Parse frontmatter and content
3. Merge with existing local posts (local takes precedence)
4. Update sync status

**Push Strategy:**
1. Get all local posts marked as unsynced
2. Create/update files in GitHub repository
3. Update local sync status
4. Handle errors gracefully

### 3. Main Admin Interface (`src/app/page.tsx`)

The main page orchestrates the local-first workflow:

**State Management:**
```typescript
const [posts, setPosts] = useState<LocalPost[]>([])
const [selectedPost, setSelectedPost] = useState<LocalPost | null>(null)
const [syncStatus, setSyncStatus] = useState<string>('')
const [isSyncing, setIsSyncing] = useState(false)
```

**Key Workflows:**

#### Initial Load
1. Load posts from localStorage on component mount
2. If user is authenticated, pull latest from GitHub
3. Merge remote changes with local posts

#### Editing Workflow
1. User selects a post → loads into Toast UI Editor
2. User makes changes → automatically saved to localStorage
3. Post marked as `synced: false`
4. User can continue editing or sync when ready

#### Sync Workflow
1. **Pull from GitHub**: Fetches latest changes, merges with local
2. **Sync to GitHub**: Pushes all local changes to repository
3. Updates sync status and timestamps

## User Interface Features

### 1. Sync Controls
- **Pull from GitHub**: Blue button to fetch latest changes
- **Sync to GitHub**: Purple button to push local changes
- **Status Indicators**: Real-time feedback on sync operations

### 2. Post Management
- **Local Editing**: Immediate save to localStorage
- **Visual Indicators**: Shows which posts are synced/unsynced
- **Conflict Resolution**: Local changes take precedence

### 3. Status Bar
- **Error Display**: Shows API errors and sync issues
- **Sync Status**: Real-time feedback on operations
- **User Context**: Shows current user and authentication status

## Benefits

### 1. Performance
- **Instant Editing**: No API delays during typing
- **Reduced API Calls**: Only sync when explicitly requested
- **Offline Capability**: Edit without internet connection

### 2. User Experience
- **No Data Loss**: Changes saved immediately to localStorage
- **Flexible Workflow**: Edit multiple posts before syncing
- **Clear Status**: Always know what's synced and what isn't

### 3. Reliability
- **Network Independence**: Works without stable internet
- **Error Recovery**: Failed syncs don't lose local changes
- **Conflict Prevention**: Local-first approach avoids merge conflicts

## Technical Implementation

### 1. Data Persistence
```typescript
// localStorage key structure
const STORAGE_KEY = 'astro-admin-posts'

// Data format
{
  "posts": [
    {
      "filename": "example-post.md",
      "content": "# My Post\n\nContent here...",
      "frontmatter": {
        "title": "My Post",
        "date": "2024-01-01",
        "tags": ["example"]
      },
      "lastModified": "2024-01-01T12:00:00Z",
      "synced": false
    }
  ]
}
```

### 2. GitHub Integration
- Uses authenticated GitHub API calls
- Handles file creation, updates, and deletions
- Manages base64 encoding for file content
- Implements proper error handling and retries

### 3. Frontmatter Parsing
- Extracts YAML frontmatter from markdown files
- Preserves formatting and structure
- Handles edge cases and malformed frontmatter

## Configuration

### Environment Variables
```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

# NextAuth
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000

# Repository
GITHUB_REPO_OWNER=your_username
GITHUB_REPO_NAME=your_repo_name
```

### Dependencies
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "next-auth": "^4.24.0",
    "@octokit/rest": "^20.0.0",
    "@toast-ui/react-editor": "^3.2.0",
    "js-yaml": "^4.1.0"
  }
}
```

## Usage Workflow

### 1. Initial Setup
1. Configure GitHub OAuth application
2. Set up environment variables
3. Install dependencies
4. Start development server

### 2. Daily Usage
1. **Sign in** with GitHub account
2. **Pull latest** changes from repository
3. **Edit posts** locally (auto-saved)
4. **Sync changes** when ready
5. **Sign out** when done

### 3. Best Practices
- Pull from GitHub at start of editing session
- Sync changes regularly to avoid conflicts
- Review changes before syncing
- Keep local storage clean (sync regularly)

## Error Handling

### 1. Network Errors
- Failed API calls don't affect local editing
- Retry mechanisms for transient failures
- Clear error messages to user

### 2. Authentication Issues
- Graceful handling of expired tokens
- Redirect to sign-in when needed
- Preserve local changes during re-authentication

### 3. Data Corruption
- Validation of localStorage data
- Fallback to empty state if corrupted
- Recovery mechanisms for malformed posts

## Future Enhancements

### 1. Advanced Sync
- **Selective Sync**: Choose which posts to sync
- **Conflict Resolution**: UI for handling merge conflicts
- **Sync History**: Track sync operations and changes

### 2. Offline Features
- **Service Worker**: Cache posts for offline editing
- **Background Sync**: Automatic sync when online
- **Offline Indicators**: Show connection status

### 3. Collaboration
- **Real-time Editing**: Multiple users editing simultaneously
- **Change Tracking**: See who made what changes
- **Comments**: Add notes to posts during editing

## Troubleshooting

### Common Issues

1. **Posts not loading**
   - Check localStorage in browser dev tools
   - Verify GitHub authentication
   - Check network connectivity

2. **Sync failures**
   - Verify GitHub repository permissions
   - Check API rate limits
   - Review error messages in status bar

3. **Data loss**
   - Check localStorage for backup data
   - Verify sync status before making changes
   - Use browser dev tools to inspect data

### Debug Tools
- Browser localStorage inspection
- Network tab for API calls
- Console logs for error details
- GitHub API rate limit status

## Conclusion

The local-first approach provides a robust, user-friendly editing experience that prioritizes performance and reliability. By storing changes locally first and syncing on demand, users can edit posts without worrying about network issues or API failures. The system is designed to be intuitive while providing powerful features for content management.

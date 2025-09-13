import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { Octokit } from '@octokit/rest'
import { Buffer } from 'buffer'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Try to get posts from GitHub first, fallback to local files
    let posts: any[] = []
    
    if (session?.accessToken) {
      // Try GitHub first
      try {
        const octokit = new Octokit({
          auth: session.accessToken,
        })

        console.log('Fetching posts from GitHub...')
        const response = await octokit.rest.repos.getContent({
          owner: process.env.GITHUB_OWNER!,
          repo: process.env.GITHUB_REPO!,
          path: 'src/content/posts',
        })
        
        const files = response.data
        console.log('GitHub files found:', Array.isArray(files) ? files.length : 'Not an array')

        if (Array.isArray(files)) {
          // Filter for markdown files and fetch their content
          posts = await Promise.all(
            files
              .filter(file => file.name.endsWith('.md') || file.name.endsWith('.mdx'))
              .map(async (file) => {
                try {
                  const fileResponse = await octokit.rest.repos.getContent({
                    owner: process.env.GITHUB_OWNER!,
                    repo: process.env.GITHUB_REPO!,
                    path: file.path,
                  })
                  const fileData = fileResponse.data

                  if ('content' in fileData) {
                    const content = Buffer.from(fileData.content, 'base64').toString('utf-8')

                    // Parse frontmatter
                    const { data: frontmatter, content: markdownContent } = matter(content)

                    return {
                      filename: file.name,
                      path: file.path,
                      content: markdownContent,
                      frontmatter,
                      sha: file.sha,
                      size: file.size,
                      lastModified: fileData.last_modified,
                    }
                  }
                  return null
                } catch (fileFetchError: any) {
                  console.error(`Error fetching content for ${file.name}:`, fileFetchError.message)
                  return null
                }
              })
          )
        }
        
        console.log('Successfully fetched posts from GitHub:', posts.filter(Boolean).length)
        return NextResponse.json({ posts: posts.filter(Boolean), source: 'github' })
        
      } catch (githubError: any) {
        console.error('GitHub API error, falling back to local files:', githubError.message)
        // Fall through to local file reading
      }
    }
    
    // Fallback: Read from local files
    console.log('Reading posts from local files...')
    try {
      const postsDir = path.join(process.cwd(), '..', 'src', 'content', 'posts')
      console.log('Local posts directory:', postsDir)
      
      if (fs.existsSync(postsDir)) {
        const files = fs.readdirSync(postsDir)
        console.log('Local files found:', files.length)
        
        posts = files
          .filter(file => file.endsWith('.md') || file.endsWith('.mdx'))
          .map(file => {
            try {
              const filePath = path.join(postsDir, file)
              const content = fs.readFileSync(filePath, 'utf-8')
              const { data: frontmatter, content: markdownContent } = matter(content)
              const stats = fs.statSync(filePath)
              
              return {
                filename: file,
                path: `src/content/posts/${file}`,
                content: markdownContent,
                frontmatter,
                sha: 'local', // No SHA for local files
                size: stats.size,
                lastModified: stats.mtime.toISOString(),
              }
            } catch (fileError: any) {
              console.error(`Error reading local file ${file}:`, fileError.message)
              return null
            }
          })
          .filter(Boolean)
        
        console.log('Successfully read local posts:', posts.length)
        return NextResponse.json({ posts, source: 'local' })
      } else {
        console.error('Local posts directory not found:', postsDir)
        return NextResponse.json({ posts: [], source: 'none', error: 'No posts directory found' })
      }
    } catch (localError: any) {
      console.error('Error reading local files:', localError.message)
      return NextResponse.json({ posts: [], source: 'none', error: localError.message })
    }
  } catch (error: any) {
    console.error('Failed to fetch posts in API route:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
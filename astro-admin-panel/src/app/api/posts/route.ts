import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { Octokit } from '@octokit/rest'
import fs from 'fs'
import path from 'path'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized - No session or access token' }, { status: 401 })
    }

    const octokit = new Octokit({
      auth: session.accessToken,
    })

    // Get posts from GitHub repository
    let files: any
    try {
      const response = await octokit.rest.repos.getContent({
        owner: process.env.GITHUB_OWNER!,
        repo: process.env.GITHUB_REPO!,
        path: 'src/content/posts',
      })
      files = response.data
    } catch (githubError: any) {
      console.error('GitHub API error:', githubError.message)
      if (githubError.status === 404) {
        return NextResponse.json({ error: 'Posts directory not found in repository' }, { status: 404 })
      }
      throw githubError
    }

    if (!Array.isArray(files)) {
      return NextResponse.json({ posts: [] })
    }

    // Filter for markdown files and fetch their content
    const posts = await Promise.all(
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
              const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
              let frontmatter = {}
              let markdownContent = content

              if (frontmatterMatch) {
                try {
                  // Simple YAML parsing for basic frontmatter
                  const frontmatterText = frontmatterMatch[1]
                  frontmatter = parseSimpleYaml(frontmatterText)
                  markdownContent = frontmatterMatch[2]
                } catch (error) {
                  console.error('Error parsing frontmatter:', error)
                }
              }

              return {
                filename: file.name,
                path: file.path,
                content: markdownContent,
                frontmatter,
                sha: fileData.sha,
                size: fileData.size,
                lastModified: new Date().toISOString(), // GitHub doesn't provide this easily
              }
            }
            return null
          } catch (error) {
            console.error(`Error fetching file ${file.name}:`, error)
            return null
          }
        })
    )

    const validPosts = posts.filter(post => post !== null)

    return NextResponse.json({ posts: validPosts })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

// Simple YAML parser for basic frontmatter
function parseSimpleYaml(yamlText: string): Record<string, any> {
  const result: Record<string, any> = {}
  const lines = yamlText.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const colonIndex = trimmed.indexOf(':')
      if (colonIndex > 0) {
        const key = trimmed.substring(0, colonIndex).trim()
        let value = trimmed.substring(colonIndex + 1).trim()
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        
        // Try to parse as array
        if (value.startsWith('[') && value.endsWith(']')) {
          try {
            value = JSON.parse(value)
          } catch {
            // Keep as string if parsing fails
          }
        }
        
        result[key] = value
      }
    }
  }
  
  return result
}

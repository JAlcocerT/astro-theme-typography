import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { Octokit } from '@octokit/rest'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { filename } = await params
    const decodedFilename = decodeURIComponent(filename)
    const body = await request.json()
    const { content, frontmatter } = body

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const octokit = new Octokit({
      auth: session.accessToken,
    })

    // Create frontmatter string
    const frontmatterStr = frontmatter && Object.keys(frontmatter).length > 0
      ? `---\n${Object.entries(frontmatter)
          .map(([key, value]) => {
            if (Array.isArray(value)) {
              return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`
            }
            return `${key}: "${value}"`
          })
          .join('\n')}\n---\n\n`
      : ''

    const fullContent = frontmatterStr + content

    // First, get the current file to get its SHA
    let currentSha: string | undefined
    try {
      const { data: currentFile } = await octokit.rest.repos.getContent({
        owner: process.env.GITHUB_OWNER!,
        repo: process.env.GITHUB_REPO!,
        path: `src/content/posts/${decodedFilename}`,
      })

      if ('sha' in currentFile) {
        currentSha = currentFile.sha
      }
    } catch (error: any) {
      // File doesn't exist, we'll create it
      if (error.status !== 404) {
        throw error
      }
    }

    // Update or create the file
    const { data: result } = await octokit.rest.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: `src/content/posts/${decodedFilename}`,
      message: `Update post: ${decodedFilename}`,
      content: Buffer.from(fullContent).toString('base64'),
      sha: currentSha, // undefined for new files
      branch: 'main',
    })

    return NextResponse.json({
      success: true,
      message: 'Post saved successfully',
      sha: result.content?.sha,
      commit: result.commit,
    })
  } catch (error: any) {
    console.error('Error saving post:', error)
    return NextResponse.json(
      { error: 'Failed to save post', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { filename } = await params
    const decodedFilename = decodeURIComponent(filename)

    const octokit = new Octokit({
      auth: session.accessToken,
    })

    // Get the current file to get its SHA
    const { data: currentFile } = await octokit.rest.repos.getContent({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: `src/content/posts/${decodedFilename}`,
    })

    if (!('sha' in currentFile)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Delete the file
    const { data: result } = await octokit.rest.repos.deleteFile({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: `src/content/posts/${decodedFilename}`,
      message: `Delete post: ${decodedFilename}`,
      sha: currentFile.sha,
      branch: 'main',
    })

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
      commit: result.commit,
    })
  } catch (error: any) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post', details: error.message },
      { status: 500 }
    )
  }
}

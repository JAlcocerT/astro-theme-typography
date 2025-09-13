'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import PostsList from '../components/PostsList'
import ToastEditor from '../components/ToastEditor'

interface Post {
  filename: string
  path: string
  content: string
  frontmatter: Record<string, any>
  sha: string
  size: number
  lastModified: string
}

export default function Home() {
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const fetchPosts = async () => {
    setLoading(true)
    setError(null)
    try {
      // console.log('Fetching posts from /api/posts...')
      const response = await fetch('/api/posts')
      // console.log('Response status:', response.status)
      // console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        throw new Error(errorData.error || 'Failed to fetch posts')
      }

      const data = await response.json()
      // console.log('Posts data:', data)
      setPosts(data.posts || [])
    }
    catch (err) {
      console.error('Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch posts')
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchPosts()
    }
  }, [session])

  const handleSavePost = async (content: string) => {
    if (!selectedPost) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/posts/${encodeURIComponent(selectedPost.filename)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          frontmatter: selectedPost.frontmatter,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save post')
      }

      const result = await response.json()
      
      // Update the selected post with new content
      setSelectedPost({
        ...selectedPost,
        content,
        sha: result.sha,
      })

      // Update the posts list
      setPosts(posts.map(post => 
        post.filename === selectedPost.filename 
          ? { ...post, content, sha: result.sha }
          : post
      ))

      // Show success message
      setSuccessMessage('Post saved successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
      
    } catch (err) {
      console.error('Error saving post:', err)
      setError(err instanceof Error ? err.message : 'Failed to save post')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (post: Post) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/posts/${encodeURIComponent(post.filename)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete post')
      }

      // Remove the post from the list
      setPosts(posts.filter(p => p.filename !== post.filename))
      
      // Clear selection if the deleted post was selected
      if (selectedPost?.filename === post.filename) {
        setSelectedPost(null)
      }

      setSuccessMessage('Post deleted successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
      
    } catch (err) {
      console.error('Error deleting post:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete post')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full rounded-lg bg-white p-8 shadow-md">
          <div className="text-center">
            <h1 className="mb-2 text-3xl text-gray-900 font-bold">Admin Panel</h1>
            <p className="mb-8 text-gray-600">
              Sign in with GitHub to manage your blog posts
            </p>
            <button
              onClick={() => signIn('github')}
              className="w-full rounded-md bg-gray-900 px-4 py-3 text-white transition-colors hover:bg-gray-800"
            >
              Sign in with GitHub
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl py-6 lg:px-8 sm:px-6">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl text-gray-900 font-bold">Admin Panel</h1>
              <p className="text-gray-600">Manage your Astro blog posts</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchPosts}
                disabled={loading}
                className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh Posts'}
              </button>
              <span className="text-sm text-gray-600">
                Welcome,
                {' '}
                {session.user?.name}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign out
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 border border-red-200 rounded-md bg-red-50 p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Success Display */}
          {successMessage && (
            <div className="mb-4 border border-green-200 rounded-md bg-green-50 p-4">
              <p className="text-green-800">{successMessage}</p>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Posts List */}
            <div className="lg:col-span-1">
              <PostsList
                posts={posts}
                onSelectPost={setSelectedPost}
                selectedPost={selectedPost}
                onDeletePost={handleDeletePost}
              />
            </div>

            {/* Editor */}
            <div className="lg:col-span-2">
              {selectedPost
                ? (
                    <ToastEditor
                      initialContent={selectedPost.content}
                      onSave={handleSavePost}
                      height="600px"
                      placeholder="Start editing your post..."
                    />
                  )
                : (
                    <div className="rounded-lg bg-white p-8 text-center shadow-md">
                      <div className="mb-4 text-gray-400">
                        <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="mb-2 text-lg text-gray-900 font-medium">Select a Post</h3>
                      <p className="text-gray-500">
                        Choose a post from the list to start editing with the Toast UI Editor.
                      </p>
                    </div>
                  )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

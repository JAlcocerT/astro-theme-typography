'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
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
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch posts')
    } finally {
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
    
    try {
      // TODO: Implement save functionality
      // console.log('Saving post:', selectedPost.filename, content)
      // alert('Save functionality will be implemented next!')
    } catch (err) {
      console.error('Error saving post:', err)
      // alert('Failed to save post')
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
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
            <p className="text-gray-600 mb-8">
              Sign in with GitHub to manage your blog posts
            </p>
            <button
              onClick={() => signIn('github')}
              className="w-full bg-gray-900 text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors"
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
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Manage your Astro blog posts</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchPosts}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh Posts'}
              </button>
              <span className="text-sm text-gray-600">
                Welcome, {session.user?.name}
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
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Posts List */}
            <div className="lg:col-span-1">
              <PostsList
                posts={posts}
                onSelectPost={setSelectedPost}
                selectedPost={selectedPost}
              />
            </div>

            {/* Editor */}
            <div className="lg:col-span-2">
              {selectedPost ? (
                <ToastEditor
                  initialContent={selectedPost.content}
                  onSave={handleSavePost}
                  height="600px"
                  placeholder="Start editing your post..."
                />
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Post</h3>
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

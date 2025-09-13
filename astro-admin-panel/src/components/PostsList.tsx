'use client'

import { useState } from 'react'

interface Post {
  filename: string
  path: string
  content: string
  frontmatter: Record<string, any>
  sha: string
  size: number
  lastModified: string
}

interface PostsListProps {
  posts: Post[]
  onSelectPost: (post: Post) => void
  selectedPost: Post | null
}

export default function PostsList({ posts, onSelectPost, selectedPost }: PostsListProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPosts = posts.filter(post =>
    post.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.frontmatter.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Posts ({posts.length})</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {filteredPosts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No posts found matching your search.' : 'No posts available.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPosts.map((post) => (
              <div
                key={post.filename}
                onClick={() => onSelectPost(post)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedPost?.filename === post.filename ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {post.frontmatter.title || post.filename}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {post.filename}
                    </p>
                    {post.frontmatter.date && (
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(post.frontmatter.date)}
                      </p>
                    )}
                    {post.frontmatter.tags && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Array.isArray(post.frontmatter.tags) ? (
                          post.frontmatter.tags.slice(0, 3).map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            {post.frontmatter.tags}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="ml-2 text-xs text-gray-400">
                    {formatFileSize(post.size)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

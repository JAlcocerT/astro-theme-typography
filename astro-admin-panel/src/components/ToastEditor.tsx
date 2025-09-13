'use client'

import { useRef, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the Editor to avoid SSR issues
const Editor = dynamic(() => import('@toast-ui/react-editor').then(mod => mod.Editor), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">Loading editor...</div>
})

// Import CSS separately
import '@toast-ui/editor/dist/toastui-editor.css'

interface ToastEditorProps {
  initialContent?: string
  onSave?: (content: string) => void
  onContentChange?: (content: string) => void
  height?: string
  placeholder?: string
}

export default function ToastEditor({
  initialContent = '',
  onSave,
  onContentChange,
  height = '600px',
  placeholder = 'Start writing your post...'
}: ToastEditorProps) {
  const editorRef = useRef<any>(null)
  const [content, setContent] = useState(initialContent)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (editorRef.current && initialContent !== content) {
      editorRef.current.getInstance().setMarkdown(initialContent)
      setContent(initialContent)
    }
  }, [initialContent])

  const handleSave = () => {
    if (editorRef.current && onSave) {
      const markdownContent = editorRef.current.getInstance().getMarkdown()
      onSave(markdownContent)
    }
  }

  const handleChange = () => {
    if (editorRef.current && onContentChange) {
      const markdownContent = editorRef.current.getInstance().getMarkdown()
      setContent(markdownContent)
      onContentChange(markdownContent)
    }
  }

  if (!isClient) {
    return (
      <div className="w-full">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Post Editor</h2>
          <button
            disabled
            className="px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed"
          >
            Save Post
          </button>
        </div>
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          Loading editor...
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Post Editor</h2>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Save Post
        </button>
      </div>
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <Editor
          ref={editorRef}
          initialValue={content}
          previewStyle="vertical"
          height={height}
          initialEditType="markdown"
          useCommandShortcut={true}
          usageStatistics={false}
          hideModeSwitch={false}
          toolbarItems={[
            ['heading', 'bold', 'italic', 'strike'],
            ['hr', 'quote'],
            ['ul', 'ol', 'task', 'indent', 'outdent'],
            ['table', 'image', 'link'],
            ['code', 'codeblock'],
            ['scrollSync']
          ]}
          onChange={handleChange}
          placeholder={placeholder}
        />
      </div>
      <div className="mt-2 text-sm text-gray-500">
        Characters: {content.length} | Words: {content.split(/\s+/).filter(word => word.length > 0).length}
      </div>
    </div>
  )
}

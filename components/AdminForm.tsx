'use client'

import { useState } from 'react'
import { createResource } from '@/lib/actions/resources'
import { Input } from "@/components/ui/input"

export default function AdminForm() {
  const [context, setContext] = useState('')
  const [content, setContent] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) {
      setMessage('Please enter some content')
      return
    }

    const combinedContent = context ? `Context: ${context}\n\nContent: ${content}` : content

    try {
      const result = await createResource({ content: combinedContent })
      setMessage(result)
      setContext('')
      setContent('')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error adding resource. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div>
        <label htmlFor="context" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Context (optional)
        </label>
        <Input
          id="context"
          type="text"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Enter context here..."
          className="bg-white border-gray-400 text-base w-full text-neutral-700 hover:border-indigo-500 dark:bg-neutral-700 dark:placeholder:text-neutral-400 dark:text-neutral-300"
        />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter knowledge content here..."
          className="bg-white border-gray-400 text-base w-full text-neutral-700 hover:border-indigo-500 text-base w-full text-neutral-700 dark:bg-neutral-700 dark:placeholder:text-neutral-400 dark:text-neutral-300 min-h-[100px] rounded-md"
          rows={6}
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200"
      >
        Add to Knowledge Base
      </button>
      {message && <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{message}</p>}
    </form>
  )
}
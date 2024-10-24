import React, { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, ...props }, ref) => {
    return (
      <div className="flex flex-col">
        {label && (
          <label className="mb-2 font-medium text-gray-700">{label}</label>
        )}
        <textarea
          className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }
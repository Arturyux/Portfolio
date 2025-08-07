'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { FormEvent } from 'react';

interface AdminFormProps {
  isEdit: boolean;
  category: string;
  title: string;
  year: string;
  description: string;
  onCategoryChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onSubmit: (e: FormEvent, description: string) => void;
  onCancel?: () => void;
}

export default function AdminForm({
  isEdit,
  category,
  title,
  year,
  description,
  onCategoryChange,
  onTitleChange,
  onYearChange,
  onSubmit,
  onCancel,
}: AdminFormProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: description,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-2 border border-gray-300 rounded-md min-h-[100px]',
      },
    },
  });

  const handleSubmit = (e: FormEvent) => {
    onSubmit(e, editor?.getHTML() || '');
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
      <input
        type="text"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        placeholder="Category"
        className="px-3 py-2 border border-gray-300 rounded-md"
        required
      />
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Title"
        className="px-3 py-2 border border-gray-300 rounded-md"
        required
      />
      <input
        type="text"
        value={year}
        onChange={(e) => onYearChange(e.target.value)}
        placeholder="Year (e.g., 2023)"
        className="px-3 py-2 border border-gray-300 rounded-md"
        required
      />
      <EditorContent editor={editor} />
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          {isEdit ? 'Save' : 'Add Item'}
        </button>
        {isEdit && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
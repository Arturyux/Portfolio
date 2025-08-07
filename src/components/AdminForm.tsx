'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { FormEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBold,
  faItalic,
  faUnderline,
  faListUl,
  faListOl,
  faUndo,
  faRedo,
} from '@fortawesome/free-solid-svg-icons';

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

  if (!editor) {
    return null;
  }

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
      <div className="flex space-x-2 mb-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${editor.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          <FontAwesomeIcon icon={faBold} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${editor.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          <FontAwesomeIcon icon={faItalic} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded ${editor.isActive('underline') ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          <FontAwesomeIcon icon={faUnderline} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          <FontAwesomeIcon icon={faListUl} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          <FontAwesomeIcon icon={faListOl} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded bg-gray-200"
        >
          <FontAwesomeIcon icon={faUndo} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded bg-gray-200"
        >
          <FontAwesomeIcon icon={faRedo} />
        </button>
      </div>
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
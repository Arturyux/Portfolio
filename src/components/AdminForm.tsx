"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { FormEvent, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold,
  faItalic,
  faUnderline,
  faListUl,
  faListOl,
  faUndo,
  faRedo,
  faImage,
} from "@fortawesome/free-solid-svg-icons";

interface AdminFormProps {
  isEdit: boolean;
  category: string;
  title: string;
  year: string;
  description: string;
  existingCategories: string[];
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
  existingCategories,
  onCategoryChange,
  onTitleChange,
  onYearChange,
  onSubmit,
  onCancel,
}: AdminFormProps) {
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isBulletList, setIsBulletList] = useState(false);
  const [isOrderedList, setIsOrderedList] = useState(false);
  const [isH1, setIsH1] = useState(false);
  const [isH2, setIsH2] = useState(false);
  const [isH3, setIsH3] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryValue, setNewCategoryValue] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: true, allowBase64: true }),
      Placeholder.configure({
        placeholder: "Write the project description here…",
      }),
    ],
    content: description,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose max-w-none focus:outline-none p-2 border border-gray-300 rounded-md min-h-[100px]",
      },
    },
    onUpdate: ({ editor }) => {
      setIsBold(editor.isActive("bold"));
      setIsItalic(editor.isActive("italic"));
      setIsUnderline(editor.isActive("underline"));
      setIsBulletList(editor.isActive("bulletList"));
      setIsOrderedList(editor.isActive("orderedList"));
      setIsH1(editor.isActive("heading", { level: 1 }));
      setIsH2(editor.isActive("heading", { level: 2 }));
      setIsH3(editor.isActive("heading", { level: 3 }));
    },
  });

  useEffect(() => {
    if (editor) {
      const updateStates = () => {
        setIsBold(editor.isActive("bold"));
        setIsItalic(editor.isActive("italic"));
        setIsUnderline(editor.isActive("underline"));
        setIsBulletList(editor.isActive("bulletList"));
        setIsOrderedList(editor.isActive("orderedList"));
        setIsH1(editor.isActive("heading", { level: 1 }));
        setIsH2(editor.isActive("heading", { level: 2 }));
        setIsH3(editor.isActive("heading", { level: 3 }));
      };

      editor.on("selectionUpdate", updateStates);
      editor.on("transaction", updateStates);

      return () => {
        editor.off("selectionUpdate", updateStates);
        editor.off("transaction", updateStates);
      };
    }
  }, [editor]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const finalCategory = showNewCategoryInput ? newCategoryValue : category;
    if (!finalCategory) {
      alert("Please select or enter a category");
      return;
    }
    onCategoryChange(finalCategory);
    onSubmit(e, editor?.getHTML() || "");
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "new") {
      setShowNewCategoryInput(true);
      onCategoryChange("");
    } else {
      setShowNewCategoryInput(false);
      onCategoryChange(value);
    }
  };

  if (!editor) return null;

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
      <div className="flex flex-col gap-2">
        <select
          value={category}
          onChange={handleCategorySelect}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select Category</option>
          {existingCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
          <option value="new">Add New Category</option>
        </select>
        {showNewCategoryInput && (
          <input
            type="text"
            value={newCategoryValue}
            onChange={(e) => setNewCategoryValue(e.target.value)}
            placeholder="New Category Name"
            className="px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        )}
      </div>
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
      <div className="flex space-x-2 mb-2 flex-wrap">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${
            isBold
              ? "bg-blue-500 text-white border-2 border-blue-700"
              : "bg-gray-200 border-2 border-transparent"
          }`}
        >
          <FontAwesomeIcon
            icon={faBold}
            className={isBold ? "text-white" : "text-gray-800"}
          />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${
            isItalic
              ? "bg-blue-500 text-white border-2 border-blue-700"
              : "bg-gray-200 border-2 border-transparent"
          }`}
        >
          <FontAwesomeIcon
            icon={faItalic}
            className={isItalic ? "text-white" : "text-gray-800"}
          />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded ${
            isUnderline
              ? "bg-blue-500 text-white border-2 border-blue-700"
              : "bg-gray-200 border-2 border-transparent"
          }`}
        >
          <FontAwesomeIcon
            icon={faUnderline}
            className={isUnderline ? "text-white" : "text-gray-800"}
          />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`p-2 rounded w-8 font-semibold ${
            isH1
              ? "bg-blue-500 text-white border-2 border-blue-700"
              : "bg-gray-200 border-2 border-transparent"
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`p-2 rounded w-8 font-semibold ${
            isH2
              ? "bg-blue-500 text-white border-2 border-blue-700"
              : "bg-gray-200 border-2 border-transparent"
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`p-2 rounded w-8 font-semibold ${
            isH3
              ? "bg-blue-500 text-white border-2 border-blue-700"
              : "bg-gray-200 border-2 border-transparent"
          }`}
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${
            isBulletList
              ? "bg-blue-500 text-white border-2 border-blue-700"
              : "bg-gray-200 border-2 border-transparent"
          }`}
        >
          <FontAwesomeIcon
            icon={faListUl}
            className={isBulletList ? "text-white" : "text-gray-800"}
          />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded ${
            isOrderedList
              ? "bg-blue-500 text-white border-2 border-blue-700"
              : "bg-gray-200 border-2 border-transparent"
          }`}
        >
          <FontAwesomeIcon
            icon={faListOl}
            className={isOrderedList ? "text-white" : "text-gray-800"}
          />
        </button>
        <button
          type="button"
          onClick={addImage}
          className="p-2 rounded bg-gray-200 border-2 border-transparent"
        >
          <FontAwesomeIcon icon={faImage} className="text-gray-800" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded bg-gray-200 border-2 border-transparent"
        >
          <FontAwesomeIcon icon={faUndo} className="text-gray-800" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded bg-gray-200 border-2 border-transparent"
        >
          <FontAwesomeIcon icon={faRedo} className="text-gray-800" />
        </button>
      </div>
      <EditorContent editor={editor} />
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isEdit ? "Save" : "Add Item"}
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
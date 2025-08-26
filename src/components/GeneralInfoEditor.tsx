"use client";

import { forwardRef, useImperativeHandle } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
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

export interface GeneralInfoEditorRef {
  getHTML: () => string;
}

interface GeneralInfoEditorProps {
  initialContent: string;
  onSave?: (html: string) => void;
  onCancel?: () => void;
}

const GeneralInfoEditor = forwardRef<GeneralInfoEditorRef, GeneralInfoEditorProps>(
  ({ initialContent, onSave, onCancel }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Underline,
        Image.configure({ inline: true, allowBase64: true }),
        Placeholder.configure({
          placeholder: "Write here…",
        }),
      ],
      content: initialContent,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class:
            "prose max-w-none focus:outline-none p-2 border border-gray-300 rounded-md min-h-[150px]",
        },
      },
    });
    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() || "",
    }));

    if (!editor) return null;

    return (
      <div className="flex flex-col gap-2">
        <div className="flex space-x-2 flex-wrap">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded ${
              editor.isActive("bold") ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            <FontAwesomeIcon icon={faBold} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded ${
              editor.isActive("italic") ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            <FontAwesomeIcon icon={faItalic} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded ${
              editor.isActive("underline")
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            <FontAwesomeIcon icon={faUnderline} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded ${
              editor.isActive("bulletList")
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            <FontAwesomeIcon icon={faListUl} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded ${
              editor.isActive("orderedList")
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            <FontAwesomeIcon icon={faListOl} />
          </button>
          <button
            type="button"
            onClick={() => {
              const url = window.prompt("Enter image URL");
              if (url) editor.chain().focus().setImage({ src: url }).run();
            }}
            className="p-2 rounded bg-gray-200"
          >
            <FontAwesomeIcon icon={faImage} />
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
        {onSave && (
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => onSave(editor.getHTML())}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);
GeneralInfoEditor.displayName = "GeneralInfoEditor";
export default GeneralInfoEditor;
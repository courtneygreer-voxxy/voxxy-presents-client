/**
 * RichTextEditor - WYSIWYG email editor using TipTap
 *
 * Features:
 * - Bold, italic, strikethrough
 * - Headings (H1, H2)
 * - Bullet and numbered lists
 * - Links
 * - Undo/redo
 * - Variable insertion support
 */

import { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link as LinkIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Undo,
  Redo,
  LinkIcon as UnlinkIcon,
  ChevronDown,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onEditorReady?: (editor: Editor) => void;
  placeholder?: string;
}

export function RichTextEditor({
  content,
  onChange,
  onFocus,
  onBlur,
  onEditorReady,
  placeholder = 'Write your email message here...',
}: RichTextEditorProps) {
  const [showLinkVarDropdown, setShowLinkVarDropdown] = useState(false);
  const linkVarDropdownRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable features we don't want in emails
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-purple-400 underline hover:text-purple-300',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] px-3 py-2 text-white',
        placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onFocus,
    onBlur,
  });

  // Notify parent when editor is ready
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Update editor content when prop changes (e.g., when email data loads)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!editor) return null;

  // Toolbar button component
  const ToolbarButton = ({
    onClick,
    active,
    disabled,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()} // Prevent losing editor focus
      disabled={disabled}
      title={title}
      className={`
        p-2 rounded transition-colors
        ${active
          ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40'
          : 'hover:bg-white/10 text-white/70 hover:text-white border border-transparent'
        }
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  );

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    // Cancelled
    if (url === null) {
      return;
    }

    // Empty string removes link
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // Add or update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (linkVarDropdownRef.current && !linkVarDropdownRef.current.contains(event.target as Node)) {
        setShowLinkVarDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const insertLinkVariable = (variable: string, displayText: string) => {
    // Insert a formatted link with the variable as href
    const linkHTML = `<a href="${variable}" style="color: #0066cc; text-decoration: underline;">${displayText}</a>`;
    editor.chain().focus().insertContent(linkHTML).run();
    setShowLinkVarDropdown(false);
  };

  const linkVariableOptions = [
    { variable: '[eventLink]', label: 'Event Page Link', displayText: 'View Event Details' },
    { variable: '[eventPortalLink]', label: 'Vendor Portal Link', displayText: 'View Portal' },
    { variable: '[applicationLink]', label: 'Application Link', displayText: 'Apply Now' },
    { variable: '[paymentLink]', label: 'Payment Link', displayText: 'Pay Now' },
    { variable: '[artistApplicationLink]', label: 'Artist Application', displayText: 'Apply as Artist' },
    { variable: '[vendorApplicationLink]', label: 'Vendor Application', displayText: 'Apply as Vendor' },
    { variable: '[unsubscribeLink]', label: 'Unsubscribe Link', displayText: 'Unsubscribe' },
  ];

  return (
    <div className="border border-white/20 rounded-lg bg-white/5 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-white/10 bg-black/20 flex-wrap">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-white/20 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-white/20 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-white/20 mx-1" />

        <ToolbarButton
          onClick={addLink}
          active={editor.isActive('link')}
          title="Add/Edit Link"
        >
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>

        {editor.isActive('link') && (
          <ToolbarButton
            onClick={removeLink}
            title="Remove Link"
          >
            <UnlinkIcon className="w-4 h-4" />
          </ToolbarButton>
        )}

        {/* Insert Link Variable Dropdown */}
        <div className="relative" ref={linkVarDropdownRef}>
          <button
            onClick={() => setShowLinkVarDropdown(!showLinkVarDropdown)}
            className="px-2 py-1 rounded text-xs font-medium bg-purple-600/80 hover:bg-purple-600 text-white transition-all flex items-center gap-1"
            title="Insert Link Variable"
          >
            <LinkIcon className="w-3 h-3" />
            <ChevronDown className="w-3 h-3" />
          </button>

          {showLinkVarDropdown && (
            <div className="absolute left-0 top-full mt-1 w-64 bg-gray-900 border border-white/20 rounded-lg shadow-xl z-50 py-1 max-h-80 overflow-y-auto">
              <div className="px-3 py-2 border-b border-white/10">
                <p className="text-xs font-semibold text-white">Insert Link Variable</p>
                <p className="text-xs text-white/60 mt-0.5">Click to insert a clickable link</p>
              </div>
              {linkVariableOptions.map((option) => (
                <button
                  key={option.variable}
                  onClick={() => insertLinkVariable(option.variable, option.displayText)}
                  className="w-full px-3 py-2 text-left hover:bg-white/10 transition-all flex flex-col gap-0.5"
                >
                  <span className="text-sm font-medium text-white">{option.label}</span>
                  <span className="text-xs text-white/50">{option.variable}</span>
                  <span className="text-xs text-purple-400">→ "{option.displayText}"</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-white/20 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}

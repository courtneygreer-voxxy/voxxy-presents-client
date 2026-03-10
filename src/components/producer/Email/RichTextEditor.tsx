/**
 * RichTextEditor - WYSIWYG email editor using TipTap
 *
 * Features:
 * - Bold, italic, strikethrough
 * - Headings (H1, H2)
 * - Bullet and numbered lists
 * - Unified link insertion (system links + custom URLs)
 * - Undo/redo
 * - Variable insertion support
 */

import { useEffect, useState, useMemo } from 'react';
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
} from 'lucide-react';
import { EMAIL_VARIABLES } from '@/utils/emailVariables';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onEditorReady?: (editor: Editor) => void;
  placeholder?: string;
}

// Default display text for system link variables
const SYSTEM_LINK_DEFAULTS: Record<string, string> = {
  '[eventLink]': 'Apply Now',
  '[eventPortalLink]': 'View Dashboard',
  '[paymentLink]': 'Submit Payment',
  '[categoryPaymentLink]': 'Submit Payment',
  '[invitationLink]': 'View Invitation',
  '[bulletinLink]': 'View Bulletin',
  '[eventOptOutLink]': 'Decline Invitation',
};

export function RichTextEditor({
  content,
  onChange,
  onFocus,
  onBlur,
  onEditorReady,
  placeholder = 'Write your email message here...',
}: RichTextEditorProps) {
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkMode, setLinkMode] = useState<'system' | 'custom'>('system');
  const [selectedSystemLink, setSelectedSystemLink] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [displayText, setDisplayText] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
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

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  // Build system link options from EMAIL_VARIABLES (excluding unsubscribe — it's in the locked footer)
  const systemLinkOptions = useMemo(() => {
    return EMAIL_VARIABLES
      .filter(v =>
        (v.category === 'computed' || v.frontendVar === '[categoryPaymentLink]') &&
        v.frontendVar !== '[unsubscribeLink]' &&
        v.frontendVar !== '[applicationCode]'
      )
      .map(v => ({
        variable: v.frontendVar,
        label: v.label,
        defaultText: SYSTEM_LINK_DEFAULTS[v.frontendVar] || 'Click Here',
      }));
  }, []);

  if (!editor) return null;

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
      onMouseDown={(e) => e.preventDefault()}
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

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const resetPopoverState = () => {
    setLinkMode('system');
    setSelectedSystemLink('');
    setCustomUrl('');
    setDisplayText('');
  };

  const handlePopoverOpen = (open: boolean) => {
    if (open) {
      // Pre-fill display text with selected text from editor
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, ' ');
      if (selectedText) {
        setDisplayText(selectedText);
      }

      // If cursor is on an existing link, pre-fill for editing
      if (editor.isActive('link')) {
        const href = editor.getAttributes('link').href || '';
        if (href.startsWith('[') && href.endsWith(']')) {
          setLinkMode('system');
          setSelectedSystemLink(href);
          if (!selectedText) {
            setDisplayText(SYSTEM_LINK_DEFAULTS[href] || 'Click Here');
          }
        } else {
          setLinkMode('custom');
          setCustomUrl(href);
        }
      }
    } else {
      resetPopoverState();
    }
    setLinkPopoverOpen(open);
  };

  const handleSystemLinkChange = (variable: string) => {
    setSelectedSystemLink(variable);
    // Auto-fill display text with default (only if user hasn't typed custom text)
    if (!displayText || displayText === SYSTEM_LINK_DEFAULTS[selectedSystemLink]) {
      setDisplayText(SYSTEM_LINK_DEFAULTS[variable] || 'Click Here');
    }
  };

  const handleInsertLink = () => {
    const href = linkMode === 'system' ? selectedSystemLink : customUrl;
    const text = displayText || (linkMode === 'system' ? SYSTEM_LINK_DEFAULTS[selectedSystemLink] : customUrl) || 'Link';

    if (!href) return;

    // If there's selected text in the editor, replace it with the link
    const { from, to } = editor.state.selection;
    const hasSelection = from !== to;

    if (hasSelection) {
      editor
        .chain()
        .focus()
        .deleteSelection()
        .insertContent(`<a href="${href}" style="color: #0066cc; text-decoration: underline;">${text}</a>`)
        .run();
    } else {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${href}" style="color: #0066cc; text-decoration: underline;">${text}</a>`)
        .run();
    }

    setLinkPopoverOpen(false);
    resetPopoverState();
  };

  const canInsert = linkMode === 'system' ? !!selectedSystemLink : !!customUrl;

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

        {/* Unified Insert Link Popover */}
        <Popover open={linkPopoverOpen} onOpenChange={handlePopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              title="Insert Link"
              className={`
                px-2.5 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5
                ${editor.isActive('link')
                  ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40'
                  : 'bg-purple-600/80 hover:bg-purple-600 text-white border border-transparent'
                }
              `}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Insert Link</span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={6}
            className="w-80 bg-[#1a0f2e] border-purple-500/30 p-0 shadow-2xl"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-white">Insert Link</p>
                <p className="text-xs text-white/50 mt-0.5">Add a clickable link to your email</p>
              </div>

              {/* Display Text */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Display Text
                </label>
                <input
                  type="text"
                  value={displayText}
                  onChange={(e) => setDisplayText(e.target.value)}
                  placeholder="e.g., Apply Now"
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/20 rounded-md text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
                />
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setLinkMode('system')}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    linkMode === 'system'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  System Link
                </button>
                <button
                  type="button"
                  onClick={() => setLinkMode('custom')}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    linkMode === 'custom'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Custom URL
                </button>
              </div>

              {/* System Link Selector */}
              {linkMode === 'system' && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {systemLinkOptions.map((option) => (
                    <button
                      key={option.variable}
                      type="button"
                      onClick={() => handleSystemLinkChange(option.variable)}
                      className={`w-full px-3 py-2 text-left rounded-md transition-all flex items-center justify-between ${
                        selectedSystemLink === option.variable
                          ? 'bg-purple-600/30 border border-purple-500/50'
                          : 'bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/10'
                      }`}
                    >
                      <div>
                        <span className="text-sm font-medium text-white block">{option.label}</span>
                        <span className="text-[10px] text-white/40">{option.defaultText}</span>
                      </div>
                      {selectedSystemLink === option.variable && (
                        <div className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Custom URL Input */}
              {linkMode === 'custom' && (
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">
                    URL
                  </label>
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 text-sm bg-white/5 border border-white/20 rounded-md text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setLinkPopoverOpen(false); resetPopoverState(); }}
                  className="flex-1 px-3 py-2 text-xs font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsertLink}
                  disabled={!canInsert}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                    canInsert
                      ? 'bg-purple-600 hover:bg-purple-500 text-white'
                      : 'bg-white/5 text-white/30 cursor-not-allowed'
                  }`}
                >
                  Insert Link
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {editor.isActive('link') && (
          <ToolbarButton
            onClick={removeLink}
            title="Remove Link"
          >
            <UnlinkIcon className="w-4 h-4" />
          </ToolbarButton>
        )}

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

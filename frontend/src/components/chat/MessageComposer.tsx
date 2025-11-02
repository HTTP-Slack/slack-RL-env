import React, { useState, useRef, useEffect } from 'react';
// import { insertMarkdown, parseMarkdown } from '../../utils/markdown'; // No longer needed - using Lexical HTML
import { useWorkspace } from '../../context/WorkspaceContext';
import { uploadFiles, getFileUrl, updateFileMetadata } from '../../services/fileApi';
import { getRecentFiles, formatRelativeTime } from '../../services/recentFilesService';
import EmojiPicker from './EmojiPicker';
import FormattingHelpModal from './FormattingHelpModal';
import EmojiSuggestions from './EmojiSuggestions';
import MentionSuggestions from './MentionSuggestions';
import AttachListModal from '../lists/AttachListModal';
import { getList } from '../../services/listApi';
import type { ListData } from '../../types/list';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { LinkNode } from '@lexical/link';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { 
  $getRoot, 
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $createTextNode,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_EDITOR,
  KEY_ENTER_COMMAND,
  KEY_BACKSPACE_COMMAND,
  FORMAT_TEXT_COMMAND,
} from 'lexical';
import { $isListNode, $isListItemNode } from '@lexical/list';
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from '@lexical/list';
import { $createQuoteNode } from '@lexical/rich-text';
import { $createCodeNode } from '@lexical/code';
import { $createLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $generateHtmlFromNodes } from '@lexical/html';
import { getEmojiByName } from '../../constants/emojis';
import './MessageComposer.css';

interface User {
  _id: string;
  username: string;
  email?: string;
  avatar?: string;
}

interface SelectedFile {
  id: string;
  file: File;
  originalSize?: number; // Store original size for placeholder files (e.g., from recent files)
}

interface MessageComposerProps {
  onSend: (text: string, attachments?: string[], listAttachments?: string[]) => void;
  placeholder?: string;
  userName?: string;
  users?: User[]; // Users available for @mentions
  channelId?: string; // Channel ID for file uploads (when in channel context)
}

// File size limit constant (25MB)
const MAX_FILE_SIZE = 25 * 1024 * 1024;

const MessageComposer: React.FC<MessageComposerProps> = ({ onSend, placeholder = 'Message...', userName, users = [], channelId }) => {
  const { sendMessage, activeConversation, currentWorkspaceId } = useWorkspace();
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  
  // New states for file upload tracking
  const [uploadedFileIds, setUploadedFileIds] = useState<Map<string, string>>(new Map()); // Map of file id to uploaded file ID
  const [uploadingFileIds, setUploadingFileIds] = useState<Set<string>>(new Set()); // Set of file ids currently uploading
  const [filePreviewUrls, setFilePreviewUrls] = useState<Map<string, string>>(new Map()); // Map of file id to preview URL
  const [uploadErrors, setUploadErrors] = useState<Map<string, string>>(new Map()); // Map of file id to error message
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewModalData, setPreviewModalData] = useState<{ file: File; previewUrl: string; id: string } | null>(null);
  const [showFileDetailsEdit, setShowFileDetailsEdit] = useState(false);
  const [editingFileName, setEditingFileName] = useState('');
  const [editingFileDescription, setEditingFileDescription] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [stickyBarPosition, setStickyBarPosition] = useState({ top: 0, left: 0 });
  const [showFormattingToolbar, setShowFormattingToolbar] = useState(true);
  const [showRecentFilesSubmenu, setShowRecentFilesSubmenu] = useState(false);
  const [showScheduleMenu, setShowScheduleMenu] = useState(false);
  const [showFormattingHelp, setShowFormattingHelp] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkModalText, setLinkModalText] = useState('');
  const [linkModalUrl, setLinkModalUrl] = useState('');
  const [linkModalSelectedText, setLinkModalSelectedText] = useState('');
  const [showEmojiSuggestions, setShowEmojiSuggestions] = useState(false);
  const [emojiSearchTerm, setEmojiSearchTerm] = useState('');
  const [selectedEmojiIndex, setSelectedEmojiIndex] = useState(0);
  const [emojiSuggestionsPosition, setEmojiSuggestionsPosition] = useState({ bottom: 0, left: 0 });
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSearchTerm, setMentionSearchTerm] = useState('');
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentionSuggestionsPosition, setMentionSuggestionsPosition] = useState({ bottom: 0, left: 0 });
  const [showAttachListModal, setShowAttachListModal] = useState(false);
  const [attachedLists, setAttachedLists] = useState<string[]>([]);
  const [attachedListsData, setAttachedListsData] = useState<Map<string, ListData>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const stickyBarRef = useRef<HTMLDivElement>(null);
  const scheduleMenuRef = useRef<HTMLDivElement>(null);
  const previewModalCloseButtonRef = useRef<HTMLButtonElement>(null);

  // Track active formatting states
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  // Lexical editor configuration
  const lexicalConfig = {
    namespace: 'MessageComposer',
    theme: {
      text: {
        bold: 'editor-text-bold',
        italic: 'editor-text-italic',
        underline: 'editor-text-underline',
        strikethrough: 'editor-text-strikethrough',
        code: 'editor-text-code',
      },
      paragraph: 'editor-paragraph',
      quote: 'editor-quote',
      code: 'editor-code',
      list: {
        nested: {
          listitem: 'editor-nested-listitem',
        },
        ol: 'editor-list-ol',
        ul: 'editor-list-ul',
        listitem: 'editor-listitem',
      },
    },
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
    editorState: () => {
      const root = $getRoot();
      if (root.getTextContent() === '') {
        root.append($createParagraphNode());
      }
    },
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
    ],
  };

  // Cleanup preview URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      // Revoke all object URLs on unmount
      filePreviewUrls.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [filePreviewUrls]);

  // Lexical plugins
  function EnterKeyPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
      return editor.registerCommand(
        KEY_ENTER_COMMAND,
        (event) => {
          if (!event) return false;
          
          // First, check if suggestions are open - if so, let SuggestionKeyboardPlugin handle it
          if (showEmojiSuggestions || showMentionSuggestions) {
            return false; // Let SuggestionKeyboardPlugin handle Enter for selecting suggestions
          }
          
          // Handle Shift+Enter
          if (event.shiftKey) {
            // Check if we're in a list
            let isInList = false;
            editor.getEditorState().read(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                const anchor = selection.anchor;
                const node = anchor.getNode();
                
                let currentNode: any = node;
                while (currentNode) {
                  if ($isListItemNode(currentNode)) {
                    isInList = true;
                    break;
                  }
                  const parent = currentNode.getParent();
                  if (!parent) break;
                  currentNode = parent;
                }
              }
            });
            
            if (isInList) {
              // In a list with Shift+Enter: insert a line break within the current list item
              editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                  selection.insertText('\n');
                }
              });
              event.preventDefault();
              return true;
            }
            
            // Not in a list - Shift+Enter just inserts newline (standard behavior)
            return false; // Let Lexical handle it normally
          }
          
          // Normal Enter key
          // Check if we're in a list - if so, let ListPlugin handle Enter to create new list items
          let isInList = false;
          editor.getEditorState().read(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              const anchor = selection.anchor;
              const node = anchor.getNode();
              
              // Check if we're inside a list item
              let currentNode: any = node;
              while (currentNode) {
                if ($isListItemNode(currentNode)) {
                  isInList = true;
                  break;
                }
                if ($isListNode(currentNode)) {
                  isInList = true;
                  break;
                }
                const parent = currentNode.getParent();
                if (!parent) break;
                currentNode = parent;
              }
            }
          });
          
          if (isInList) {
            // We're in a list - let ListPlugin handle Enter to create new list items
            return false;
          }
          
          // Not in a list and no suggestions - Enter should send the message
          event.preventDefault();
          handleSend();
          return true;
        },
        COMMAND_PRIORITY_HIGH
      );
    }, [editor, showEmojiSuggestions, showMentionSuggestions]);

    return null;
  }

  function BackspaceKeyPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
      return editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        (event) => {
          if (!event) return false;

          let shouldExitList = false;
          let listItemNode: any = null;

          editor.getEditorState().read(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
              return;
            }

            const anchor = selection.anchor;
            const node = anchor.getNode();

            // Check if we're in a list item
            let currentNode: any = node;
            while (currentNode) {
              if ($isListItemNode(currentNode)) {
                listItemNode = currentNode;
                break;
              }
              const parent = currentNode.getParent();
              if (!parent) break;
              currentNode = parent;
            }

            if (!listItemNode) return;

            // Check if list item is empty (no text content or only whitespace)
            const textContent = listItemNode.getTextContent().trim();
            const isEmpty = textContent === '';

            if (!isEmpty) return;

            // Check if cursor is at the start of the list item
            // We need to check if we're at position 0 in the first child node
            const children = listItemNode.getChildren();
            
            if (children.length === 0) {
              // Completely empty list item
              shouldExitList = true;
            } else {
              // Check if we're at the start of the first child
              const firstChild = children[0];
              if (firstChild) {
                // If the current node is the first child and offset is 0, we're at the start
                if (node === firstChild && anchor.offset === 0) {
                  shouldExitList = true;
                } else if (firstChild.getType() === 'paragraph') {
                  // List items often contain paragraph nodes
                  const paragraphChildren = firstChild.getChildren();
                  if (paragraphChildren.length === 0) {
                    // Empty paragraph in list item
                    shouldExitList = true;
                  } else if (paragraphChildren.length === 1 && paragraphChildren[0].getType() === 'text') {
                    // Single text node in paragraph
                    if (node === paragraphChildren[0] && anchor.offset === 0) {
                      shouldExitList = true;
                    }
                  }
                }
              }
            }
          });

          if (shouldExitList && listItemNode) {
            event.preventDefault();
            editor.update(() => {
              // Create a new paragraph node
              const paragraph = $createParagraphNode();
              
              // Replace the list item with the paragraph
              listItemNode.replace(paragraph);
              
              // Select the paragraph
              paragraph.selectStart();
            });
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_EDITOR
      );
    }, [editor]);

    return null;
  }

  function FormatTrackingPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
      return editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const formats = new Set<string>();
            
            if (selection.hasFormat('bold')) formats.add('bold');
            if (selection.hasFormat('italic')) formats.add('italic');
            if (selection.hasFormat('underline')) formats.add('underline');
            if (selection.hasFormat('strikethrough')) formats.add('strikethrough');
            if (selection.hasFormat('code')) formats.add('code');
            
            // Check for lists and blockquote
            const anchor = selection.anchor;
            const node = anchor.getNode();
            const parent = node.getParent();
            
            if (parent && parent.getType() === 'listitem') {
              const listParent = parent.getParent();
              if (listParent && listParent instanceof ListNode) {
                const listType = listParent.getListType();
                if (listType === 'number') {
                  formats.add('orderedList');
                } else if (listType === 'bullet') {
                  formats.add('bulletList');
                }
              }
            }
            
            // Check for quote
            let current: any = node;
            while (current) {
              if (current.getType() === 'quote') {
                formats.add('blockquote');
                break;
              }
              current = current.getParent();
            }
            
            setActiveFormats(formats);
          }
        });
      });
    }, [editor]);

    return null;
  }

  function OnChangeSyncPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
      editorRef.current = editor;
      
      return editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          // Generate HTML with proper formatting for lists
          const htmlString = $generateHtmlFromNodes(editor, null);
          setText(htmlString);
        });
      });
    }, [editor]);

    return null;
  }

  // Mention and Emoji Suggestion Plugin
  function MentionEmojiSuggestionPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
      return editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
            setShowMentionSuggestions(false);
            setShowEmojiSuggestions(false);
            return;
          }

          // Get text from current node up to cursor position
          const anchor = selection.anchor;
          const node = anchor.getNode();
          const offset = anchor.offset;
          
          // Get text content from current node (simplified - works for most cases)
          const nodeText = node.getTextContent();
          const textBeforeCursor = nodeText.slice(0, offset);

          // Check for @ mentions first
          const lastAtIndex = textBeforeCursor.lastIndexOf('@');
          if (lastAtIndex !== -1) {
            const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' ';
            const isValidStart = charBeforeAt === ' ' || charBeforeAt === '\n' || lastAtIndex === 0;

            if (isValidStart) {
              const searchTerm = textBeforeCursor.slice(lastAtIndex + 1);
              if (!searchTerm.includes(' ') && !searchTerm.includes('\n') && !searchTerm.includes('@')) {
                setMentionSearchTerm(searchTerm);
                const position = getCursorCoordinates();
                setMentionSuggestionsPosition(position);
                setShowMentionSuggestions(true);
                setSelectedMentionIndex(0);
                setShowEmojiSuggestions(false);
                return;
              }
            }
          }

          // Check for :emoji: shortcodes
          const lastColonIndex = textBeforeCursor.lastIndexOf(':');
          if (lastColonIndex !== -1) {
            const charBeforeColon = lastColonIndex > 0 ? textBeforeCursor[lastColonIndex - 1] : ' ';
            const isValidStart = charBeforeColon === ' ' || charBeforeColon === '\n' || lastColonIndex === 0;

            if (isValidStart) {
              const searchTerm = textBeforeCursor.slice(lastColonIndex + 1);
              if (!searchTerm.includes(' ') && !searchTerm.includes('\n') && !searchTerm.includes(':')) {
                setEmojiSearchTerm(searchTerm);
                const position = getCursorCoordinates();
                setEmojiSuggestionsPosition(position);
                setShowEmojiSuggestions(true);
                setSelectedEmojiIndex(0);
                setShowMentionSuggestions(false);
                return;
              }
            }
          }

          // Hide suggestions if conditions aren't met
          setShowEmojiSuggestions(false);
          setShowMentionSuggestions(false);
        });
      });
    }, [editor]);

    return null;
  }

  // Keyboard navigation for suggestions
  function SuggestionKeyboardPlugin() {
    const [editor] = useLexicalComposerContext();

    // Handle Enter key for suggestions (higher priority)
    useEffect(() => {
      return editor.registerCommand(
        KEY_ENTER_COMMAND,
        (event) => {
          if (!event || event.shiftKey) return false;
          
          // Handle mention suggestions
          if (showMentionSuggestions) {
            const filteredUsers = users.filter(user =>
              user.username.toLowerCase().includes(mentionSearchTerm.toLowerCase())
            );
            const specialMentions = [
              { username: 'channel' },
              { username: 'here' },
              { username: 'everyone' },
            ].filter(mention =>
              mention.username.toLowerCase().includes(mentionSearchTerm.toLowerCase())
            );
            const allSuggestions = [...specialMentions, ...filteredUsers];
            
            if (allSuggestions.length > 0 && selectedMentionIndex < allSuggestions.length) {
              event.preventDefault();
              handleMentionSelect(allSuggestions[selectedMentionIndex].username);
              return true;
            }
          }

          // Handle emoji suggestions
          if (showEmojiSuggestions) {
            const filteredEmojis = getFilteredEmojis();
            if (filteredEmojis.length > 0 && selectedEmojiIndex < filteredEmojis.length) {
              event.preventDefault();
              handleEmojiSelectFromSuggestions(filteredEmojis[selectedEmojiIndex].code);
              return true;
            }
          }
          
          return false;
        },
        COMMAND_PRIORITY_CRITICAL // Higher priority than EnterKeyPlugin
      );
    }, [editor, showMentionSuggestions, showEmojiSuggestions, mentionSearchTerm, selectedMentionIndex, selectedEmojiIndex, users]);

    // Handle other keys for suggestions navigation
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        // Handle mention suggestions navigation (non-Enter keys)
        if (showMentionSuggestions) {
          const filteredUsers = users.filter(user =>
            user.username.toLowerCase().includes(mentionSearchTerm.toLowerCase())
          );
          const specialMentions = [
            { username: 'channel' },
            { username: 'here' },
            { username: 'everyone' },
          ].filter(mention =>
            mention.username.toLowerCase().includes(mentionSearchTerm.toLowerCase())
          );
          const allSuggestions = [...specialMentions, ...filteredUsers];

          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setSelectedMentionIndex(prev => Math.min(allSuggestions.length - 1, prev + 1));
            return;
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            setSelectedMentionIndex(prev => Math.max(0, prev - 1));
            return;
          }
          if (event.key === 'Tab') {
            event.preventDefault();
            if (allSuggestions.length > 0 && selectedMentionIndex < allSuggestions.length) {
              handleMentionSelect(allSuggestions[selectedMentionIndex].username);
            }
            return;
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            setShowMentionSuggestions(false);
            return;
          }
        }

        // Handle emoji suggestions navigation (non-Enter keys)
        if (showEmojiSuggestions) {
          const filteredEmojis = getFilteredEmojis();
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setSelectedEmojiIndex(prev => Math.min(filteredEmojis.length - 1, prev + 1));
            return;
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            setSelectedEmojiIndex(prev => Math.max(0, prev - 1));
            return;
          }
          if (event.key === 'Tab') {
            event.preventDefault();
            if (filteredEmojis.length > 0 && selectedEmojiIndex < filteredEmojis.length) {
              handleEmojiSelectFromSuggestions(filteredEmojis[selectedEmojiIndex].code);
            }
            return;
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            setShowEmojiSuggestions(false);
            return;
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [editor, showMentionSuggestions, showEmojiSuggestions, mentionSearchTerm, selectedMentionIndex, selectedEmojiIndex, users]);

    return null;
  }

  // Handle text selection for sticky formatting bar - Lexical version
  useEffect(() => {
    const editor = editorRef.current;
    const container = containerRef.current;
    
    if (!editor || !container) return;

    const handleSelectionChange = () => {
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        const hasSelection = $isRangeSelection(selection) && !selection.isCollapsed();

        if (hasSelection) {
          // Small delay to ensure selection is finalized
          setTimeout(() => {
            const containerRect = container.getBoundingClientRect();
            const parentRect = container.parentElement?.getBoundingClientRect();

            if (!parentRect) return;

            // Position the bar above the container, centered
            setStickyBarPosition({
              top: containerRect.top - parentRect.top - 45,
              left: 20
            });
            setShowStickyBar(true);
          }, 10);
        } else {
          setShowStickyBar(false);
        }
      });
    };

    // Listen to selection changes via Lexical
    const removeListener = editor.registerUpdateListener(({ editorState }: { editorState: any }) => {
      editorState.read(() => {
        handleSelectionChange();
      });
    });

    // Also listen to DOM selection events as fallback
    document.addEventListener('selectionchange', handleSelectionChange);
    container.addEventListener('mouseup', handleSelectionChange);
    container.addEventListener('keyup', handleSelectionChange);

    return () => {
      removeListener();
      document.removeEventListener('selectionchange', handleSelectionChange);
      container.removeEventListener('mouseup', handleSelectionChange);
      container.removeEventListener('keyup', handleSelectionChange);
    };
  }, []);

  // Close sticky bar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stickyBarRef.current && !stickyBarRef.current.contains(event.target as Node)) {
        // Check if click is not in editor container (to allow selection)
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setShowStickyBar(false);
        }
      }
    };

    if (showStickyBar) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showStickyBar]);

  // Helper to get filtered emojis (same logic as in EmojiSuggestions component)
  const getFilteredEmojis = () => {
    const commonEmojis = [
      { code: 'smile', emoji: '😊' }, { code: 'smiley', emoji: '😃' }, { code: 'grin', emoji: '😁' },
      { code: 'laughing', emoji: '😆' }, { code: 'joy', emoji: '😂' }, { code: 'rofl', emoji: '🤣' },
      { code: 'wink', emoji: '😉' }, { code: 'heart_eyes', emoji: '😍' }, { code: 'kissing_heart', emoji: '😘' },
      { code: 'thinking', emoji: '🤔' }, { code: 'sunglasses', emoji: '😎' }, { code: '+1', emoji: '👍' },
      { code: 'thumbsup', emoji: '👍' }, { code: '-1', emoji: '👎' }, { code: 'clap', emoji: '👏' },
      { code: 'wave', emoji: '👋' }, { code: 'pray', emoji: '🙏' }, { code: 'muscle', emoji: '💪' },
      { code: 'heart', emoji: '❤️' }, { code: 'fire', emoji: '🔥' }, { code: 'rocket', emoji: '🚀' },
      { code: 'star', emoji: '⭐' }, { code: 'sparkles', emoji: '✨' }, { code: 'tada', emoji: '🎉' },
      { code: 'trophy', emoji: '🏆' }, { code: 'gift', emoji: '🎁' }, { code: 'coffee', emoji: '☕' },
      { code: 'pizza', emoji: '🍕' }, { code: 'cake', emoji: '🍰' }, { code: 'dog', emoji: '🐶' },
      { code: 'cat', emoji: '🐱' },
    ];

    return emojiSearchTerm
      ? commonEmojis.filter((emoji) =>
          emoji.code.toLowerCase().includes(emojiSearchTerm.toLowerCase())
        )
      : commonEmojis.slice(0, 20);
  };

  // Note: handleKeyDown and handleChange are for mention/emoji suggestions
  // These need to be integrated into Lexical plugins later
  // For now, keeping them commented out as they won't work with Lexical's ContentEditable
  /*
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle mention suggestions navigation
    if (showMentionSuggestions) {
      // Filter users based on search term
      const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(mentionSearchTerm.toLowerCase())
      );
      const specialMentions = [
        { username: 'channel' },
        { username: 'here' },
        { username: 'everyone' },
      ].filter(mention =>
        mention.username.toLowerCase().includes(mentionSearchTerm.toLowerCase())
      );
      const allSuggestions = [...specialMentions, ...filteredUsers];

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex(prev => Math.min(allSuggestions.length - 1, prev + 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex(prev => Math.max(0, prev - 1));
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (allSuggestions.length > 0 && selectedMentionIndex < allSuggestions.length) {
          handleMentionSelect(allSuggestions[selectedMentionIndex].username);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentionSuggestions(false);
        return;
      }
    }

    // Handle emoji suggestions navigation
    if (showEmojiSuggestions) {
      const filteredEmojis = getFilteredEmojis();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedEmojiIndex(prev => Math.min(filteredEmojis.length - 1, prev + 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedEmojiIndex(prev => Math.max(0, prev - 1));
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        // Get the currently selected emoji from filtered list
        const filteredEmojis = getFilteredEmojis();
        if (filteredEmojis.length > 0 && selectedEmojiIndex < filteredEmojis.length) {
          handleEmojiSelectFromSuggestions(filteredEmojis[selectedEmojiIndex].code);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowEmojiSuggestions(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  */

  const handleSend = async () => {
    // Check if HTML content is actually empty (Lexical can return <p><br></p> for empty content)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    const hasContent = textContent.trim().length > 0;
    
    if (!hasContent && selectedFiles.length === 0 && attachedLists.length === 0) return;

    try {
      const attachmentIds = Array.from(uploadedFileIds.values());
      const attachments = attachmentIds.length > 0 ? attachmentIds : undefined;
      const listAttachments = attachedLists.length > 0 ? attachedLists : undefined;

      console.log('📤 Sending message with attachments:', attachments);
      console.log('📋 Sending message with listAttachments:', listAttachments);
      console.log('📝 attachedLists state:', attachedLists);

      // Send via channel or DM context - send HTML content
      if (channelId && currentWorkspaceId) {
        await onSend(text, attachments, listAttachments);
      } else if (activeConversation?._id && currentWorkspaceId) {
        await sendMessage(text, attachments, listAttachments);
      } else {
        await onSend(text, attachments, listAttachments);
      }

      // Clear all states after successful send
      // First, revoke all preview URLs to prevent memory leaks
      filePreviewUrls.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      
      // Clear Lexical editor
      if (editorRef.current) {
        editorRef.current.update(() => {
          const root = $getRoot();
          root.clear();
        });
      }
      setText('');
      setSelectedFiles([]);
      setUploadedFileIds(new Map());
      setUploadingFileIds(new Set());
      setFilePreviewUrls(new Map());
      setUploadErrors(new Map());
      setAttachedLists([]);
      setAttachedListsData(new Map());
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Filter files by size and collect rejected files for aggregate error message
    const validFiles: File[] = [];
    const rejectedFiles: File[] = [];
    
    files.forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        rejectedFiles.push(file);
      } else {
        validFiles.push(file);
      }
    });
    
    // Show aggregate error message if any files were rejected
    if (rejectedFiles.length > 0) {
      const maxSizeMB = (MAX_FILE_SIZE / 1024 / 1024).toFixed(0);
      if (rejectedFiles.length === 1) {
        alert(`File "${rejectedFiles[0].name}" is too large. Maximum size is ${maxSizeMB}MB.`);
      } else {
        const fileList = rejectedFiles.map(f => `• ${f.name}`).join('\n');
        alert(`${rejectedFiles.length} files are too large (maximum size is ${maxSizeMB}MB):\n\n${fileList}`);
      }
    }
    
    if (validFiles.length === 0) return;
    
    // Create SelectedFile objects with unique IDs
    const selectedFilesWithIds: SelectedFile[] = validFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file
    }));
    
    // Generate preview URLs for images immediately using createObjectURL
    const newPreviewUrls = new Map<string, string>();
    selectedFilesWithIds.forEach((selectedFile) => {
      if (selectedFile.file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(selectedFile.file);
        newPreviewUrls.set(selectedFile.id, previewUrl);
      }
    });
    
    if (newPreviewUrls.size > 0) {
      setFilePreviewUrls(prev => new Map([...prev, ...newPreviewUrls]));
    }
    
    setSelectedFiles(prev => [...prev, ...selectedFilesWithIds]);
    
    // Upload files immediately if we have the required context
    if (currentWorkspaceId && (channelId || activeConversation?._id)) {
      selectedFilesWithIds.forEach((selectedFile) => {
        handleFileUpload(selectedFile.file, selectedFile.id);
      });
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleFileUpload = async (file: File, fileId: string) => {
    if (!currentWorkspaceId || (!channelId && !activeConversation?._id)) {
      console.error('Cannot upload file: missing workspace context');
      setUploadErrors(prev => new Map(prev).set(fileId, 'Missing workspace context'));
      return;
    }
    
    // Mark file as uploading
    setUploadingFileIds(prev => new Set(prev).add(fileId));
    setUploadErrors(prev => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
    
    try {
      const uploadedFiles = await uploadFiles(
        [file],
        currentWorkspaceId,
        channelId,
        activeConversation?._id
      );
      
      if (uploadedFiles && uploadedFiles.length > 0) {
        setUploadedFileIds(prev => new Map(prev).set(fileId, uploadedFiles[0].id));
      } else {
        throw new Error('No file returned from upload');
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setUploadErrors(prev => new Map(prev).set(fileId, error.message || 'Failed to upload file'));
    } finally {
      setUploadingFileIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const handleRemoveFile = (fileId: string) => {
    // Revoke the object URL before removing to prevent memory leak
    const previewUrl = filePreviewUrls.get(fileId);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadedFileIds(prev => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
    setUploadingFileIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(fileId);
      return newSet;
    });
    setFilePreviewUrls(prev => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
    setUploadErrors(prev => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
    // Close modal if this file is being previewed
    if (previewModalData?.id === fileId) {
      setPreviewModalOpen(false);
      setPreviewModalData(null);
    }
  };

  const handleImageClick = (file: File, previewUrl: string, id: string) => {
    setPreviewModalData({ file, previewUrl, id });
    setPreviewModalOpen(true);
    setShowFileDetailsEdit(false);
    setEditingFileName(file.name);
    setEditingFileDescription('');
  };

  const handleEditFileDetails = () => {
    setShowFileDetailsEdit(true);
  };

  const handleSaveFileDetails = async () => {
    if (!previewModalData) return;

    try {
      // Get the uploaded file ID from the map
      const uploadedFileId = uploadedFileIds.get(previewModalData.id);
      
      if (!uploadedFileId) {
        alert('Cannot update file: File not uploaded yet');
        return;
      }

      // Call API to update file metadata
      const updatedFile = await updateFileMetadata(uploadedFileId, {
        filename: editingFileName,
        description: editingFileDescription,
      });

      if (updatedFile) {
        // Update the selected file with new name
        setSelectedFiles(prev => 
          prev.map(sf => 
            sf.id === previewModalData.id 
              ? { ...sf, file: new File([sf.file], updatedFile.filename, { type: sf.file.type }) }
              : sf
          )
        );
        
        // Update preview modal data
        const newFile = new File([previewModalData.file], updatedFile.filename, { type: previewModalData.file.type });
        setPreviewModalData({
          ...previewModalData,
          file: newFile,
        });
        
        // Close the edit modal
        setShowFileDetailsEdit(false);
        
        // Show success feedback
        console.log('File details updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating file details:', error);
      alert(error.response?.data?.message || 'Failed to update file details. Please try again.');
    }
  };

  const handleCancelFileDetails = () => {
    setShowFileDetailsEdit(false);
    if (previewModalData) {
      setEditingFileName(previewModalData.file.name);
      setEditingFileDescription('');
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
    setShowAddMenu(false);
  };

  const getCursorCoordinates = () => {
    const container = containerRef.current;
    if (!container) return { bottom: 60, left: 200 };

    // Position it just above the input area, more to the right
    const containerHeight = container.offsetHeight;
    return {
      bottom: containerHeight + 10, // 10px gap above the container
      left: 200 // Move it to the right
    };
  };

  /*
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    const textarea = e.target;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = newText.slice(0, cursorPos);

    // Check for @ mentions first
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      // Check if there's a space or start of string before the @
      const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' ';
      const isValidStart = charBeforeAt === ' ' || charBeforeAt === '\n' || lastAtIndex === 0;

      if (isValidStart) {
        const searchTerm = textBeforeCursor.slice(lastAtIndex + 1);

        // Only show suggestions if search term doesn't contain spaces, newlines, or @
        if (!searchTerm.includes(' ') && !searchTerm.includes('\n') && !searchTerm.includes('@')) {
          setMentionSearchTerm(searchTerm);
          setMentionSearchStartPos(lastAtIndex);

          // Calculate cursor position for suggestions box
          const position = getCursorCoordinates();
          setMentionSuggestionsPosition(position);

          setShowMentionSuggestions(true);
          setSelectedMentionIndex(0);
          setShowEmojiSuggestions(false); // Hide emoji suggestions
          return;
        }
      }
    } else {
      setShowMentionSuggestions(false);
    }

    // Check if user is typing an emoji shortcode
    const lastColonIndex = textBeforeCursor.lastIndexOf(':');

    if (lastColonIndex !== -1) {
      // Check if there's a space or start of string before the colon
      const charBeforeColon = lastColonIndex > 0 ? textBeforeCursor[lastColonIndex - 1] : ' ';
      const isValidStart = charBeforeColon === ' ' || charBeforeColon === '\n' || lastColonIndex === 0;

      if (isValidStart) {
        const searchTerm = textBeforeCursor.slice(lastColonIndex + 1);

        // Only show suggestions if search term doesn't contain spaces or newlines
        if (!searchTerm.includes(' ') && !searchTerm.includes('\n') && !searchTerm.includes(':')) {
          setEmojiSearchTerm(searchTerm);
          setEmojiSearchStartPos(lastColonIndex);

          // Calculate cursor position for suggestions box
          const position = getCursorCoordinates();
          setEmojiSuggestionsPosition(position);

          setShowEmojiSuggestions(true);
          setSelectedEmojiIndex(0);
          setShowMentionSuggestions(false); // Hide mention suggestions
          return;
        }
      }
    }

    // Hide suggestions if conditions aren't met
    setShowEmojiSuggestions(false);
    setShowMentionSuggestions(false);
  };
  */

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
      }
    };

    if (showAddMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showAddMenu]);

  // Close schedule menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (scheduleMenuRef.current && !scheduleMenuRef.current.contains(event.target as Node)) {
        setShowScheduleMenu(false);
      }
    };

    if (showScheduleMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showScheduleMenu]);

  // Focus management for preview modal (accessibility)
  useEffect(() => {
    if (previewModalOpen && previewModalCloseButtonRef.current) {
      // Store previously focused element to restore later
      const previouslyFocusedElement = document.activeElement as HTMLElement;
      
      // Focus the close button when modal opens
      previewModalCloseButtonRef.current.focus();
      
      return () => {
        // Restore focus when modal closes
        if (previouslyFocusedElement) {
          previouslyFocusedElement.focus();
        }
      };
    }
  }, [previewModalOpen]);

  // Keyboard handling for preview modal (Escape key to close)
  useEffect(() => {
    if (!previewModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewModalOpen(false);
        setPreviewModalData(null);
        setShowFileDetailsEdit(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewModalOpen]);

  const handleEmojiSelectFromSuggestions = (emojiCode: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    // Get the actual emoji character from the code
    const emojiChar = getEmojiByName(emojiCode);
    const emojiToInsert = emojiChar || `:${emojiCode}:`;

    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchor = selection.anchor;
        const node = anchor.getNode();
        const offset = anchor.offset;
        const textBeforeCursor = node.getTextContent().slice(0, offset);
        const lastColonIndex = textBeforeCursor.lastIndexOf(':');
        
        if (lastColonIndex !== -1 && node.getType() === 'text') {
          // Select from : to cursor and replace with actual emoji
          selection.setTextNodeRange(node as any, lastColonIndex, node as any, offset);
          selection.insertText(emojiToInsert + ' ');
        } else {
          // Fallback: just insert emoji
          selection.insertText(emojiToInsert + ' ');
        }
      }
    });

    setShowEmojiSuggestions(false);
  };

  const handleMentionSelect = (username: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchor = selection.anchor;
        const node = anchor.getNode();
        const offset = anchor.offset;
        const textBeforeCursor = node.getTextContent().slice(0, offset);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        
        if (lastAtIndex !== -1 && node.getType() === 'text') {
          // Select from @ to cursor and replace
          selection.setTextNodeRange(node as any, lastAtIndex + 1, node as any, offset);
          // Replace with username
          selection.insertText(username + ' ');
        } else {
          // Fallback: just insert
          selection.insertText(`@${username} `);
        }
      }
    });

    setShowMentionSuggestions(false);
  };

  const handleFormat = (formatType: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      switch (formatType) {
        case 'bold':
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
          break;
        case 'italic':
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
          break;
        case 'underline':
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
          break;
        case 'strikethrough':
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
          break;
        case 'code':
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
          break;
        case 'orderedList':
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
          break;
        case 'bulletList':
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
          break;
        case 'blockquote': {
          // Toggle blockquote - wrap selected text in quote or remove if already in quote
          const anchor = selection.anchor;
          const node = anchor.getNode();
          
          // Check if already in a quote
          let inQuote = false;
          let quoteNode: any = null;
          let current: any = node;
          while (current) {
            if (current.getType() === 'quote') {
              inQuote = true;
              quoteNode = current;
              break;
            }
            current = current.getParent();
          }
          
          if (inQuote && quoteNode) {
            // Remove quote by converting children to paragraphs
            const children = quoteNode.getChildren();
            quoteNode.replace(...children);
          } else {
            // Wrap selection in quote
            const nodes = selection.getNodes();
            if (nodes.length > 0) {
              const quote = $createQuoteNode();
              nodes.forEach(n => quote.append(n));
              selection.insertNodes([quote]);
            }
          }
          break;
        }
        case 'codeBlock': {
          const codeNode = $createCodeNode('javascript');
          selection.insertNodes([codeNode]);
          break;
        }
        case 'link': {
          // Get selected text and open link modal
          const selectedText = selection.getTextContent();
          setLinkModalSelectedText(selectedText);
          setLinkModalText(selectedText || '');
          setLinkModalUrl('');
          setShowLinkModal(true);
          break;
        }
      }
    });
  };

  const handleFormatClick = (e: React.MouseEvent, formatType: string) => {
    e.preventDefault();
    handleFormat(formatType);
  };

  const handleLinkModalSave = () => {
    if (!linkModalUrl.trim()) return;

    const editor = editorRef.current;
    if (!editor) return;

    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      if (linkModalSelectedText) {
        // If text was selected, wrap it in a link
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkModalUrl.trim());
      } else {
        // No selection - create link with text
        const linkText = linkModalText.trim() || linkModalUrl.trim();
        const textNode = $createTextNode(linkText);
        const linkNode = $createLinkNode(linkModalUrl.trim());
        linkNode.append(textNode);
        selection.insertNodes([linkNode]);
      }
    });

    setShowLinkModal(false);
    setLinkModalText('');
    setLinkModalUrl('');
    setLinkModalSelectedText('');
  };

  const handleLinkModalCancel = () => {
    setShowLinkModal(false);
    setLinkModalText('');
    setLinkModalUrl('');
    setLinkModalSelectedText('');
  };

  const handleContainerClick = () => {
    // Focus Lexical editor by focusing the contentEditable element
    const container = containerRef.current;
    if (container) {
      const contentEditable = container.querySelector('[contenteditable="true"]') as HTMLElement;
      if (contentEditable) {
        contentEditable.focus();
      }
    }
  };

  const handleSelectRecentFile = async (fileId: string) => {
    // When a recent file is selected, add it to the upload queue
    const recentFiles = getRecentFiles();
    const recentFile = recentFiles.find(f => f.id === fileId);
    
    if (!recentFile) {
      console.error('Recent file not found');
      return;
    }
    
    // Generate a unique ID for this selected file
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Mark this file as already uploaded (it's from recent files)
    setUploadedFileIds(prev => new Map(prev).set(uniqueId, fileId));
    
    // Create a placeholder File object with proper metadata
    const placeholderFile: SelectedFile = {
      id: uniqueId,
      file: new File([], recentFile.filename, { type: recentFile.contentType }),
      originalSize: recentFile.length // Store the original file size from metadata
    };
    
    setSelectedFiles(prev => [...prev, placeholderFile]);
    
    // If it's an image, set the preview URL
    if (recentFile.contentType.startsWith('image/')) {
      const previewUrl = getFileUrl(fileId, true);
      if (previewUrl) {
        setFilePreviewUrls(prev => new Map(prev).set(uniqueId, previewUrl));
      }
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertText(emoji);
      }
    });
  };

  return (
    <>
      {/* Sticky Formatting Bar */}
      {showStickyBar && (
        <div
          ref={stickyBarRef}
          className="absolute z-50 flex items-center gap-0 bg-[rgb(34,37,41)] rounded-lg shadow-lg border border-[rgb(60,56,54)] px-1 py-1"
          style={{
            top: `${stickyBarPosition.top}px`,
            left: `${stickyBarPosition.left}px`,
          }}
        >
          <button
            onClick={(e) => handleFormatClick(e, 'bold')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('bold')
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white'
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`}
            title="Bold"
          >
            <svg data-qa="bold" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M4 2.75A.75.75 0 0 1 4.75 2h6.343a3.91 3.91 0 0 1 3.88 3.449A2 2 0 0 1 15 5.84l.001.067a3.9 3.9 0 0 1-1.551 3.118A4.627 4.627 0 0 1 11.875 18H4.75a.75.75 0 0 1-.75-.75V9.5a.8.8 0 0 1 .032-.218A.8.8 0 0 1 4 9.065zm2.5 5.565h3.593a2.157 2.157 0 1 0 0-4.315H6.5zm4.25 1.935H6.5v5.5h4.25a2.75 2.75 0 1 0 0-5.5" clipRule="evenodd"></path>
            </svg>
          </button>

          <button
            onClick={(e) => handleFormatClick(e, 'italic')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('italic')
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white'
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`}
            title="Italic"
          >
            <svg data-qa="italic" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M7 2.75A.75.75 0 0 1 7.75 2h7.5a.75.75 0 0 1 0 1.5H12.3l-2.6 13h2.55a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5H7.7l2.6-13H7.75A.75.75 0 0 1 7 2.75" clipRule="evenodd"></path>
            </svg>
          </button>

          <button
            onClick={(e) => handleFormatClick(e, 'underline')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('underline')
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white'
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`}
            title="Underline"
          >
            <svg data-qa="underline" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" d="M17.25 17.12a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5zM14.5 1.63a.75.75 0 0 1 .75.75v8a5.25 5.25 0 1 1-10.5 0v-8a.75.75 0 0 1 1.5 0v8a3.75 3.75 0 0 0 7.5 0v-8a.75.75 0 0 1 .75-.75"></path>
            </svg>
          </button>

          <button
            onClick={(e) => handleFormatClick(e, 'strikethrough')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('strikethrough')
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white'
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`}
            title="Strikethrough"
          >
            <svg data-qa="strikethrough" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M11.721 3.84c-.91-.334-2.028-.36-3.035-.114-1.51.407-2.379 1.861-2.164 3.15C6.718 8.051 7.939 9.5 11.5 9.5l.027.001h5.723a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5h3.66c-.76-.649-1.216-1.468-1.368-2.377-.347-2.084 1.033-4.253 3.265-4.848l.007-.002.007-.002c1.252-.307 2.68-.292 3.915.16 1.252.457 2.337 1.381 2.738 2.874a.75.75 0 0 1-1.448.39c-.25-.925-.91-1.528-1.805-1.856m2.968 9.114a.75.75 0 1 0-1.378.59c.273.64.186 1.205-.13 1.674-.333.492-.958.925-1.82 1.137-.989.243-1.991.165-3.029-.124-.93-.26-1.613-.935-1.858-1.845a.75.75 0 0 0-1.448.39c.388 1.441 1.483 2.503 2.903 2.9 1.213.338 2.486.456 3.79.135 1.14-.28 2.12-.889 2.704-1.753.6-.888.743-1.992.266-3.104" clipRule="evenodd"></path>
            </svg>
          </button>

          <span className="w-[1px] h-5 bg-[rgba(232,232,232,0.13)] mx-1 self-center"></span>

          <button
            onClick={(e) => handleFormatClick(e, 'link')}
            className="w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]"
            title="Link"
          >
            <svg data-qa="link" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M12.306 3.756a2.75 2.75 0 0 1 3.889 0l.05.05a2.75 2.75 0 0 1 0 3.889l-3.18 3.18a2.75 2.75 0 0 1-3.98-.095l-.03-.034a.75.75 0 0 0-1.11 1.009l.03.034a4.25 4.25 0 0 0 6.15.146l3.18-3.18a4.25 4.25 0 0 0 0-6.01l-.05-.05a4.25 4.25 0 0 0-6.01 0L9.47 4.47a.75.75 0 1 0 1.06 1.06zm-4.611 12.49a2.75 2.75 0 0 1-3.89 0l-.05-.051a2.75 2.75 0 0 1 0-3.89l3.18-3.179a2.75 2.75 0 0 1 3.98.095l.03.034a.75.75 0 1 0 1.11-1.01l-.03-.033a4.25 4.25 0 0 0-6.15-.146l-3.18 3.18a4.25 4.25 0 0 0 0 6.01l.05.05a4.25 4.25 0 0 0 6.01 0l1.775-1.775a.75.75 0 0 0-1.06-1.06z" clipRule="evenodd"></path>
            </svg>
          </button>

          <button
            onClick={(e) => handleFormatClick(e, 'orderedList')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('orderedList')
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white'
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`}
            title="Numbered list"
          >
            <svg data-qa="numbered-list" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M3.792 2.094A.5.5 0 0 1 4 2.5V6h1a.5.5 0 1 1 0 1H2a.5.5 0 1 1 0-1h1V3.194l-.842.28a.5.5 0 0 1-.316-.948l1.5-.5a.5.5 0 0 1 .45.068M7.75 3.5a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5zM7 10.75a.75.75 0 0 1 .75-.75h10a.75.75 0 0 1 0 1.5h-10a.75.75 0 0 1-.75-.75m0 6.5a.75.75 0 0 1 .75-.75h10a.75.75 0 0 1 0 1.5h-10a.75.75 0 0 1-.75-.75m-4.293-3.36a1 1 0 0 1 .793-.39c.49 0 .75.38.75.75 0 .064-.033.194-.173.409a5 5 0 0 1-.594.711c-.256.267-.552.548-.87.848l-.088.084a42 42 0 0 0-.879.845A.5.5 0 0 0 2 18h3a.5.5 0 0 0 0-1H3.242l.058-.055c.316-.298.629-.595.904-.882a6 6 0 0 0 .711-.859c.18-.277.335-.604.335-.954 0-.787-.582-1.75-1.75-1.75a2 2 0 0 0-1.81 1.147.5.5 0 1 0 .905.427 1 1 0 0 1 .112-.184" clipRule="evenodd"></path>
            </svg>
          </button>

          <button
            onClick={(e) => handleFormatClick(e, 'bulletList')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('bulletList')
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white'
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`}
            title="Bulleted list"
          >
            <svg data-qa="bulleted-list" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M4 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a.75.75 0 0 1 .75-.75h10a.75.75 0 0 1 0 1.5h-10A.75.75 0 0 1 7 3m.75 6.25a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5zm0 7a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5zM3 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2" clipRule="evenodd"></path>
            </svg>
          </button>

          <span className="w-[1px] h-5 bg-[rgba(232,232,232,0.13)] mx-1 self-center"></span>

          <button
            onClick={(e) => handleFormatClick(e, 'blockquote')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('blockquote')
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white'
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`}
            title="Quote"
          >
            <svg data-qa="quote" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M3.5 2.75a.75.75 0 0 0-1.5 0v14.5a.75.75 0 0 0 1.5 0zM6.75 3a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5zM6 10.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75m.75 5.25a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"></path>
            </svg>
          </button>

          <button
            onClick={(e) => handleFormatClick(e, 'code')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('code')
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white'
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`}
            title="Inline code"
          >
            <svg data-qa="code" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M12.058 3.212c.396.12.62.54.5.936L8.87 16.29a.75.75 0 1 1-1.435-.436l3.686-12.143a.75.75 0 0 1 .936-.5M5.472 6.24a.75.75 0 0 1 .005 1.06l-2.67 2.693 2.67 2.691a.75.75 0 1 1-1.065 1.057l-3.194-3.22a.75.75 0 0 1 0-1.056l3.194-3.22a.75.75 0 0 1 1.06-.005m9.044 1.06a.75.75 0 1 1 1.065-1.056l3.194 3.221a.75.75 0 0 1 0 1.057l-3.194 3.219a.75.75 0 0 1-1.065-1.057l2.67-2.69z" clipRule="evenodd"></path>
            </svg>
          </button>

          <button
            onClick={(e) => handleFormatClick(e, 'codeBlock')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('codeBlock')
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white'
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`}
            title="Code block"
          >
            <svg data-qa="code-block" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M9.212 2.737a.75.75 0 1 0-1.424-.474l-2.5 7.5a.75.75 0 0 0 1.424.474zm6.038.265a.75.75 0 0 0 0 1.5h2a.25.25 0 0 1 .25.25v11.5a.25.25 0 0 1-.25.25h-13a.25.25 0 0 1-.25-.25v-3.5a.75.75 0 0 0-1.5 0v3.5c0 .966.784 1.75 1.75 1.75h13a1.75 1.75 0 0 0 1.75-1.75v-11.5a1.75 1.75 0 0 0-1.75-1.75zm-3.69.5a.75.75 0 1 0-1.12.996l1.556 1.754-1.556 1.75a.75.75 0 1 0 1.12.997l2-2.249a.75.75 0 0 0 0-.996zM3.999 9.061a.75.75 0 0 1-1.058-.062l-2-2.249a.75.75 0 0 1 0-.996l2-2.252a.75.75 0 1 1 1.12.996L2.504 6.252l1.557 1.75a.75.75 0 0 1-.062 1.059" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <EmojiPicker
          onSelectEmoji={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
    <div className="p-message_pane_input relative">
      {userName && (
        <div className="flex items-start gap-3 mb-2 px-3 py-3 bg-[rgb(36,39,42)] rounded-t-lg border-b border-[rgb(209,210,211)]/20">
          <div className="flex items-center justify-center flex-shrink-0 w-4 h-4 mt-0.5">
            <svg
              viewBox="0 0 20 20"
              className="w-4 h-4 text-[rgb(171,171,173)]"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.001 1.5c-.689 0-1.31.246-1.767.762-.331.374-.54.85-.65 1.383-1.21.369-2.103 1.137-2.685 2.357-.604 1.266-.859 2.989-.894 5.185l-1.88 1.886-.012.013c-.636.7-.806 1.59-.373 2.342.407.705 1.224 1.072 2.104 1.072h3.388c.13.391.34.777.646 1.107.498.537 1.219.893 2.137.893.911 0 1.626-.358 2.119-.896.302-.33.51-.714.638-1.104h3.384c.88 0 1.697-.367 2.103-1.072.434-.752.264-1.642-.372-2.342l-.011-.013-1.878-1.886c-.028-1.727-.19-3.162-.553-4.312h2.305a.625.625 0 1 0 0-1.25H16l2.25-3a.625.625 0 0 0-.5-1h-3a.625.625 0 1 0 0 1.25h1.75l-1.808 2.411c-.563-.812-1.32-1.35-2.273-1.641-.112-.533-.32-1.009-.651-1.383-.457-.516-1.078-.762-1.767-.762m-.501 6A.5.5 0 0 1 10 7h2.5a.5.5 0 0 1 .384.82L11.068 10H12.5a.5.5 0 0 1 0 1H10a.5.5 0 0 1-.384-.82L11.432 8H10a.5.5 0 0 1-.5-.5"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="text-[13px] text-[rgb(209,210,211)] leading-[1.38463]">
            <span>{userName}</span> has <strong className="font-bold">paused their notifications</strong>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className={`bg-[rgb(26,29,33)] rounded-lg border transition-colors relative ${
          isFocused ? 'border-[rgb(29,28,29)] shadow-[0_0_0_1px_rgb(29,28,29),0_0_0_5px_rgba(29,122,177,0.3)]' : 'border-[rgb(134,134,134)]'
        }`}
        onClick={handleContainerClick}
      >
        {/* Formatting Toolbar - Top */}
        {showFormattingToolbar && (
        <div
          role="toolbar"
          aria-orientation="horizontal"
          aria-label="Formatting"
          className="px-1 py-1 border-b border-[rgb(60,56,54)] flex items-center gap-0 bg-[rgb(34,37,41)] rounded-t-lg"
        >
          <button 
            onClick={(e) => handleFormatClick(e, 'bold')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('bold') 
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white' 
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`} 
            title="Bold"
            aria-label="Bold"
            aria-pressed={activeFormats.has('bold')}
          >
            <svg data-qa="bold" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M4 2.75A.75.75 0 0 1 4.75 2h6.343a3.91 3.91 0 0 1 3.88 3.449A2 2 0 0 1 15 5.84l.001.067a3.9 3.9 0 0 1-1.551 3.118A4.627 4.627 0 0 1 11.875 18H4.75a.75.75 0 0 1-.75-.75V9.5a.8.8 0 0 1 .032-.218A.8.8 0 0 1 4 9.065zm2.5 5.565h3.593a2.157 2.157 0 1 0 0-4.315H6.5zm4.25 1.935H6.5v5.5h4.25a2.75 2.75 0 1 0 0-5.5" clipRule="evenodd"></path>
            </svg>
          </button>
          <button 
            onClick={(e) => handleFormatClick(e, 'italic')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('italic') 
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white' 
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`} 
            title="Italic"
            aria-label="Italic"
            aria-pressed={activeFormats.has('italic')}
          >
            <svg data-qa="italic" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M7 2.75A.75.75 0 0 1 7.75 2h7.5a.75.75 0 0 1 0 1.5H12.3l-2.6 13h2.55a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5H7.7l2.6-13H7.75A.75.75 0 0 1 7 2.75" clipRule="evenodd"></path>
            </svg>
          </button>
          <button 
            onClick={(e) => handleFormatClick(e, 'underline')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('underline') 
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white' 
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`} 
            title="Underline"
            aria-label="Underline"
            aria-pressed={activeFormats.has('underline')}
          >
            <svg data-qa="underline" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" d="M17.25 17.12a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5zM14.5 1.63a.75.75 0 0 1 .75.75v8a5.25 5.25 0 1 1-10.5 0v-8a.75.75 0 0 1 1.5 0v8a3.75 3.75 0 0 0 7.5 0v-8a.75.75 0 0 1 .75-.75"></path>
            </svg>
          </button>
          <button 
            onClick={(e) => handleFormatClick(e, 'strikethrough')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('strikethrough') 
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white' 
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`} 
            title="Strikethrough"
            aria-label="Strikethrough"
            aria-pressed={activeFormats.has('strikethrough')}
          >
            <svg data-qa="strikethrough" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M11.721 3.84c-.91-.334-2.028-.36-3.035-.114-1.51.407-2.379 1.861-2.164 3.15C6.718 8.051 7.939 9.5 11.5 9.5l.027.001h5.723a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5h3.66c-.76-.649-1.216-1.468-1.368-2.377-.347-2.084 1.033-4.253 3.265-4.848l.007-.002.007-.002c1.252-.307 2.68-.292 3.915.16 1.252.457 2.337 1.381 2.738 2.874a.75.75 0 0 1-1.448.39c-.25-.925-.91-1.528-1.805-1.856m2.968 9.114a.75.75 0 1 0-1.378.59c.273.64.186 1.205-.13 1.674-.333.492-.958.925-1.82 1.137-.989.243-1.991.165-3.029-.124-.93-.26-1.613-.935-1.858-1.845a.75.75 0 0 0-1.448.39c.388 1.441 1.483 2.503 2.903 2.9 1.213.338 2.486.456 3.79.135 1.14-.28 2.12-.889 2.704-1.753.6-.888.743-1.992.266-3.104" clipRule="evenodd"></path>
            </svg>
          </button>
          <span className="w-[1px] h-5 bg-[rgba(232,232,232,0.13)] mx-1 self-center"></span>
          <button 
            onClick={(e) => handleFormatClick(e, 'link')}
            className="w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]" 
            title="Link"
            aria-label="Link"
            aria-pressed="false"
          >
            <svg data-qa="link" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M12.306 3.756a2.75 2.75 0 0 1 3.889 0l.05.05a2.75 2.75 0 0 1 0 3.889l-3.18 3.18a2.75 2.75 0 0 1-3.98-.095l-.03-.034a.75.75 0 0 0-1.11 1.009l.03.034a4.25 4.25 0 0 0 6.15.146l3.18-3.18a4.25 4.25 0 0 0 0-6.01l-.05-.05a4.25 4.25 0 0 0-6.01 0L9.47 4.47a.75.75 0 1 0 1.06 1.06zm-4.611 12.49a2.75 2.75 0 0 1-3.89 0l-.05-.051a2.75 2.75 0 0 1 0-3.89l3.18-3.179a2.75 2.75 0 0 1 3.98.095l.03.034a.75.75 0 1 0 1.11-1.01l-.03-.033a4.25 4.25 0 0 0-6.15-.146l-3.18 3.18a4.25 4.25 0 0 0 0 6.01l.05.05a4.25 4.25 0 0 0 6.01 0l1.775-1.775a.75.75 0 0 0-1.06-1.06z" clipRule="evenodd"></path>
            </svg>
          </button>
          <button 
            onClick={(e) => handleFormatClick(e, 'orderedList')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('orderedList') 
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white' 
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`} 
            title="Ordered list"
            aria-label="Ordered list"
            aria-pressed={activeFormats.has('orderedList')}
          >
            <svg data-qa="numbered-list" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M3.792 2.094A.5.5 0 0 1 4 2.5V6h1a.5.5 0 1 1 0 1H2a.5.5 0 1 1 0-1h1V3.194l-.842.28a.5.5 0 0 1-.316-.948l1.5-.5a.5.5 0 0 1 .45.068M7.75 3.5a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5zM7 10.75a.75.75 0 0 1 .75-.75h10a.75.75 0 0 1 0 1.5h-10a.75.75 0 0 1-.75-.75m0 6.5a.75.75 0 0 1 .75-.75h10a.75.75 0 0 1 0 1.5h-10a.75.75 0 0 1-.75-.75m-4.293-3.36a1 1 0 0 1 .793-.39c.49 0 .75.38.75.75 0 .064-.033.194-.173.409a5 5 0 0 1-.594.711c-.256.267-.552.548-.87.848l-.088.084a42 42 0 0 0-.879.845A.5.5 0 0 0 2 18h3a.5.5 0 0 0 0-1H3.242l.058-.055c.316-.298.629-.595.904-.882a6 6 0 0 0 .711-.859c.18-.277.335-.604.335-.954 0-.787-.582-1.75-1.75-1.75a2 2 0 0 0-1.81 1.147.5.5 0 1 0 .905.427 1 1 0 0 1 .112-.184" clipRule="evenodd"></path>
            </svg>
          </button>
          <button 
            onClick={(e) => handleFormatClick(e, 'bulletList')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('bulletList') 
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white' 
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`} 
            title="Bulleted list"
            aria-label="Bulleted list"
            aria-pressed={activeFormats.has('bulletList')}
          >
            <svg data-qa="bulleted-list" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M4 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a.75.75 0 0 1 .75-.75h10a.75.75 0 0 1 0 1.5h-10A.75.75 0 0 1 7 3m.75 6.25a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5zm0 7a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5zM3 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2" clipRule="evenodd"></path>
            </svg>
          </button>
          <span className="w-[1px] h-5 bg-[rgba(232,232,232,0.13)] mx-1 self-center"></span>
          <button 
            onClick={(e) => handleFormatClick(e, 'blockquote')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('blockquote') 
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white' 
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`} 
            title="Blockquote"
            aria-label="Blockquote"
            aria-pressed={activeFormats.has('blockquote')}
          >
            <svg data-qa="quote" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M3.5 2.75a.75.75 0 0 0-1.5 0v14.5a.75.75 0 0 0 1.5 0zM6.75 3a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5zM6 10.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75m.75 5.25a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"></path>
            </svg>
          </button>
          <button 
            onClick={(e) => handleFormatClick(e, 'code')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('code') 
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white' 
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`} 
            title="Code"
            aria-label="Code"
            aria-pressed={activeFormats.has('code')}
          >
            <svg data-qa="code" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M12.058 3.212c.396.12.62.54.5.936L8.87 16.29a.75.75 0 1 1-1.435-.436l3.686-12.143a.75.75 0 0 1 .936-.5M5.472 6.24a.75.75 0 0 1 .005 1.06l-2.67 2.693 2.67 2.691a.75.75 0 1 1-1.065 1.057l-3.194-3.22a.75.75 0 0 1 0-1.056l3.194-3.22a.75.75 0 0 1 1.06-.005m9.044 1.06a.75.75 0 1 1 1.065-1.056l3.194 3.221a.75.75 0 0 1 0 1.057l-3.194 3.219a.75.75 0 0 1-1.065-1.057l2.67-2.69z" clipRule="evenodd"></path>
            </svg>
          </button>
          <button
            onClick={(e) => handleFormatClick(e, 'codeBlock')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('codeBlock')
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white'
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`}
            title="Code block"
            aria-label="Code block"
            aria-pressed={activeFormats.has('codeBlock')}
          >
            <svg data-qa="code-block" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M9.212 2.737a.75.75 0 1 0-1.424-.474l-2.5 7.5a.75.75 0 0 0 1.424.474zm6.038.265a.75.75 0 0 0 0 1.5h2a.25.25 0 0 1 .25.25v11.5a.25.25 0 0 1-.25.25h-13a.25.25 0 0 1-.25-.25v-3.5a.75.75 0 0 0-1.5 0v3.5c0 .966.784 1.75 1.75 1.75h13a1.75 1.75 0 0 0 1.75-1.75v-11.5a1.75 1.75 0 0 0-1.75-1.75zm-3.69.5a.75.75 0 1 0-1.12.996l1.556 1.754-1.556 1.75a.75.75 0 1 0 1.12.997l2-2.249a.75.75 0 0 0 0-.996zM3.999 9.061a.75.75 0 0 1-1.058-.062l-2-2.249a.75.75 0 0 1 0-.996l2-2.252a.75.75 0 1 1 1.12.996L2.504 6.252l1.557 1.75a.75.75 0 0 1-.062 1.059" clipRule="evenodd"></path>
            </svg>
          </button>
          <div className="flex-1"></div>
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowFormattingHelp(true);
            }}
            className="w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]"
            title="Formatting help"
            aria-label="Formatting help"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
        )}

        {/* Message Input Area - Lexical Rich Text Editor */}
        <div className="relative px-3 pt-2 pb-1" ref={containerRef}>
          <LexicalComposer initialConfig={lexicalConfig}>
            <div className="relative">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable 
                    className="editor-input-message-composer"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  />
                }
                placeholder={
                  <div className="editor-placeholder-message-composer">
                    {placeholder}
                  </div>
                }
                ErrorBoundary={(props: any) => <div>{props.children}</div>}
              />
              <HistoryPlugin />
              <ListPlugin />
              <LinkPlugin />
              <EnterKeyPlugin />
              <BackspaceKeyPlugin />
              <FormatTrackingPlugin />
              <OnChangeSyncPlugin />
              <MentionEmojiSuggestionPlugin />
              <SuggestionKeyboardPlugin />
            </div>
          </LexicalComposer>
        </div>

        {/* Selected Files Preview - Right below text input */}
        {selectedFiles.length > 0 && (
          <div className="px-3 pb-2">
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((selectedFile) => {
                const isUploading = uploadingFileIds.has(selectedFile.id);
                const hasError = uploadErrors.has(selectedFile.id);
                const previewUrl = filePreviewUrls.get(selectedFile.id);
                const isImage = selectedFile.file.type.startsWith('image/');
                
                return (
                  <div
                    key={selectedFile.id}
                    className={`relative group ${isImage && previewUrl ? 'w-24 h-24' : 'w-auto'} rounded-lg overflow-hidden ${hasError ? 'ring-2 ring-red-500' : ''}`}
                  >
                    {isImage && previewUrl ? (
                      // Image preview
                      <div className="relative w-full h-full rounded-lg overflow-hidden bg-[rgb(34,37,41)]">
                        {/* Progress bar at top - only show during upload */}
                        {isUploading && (
                          <div className="absolute top-0 left-0 right-0 h-1 bg-[rgba(255,255,255,0.2)] z-20 overflow-hidden">
                            <div 
                              className="h-full w-1/3 bg-gradient-to-r from-transparent via-white to-transparent"
                              style={{
                                animation: 'slideProgress 1.5s ease-in-out infinite'
                              }}
                            ></div>
                          </div>
                        )}
                        
                        <img
                          src={previewUrl}
                          alt={selectedFile.file.name}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => handleImageClick(selectedFile.file, previewUrl, selectedFile.id)}
                        />
                        
                        {/* Remove button - only show on hover when not uploading */}
                        {!isUploading && (
                          <button
                            onClick={() => handleRemoveFile(selectedFile.id)}
                            className="absolute top-1 right-1 w-6 h-6 bg-[rgba(0,0,0,0.7)] hover:bg-[rgba(0,0,0,0.9)] rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                            title="Remove file"
                          >
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        
                        {/* Loading spinner overlay */}
                        {isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Non-image file preview
                      <div className="relative flex items-center gap-2 px-3 py-2 bg-[rgb(49,48,44)] rounded-lg text-sm text-[rgb(209,210,211)]">
                        {/* Progress bar at top - only show during upload */}
                        {isUploading && (
                          <div className="absolute top-0 left-0 right-0 h-1 bg-[rgba(255,255,255,0.2)] rounded-t-lg overflow-hidden">
                            <div 
                              className="h-full w-1/3 bg-gradient-to-r from-transparent via-white to-transparent rounded-tl-lg"
                              style={{
                                animation: 'slideProgress 1.5s ease-in-out infinite'
                              }}
                            ></div>
                          </div>
                        )}
                        
                        <span className="truncate max-w-[200px]">{selectedFile.file.name}</span>
                        <span className="text-xs text-[rgb(134,134,134)]">
                          {((selectedFile.originalSize ?? selectedFile.file.size) / 1024 / 1024).toFixed(2)} MB
                        </span>
                        {hasError && (
                          <span className="text-xs text-red-500">Error</span>
                        )}
                        
                        {/* Loading spinner */}
                        {isUploading && (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                        )}
                        
                        {/* Remove button - only show on hover when not uploading */}
                        {!isUploading && (
                          <button
                            onClick={() => handleRemoveFile(selectedFile.id)}
                            className="ml-2 w-5 h-5 rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                            title="Remove file"
                          >
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Attached Lists Preview */}
        {attachedLists.length > 0 && (
          <div className="px-3 pb-2">
            <div className="flex flex-wrap gap-2">
              {attachedLists.map((listId) => {
                const listData = attachedListsData.get(listId);
                return (
                  <div
                    key={listId}
                    className="relative group w-auto rounded-lg overflow-hidden"
                  >
                    <div className="relative flex items-center gap-2 px-3 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-sm text-[rgb(209,210,211)]">
                      <div className="w-5 h-5 bg-yellow-500 rounded flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <span className="truncate max-w-[200px] text-white">
                        {listData?.title || 'Loading...'}
                      </span>
                      <button
                        onClick={() => {
                          setAttachedLists((prev) => prev.filter((id) => id !== listId));
                          setAttachedListsData((prev) => {
                            const newMap = new Map(prev);
                            newMap.delete(listId);
                            return newMap;
                          });
                        }}
                        className="ml-2 w-5 h-5 rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        title="Remove list"
                      >
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Bar - Bottom - Slack Style */}
        <div className="px-1 py-1 flex items-center justify-between bg-[rgb(26,29,33)]">
          {/* Left side - Formatting & Action icons */}
          <div className="flex items-center gap-0 relative">
            {/* Circular Add Button */}
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="relative inline-flex w-7 h-7 min-w-[28px] items-center justify-center rounded-full bg-[rgba(232,232,232,0.13)] transition-all m-0.5 p-0.5 hover:bg-[rgba(232,232,232,0.2)] text-[rgb(209,210,211)]"
              title="Attach"
              aria-label="Attach"
              aria-haspopup="menu"
            >
              <svg data-qa="plus" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
                <path fill="currentColor" fillRule="evenodd" d="M10.75 3.25a.75.75 0 0 0-1.5 0v6H3.251L3.25 10v-.75a.75.75 0 0 0 0 1.5V10v.75h6v6a.75.75 0 0 0 1.5 0v-6h6a.75.75 0 0 0 0-1.5h-6z" clipRule="evenodd"></path>
              </svg>
            </button>

            {/* Formatting Toggle Button with animated indicator */}
            <button
              onClick={() => setShowFormattingToolbar(!showFormattingToolbar)}
              className="relative w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all m-0.5 p-0.5 hover:bg-[rgba(232,232,232,0.1)] text-[rgba(232,232,232,0.7)]"
              title={showFormattingToolbar ? "Hide formatting" : "Show formatting"}
              aria-label={showFormattingToolbar ? "Hide formatting" : "Show formatting"}
              aria-pressed={showFormattingToolbar}
            >
              <svg data-qa="formatting" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
                <path fill="currentColor" fillRule="evenodd" d="M6.941 3.952c-.459-1.378-2.414-1.363-2.853.022l-4.053 12.8a.75.75 0 0 0 1.43.452l1.101-3.476h6.06l1.163 3.487a.75.75 0 1 0 1.423-.474zm1.185 8.298L5.518 4.427 3.041 12.25zm6.198-5.537a4.74 4.74 0 0 1 3.037-.081A3.74 3.74 0 0 1 20 10.208V17a.75.75 0 0 1-1.5 0v-.745a8 8 0 0 1-2.847 1.355 3 3 0 0 1-3.15-1.143C10.848 14.192 12.473 11 15.287 11H18.5v-.792c0-.984-.641-1.853-1.581-2.143a3.24 3.24 0 0 0-2.077.056l-.242.089a2.22 2.22 0 0 0-1.34 1.382l-.048.145a.75.75 0 0 1-1.423-.474l.048-.145a3.72 3.72 0 0 1 2.244-2.315zM18.5 12.5h-3.213c-1.587 0-2.504 1.801-1.57 3.085.357.491.98.717 1.572.57a6.5 6.5 0 0 0 2.47-1.223l.741-.593z" clipRule="evenodd"></path>
              </svg>
              {/* Animated line indicator when active */}
              {showFormattingToolbar && (
                <span className="absolute w-[21px] h-[1.5px] bg-[rgba(232,232,232,0.7)] rounded-full -bottom-1 left-1/2 -translate-x-1/2"></span>
              )}
            </button>

            {/* Emoji Button with two-state icon */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="relative z-[1] w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all m-0.5 p-0.5 hover:bg-[rgba(232,232,232,0.1)] text-[rgba(232,232,232,0.7)]"
              title="Emoji"
              aria-label="Emoji"
            >
              <div className="relative w-[18px] h-[18px]">
                <svg data-qa="emoji" aria-hidden="true" viewBox="0 0 20 20" className={`absolute inset-0 w-[18px] h-[18px] transition-opacity ${showEmojiPicker ? 'opacity-0' : 'opacity-100'}`}>
                  <path fill="currentColor" fillRule="evenodd" d="M2.5 10a7.5 7.5 0 1 1 15 0 7.5 7.5 0 0 1-15 0M10 1a9 9 0 1 0 0 18 9 9 0 0 0 0-18M7.5 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M14 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m-6.385 3.766a.75.75 0 1 0-1.425.468C6.796 14.08 8.428 15 10.027 15s3.23-.92 3.838-2.766a.75.75 0 1 0-1.425-.468c-.38 1.155-1.38 1.734-2.413 1.734s-2.032-.58-2.412-1.734" clipRule="evenodd"></path>
                </svg>
                <svg data-qa="emoji-filled" aria-hidden="true" viewBox="0 0 20 20" className={`absolute inset-0 w-[18px] h-[18px] transition-opacity ${showEmojiPicker ? 'opacity-100' : 'opacity-0'}`}>
                  <path fill="currentColor" fillRule="evenodd" d="M2.5 10a7.5 7.5 0 1 1 15 0 7.5 7.5 0 0 1-15 0M10 1a9 9 0 1 0 0 18 9 9 0 0 0 0-18M7.5 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M14 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m-.523 4.597c-.616 1.576-2.046 2.364-3.477 2.364-1.43 0-2.86-.788-3.477-2.364-.22-.56.258-1.097.86-1.097h5.234c.602 0 1.08.537.86 1.097" clipRule="evenodd"></path>
                </svg>
              </div>
              {/* Yellow dot indicator when emoji picker is open */}
              {showEmojiPicker && (
                <span className="absolute w-[18px] h-[18px] bg-[rgb(242,199,68)] rounded-full opacity-0 -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></span>
              )}
            </button>

            {/* Mention Button */}
            <button
              className="w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all m-0.5 p-0.5 hover:bg-[rgba(232,232,232,0.1)] text-[rgba(232,232,232,0.7)]"
              title="Mention someone"
              aria-label="Mention someone"
            >
              <svg data-qa="mentions" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
                <path fill="currentColor" fillRule="evenodd" d="M2.5 10a7.5 7.5 0 1 1 15 0v.645c0 1.024-.83 1.855-1.855 1.855a1.145 1.145 0 0 1-1.145-1.145V6.75a.75.75 0 0 0-1.494-.098 4.5 4.5 0 1 0 .465 6.212A2.64 2.64 0 0 0 15.646 14 3.355 3.355 0 0 0 19 10.645V10a9 9 0 1 0-3.815 7.357.75.75 0 1 0-.865-1.225A7.5 7.5 0 0 1 2.5 10m7.5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6" clipRule="evenodd"></path>
              </svg>
            </button>

            {/* Divider */}
            <span className="w-[1px] h-5 bg-[rgba(232,232,232,0.13)] mx-1.5 self-center"></span>

            {/* Video Clip Button */}
            <button
              className="relative w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all m-0.5 p-0.5 hover:bg-[rgba(232,232,232,0.1)] text-[rgba(232,232,232,0.7)]"
              title="Record video clip"
              aria-label="Record video clip"
            >
              <svg data-qa="video" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
                <path fill="currentColor" fillRule="evenodd" d="M3.75 4.5a.75.75 0 0 0-.75.75v9.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-2.59a.75.75 0 0 1 1.124-.65l3.376 1.943V6.547l-3.376 1.944A.75.75 0 0 1 13 7.84V5.25a.75.75 0 0 0-.75-.75zm-2.25.75A2.25 2.25 0 0 1 3.75 3h8.5a2.25 2.25 0 0 1 2.25 2.25v1.294l2.626-1.512A1.25 1.25 0 0 1 19 6.115v7.77a1.25 1.25 0 0 1-1.874 1.083L14.5 13.456v1.294A2.25 2.25 0 0 1 12.25 17h-8.5a2.25 2.25 0 0 1-2.25-2.25z" clipRule="evenodd"></path>
              </svg>
            </button>

            {/* Audio Clip Button */}
            <button
              className="w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all m-0.5 p-0.5 hover:bg-[rgba(232,232,232,0.1)] text-[rgba(232,232,232,0.7)]"
              title="Record audio clip"
              aria-label="Record audio clip"
            >
              <svg data-qa="microphone" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
                <path fill="currentColor" fillRule="evenodd" d="M10 2a3.5 3.5 0 0 0-3.5 3.5v3a3.5 3.5 0 1 0 7 0v-3A3.5 3.5 0 0 0 10 2M8 5.5a2 2 0 1 1 4 0v3a2 2 0 1 1-4 0zM5 8.25a.75.75 0 0 0-1.5 0v.25a6.5 6.5 0 0 0 5.75 6.457V16.5h-1.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-1.5v-1.543A6.5 6.5 0 0 0 16.5 8.5v-.25a.75.75 0 0 0-1.5 0v.25a5 5 0 0 1-10 0z" clipRule="evenodd"></path>
              </svg>
            </button>

            {/* Divider */}
            <span className="w-[1px] h-5 bg-[rgba(232,232,232,0.13)] mx-1.5 self-center"></span>

            {/* Slash Commands Button */}
            <button
              className="w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all m-0.5 p-0.5 hover:bg-[rgba(232,232,232,0.1)] text-[rgba(232,232,232,0.7)]"
              title="Run shortcut"
              aria-label="Run shortcut"
            >
              <svg data-qa="slash-box" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
                <path fill="currentColor" fillRule="evenodd" d="M4.5 3h11A1.5 1.5 0 0 1 17 4.5v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 15.5v-11A1.5 1.5 0 0 1 4.5 3m-3 1.5a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3zm11.64 1.391a.75.75 0 0 0-1.28-.782l-5.5 9a.75.75 0 0 0 1.28.782z" clipRule="evenodd"></path>
              </svg>
            </button>

            {/* Add Menu Dropdown - Slack Style */}
            {showAddMenu && (
              <div
                ref={addMenuRef}
                className="absolute bottom-full left-0 mb-2 w-[360px] bg-[rgb(34,37,41)] rounded-lg shadow-lg border border-[rgb(60,56,54)] py-3 z-50"
                role="menu"
                aria-label="Attach"
              >
                {/* Canvas */}
                <button
                  className="w-full h-7 min-h-[28px] px-6 flex items-center hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left"
                  role="menuitem"
                  disabled
                >
                  <div className="w-5 h-7 mr-2 flex items-center justify-center">
                    <svg data-qa="canvas" aria-hidden="true" viewBox="0 0 20 20" className="w-5 h-5 text-[rgb(248,248,248)]">
                      <path fill="currentColor" fillRule="evenodd" d="M3 5.25A2.25 2.25 0 0 1 5.25 3h9.5A2.25 2.25 0 0 1 17 5.25v5.5h-4.75a1.5 1.5 0 0 0-1.5 1.5V17h-5.5A2.25 2.25 0 0 1 3 14.75zm9.25 11.003 4.003-4.003H12.25zM5.25 1.5A3.75 3.75 0 0 0 1.5 5.25v9.5a3.75 3.75 0 0 0 3.75 3.75h5.736c.729 0 1.428-.29 1.944-.805l4.765-4.765a2.75 2.75 0 0 0 .805-1.944V5.25a3.75 3.75 0 0 0-3.75-3.75z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis text-[rgb(248,248,248)] text-[15px] leading-7 opacity-50">
                    Canvas
                  </div>
                </button>

                {/* List */}
                <button
                  onClick={() => {
                    setShowAttachListModal(true);
                    setShowAddMenu(false);
                  }}
                  className="w-full h-7 min-h-[28px] px-6 flex items-center hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left"
                  role="menuitem"
                >
                  <div className="w-5 h-7 mr-2 flex items-center justify-center">
                    <svg data-qa="lists" aria-hidden="true" viewBox="0 0 20 20" className="w-5 h-5 text-[rgb(248,248,248)]">
                      <path fill="currentColor" fillRule="evenodd" d="M1.5 5.25A3.75 3.75 0 0 1 5.25 1.5h9.5a3.75 3.75 0 0 1 3.75 3.75v9.5a3.75 3.75 0 0 1-3.75 3.75h-9.5a3.75 3.75 0 0 1-3.75-3.75zM5.25 3A2.25 2.25 0 0 0 3 5.25v9.5A2.25 2.25 0 0 0 5.25 17h9.5A2.25 2.25 0 0 0 17 14.75v-9.5A2.25 2.25 0 0 0 14.75 3zm3.654 9.204a.75.75 0 1 0-1.044-1.078l-1.802 1.745-.654-.634a.75.75 0 1 0-1.044 1.077l1.177 1.14a.75.75 0 0 0 1.043 0zm1.714.782a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5zm0-3.687a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5zm-.75-2.938a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75m-3.28 2.482c.2 0 .402-.114.737-.343.85-.586 1.513-1.317 1.513-2.082 0-.595-.486-1.075-1.168-1.075-.832 0-1.082.757-1.082.757s-.258-.757-1.082-.757c-.68 0-1.168.48-1.168 1.075 0 .765.66 1.498 1.51 2.078.337.231.54.347.74.347" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis text-[rgb(248,248,248)] text-[15px] leading-7">
                    List
                  </div>
                </button>

                {/* Recent file with submenu */}
                <div
                  className="relative"
                  onMouseEnter={() => setShowRecentFilesSubmenu(true)}
                  onMouseLeave={() => setShowRecentFilesSubmenu(false)}
                >
                  <button
                    className="w-full h-7 min-h-[28px] px-6 flex items-center hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left"
                    role="menuitem"
                    aria-haspopup="true"
                  >
                    <div className="w-5 h-7 mr-2 flex items-center justify-center">
                      <svg viewBox="0 0 20 20" className="w-5 h-5 text-[rgb(248,248,248)]" fill="currentColor">
                        <path d="M3 4a2 2 0 012-2h3.5a2 2 0 011.6.8l1.4 1.7c.2.3.5.5.9.5H15a2 2 0 012 2v1H3V4zm0 4h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"></path>
                      </svg>
                    </div>
                    <div className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis text-[rgb(248,248,248)] text-[15px] leading-7">
                      Recent file
                    </div>
                    <div className="w-[15px] h-[15px]">
                      <svg data-qa="caret-right" aria-hidden="true" viewBox="0 0 20 20" className="w-[15px] h-[15px] text-[rgb(185,186,189)]">
                        <path fill="currentColor" fillRule="evenodd" d="M7.72 5.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 0 1-1.06-1.06L10.94 10 7.72 6.78a.75.75 0 0 1 0-1.06" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </button>

                  {/* Recent Files Submenu */}
                  {showRecentFilesSubmenu && (
                    <div className="absolute left-[calc(100%+2px)] bottom-0 w-[440px] max-h-[300px] bg-[rgb(34,37,41)] rounded-lg shadow-lg border border-[rgb(60,56,54)] overflow-hidden z-50" style={{ transform: 'translateY(130px)' }}>                      <div className="overflow-y-auto max-h-[500px] py-2 recent-files-submenu-scroll">
                      {(() => {
                        const recentFiles = getRecentFiles();
                        if (recentFiles.length === 0) {
                          return (
                            <div className="px-6 py-8 text-center">
                              <svg className="w-12 h-12 mx-auto mb-3 text-[rgb(209,210,211)] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className="text-[rgb(209,210,211)] text-sm">No recent files</p>
                            </div>
                          );
                        }

                        return recentFiles.map((file) => {
                          const getFileIcon = () => {
                            const extension = file.filename.split('.').pop()?.toLowerCase() || '';

                            if (file.contentType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
                              return (
                                <div className="w-[72px] h-[72px] flex items-center justify-center bg-gray-200 rounded overflow-hidden shrink-0">
                                  <img src={getFileUrl(file.id, true) || '/placeholder-image.png'} alt={file.filename} className="w-full h-full object-cover" />
                                </div>
                              );
                            }

                            if (file.contentType.startsWith('audio/') || ['mp3', 'wav', 'ogg'].includes(extension)) {
                              return (
                                <div className="w-[72px] h-[72px] flex items-center justify-center bg-[rgb(76,133,226)] rounded shrink-0">
                                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                  </svg>
                                </div>
                              );
                            }

                            if (file.contentType.includes('pdf') || extension === 'pdf') {
                              return (
                                <div className="w-[72px] h-[72px] flex items-center justify-center bg-[rgb(206,78,98)] rounded shrink-0">
                                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                                    <path d="M14 2v6h6M9 13h6v1H9v-1zm0 3h6v1H9v-1z" fill="white" opacity="0.8" />
                                  </svg>
                                </div>
                              );
                            }

                            if (file.contentType.includes('presentation') || ['ppt', 'pptx'].includes(extension)) {
                              return (
                                <div className="w-[72px] h-[72px] flex items-center justify-center bg-[rgb(210,70,37)] rounded shrink-0">
                                  <span className="text-white text-2xl font-bold">P</span>
                                </div>
                              );
                            }

                            if (extension === 'epub') {
                              return (
                                <div className="w-[72px] h-[72px] flex items-center justify-center bg-[rgb(76,133,226)] rounded shrink-0">
                                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm0 2v16h12V4H6zm2 2h8v2H8V6zm0 4h8v2H8v-2zm0 4h5v2H8v-2z" />
                                  </svg>
                                </div>
                              );
                            }

                            // Canvas files
                            if (file.contentType.includes('canvas') || file.filename.toLowerCase().includes('canvas')) {
                              return (
                                <div className="w-[72px] h-[72px] flex items-center justify-center bg-[rgb(82,171,217)] rounded shrink-0">
                                  <svg data-qa="canvas" aria-hidden="true" viewBox="0 0 20 20" className="w-8 h-8 text-white">
                                    <path fill="currentColor" fillRule="evenodd" d="M3 5.25A2.25 2.25 0 0 1 5.25 3h9.5A2.25 2.25 0 0 1 17 5.25v5.5h-4.75a1.5 1.5 0 0 0-1.5 1.5V17h-5.5A2.25 2.25 0 0 1 3 14.75zm9.25 11.003 4.003-4.003H12.25zM5.25 1.5A3.75 3.75 0 0 0 1.5 5.25v9.5a3.75 3.75 0 0 0 3.75 3.75h5.736c.729 0 1.428-.29 1.944-.805l4.765-4.765a2.75 2.75 0 0 0 .805-1.944V5.25a3.75 3.75 0 0 0-3.75-3.75z" clipRule="evenodd"></path>
                                  </svg>
                                </div>
                              );
                            }

                            // List files  
                            if (file.contentType.includes('list')) {
                              return (
                                <div className="w-[72px] h-[72px] flex items-center justify-center bg-[rgb(205,147,44)] rounded shrink-0">
                                  <svg data-qa="lists" aria-hidden="true" viewBox="0 0 20 20" className="w-8 h-8 text-white">
                                    <path fill="currentColor" fillRule="evenodd" d="M1.5 5.25A3.75 3.75 0 0 1 5.25 1.5h9.5a3.75 3.75 0 0 1 3.75 3.75v9.5a3.75 3.75 0 0 1-3.75 3.75h-9.5a3.75 3.75 0 0 1-3.75-3.75zM5.25 3A2.25 2.25 0 0 0 3 5.25v9.5A2.25 2.25 0 0 0 5.25 17h9.5A2.25 2.25 0 0 0 17 14.75v-9.5A2.25 2.25 0 0 0 14.75 3zm3.654 9.204a.75.75 0 1 0-1.044-1.078l-1.802 1.745-.654-.634a.75.75 0 1 0-1.044 1.077l1.177 1.14a.75.75 0 0 0 1.043 0zm1.714.782a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5zm0-3.687a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5zm-.75-2.938a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75m-3.28 2.482c.2 0 .402-.114.737-.343.85-.586 1.513-1.317 1.513-2.082 0-.595-.486-1.075-1.168-1.075-.832 0-1.082.757-1.082.757s-.258-.757-1.082-.757c-.68 0-1.168.48-1.168 1.075 0 .765.66 1.498 1.51 2.078.337.231.54.347.74.347" clipRule="evenodd"></path>
                                  </svg>
                                </div>
                              );
                            }

                            return (
                              <div className="w-[72px] h-[72px] flex items-center justify-center bg-[rgb(97,97,97)] rounded shrink-0">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              </div>
                            );
                          };

                          const getFileType = () => {
                            const extension = file.filename.split('.').pop()?.toLowerCase() || '';
                            if (file.contentType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'PNG';
                            if (file.contentType.startsWith('audio/') || ['mp3', 'wav', 'ogg'].includes(extension)) return 'MP3';
                            if (file.contentType.includes('pdf') || extension === 'pdf') return 'PDF';
                            if (file.contentType.includes('presentation') || ['ppt', 'pptx'].includes(extension)) return 'PowerPoint';
                            if (extension === 'epub') return 'EPUB';
                            if (extension === 'jpeg' || extension === 'jpg') return 'JPEG';
                            if (file.contentType.includes('canvas')) return 'Canvas';
                            if (file.contentType.includes('list')) return 'List';
                            return extension.toUpperCase();
                          };

                          return (
                            <button
                              key={file.id}
                              onClick={() => {
                                handleSelectRecentFile(file.id);
                                setShowAddMenu(false);
                                setShowRecentFilesSubmenu(false);
                              }}
                              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[rgba(255,255,255,0.06)] transition-colors text-left"
                            >
                              {getFileIcon()}
                              <div className="flex-1 min-w-0">
                                <div className="text-white text-[15px] font-medium truncate mb-0.5">
                                  {file.filename}
                                </div>
                                <div className="text-[rgb(185,186,189)] text-[13px]">
                                  {getFileType()} · {formatRelativeTime(file.uploadedAt)}
                                </div>
                              </div>
                            </button>
                          );
                        });
                      })()}
                      </div>
                    </div>
                  )}
                </div>

                {/* Text snippet */}
                <button
                  className="w-full h-7 min-h-[28px] px-6 flex items-center hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left"
                  role="menuitem"
                  disabled
                >
                  <div className="w-5 h-7 mr-2 flex items-center justify-center">
                    <svg viewBox="0 0 20 20" className="w-5 h-5 text-[rgb(248,248,248)]" fill="currentColor">
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm1 4h10v2H5V7zm0 4h6v2H5v-2z"></path>
                    </svg>
                  </div>
                  <div className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis text-[rgb(248,248,248)] text-[15px] leading-7 opacity-50">
                    Text snippet
                  </div>
                  <div className="ml-2 text-[rgb(154,155,158)] text-[13px] leading-7 whitespace-nowrap">
                    ⌘⇧Enter
                  </div>
                </button>

                {/* Workflow */}
                <button
                  className="w-full h-7 min-h-[28px] px-6 flex items-center hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left"
                  role="menuitem"
                  disabled
                >
                  <div className="w-5 h-7 mr-2 flex items-center justify-center">
                    <svg data-qa="play" aria-hidden="true" viewBox="0 0 20 20" className="w-5 h-5 text-[rgb(248,248,248)]">
                      <path fill="currentColor" fillRule="evenodd" d="M5.128 3.213A.75.75 0 0 0 4 3.861v12.277a.75.75 0 0 0 1.128.647l10.523-6.138a.75.75 0 0 0 0-1.296zM2.5 3.861c0-1.737 1.884-2.819 3.384-1.944l10.523 6.139c1.488.868 1.488 3.019 0 3.887L5.884 18.08c-1.5.875-3.384-.207-3.384-1.943z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis text-[rgb(248,248,248)] text-[15px] leading-7 opacity-50">
                    Workflow
                  </div>
                </button>

                {/* Upload from your computer */}
                <button
                  onClick={handleAttachClick}
                  className="w-full h-7 min-h-[28px] px-6 flex items-center hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left"
                  role="menuitem"
                >
                  <div className="w-5 h-7 mr-2 flex items-center justify-center">
                    <svg viewBox="0 0 20 20" className="w-5 h-5 text-[rgb(248,248,248)]" fill="currentColor">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v1H3V4zm0 3h14v8a1 1 0 01-1 1H4a1 1 0 01-1-1V7zm7-1a1 1 0 00-1 1v3H7l3 3 3-3h-2V9a1 1 0 00-1-1z"></path>
                    </svg>
                  </div>
                  <div className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis text-[rgb(248,248,248)] text-[15px] leading-7">
                    Upload from your computer
                  </div>
                </button>
              </div>
            )}

            {/* Hidden file input for uploads */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Right side - Send button (split button) */}
          <div className="relative flex items-center gap-0 rounded">
            {/* Send now button */}
            <button
              onClick={handleSend}
              disabled={(!text.trim() && selectedFiles.length === 0) || uploadingFileIds.size > 0}
              className={`relative flex items-center justify-center min-w-[28px] h-7 px-2 rounded-l transition-all ${
                (!text.trim() && selectedFiles.length === 0) || uploadingFileIds.size > 0
                  ? 'bg-[rgb(0,122,90)] opacity-30 cursor-default'
                  : 'bg-[rgb(0,122,90)] hover:bg-[rgb(0,108,78)] cursor-pointer'
              }`}
              title="Send now"
              aria-label="Send now"
              aria-disabled={(!text.trim() && selectedFiles.length === 0) || uploadingFileIds.size > 0}
            >
              {uploadingFileIds.size > 0 ? (
                <span className="text-white text-xs">...</span>
              ) : (
                <svg data-qa="send-filled" aria-hidden="true" viewBox="0 0 20 20" className="w-4 h-4 text-white">
                  <path fill="currentColor" d="M1.5 2.106c0-.462.498-.754.901-.528l15.7 7.714a.73.73 0 0 1 .006 1.307L2.501 18.46l-.07.017a.754.754 0 0 1-.931-.733v-4.572c0-1.22.971-2.246 2.213-2.268l6.547-.17c.27-.01.75-.243.75-.797 0-.553-.5-.795-.75-.795l-6.547-.171C2.47 8.95 1.5 7.924 1.5 6.704z"></path>
                </svg>
              )}
              {/* Divider line */}
              <span className="absolute top-1/2 right-0 -translate-y-1/2 w-[1px] h-5 bg-[rgba(209,210,211,0.3)]"></span>
            </button>

            {/* Schedule/Options button */}
            <button
              onClick={() => setShowScheduleMenu(!showScheduleMenu)}
              disabled={(!text.trim() && selectedFiles.length === 0) || uploadingFileIds.size > 0}
              className={`flex items-center justify-center min-w-[28px] h-7 px-1 rounded-r transition-all ${
                (!text.trim() && selectedFiles.length === 0) || uploadingFileIds.size > 0
                  ? 'bg-[rgb(0,122,90)] opacity-30 cursor-default'
                  : 'bg-[rgb(0,122,90)] hover:bg-[rgb(0,108,78)] cursor-pointer'
              }`}
              title="Schedule for later"
              aria-label="Schedule for later"
              aria-haspopup="menu"
              aria-disabled={(!text.trim() && selectedFiles.length === 0) || uploadingFileIds.size > 0}
            >
              <svg data-qa="caret-down" aria-hidden="true" viewBox="0 0 20 20" className="w-4 h-4 text-white">
                <path fill="currentColor" fillRule="evenodd" d="M5.72 7.47a.75.75 0 0 1 1.06 0L10 10.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0L5.72 8.53a.75.75 0 0 1 0-1.06" clipRule="evenodd"></path>
              </svg>
            </button>

            {/* Schedule Menu Dropdown */}
            {showScheduleMenu && (
              <div
                ref={scheduleMenuRef}
                className="absolute bottom-full right-0 mb-2 w-[260px] bg-[rgb(34,37,41)] rounded-lg shadow-lg border border-[rgb(60,56,54)] py-3 z-50"
                role="menu"
                aria-label="Schedule message"
              >
                {/* Header */}
                <div className="px-6 py-1 text-[rgba(232,232,232,0.7)] text-[13px] leading-[18px]">
                  Schedule message
                </div>

                {/* Suggested time option */}
                <button
                  onClick={() => {
                    // TODO: Handle scheduling for suggested time
                    console.log('Schedule for Monday at 9:00 AM');
                    setShowScheduleMenu(false);
                  }}
                  className="w-full h-7 min-h-[28px] px-6 flex items-center hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left"
                  role="menuitem"
                >
                  <div className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis text-[rgb(248,248,248)] text-[15px] leading-7">
                    Monday at 9:00 AM
                  </div>
                </button>

                {/* Separator */}
                <div className="py-2">
                  <hr className="border-t border-[rgba(232,232,232,0.13)]" />
                </div>

                {/* Custom time option */}
                <button
                  onClick={() => {
                    // TODO: Open custom time picker
                    console.log('Open custom time picker');
                    setShowScheduleMenu(false);
                  }}
                  className="w-full h-7 min-h-[28px] px-6 flex items-center bg-[rgb(18,100,163)] hover:bg-[rgb(16,90,150)] transition-colors text-left"
                  role="menuitem"
                >
                  <div className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis text-[rgb(248,248,248)] text-[15px] leading-7">
                    Custom time
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mention Suggestions */}
      {showMentionSuggestions && containerRef.current && (
        <MentionSuggestions
          users={users}
          searchTerm={mentionSearchTerm}
          selectedIndex={selectedMentionIndex}
          position={mentionSuggestionsPosition}
          onSelect={handleMentionSelect}
          onClose={() => setShowMentionSuggestions(false)}
        />
      )}

      {/* Emoji Suggestions */}
      {showEmojiSuggestions && containerRef.current && (
        <EmojiSuggestions
          searchTerm={emojiSearchTerm}
          onSelect={handleEmojiSelectFromSuggestions}
          position={emojiSuggestionsPosition}
          selectedIndex={selectedEmojiIndex}
        />
      )}

      {/* Modals */}
      <FormattingHelpModal
        isOpen={showFormattingHelp}
        onClose={() => setShowFormattingHelp(false)}
      />

      {/* Link Modal */}
      {showLinkModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="link-modal-title"
          onClick={handleLinkModalCancel}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              handleLinkModalCancel();
            }
          }}
        >
          <div 
            className="bg-[rgb(34,37,41)] rounded-lg w-full max-w-[440px] shadow-2xl border border-[rgb(60,56,54)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(60,56,54)]">
              <h2 id="link-modal-title" className="text-white text-lg font-semibold">Add link</h2>
              <button
                onClick={handleLinkModalCancel}
                className="w-8 h-8 rounded flex items-center justify-center hover:bg-white hover:bg-opacity-10 transition-colors"
                aria-label="Close link modal"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-5">
              {/* Text Input */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Text
                </label>
                <input
                  type="text"
                  value={linkModalText}
                  onChange={(e) => setLinkModalText(e.target.value)}
                  className="w-full px-3 py-2 bg-[rgb(26,29,33)] border border-[rgb(134,134,134)] rounded text-white text-sm focus:outline-none focus:border-[rgb(29,155,209)] focus:ring-1 focus:ring-[rgb(29,155,209)]"
                  placeholder="Enter link text"
                  autoFocus={!linkModalSelectedText}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const linkInput = e.currentTarget.parentElement?.nextElementSibling?.querySelector('input') as HTMLInputElement;
                      linkInput?.focus();
                    } else if (e.key === 'Escape') {
                      handleLinkModalCancel();
                    }
                  }}
                />
              </div>

              {/* Link Input */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Link
                </label>
                <input
                  type="text"
                  value={linkModalUrl}
                  onChange={(e) => setLinkModalUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[rgb(26,29,33)] border border-[rgb(134,134,134)] rounded text-white text-sm focus:outline-none focus:border-[rgb(29,155,209)] focus:ring-1 focus:ring-[rgb(29,155,209)]"
                  placeholder="Enter URL"
                  autoFocus={!!linkModalSelectedText}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && linkModalUrl.trim()) {
                      e.preventDefault();
                      handleLinkModalSave();
                    } else if (e.key === 'Escape') {
                      handleLinkModalCancel();
                    }
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[rgb(60,56,54)]">
              <button
                onClick={handleLinkModalCancel}
                className="px-4 py-2 border border-[rgb(134,134,134)] hover:border-[rgb(209,210,211)] text-white rounded transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleLinkModalSave}
                disabled={!linkModalUrl.trim()}
                className={`px-4 py-2 rounded text-white text-sm transition-colors ${
                  linkModalUrl.trim()
                    ? 'bg-[#00553d] hover:bg-[#11624b] cursor-pointer'
                    : 'border border-[rgb(60,56,54)] opacity-50 cursor-not-allowed bg-transparent'
                }`}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewModalOpen && previewModalData && !showFileDetailsEdit && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => {
            setPreviewModalOpen(false);
            setPreviewModalData(null);
          }}
        >
          <div className="relative w-full h-full max-w-[90vw] max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 px-2 flex-shrink-0">
              <div className="flex items-center gap-2 text-white">
                <span className="text-sm font-medium">{editingFileName}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditFileDetails();
                  }}
                  className="text-xs text-gray-400 hover:text-gray-300 cursor-pointer underline"
                >
                  Edit file details
                </button>
              </div>
              <button
                ref={previewModalCloseButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewModalOpen(false);
                  setPreviewModalData(null);
                }}
                className="w-8 h-8 rounded flex items-center justify-center hover:bg-white hover:bg-opacity-10 transition-colors"
                aria-label="Close preview"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Image Container - takes remaining space */}
            <div 
              className="flex-1 flex items-center justify-center mb-3 min-h-0"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewModalData.previewUrl}
                alt={previewModalData.file.name}
                className="max-w-full max-h-full object-contain"
                style={{ maxHeight: 'calc(90vh - 120px)' }}
              />
            </div>

            {/* Bottom Actions */}
            <div 
              className="flex items-center justify-between px-2 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleRemoveFile(previewModalData.id);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setPreviewModalOpen(false);
                    setPreviewModalData(null);
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setPreviewModalOpen(false);
                    setPreviewModalData(null);
                  }}
                  className="px-4 py-2 bg-[rgb(0,122,90)] hover:bg-[rgb(0,108,78)] text-white rounded transition-colors text-sm font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Details Edit Modal */}
      {previewModalOpen && previewModalData && showFileDetailsEdit && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="file-details-title"
          onClick={() => handleCancelFileDetails()}
        >
          <div 
            className="bg-[rgb(34,37,41)] rounded-lg w-full max-w-[520px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(60,56,54)]">
              <h2 id="file-details-title" className="text-white text-lg font-semibold">File details</h2>
              <button
                onClick={handleCancelFileDetails}
                className="w-8 h-8 rounded flex items-center justify-center hover:bg-white hover:bg-opacity-10 transition-colors"
                aria-label="Close file details"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-5">
              {/* File name */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  File name
                </label>
                <input
                  type="text"
                  value={editingFileName}
                  onChange={(e) => setEditingFileName(e.target.value)}
                  className="w-full px-3 py-2 bg-[rgb(26,29,33)] border border-[rgb(134,134,134)] rounded text-white text-sm focus:outline-none focus:border-[rgb(29,155,209)] focus:ring-1 focus:ring-[rgb(29,155,209)]"
                  placeholder="Enter file name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Description
                </label>
                <p className="text-gray-400 text-xs mb-2">
                  A description (or alt text) helps people to understand what you're sharing if they cannot see or parse this image. Consider the information in the image, and convey it as concisely as possible.
                </p>
                <textarea
                  value={editingFileDescription}
                  onChange={(e) => setEditingFileDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-[rgb(26,29,33)] border border-[rgb(134,134,134)] rounded text-white text-sm focus:outline-none focus:border-[rgb(29,155,209)] focus:ring-1 focus:ring-[rgb(29,155,209)] resize-none"
                  placeholder="Add a description..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[rgb(60,56,54)]">
              <button
                onClick={handleCancelFileDetails}
                className="px-4 py-2 border border-gray-500 hover:border-gray-400 text-white rounded transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFileDetails}
                className="px-4 py-2 bg-[rgb(0,122,90)] hover:bg-[rgb(0,108,78)] text-white rounded transition-colors text-sm font-medium"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attach List Modal */}
      {currentWorkspaceId && (
        <AttachListModal
          isOpen={showAttachListModal}
          onClose={() => setShowAttachListModal(false)}
          onSelect={async (listId) => {
            setAttachedLists([...attachedLists, listId]);
            // Fetch list details
            try {
              const listData = await getList(listId);
              setAttachedListsData((prev) => new Map(prev).set(listId, listData));
            } catch (error) {
              console.error('Failed to fetch list details:', error);
            }
            setShowAttachListModal(false);
          }}
          organisationId={currentWorkspaceId}
        />
      )}
    </div>
    </>
  );
};

export default MessageComposer;

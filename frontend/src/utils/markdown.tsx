import React from 'react';

// Markdown parser utility for live rendering
export const parseMarkdown = (text: string): React.ReactNode[] => {
  if (!text) return [];

  const parts: React.ReactNode[] = [];
  
  // Split by lines for processing
  const lines = text.split('\n');
  
  // Process line by line with better list handling
  let listItems: Array<{ type: 'ordered' | 'bullet'; level: number; content: React.ReactNode[] }> = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockKey = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    
    // Group consecutive items of the same type and level
    const grouped: Array<{ type: 'ordered' | 'bullet'; level: number; items: React.ReactNode[][] }> = [];
    
    listItems.forEach((item) => {
      const lastGroup = grouped[grouped.length - 1];
      if (lastGroup && lastGroup.type === item.type && lastGroup.level === item.level) {
        lastGroup.items.push(item.content);
      } else {
        grouped.push({
          type: item.type,
          level: item.level,
          items: [item.content],
        });
      }
    });
    
    grouped.forEach((group, groupIdx) => {
      const paddingLeft = 20 + (group.level * 20);
      
      if (group.type === 'ordered') {
        parts.push(
          <ol key={`ordered-${groupIdx}`} className="list-decimal list-outside my-0.5" style={{ paddingLeft: `${paddingLeft}px` }}>
            {group.items.map((itemContent, idx) => (
              <li key={idx} className="leading-[1.46668]">
                {itemContent.map((part, partIdx) => (
                  <React.Fragment key={partIdx}>{part}</React.Fragment>
                ))}
              </li>
            ))}
          </ol>
        );
      } else {
        parts.push(
          <ul key={`bullet-${groupIdx}`} className="list-disc list-outside my-0.5" style={{ paddingLeft: `${paddingLeft}px` }}>
            {group.items.map((itemContent, idx) => (
              <li key={idx} className="leading-[1.46668]">
                {itemContent.map((part, partIdx) => (
                  <React.Fragment key={partIdx}>{part}</React.Fragment>
                ))}
              </li>
            ))}
          </ul>
        );
      }
    });
    
    listItems = [];
  };

  lines.forEach((line, lineIdx) => {
    // Handle code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        flushList();
        parts.push(
          <pre key={`codeblock-${codeBlockKey++}`} className="font-mono text-[13px] bg-[rgb(26,29,33)] text-white p-2 rounded border border-[rgb(49,48,44)] overflow-x-auto my-1 whitespace-pre-wrap">
            <code>{codeBlockContent.join('\n')}</code>
          </pre>
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
        // Language identifier is extracted but not used for syntax highlighting.
      }
      return;
    }
    
    if (inCodeBlock) {
      codeBlockContent.push(line);
      return;
    }
    
    // Handle blockquotes
    const blockquoteMatch = line.match(/^>\s+(.+)$/);
    if (blockquoteMatch) {
      flushList();
      parts.push(
        <div key={`blockquote-${lineIdx}`} className="border-l-4 border-[rgb(209,210,211)] pl-3 my-0.5 text-[rgb(209,210,211)] leading-[1.46668]">
          {processInlineMarkdown(blockquoteMatch[1]).map((part, idx) => (
            <React.Fragment key={idx}>{part}</React.Fragment>
          ))}
        </div>
      );
      return;
    }
    
    // Handle ordered lists (including nested with letters)
    const orderedMatch = line.match(/^(\s*)(\d+|[a-z])\.\s+(.+)$/i);
    if (orderedMatch) {
      const indent = orderedMatch[1].length;
      const level = Math.floor(indent / 2);
      const content = processInlineMarkdown(orderedMatch[3]);
      
      listItems.push({
        type: 'ordered',
        level,
        content,
      });
      return;
    }
    
    // Handle bullet lists
    const bulletMatch = line.match(/^(\s*)[-*]\s+(.+)$/);
    if (bulletMatch) {
      const indent = bulletMatch[1].length;
      const level = Math.floor(indent / 2);
      const content = processInlineMarkdown(bulletMatch[2]);
      
      listItems.push({
        type: 'bullet',
        level,
        content,
      });
      return;
    }
    
    // Regular line - flush any pending list first
    if (line.trim() === '') {
      flushList();
      parts.push(<br key={`br-${lineIdx}`} />);
    } else {
      flushList();
      parts.push(
        <div key={`line-${lineIdx}`} className="leading-[1.46668]">
          {processInlineMarkdown(line).map((part, idx) => (
            <React.Fragment key={idx}>{part}</React.Fragment>
          ))}
        </div>
      );
    }
  });
  
  // Flush any remaining code block
  if (inCodeBlock && codeBlockContent.length > 0) {
    flushList();
    parts.push(
      <pre key={`codeblock-${codeBlockKey++}`} className="font-mono text-[13px] bg-[rgb(26,29,33)] text-white p-2 rounded border border-[rgb(49,48,44)] overflow-x-auto my-1 whitespace-pre-wrap">
        <code>{codeBlockContent.join('\n')}</code>
      </pre>
    );
  }
  
  // Flush any remaining list
  flushList();

  return parts.length > 0 ? parts : processInlineMarkdown(text);
};

const processInlineMarkdown = (text: string): React.ReactNode[] => {
  if (!text) return [];
  
  let processedText = text;
  const replacements: Array<{ placeholder: string; element: React.ReactNode }> = [];
  
  // Process inline code (backticks) - must be first to avoid conflicts
  processedText = processedText.replace(/`([^`\n]+)`/g, (_match, content) => {
    const placeholder = `__CODE_${replacements.length}__`;
    replacements.push({
      placeholder,
      element: (
        <code key={placeholder} className="bg-[rgb(49,48,44)] px-1.5 py-0.5 rounded text-[rgb(209,210,211)] text-[13px] font-mono">
          {content}
        </code>
      ),
    });
    return placeholder;
  });

  // Process links
  processedText = processedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, linkText, url) => {
    const placeholder = `__LINK_${replacements.length}__`;
    replacements.push({
      placeholder,
      element: (
        <a
          key={placeholder}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[rgb(54,197,240)] hover:underline cursor-pointer"
        >
          {linkText}
        </a>
      ),
    });
    return placeholder;
  });

  // Process bold (**text**)
  processedText = processedText.replace(/\*\*([^*\n]+)\*\*/g, (_match, content) => {
    const placeholder = `__BOLD_${replacements.length}__`;
    replacements.push({
      placeholder,
      element: <strong key={placeholder} className="font-bold">{content}</strong>,
    });
    return placeholder;
  });

  // Process underline (__text__) - must come before italic underscore
  processedText = processedText.replace(/__([^_\n]+)__/g, (_match, content) => {
    const placeholder = `__UNDERLINE_${replacements.length}__`;
    replacements.push({
      placeholder,
      element: <u key={placeholder} className="underline">{content}</u>,
    });
    return placeholder;
  });

  // Process strikethrough (~~text~~)
  processedText = processedText.replace(/~~([^~\n]+)~~/g, (_match, content) => {
    const placeholder = `__STRIKE_${replacements.length}__`;
    replacements.push({
      placeholder,
      element: <del key={placeholder} className="line-through">{content}</del>,
    });
    return placeholder;
  });

  // Process italic with asterisk (*text*) - allow asterisks inside, non-greedy match
  processedText = processedText.replace(/\*([^\n]+?)\*/g, (_match, content) => {
    const placeholder = `__ITALIC_${replacements.length}__`;
    replacements.push({
      placeholder,
      element: <em key={placeholder} className="italic">{content}</em>,
    });
    return placeholder;
  });
  
  // Process italic with underscore (_text_) - underline is already processed, so this is safe
  processedText = processedText.replace(/_([^_\n]+)_/g, (_match, content) => {
    const placeholder = `__ITALIC2_${replacements.length}__`;
    replacements.push({
      placeholder,
      element: <em key={placeholder} className="italic">{content}</em>,
    });
    return placeholder;
  });

  // Split by placeholders and reconstruct
  const placeholderRegex = /__(CODE|LINK|BOLD|UNDERLINE|ITALIC|ITALIC2|STRIKE)_(\d+)__/g;
  const finalParts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = placeholderRegex.exec(processedText)) !== null) {
    if (match.index > lastIndex) {
      const textPart = processedText.slice(lastIndex, match.index);
      if (textPart) {
        finalParts.push(textPart);
      }
    }
    
    const placeholderIndex = parseInt(match[2], 10);
    if (replacements[placeholderIndex]) {
      finalParts.push(replacements[placeholderIndex].element);
    }
    
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < processedText.length) {
    finalParts.push(processedText.slice(lastIndex));
  }

  return finalParts.length > 0 ? finalParts : [text];
};

export const insertMarkdown = (
  text: string,
  selectionStart: number,
  selectionEnd: number,
  markdown: string
): { newText: string; newCursorPosition: number } => {
  const selectedText = text.slice(selectionStart, selectionEnd);
  const before = text.slice(0, selectionStart);
  const after = text.slice(selectionEnd);

  let newText: string;
  let newCursorPosition: number;

  if (markdown === 'bold') {
    newText = `${before}**${selectedText || 'bold text'}**${after}`;
    newCursorPosition = selectionStart + (selectedText ? 0 : 11);
  } else if (markdown === 'italic') {
    newText = `${before}_${selectedText || 'italic text'}_${after}`;
    newCursorPosition = selectionStart + (selectedText ? 0 : 12);
  } else if (markdown === 'underline') {
    newText = `${before}__${selectedText || 'underlined text'}__${after}`;
    newCursorPosition = selectionStart + (selectedText ? 0 : 16);
  } else if (markdown === 'strikethrough') {
    newText = `${before}~~${selectedText || 'strikethrough text'}~~${after}`;
    newCursorPosition = selectionStart + (selectedText ? 0 : 20);
  } else if (markdown === 'code') {
    newText = `${before}\`${selectedText || 'code'}\`${after}`;
    newCursorPosition = selectionStart + (selectedText ? 0 : 6);
  } else if (markdown === 'codeBlock') {
    const lines = text.split('\n');
    const lineIndex = text.slice(0, selectionStart).split('\n').length - 1;
    const currentLine = lines[lineIndex] || '';
    if (!currentLine.trim().startsWith('```')) {
      lines[lineIndex] = `\`\`\`\n${currentLine}\n\`\`\``;
      newText = lines.join('\n');
      newCursorPosition = selectionStart + 5;
    } else {
      newText = text;
      newCursorPosition = selectionStart;
    }
  } else if (markdown === 'link') {
    newText = `${before}[${selectedText || 'link text'}](url)${after}`;
    newCursorPosition = selectionStart + (selectedText ? selectedText.length + 3 : 10);
  } else if (markdown === 'orderedList') {
    const lines = text.split('\n');
    const lineIndex = text.slice(0, selectionStart).split('\n').length - 1;
    if (lines[lineIndex] && !lines[lineIndex].match(/^\d+\.\s/)) {
      lines[lineIndex] = `1. ${lines[lineIndex]}`;
      newText = lines.join('\n');
      newCursorPosition = selectionStart + 3;
    } else {
      newText = text;
      newCursorPosition = selectionStart;
    }
  } else if (markdown === 'bulletList') {
    const lines = text.split('\n');
    const lineIndex = text.slice(0, selectionStart).split('\n').length - 1;
    if (lines[lineIndex] && !lines[lineIndex].match(/^[-*]\s/)) {
      lines[lineIndex] = `- ${lines[lineIndex]}`;
      newText = lines.join('\n');
      newCursorPosition = selectionStart + 2;
    } else {
      newText = text;
      newCursorPosition = selectionStart;
    }
  } else if (markdown === 'blockquote') {
    const lines = text.split('\n');
    const lineIndex = text.slice(0, selectionStart).split('\n').length - 1;
    if (lines[lineIndex] && !lines[lineIndex].match(/^>\s/)) {
      lines[lineIndex] = `> ${lines[lineIndex]}`;
      newText = lines.join('\n');
      newCursorPosition = selectionStart + 2;
    } else {
      newText = text;
      newCursorPosition = selectionStart;
    }
  } else {
    newText = text;
    newCursorPosition = selectionStart;
  }

  return { newText, newCursorPosition };
};


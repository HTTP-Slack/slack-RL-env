import React from 'react';

// Markdown parser utility
export const parseMarkdown = (text: string): React.ReactNode[] => {
  if (!text) return [];

  const parts: React.ReactNode[] = [];
  
  // Check for code blocks first
  const codeBlockRegex = /```([\s\S]*?)```/g;
  const codeBlocks: Array<{ start: number; end: number; content: string }> = [];
  let match;
  
  while ((match = codeBlockRegex.exec(text)) !== null) {
    codeBlocks.push({
      start: match.index,
      end: match.index + match[0].length,
      content: match[1],
    });
  }

  if (codeBlocks.length > 0) {
    let currentIndex = 0;
    codeBlocks.forEach((block, idx) => {
      // Add text before code block
      if (block.start > currentIndex) {
        parts.push(...processInlineMarkdown(text.slice(currentIndex, block.start)));
      }
      
      // Add code block
      parts.push(
        <pre key={`codeblock-${idx}`} className="font-mono text-[13px] bg-[rgb(26,29,33)] text-white p-2 rounded border border-[rgb(49,48,44)] overflow-x-auto my-1">
          <code>{block.content}</code>
        </pre>
      );
      
      currentIndex = block.end;
    });
    
    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(...processInlineMarkdown(text.slice(currentIndex)));
    }
    
    return parts;
  }

  // Process lists
  const lines = text.split('\n');
  const listItems: React.ReactNode[] = [];
  let inList = false;
  let listType: 'ordered' | 'bullet' | null = null;

  lines.forEach((line, lineIdx) => {
    const orderedMatch = line.match(/^(\d+)\.\s+(.+)$/);
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    const blockquoteMatch = line.match(/^>\s+(.+)$/);

    if (blockquoteMatch) {
      if (inList) {
        if (listType === 'ordered') {
          parts.push(
            <ol key={`ordered-list-${lineIdx}`} className="list-decimal list-inside ml-4 my-1">
              {listItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ol>
          );
        } else {
          parts.push(
            <ul key={`bullet-list-${lineIdx}`} className="list-disc list-inside ml-4 my-1">
              {listItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          );
        }
        listItems.length = 0;
        inList = false;
        listType = null;
      }
      parts.push(
        <div key={`blockquote-${lineIdx}`} className="border-l-4 border-[rgb(209,210,211)] pl-3 my-1 text-[rgb(209,210,211)]">
          {processInlineMarkdown(blockquoteMatch[1]).map((part, idx) => (
            <React.Fragment key={idx}>{part}</React.Fragment>
          ))}
        </div>
      );
    } else if (orderedMatch) {
      if (!inList || listType !== 'ordered') {
        if (inList && listType === 'bullet') {
          parts.push(
            <ul key={`bullet-list-${lineIdx}`} className="list-disc list-inside ml-4 my-1">
              {listItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          );
          listItems.length = 0;
        }
        inList = true;
        listType = 'ordered';
      }
      const inlineParts = processInlineMarkdown(orderedMatch[2]);
      listItems.push(
        <React.Fragment key={`ordered-item-${lineIdx}`}>
          {inlineParts.map((part, idx) => (
            <React.Fragment key={idx}>{part}</React.Fragment>
          ))}
        </React.Fragment>
      );
    } else if (bulletMatch) {
      if (!inList || listType !== 'bullet') {
        if (inList && listType === 'ordered') {
          parts.push(
            <ol key={`ordered-list-${lineIdx}`} className="list-decimal list-inside ml-4 my-1">
              {listItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ol>
          );
          listItems.length = 0;
        }
        inList = true;
        listType = 'bullet';
      }
      const inlineParts = processInlineMarkdown(bulletMatch[1]);
      listItems.push(
        <React.Fragment key={`bullet-item-${lineIdx}`}>
          {inlineParts.map((part, idx) => (
            <React.Fragment key={idx}>{part}</React.Fragment>
          ))}
        </React.Fragment>
      );
    } else {
      if (inList) {
        if (listType === 'ordered') {
          parts.push(
            <ol key={`ordered-list-${lineIdx}`} className="list-decimal list-inside ml-4 my-1">
              {listItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ol>
          );
        } else {
          parts.push(
            <ul key={`bullet-list-${lineIdx}`} className="list-disc list-inside ml-4 my-1">
              {listItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          );
        }
        listItems.length = 0;
        inList = false;
        listType = null;
      }
      if (line.trim()) {
        parts.push(
          <div key={`line-${lineIdx}`} className="my-1">
            {processInlineMarkdown(line).map((part, idx) => (
              <React.Fragment key={idx}>{part}</React.Fragment>
            ))}
          </div>
        );
      } else {
        parts.push(<br key={`br-${lineIdx}`} />);
      }
    }
  });

  // Close any remaining list
  if (inList) {
    if (listType === 'ordered') {
      parts.push(
        <ol key="ordered-list-final" className="list-decimal list-inside ml-4 my-1">
          {listItems.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ol>
      );
    } else {
      parts.push(
        <ul key="bullet-list-final" className="list-disc list-inside ml-4 my-1">
          {listItems.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
    }
  }

  return parts.length > 0 ? parts : processInlineMarkdown(text);
};

const processInlineMarkdown = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let processedText = text;
  const replacements: Array<{ placeholder: string; element: React.ReactNode }> = [];
  
  // Process code blocks (already handled above, but handle inline code)
  processedText = processedText.replace(/`([^`]+)`/g, (match, content) => {
    const placeholder = `__CODE_${replacements.length}__`;
    replacements.push({
      placeholder,
      element: (
        <code key={placeholder} className="bg-[rgb(49,48,44)] px-1 rounded text-[rgb(209,210,211)] text-[13px]">
          {content}
        </code>
      ),
    });
    return placeholder;
  });

  // Process links
  processedText = processedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
    const placeholder = `__LINK_${replacements.length}__`;
    replacements.push({
      placeholder,
      element: (
        <a
          key={placeholder}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[rgb(54,197,240)] hover:underline"
        >
          {linkText}
        </a>
      ),
    });
    return placeholder;
  });

  // Process bold
  processedText = processedText.replace(/\*\*(.*?)\*\*/g, (match, content) => {
    const placeholder = `__BOLD_${replacements.length}__`;
    replacements.push({
      placeholder,
      element: <strong key={placeholder}>{content}</strong>,
    });
    return placeholder;
  });

  // Process underline (must come before italic to avoid conflicts)
  processedText = processedText.replace(/__(.*?)__/g, (match, content) => {
    const placeholder = `__UNDERLINE_${replacements.length}__`;
    replacements.push({
      placeholder,
      element: <u key={placeholder}>{content}</u>,
    });
    return placeholder;
  });

  // Process strikethrough
  processedText = processedText.replace(/~~(.*?)~~/g, (match, content) => {
    const placeholder = `__STRIKE_${replacements.length}__`;
    replacements.push({
      placeholder,
      element: <del key={placeholder}>{content}</del>,
    });
    return placeholder;
  });

  // Process italic (after underline to avoid conflicts)
  processedText = processedText.replace(/_(.*?)_/g, (match, content) => {
    // Skip if it's part of __ (underline) or already processed
    if (content.includes('__') || content.includes('**')) return match;
    const placeholder = `__ITALIC_${replacements.length}__`;
    replacements.push({
      placeholder,
      element: <em key={placeholder}>{content}</em>,
    });
    return placeholder;
  });

  // Split by placeholders and reconstruct
  const placeholderRegex = /__(CODE|LINK|BOLD|UNDERLINE|ITALIC|STRIKE)_(\d+)__/g;
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


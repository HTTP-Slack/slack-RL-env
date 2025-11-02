import React from 'react';

/**
 * Markdown parser with emoji support
 * 
 * Supports Slack-style emoji shortcodes like :smile:, :fire:, :heart:
 * 
 * Available emoji categories:
 * - Smileys & Emotion: :smile:, :joy:, :heart_eyes:, :thinking:, :sunglasses:
 * - Hand gestures: :wave:, :+1:, :clap:, :pray:, :muscle:
 * - Hearts: :heart:, :blue_heart:, :green_heart:, :yellow_heart:
 * - Symbols: :fire:, :star:, :zap:, :sparkles:, :rainbow:
 * - Food & Drink: :coffee:, :pizza:, :beer:, :cake:, :apple:
 * - Objects: :rocket:, :computer:, :bulb:, :trophy:, :gift:
 * - Nature & Animals: :dog:, :cat:, :tree:, :sunflower:, :bee:
 * 
 * Plus many more! See emojiMap below for full list.
 */

// Common emoji map for Slack-style emoji codes
const emojiMap: Record<string, string> = {
  // Smileys & Emotion
  'smile': '😊',
  'smiley': '😃',
  'grin': '😁',
  'laughing': '😆',
  'satisfied': '😆',
  'joy': '😂',
  'rofl': '🤣',
  'relaxed': '☺️',
  'blush': '😊',
  'innocent': '😇',
  'slightly_smiling_face': '🙂',
  'upside_down_face': '🙃',
  'wink': '😉',
  'relieved': '😌',
  'heart_eyes': '😍',
  'kissing_heart': '😘',
  'kissing': '😗',
  'kissing_smiling_eyes': '😙',
  'kissing_closed_eyes': '😚',
  'yum': '😋',
  'stuck_out_tongue': '😛',
  'stuck_out_tongue_winking_eye': '😜',
  'stuck_out_tongue_closed_eyes': '😝',
  'neutral_face': '😐',
  'expressionless': '😑',
  'no_mouth': '😶',
  'smirk': '😏',
  'unamused': '😒',
  'face_with_rolling_eyes': '🙄',
  'grimacing': '😬',
  'lying_face': '🤥',
  'thinking_face': '🤔',
  'thinking': '🤔',
  'zipper_mouth_face': '🤐',
  'raised_eyebrow': '🤨',
  'exploding_head': '🤯',
  'flushed': '😳',
  'disappointed': '😞',
  'worried': '😟',
  'angry': '😠',
  'rage': '😡',
  'pensive': '😔',
  'confused': '😕',
  'slightly_frowning_face': '🙁',
  'frowning_face': '☹️',
  'persevere': '😣',
  'confounded': '😖',
  'tired_face': '😫',
  'weary': '😩',
  'triumph': '😤',
  'open_mouth': '😮',
  'scream': '😱',
  'fearful': '😨',
  'cold_sweat': '😰',
  'hushed': '😯',
  'frowning': '😦',
  'anguished': '😧',
  'cry': '😢',
  'disappointed_relieved': '😥',
  'sob': '😭',
  'sweat': '😓',
  'sleepy': '😪',
  'sleeping': '😴',
  'roll_eyes': '🙄',
  'sunglasses': '😎',
  'dizzy_face': '😵',
  'astonished': '😲',
  'zipper_mouth': '🤐',
  'mask': '😷',
  'face_with_thermometer': '🤒',
  'face_with_head_bandage': '🤕',
  'smiling_imp': '😈',
  'imp': '👿',
  'japanese_ogre': '👹',
  'japanese_goblin': '👺',
  'skull': '💀',
  'ghost': '👻',
  'alien': '👽',
  'robot_face': '🤖',
  'poop': '💩',
  'clown_face': '🤡',

  // Hand gestures
  'wave': '👋',
  'raised_hand': '✋',
  'hand': '✋',
  'ok_hand': '👌',
  'v': '✌️',
  'crossed_fingers': '🤞',
  'metal': '🤘',
  'call_me_hand': '🤙',
  'point_left': '👈',
  'point_right': '👉',
  'point_up_2': '👆',
  'point_down': '👇',
  'point_up': '☝️',
  '+1': '👍',
  'thumbsup': '👍',
  '-1': '👎',
  'thumbsdown': '👎',
  'fist': '✊',
  'facepunch': '👊',
  'punch': '👊',
  'left-facing_fist': '🤛',
  'right-facing_fist': '🤜',
  'clap': '👏',
  'raised_hands': '🙌',
  'open_hands': '👐',
  'palms_up_together': '🤲',
  'handshake': '🤝',
  'pray': '🙏',
  'writing_hand': '✍️',
  'nail_care': '💅',
  'selfie': '🤳',
  'muscle': '💪',

  // Hearts & Symbols
  'heart': '❤️',
  'orange_heart': '🧡',
  'yellow_heart': '💛',
  'green_heart': '💚',
  'blue_heart': '💙',
  'purple_heart': '�purple',
  'black_heart': '🖤',
  'broken_heart': '💔',
  'heart_exclamation': '❣️',
  'two_hearts': '💕',
  'revolving_hearts': '💞',
  'heartbeat': '💓',
  'heartpulse': '💗',
  'sparkling_heart': '💖',
  'cupid': '💘',
  'gift_heart': '💝',
  'star': '⭐',
  'star2': '🌟',
  'sparkles': '✨',
  'zap': '⚡',
  'boom': '💥',
  'collision': '💥',
  'fire': '🔥',
  'rainbow': '🌈',
  'sunny': '☀️',
  'cloud': '☁️',
  'snowflake': '❄️',
  'umbrella': '☂️',

  // Common objects & symbols
  'coffee': '☕',
  'tea': '🍵',
  'beer': '🍺',
  'wine_glass': '🍷',
  'cocktail': '🍸',
  'tropical_drink': '🍹',
  'champagne': '🍾',
  'pizza': '🍕',
  'hamburger': '🍔',
  'fries': '🍟',
  'popcorn': '🍿',
  'cake': '🍰',
  'birthday': '🎂',
  'cookie': '🍪',
  'apple': '🍎',
  'banana': '🍌',
  'watermelon': '🍉',
  'grapes': '🍇',
  'strawberry': '🍓',
  'rocket': '🚀',
  'airplane': '✈️',
  'car': '🚗',
  'taxi': '🚕',
  'bus': '🚌',
  'bike': '🚲',
  'computer': '💻',
  'laptop': '💻',
  'iphone': '📱',
  'phone': '☎️',
  'email': '📧',
  'envelope': '✉️',
  'memo': '📝',
  'pencil2': '✏️',
  'pencil': '📝',
  'book': '📖',
  'notebook': '📓',
  'calendar': '📅',
  'clock': '🕐',
  'alarm_clock': '⏰',
  'hourglass': '⌛',
  'watch': '⌚',
  'lock': '🔒',
  'unlock': '🔓',
  'key': '🔑',
  'bulb': '💡',
  'flashlight': '🔦',
  'wrench': '🔧',
  'hammer': '🔨',
  'scissors': '✂️',
  'mag': '🔍',
  'mag_right': '🔎',
  'bookmark': '🔖',
  'link': '🔗',
  'paperclip': '📎',
  'pushpin': '📌',
  'triangular_flag_on_post': '🚩',
  'checkered_flag': '🏁',
  'white_check_mark': '✅',
  'heavy_check_mark': '✔️',
  'x': '❌',
  'negative_squared_cross_mark': '❎',
  'warning': '⚠️',
  'exclamation': '❗',
  'question': '❓',
  'grey_question': '❔',
  'grey_exclamation': '❕',
  'bangbang': '‼️',
  'interrobang': '⁉️',
  'chart_with_upwards_trend': '📈',
  'chart_with_downwards_trend': '📉',
  'bar_chart': '📊',
  'money_with_wings': '💸',
  'dollar': '💵',
  'yen': '💴',
  'euro': '💶',
  'pound': '💷',
  'moneybag': '💰',
  'credit_card': '💳',
  'trophy': '🏆',
  'medal': '🏅',
  'first_place_medal': '🥇',
  'second_place_medal': '🥈',
  'third_place_medal': '🥉',
  'dart': '🎯',
  'game_die': '🎲',
  'gift': '🎁',
  'balloon': '🎈',
  'tada': '🎉',
  'confetti_ball': '🎊',
  'microphone': '🎤',
  'headphones': '🎧',
  'musical_note': '🎵',
  'notes': '🎶',
  'art': '🎨',
  'camera': '📷',
  'video_camera': '📹',
  'movie_camera': '🎥',

  // Nature & Animals
  'dog': '🐶',
  'cat': '🐱',
  'mouse': '🐭',
  'hamster': '🐹',
  'rabbit': '🐰',
  'fox_face': '🦊',
  'bear': '🐻',
  'panda_face': '🐼',
  'koala': '🐨',
  'tiger': '🐯',
  'lion_face': '🦁',
  'cow': '🐮',
  'pig': '🐷',
  'frog': '🐸',
  'monkey_face': '🐵',
  'see_no_evil': '🙈',
  'hear_no_evil': '🙉',
  'speak_no_evil': '🙊',
  'chicken': '🐔',
  'penguin': '🐧',
  'bird': '🐦',
  'baby_chick': '🐤',
  'hatched_chick': '🐥',
  'hatching_chick': '🐣',
  'duck': '🦆',
  'eagle': '🦅',
  'owl': '🦉',
  'bat': '🦇',
  'wolf': '🐺',
  'boar': '🐗',
  'horse': '🐴',
  'unicorn_face': '🦄',
  'bee': '🐝',
  'bug': '🐛',
  'butterfly': '🦋',
  'snail': '🐌',
  'shell': '🐚',
  'beetle': '🐞',
  'ant': '🐜',
  'spider': '🕷️',
  'scorpion': '🦂',
  'crab': '🦀',
  'snake': '🐍',
  'turtle': '🐢',
  'tropical_fish': '🐠',
  'fish': '🐟',
  'dolphin': '🐬',
  'whale': '🐳',
  'whale2': '🐋',
  'shark': '🦈',
  'octopus': '🐙',
  'tree': '🌲',
  'evergreen_tree': '🌲',
  'deciduous_tree': '🌳',
  'palm_tree': '🌴',
  'cactus': '🌵',
  'tulip': '🌷',
  'cherry_blossom': '🌸',
  'rose': '🌹',
  'hibiscus': '🌺',
  'sunflower': '🌻',
  'blossom': '🌼',
  'bouquet': '💐',
  'four_leaf_clover': '🍀',
  'shamrock': '☘️',
  'leaves': '🍃',
  'fallen_leaf': '🍂',
  'herb': '🌿',
  'mushroom': '🍄',
  'seedling': '🌱',
};

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
    
    // Handle horizontal rule
    if (line.match(/^(-{3,}|\*{3,}|_{3,})$/)) {
      flushList();
      parts.push(
        <hr key={`hr-${lineIdx}`} className="border-t border-[rgb(60,56,54)] my-2" />
      );
      return;
    }

    // Handle headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const content = processInlineMarkdown(headingMatch[2]);
      
      const headingClasses = {
        1: 'text-2xl font-bold mb-2 mt-4',
        2: 'text-xl font-bold mb-1.5 mt-3',
        3: 'text-lg font-bold mb-1 mt-2',
        4: 'text-base font-bold mb-1 mt-2',
        5: 'text-sm font-bold mb-0.5 mt-1',
        6: 'text-xs font-bold mb-0.5 mt-1',
      };
      
      const className = `text-white ${headingClasses[level as keyof typeof headingClasses]}`;
      const headingContent = content.map((part, idx) => (
        <React.Fragment key={idx}>{part}</React.Fragment>
      ));
      
      if (level === 1) {
        parts.push(<h1 key={`heading-${lineIdx}`} className={className}>{headingContent}</h1>);
      } else if (level === 2) {
        parts.push(<h2 key={`heading-${lineIdx}`} className={className}>{headingContent}</h2>);
      } else if (level === 3) {
        parts.push(<h3 key={`heading-${lineIdx}`} className={className}>{headingContent}</h3>);
      } else if (level === 4) {
        parts.push(<h4 key={`heading-${lineIdx}`} className={className}>{headingContent}</h4>);
      } else if (level === 5) {
        parts.push(<h5 key={`heading-${lineIdx}`} className={className}>{headingContent}</h5>);
      } else {
        parts.push(<h6 key={`heading-${lineIdx}`} className={className}>{headingContent}</h6>);
      }
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
  // Match single underscore not followed by another underscore
  processedText = processedText.replace(/(?<!_)_([^_\n]+?)_(?!_)/g, (_match, content) => {
    const placeholder = `__ITALIC2_${replacements.length}__`;
    replacements.push({
      placeholder,
      element: <em key={placeholder} className="italic">{content}</em>,
    });
    return placeholder;
  });

  // Process emoji shortcodes (:emoji_name:)
  processedText = processedText.replace(/:([a-z0-9_+-]+):/g, (_match, emojiName) => {
    const emoji = emojiMap[emojiName];
    if (emoji) {
      const placeholder = `__EMOJI_${replacements.length}__`;
      replacements.push({
        placeholder,
        element: <span key={placeholder} className="text-[22px] leading-[22px] align-middle mx-0.5">{emoji}</span>,
      });
      return placeholder;
    }
    return _match; // Return original if emoji not found
  });

  // Split by placeholders and reconstruct
  const placeholderRegex = /__(CODE|LINK|BOLD|UNDERLINE|ITALIC|ITALIC2|STRIKE|EMOJI)_(\d+)__/g;
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


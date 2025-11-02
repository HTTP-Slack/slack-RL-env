import React from 'react';

interface FormattingHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FormattingHelpModal: React.FC<FormattingHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const examples = [
    {
      category: 'Text Formatting',
      items: [
        { syntax: '**bold text**', result: 'bold text', desc: 'Bold' },
        { syntax: '_italic text_', result: 'italic text', desc: 'Italic' },
        { syntax: '__underlined text__', result: 'underlined text', desc: 'Underline' },
        { syntax: '~~strikethrough~~', result: 'strikethrough', desc: 'Strikethrough' },
      ],
    },
    {
      category: 'Code',
      items: [
        { syntax: '`inline code`', result: 'inline code', desc: 'Inline code' },
        { syntax: '```\ncode block\n```', result: 'Multi-line code block', desc: 'Code block' },
      ],
    },
    {
      category: 'Lists',
      items: [
        { syntax: '1. First item\n2. Second item', result: 'Numbered list', desc: 'Ordered list' },
        { syntax: '- Item one\n- Item two', result: 'Bulleted list', desc: 'Bullet list' },
        { syntax: '  - Nested item', result: 'Indented list item', desc: 'Nested list' },
      ],
    },
    {
      category: 'Emoji',
      items: [
        { syntax: ':smile:', result: '😊', desc: 'Emoji shortcode' },
        { syntax: ':fire:', result: '🔥', desc: 'Fire emoji' },
        { syntax: ':heart:', result: '❤️', desc: 'Heart emoji' },
        { syntax: ':rocket:', result: '🚀', desc: 'Rocket emoji' },
        { syntax: ':tada:', result: '🎉', desc: 'Party emoji' },
        { syntax: ':+1:', result: '👍', desc: 'Thumbs up' },
      ],
    },
    {
      category: 'Other',
      items: [
        { syntax: '> Quoted text', result: 'Blockquote', desc: 'Quote' },
        { syntax: '[Link text](url)', result: 'Clickable link', desc: 'Link' },
        { syntax: '# Heading 1', result: 'Large heading', desc: 'Heading (# to ######)' },
        { syntax: '---', result: 'Horizontal line', desc: 'Horizontal rule' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-[rgb(34,37,41)] rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[rgb(34,37,41)] border-b border-[rgb(60,56,54)] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-[22px] font-bold text-white">Message Formatting Guide</h2>
          <button
            onClick={onClose}
            className="text-[rgb(209,210,211)] hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-[15px] text-[rgb(209,210,211)] mb-6">
            Use these markdown-style shortcuts to format your messages. You can also use the formatting toolbar
            above the message input.
          </p>

          {examples.map((section, sectionIdx) => (
            <div key={sectionIdx} className="mb-6">
              <h3 className="text-[18px] font-bold text-white mb-3">{section.category}</h3>
              <div className="space-y-3">
                {section.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="bg-[rgb(26,29,33)] rounded p-4 border border-[rgb(60,56,54)]"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="text-[13px] font-semibold text-[rgb(209,210,211)] mb-1">
                          {item.desc}
                        </div>
                        <code className="text-[13px] font-mono text-[rgb(54,197,240)] bg-[rgb(49,48,44)] px-2 py-1 rounded break-all">
                          {item.syntax}
                        </code>
                      </div>
                      <div className="text-[13px] text-[rgb(134,134,134)]">→</div>
                      <div className="flex-1 text-[13px] text-white">
                        {item.desc === 'Bold' && <strong className="font-bold">{item.result}</strong>}
                        {item.desc === 'Italic' && <em className="italic">{item.result}</em>}
                        {item.desc === 'Underline' && <u className="underline">{item.result}</u>}
                        {item.desc === 'Strikethrough' && <del className="line-through">{item.result}</del>}
                        {item.desc === 'Inline code' && (
                          <code className="bg-[rgb(49,48,44)] px-1.5 py-0.5 rounded font-mono">
                            {item.result}
                          </code>
                        )}
                        {section.category === 'Emoji' && (
                          <span className="text-[22px]">{item.result}</span>
                        )}
                        {!['Bold', 'Italic', 'Underline', 'Strikethrough', 'Inline code'].includes(item.desc) && section.category !== 'Emoji' && (
                          <span className="text-[rgb(209,210,211)]">{item.result}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Tips */}
          <div className="bg-[rgb(60,56,54)] bg-opacity-30 rounded p-4 border border-[rgb(60,56,54)]">
            <h3 className="text-[15px] font-bold text-white mb-2">💡 Pro Tips</h3>
            <ul className="text-[13px] text-[rgb(209,210,211)] space-y-1 list-disc list-inside">
              <li>Press <kbd className="px-1.5 py-0.5 bg-[rgb(49,48,44)] rounded font-mono text-xs">Shift + Enter</kbd> for a new line without sending</li>
              <li>Use the formatting toolbar buttons for quick access to common styles</li>
              <li>Combine multiple formats: **_bold and italic_**</li>
              <li>Triple backticks (```) for multi-line code blocks</li>
              <li>Type emoji codes like :smile:, :fire:, :heart:, :rocket:, :tada:</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[rgb(34,37,41)] border-t border-[rgb(60,56,54)] px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-[#007a5a] hover:bg-[#006644] rounded text-[15px] font-medium text-white transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormattingHelpModal;

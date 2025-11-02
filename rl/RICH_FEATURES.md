# Enhanced Synthetic Data - Rich Features Showcase

## Overview

The synthetic data generator now produces **realistic Slack-like workspaces** with rich markdown, file attachments, reactions, threads, and task-oriented content.

## Rich Features Included

### 1. **Rich Markdown Messages** ✨

Messages include various markdown formatting:

- **Bold** (`**text**`)
- *Italic* (`*text*`)
- __Underline__ (`__text__`)
- ~~Strikethrough~~ (`~~text~~`)
- `Inline code` (`` `code` ``)
- Code blocks with syntax highlighting:
  ```python
  def process_payment(amount: float) -> bool:
      if amount <= 0:
          raise ValueError("Amount must be positive")
  ```
- Links: [Example Article](https://example.com)
- Blockquotes:
  > This is a quote from someone important
- Ordered and bullet lists (with nesting)
- Tables (via code blocks)

### 2. **File Attachments** 📎

Generated files include:
- **Images**: PNG (synthetic 800x600 images)
- **Documents**: PDF, DOCX, XLSX, PPTX
- **Data**: CSV, plain text files
- **Media**: MP4 videos, MP3 audio (placeholder content)

Each file has proper metadata (filename, content_type, size).

### 3. **Reactions** 😊

Messages include emoji reactions with realistic user participation:
- Common combinations: 👍❤️, 🎉🚀, ✅👏, 🔥💯
- Multiple users can react to the same message
- Reactions are distributed across channel members

### 4. **Thread Replies** 💬

Messages can have threaded conversations:
- Replies maintain context
- Replies can have their own reactions
- Multiple participants in threads

### 5. **Task-Oriented Content** 🎯

Special markdown content designed for RL tasks:
- **Code snippets** for debugging tasks
- **Checklists** for task completion tracking
- **API documentation** for integration tasks
- **Status reports** with tables
- **Technical discussions** with code blocks

## Example Generated Content

### Task-Oriented Message (Code Fix)
```
Here's the fix for the bug:

```python
def process_payment(amount: float) -> bool:
    if amount <= 0:
        raise ValueError("Amount must be positive")
    return charge_card(amount)
```

This should resolve the issue! 🎉
```

**Features:**
- ✅ Code block with syntax highlighting
- ✅ Task-oriented (`is_task_oriented: true`)
- ✅ Perfect for RL tasks involving code review/editing

### Message with File Attachment
```
Content: "Here's the status report..."

Attachment: document.pdf
Type: application/pdf
Size: 25 bytes
```

### Message with Reactions
```
Content: "Great work on the latest release!"

Reactions:
  - 👍 (reacted by: alice@example.com, bob@example.com)
  - 🎉 (reacted by: bob@example.com)
```

### Message with Thread
```
Main: "**Quarterly Goals:**\n\n1. Product Launch..."
Thread Reply: "This is exactly what we needed!"
Thread Author: bob@example.com
```

## Usage

### Generate Rich Workspace Plan
```bash
cd rl
source .venv/bin/activate
python -m rl.scripts.bootstrap_workspace --seed 42 --dry-run
```

### Populate Workspace (when backend is running)
```bash
python -m rl.scripts.bootstrap_workspace --seed 42
```

### Customize Generation
```python
from rl.data.rich_content import RichContentGenerator
from rl.data.specs import ChannelMessageSpec

gen = RichContentGenerator()

# Generate task-oriented message
msg = gen.generate_rich_message(
    author_email="alice@example.com",
    task_oriented=True,
    include_file=True,
    include_reactions=True,
    include_thread=True,
)
```

## Markdown Templates Available

1. **Code fixes** - Python/JavaScript snippets
2. **Checklists** - Task management
3. **API docs** - Endpoint documentation
4. **Status reports** - Team updates
5. **Technical discussions** - Code reviews
6. **Rich formatting** - Mixed bold/italic/links
7. **Nested lists** - Complex hierarchies
8. **Tables** - Data visualization
9. **Blockquotes** - Discussions
10. **Mixed content** - Combination of all features

## Statistics

- **3-5 messages per channel** (varies by seed)
- **70% of messages** include markdown formatting
- **~30% of messages** include file attachments
- **~70% of messages** have reactions
- **~40% of last messages** have thread replies
- **Task-oriented content** in planning channels

## Task Integration

Messages marked `is_task_oriented: true` are specifically designed for RL agents to:
- Parse code blocks
- Extract checklists
- Understand API documentation
- Complete technical tasks

These messages provide rich, structured content that agents can learn to interact with.

---

**Generated**: 2025-11-02  
**Status**: ✅ All rich features implemented and tested



# Slack Clone - Full-Stack Collaborative Workspace Platform

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Setup & Installation](#setup--installation)
   - [Quick Start with Docker (Recommended)](#quick-start-with-docker-recommended-)
   - [Manual Setup (Without Docker)](#manual-setup-without-docker)
4. [Data Pipeline & Scraper](#data-pipeline--scraper)
5. [Features & Business Logic](#features--business-logic)
6. [Reinforcement Learning Environment](#reinforcement-learning-environment)
7. [Animations & Interactions](#animations--interactions)
8. [API Documentation](#api-documentation)
9. [Edge Cases & Error Handling](#edge-cases--error-handling)
10. [Future Enhancements](#future-enhancements)

---

## 🎯 Project Overview

This is a **full-featured Slack clone** built with a modern tech stack, featuring real-time messaging, workspace collaboration, file sharing, and a complete suite of productivity tools. The project includes:

- **Real-time messaging** with WebSocket support
- **Multi-workspace** organization with channels and direct messages
- **Data scraping pipeline** from Slack to populate the database
- **Reinforcement Learning environment** setup for training conversational AI agents
- **Advanced features**: Canvas boards, Lists (task management), file management, preferences system
- **Authentication**: Email/password + Google OAuth
- **Responsive UI** with smooth animations and interactions

---

## 🏗️ Architecture & Technology Stack

### **Frontend**

| Technology | Purpose | Why Chosen |
|-----------|---------|------------|
| **React 19** | UI Framework | Latest features with improved performance and automatic batching |
| **TypeScript** | Type Safety | Reduces bugs, improves developer experience and code maintainability |
| **Vite** | Build Tool | Fast hot module replacement (HMR), optimized production builds |
| **Tailwind CSS** | Styling | Utility-first approach, rapid development, small bundle size |
| **React Router DOM** | Routing | Industry-standard client-side routing with protected routes |
| **Socket.io Client** | Real-time Communication | Bi-directional event-based communication with fallback support |
| **Axios** | HTTP Client | Request/response interceptors, automatic JSON transformation |
| **Lexical** | Rich Text Editor | Extensible editor framework from Meta for canvas/document editing |
| **DnD Kit** | Drag & Drop | Accessible, performant drag-and-drop for lists and sections |
| **DOMPurify** | XSS Protection | Sanitizes HTML to prevent cross-site scripting attacks |

### **Backend**

| Technology | Purpose | Why Chosen |
|-----------|---------|------------|
| **Node.js** | Runtime | Non-blocking I/O, excellent for real-time applications |
| **Express 5** | Web Framework | Minimal, flexible, robust HTTP server with middleware support |
| **MongoDB** | Database | Document-oriented, flexible schema, excellent for real-time apps |
| **Mongoose** | ODM | Schema validation, middleware, query building for MongoDB |
| **Socket.io** | WebSocket Server | Real-time bidirectional communication with automatic reconnection |
| **JWT** | Authentication | Stateless authentication tokens with httpOnly cookies |
| **bcrypt** | Password Hashing | Industry-standard password hashing (10 salt rounds) |
| **Passport.js** | OAuth | Modular authentication middleware with Google OAuth strategy |
| **Multer** | File Upload | Middleware for handling multipart/form-data (file uploads) |
| **GridFS** | File Storage | MongoDB solution for storing large files (>16MB) |
| **Nodemailer** | Email Service | Sending workspace invitations and notifications |

### **Data Processing**

| Technology | Purpose |
|-----------|---------|
| **Python 3** | Scripting language for data transformation |
| **Pandas** | Data manipulation and analysis |
| **Slack SDK** | Official Slack API client for data extraction |
| **BSON/MongoDB ObjectId** | Generating database-compatible IDs |

### **Architecture Pattern**

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Context    │  │  Components  │  │   Services   │      │
│  │  Providers   │→ │  & Features  │→ │  (API calls) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         ↕                                      ↕             │
│    Socket.io                              Axios/REST         │
└─────────────────────────────────────────────────────────────┘
         ↕                                      ↕
┌─────────────────────────────────────────────────────────────┐
│                         Backend (Node.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Socket.io  │  │   Express    │  │  Middleware  │      │
│  │   Events     │  │   Routes     │→ │  (Auth, etc) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         ↕                  ↕                                 │
│    Controllers ← → Services → Models                        │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                     MongoDB Database                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  Users   │ │ Messages │ │ Channels │ │  Files   │      │
│  │Workspaces│ │ Threads  │ │   Lists  │ │  Canvas  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
```

**Key Architectural Decisions:**

1. **Context API over Redux**: React Context provides sufficient state management without the complexity of Redux, suitable for this application's scale.

2. **Socket.io for Real-time**: Chosen over native WebSockets for automatic reconnection, room support, and fallback to long-polling.

3. **JWT in httpOnly Cookies**: More secure than localStorage, prevents XSS attacks while maintaining stateless authentication.

4. **MongoDB with GridFS**: Document model fits chat/message structure naturally, GridFS handles large file storage efficiently.

5. **Monorepo Structure**: Keeps frontend and backend in sync, simplifies deployment and development.

---

## 🚀 Setup & Installation

### **Quick Start with Docker (Recommended)** 🐳

The easiest way to run the entire application:

```powershell
# Clone repository
git clone https://github.com/HTTP-Slack/slack-RL-env.git
cd slack-RL-env

# Start everything with one command
docker-compose up -d
```

**That's it!** Access the application at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080
- **MongoDB:** localhost:27017

For detailed Docker setup, see **[DOCKER_SETUP.md](./DOCKER_SETUP.md)**

---

### **Manual Setup (Without Docker)**

### **Prerequisites**

- **Node.js** v16+ (recommended: v18 or v20)
- **MongoDB** v5+ (local installation or Atlas cloud)
- **npm** or **yarn** package manager
- **Python 3.8+** (for data scraping scripts)
- **Git** for version control

### **1. Clone Repository**

```powershell
git clone https://github.com/HTTP-Slack/slack-RL-env.git
cd slack-RL-env
```

### **2. Backend Setup**

```powershell
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
# Copy the following into .env file:
```

**Backend `.env` Configuration:**

```env
# Database
MONGO_URI=mongodb://localhost:27017/slack_clone_db

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
SESSION_SECRET=your-session-secret-key-change-in-production

# Google OAuth (Optional - get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8080/api/auth/google/callback

# Email Service (Optional - for invitations)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM="Slack Clone" <noreply@slack-clone.com>

# Server Configuration
PORT=8080
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# URLs for workspace links
STAGING_URL=http://localhost:5173
PRODUCTION_URL=https://your-production-domain.com
```

```powershell
# Start backend server
npm run dev
```

Backend will run on `http://localhost:8080`

### **3. Frontend Setup**

```powershell
# Open new terminal
cd frontend

# Install dependencies
npm install

# Create environment file
# Copy the following into .env file:
```

**Frontend `.env` Configuration:**

```env
VITE_API_URL=http://localhost:8080/api
```

```powershell
# Start frontend development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### **4. Database Setup**

**Option A: Local MongoDB**

```powershell
# Start MongoDB service
# Windows:
net start MongoDB

# macOS (via Homebrew):
brew services start mongodb-community

# Linux:
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**

1. Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get connection string and update `MONGO_URI` in backend `.env`
4. Add your IP to whitelist in Atlas dashboard

### **5. Google OAuth Setup (Optional)**

See `GOOGLE_OAUTH_SETUP.md` for detailed instructions:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:8080/api/auth/google/callback`
6. Copy Client ID and Secret to `.env`

### **6. Verify Installation**

1. Open browser to `http://localhost:5173`
2. Click "Create an account"
3. Register with email and password
4. You should be redirected to workspace selection
5. Create a new workspace
6. Start messaging!

### **Common Issues & Solutions**

| Issue | Solution |
|-------|----------|
| **MongoDB connection error** | Ensure MongoDB is running, check `MONGO_URI` |
| **CORS errors** | Verify `CLIENT_URL` matches frontend URL |
| **Socket connection fails** | Check backend server is running on correct port |
| **"Invalid credentials"** | Ensure password is at least 6 characters |
| **Port already in use** | Kill process on port or change `PORT` in `.env` |

---

## 📊 Data Pipeline & Scraper

The project includes a sophisticated **Slack data extraction and transformation pipeline** to seed the database with real Slack workspace data for development, testing, or creating an RL training environment.

### **Pipeline Overview**

```
┌──────────────────┐
│  Slack Workspace │
│  (Source Data)   │
└────────┬─────────┘
         │
         │ Step 1: slack_data_pull.py
         │ (Slack API + SDK)
         ↓
┌──────────────────┐
│   Raw JSON Files │
│ - all_users.json │
│ - messages.json  │
└────────┬─────────┘
         │
         │ Step 2: script.py
         │ (Pandas transformation)
         ↓
┌──────────────────────┐
│ Transformed JSONL    │
│ - users_transformed  │
│ - messages_transformed│
│ - threads_transformed│
│ - conversation_...   │
└────────┬─────────────┘
         │
         │ Step 3: mongoimport
         │ (MongoDB CLI)
         ↓
┌──────────────────┐
│  MongoDB Atlas   │
│  Production DB   │
└──────────────────┘
```

### **1. Slack Data Scraper (`slack_data_pull.py`)**

**Purpose**: Extracts users and message history from a Slack workspace using the official Slack SDK.

**Features**:
- Handles pagination for large workspaces (200+ users, 1000+ messages)
- Fetches all users with profile information
- Retrieves complete message history from specific channels
- Supports private channels/groups
- Exports data to JSON format

**Configuration**:

```python
# Edit these values in slack_data_pull.py
SLACK_BOT_TOKEN = "xoxb-your-bot-token"
CHANNEL_ID = "C07GJFVLYKS"  # Your channel ID
OUTPUT_MESSAGES_FILE = f"{CHANNEL_ID}_messages.json"
OUTPUT_USERS_FILE = "all_users.json"
```

**Required Slack Scopes**:
- `users:read` - To fetch user list
- `groups:history` or `channels:history` - To fetch messages
- `channels:read` - To access channel information

**Usage**:

```powershell
# Install dependencies
pip install slack-sdk

# Configure token and channel in script
# Run scraper
python slack_data_pull.py
```

**Output Files**:
- `all_users.json` - Complete user directory with profiles
- `C07GJFVLYKS_messages.json` - All messages from specified channel

### **2. Data Transformation (`script.py`)**

**Purpose**: Transforms raw Slack JSON data into MongoDB-compatible JSONL format with proper schema and ObjectIds.

**Key Transformations**:

1. **User Transformation**
   - Filters out bots, deleted users, and Slackbot
   - Generates MongoDB ObjectIds for each user
   - Creates username from display name → real name → email
   - Maps roles (owner, admin, user)
   - Generates random passwords (not used for OAuth users)
   - Cleans text fields to remove UTF-8 encoding issues

2. **Message Transformation**
   - Separates parent messages from thread replies
   - Maps user IDs to MongoDB ObjectIds
   - Transforms reactions with user references
   - Handles thread metadata (reply count, participants)
   - Converts Slack timestamps to datetime objects
   - Assigns messages to conversations

3. **Thread Transformation**
   - Links replies to parent messages
   - Maps sender and reactor IDs
   - Preserves thread hierarchy

4. **Conversation Creation**
   - Creates a conversation representing the Slack channel
   - Lists all collaborators (unique message senders)
   - Links to organization

**ID Mapping**:

The script maintains CSV mappings for reference:
- `user_id_map.csv` - Slack user ID → MongoDB ObjectId
- `message_id_map.csv` - Slack timestamp → MongoDB ObjectId

**Output Files**:
- `users_transformed.jsonl` - Users ready for MongoDB
- `messages_transformed.jsonl` - Parent messages
- `threads_transformed.jsonl` - Thread replies
- `conversation_transformed.jsonl` - Channel metadata

**Usage**:

```powershell
# Install dependencies
pip install pandas bson

# Ensure input files exist:
# - all_users.json
# - C07GJFVLYKS_messages.json

# Run transformation
python script.py
```

### **3. Database Import**

**Using MongoDB Import Tool**:

```powershell
# Import users
mongoimport --uri="mongodb://localhost:27017/slack_clone_db" --collection=users --file=users_transformed.jsonl

# Import messages
mongoimport --uri="mongodb://localhost:27017/slack_clone_db" --collection=messages --file=messages_transformed.jsonl

# Import threads
mongoimport --uri="mongodb://localhost:27017/slack_clone_db" --collection=threads --file=threads_transformed.jsonl

# Import conversations
mongoimport --uri="mongodb://localhost:27017/slack_clone_db" --collection=conversations --file=conversation_transformed.jsonl
```

**Using MongoDB Compass** (GUI):
1. Open MongoDB Compass
2. Connect to your database
3. Select database and collection
4. Click "Add Data" → "Import File"
5. Select JSONL file and import

### **Data Quality & Edge Cases**

**Handled in Transformation**:
- ✅ Missing email addresses (uses username fallback)
- ✅ Special characters in text (manual UTF-8 cleaning)
- ✅ Unpopulated user references
- ✅ Messages without reactions
- ✅ Threads without replies
- ✅ Duplicate timestamps (uses Slack's unique ts)
- ✅ Bot messages (filtered out)
- ✅ Deleted users (excluded)

---

## 🎓 Reinforcement Learning Environment

The project name "slack-RL-env" suggests this is designed as a **Reinforcement Learning environment** for training conversational AI agents.

### **RL Environment Characteristics**

**State Space**:
- User profiles (role, online status, preferences)
- Message history (content, sender, timestamp, reactions)
- Conversation context (participants, channel/DM)
- Thread relationships (parent-child message structure)
- Workspace state (channels, collaborators, sections)

**Action Space**:
- Send message with text content
- Reply to thread
- React with emoji
- Create channel
- Invite users
- Share file
- Update preferences
- Search messages

**Reward Structure** (Potential Implementation):
- **Positive Rewards**:
  - Message receives reactions (+0.5 per reaction)
  - Message starts a thread (+1.0 for engagement)
  - Response time within expected window (+0.3)
  - Message tagged as helpful by users (+2.0)
  - Successful task completion in Lists (+5.0)
  
- **Negative Rewards**:
  - Message ignored for extended period (-0.2)
  - Off-topic message (-1.0)
  - Repetitive/spam content (-2.0)
  - User blocks or hides agent (-5.0)

**Episode Structure**:
- **Episode Start**: Agent joins a workspace
- **Episode Length**: Fixed time window or conversation conclusion
- **Episode End**: Workspace session ends or user logs out

### **Using as an RL Environment**

**1. Gym-Compatible Wrapper** (Future Implementation)

```python
import gym
from gym import spaces
import numpy as np

class SlackEnv(gym.Env):
    """Slack messaging environment for RL agents"""
    
    def __init__(self, api_url, workspace_id):
        super().__init__()
        self.api_url = api_url
        self.workspace_id = workspace_id
        
        # Define action space (discrete: send, reply, react, etc.)
        self.action_space = spaces.Discrete(8)
        
        # Define observation space (message embeddings + metadata)
        self.observation_space = spaces.Dict({
            'message_history': spaces.Box(low=-1, high=1, shape=(100, 768)),
            'current_channel': spaces.Discrete(50),
            'user_count': spaces.Box(low=0, high=200, shape=(1,)),
            'time_of_day': spaces.Box(low=0, high=24, shape=(1,)),
        })
    
    def reset(self):
        """Reset environment to initial state"""
        # Create new conversation or join channel
        return self._get_observation()
    
    def step(self, action):
        """Execute action and return new state"""
        # Send API request based on action
        # Get response and new messages
        observation = self._get_observation()
        reward = self._calculate_reward()
        done = self._is_episode_done()
        info = {}
        return observation, reward, done, info
```

**2. Training Data Generation**

The scraped Slack data provides:
- **Imitation Learning**: Real human conversations as demonstrations
- **Offline RL**: Historical state-action-reward sequences
- **Evaluation Benchmarks**: Test agent against human performance

**3. Agent Architecture Suggestions**

```python
# Example using transformers + RL
from transformers import AutoModel
import torch.nn as nn

class SlackAgent(nn.Module):
    def __init__(self):
        super().__init__()
        # Language model for understanding context
        self.encoder = AutoModel.from_pretrained('bert-base-uncased')
        
        # Policy network for action selection
        self.policy_head = nn.Linear(768, action_dim)
        
        # Value network for reward prediction
        self.value_head = nn.Linear(768, 1)
    
    def forward(self, message_embeddings, metadata):
        # Encode current state
        context = self.encoder(message_embeddings)
        
        # Predict action probabilities
        action_probs = F.softmax(self.policy_head(context), dim=-1)
        
        # Estimate state value
        state_value = self.value_head(context)
        
        return action_probs, state_value
```

### **RL Use Cases**

1. **Conversational Agent Training**: Train bots to engage naturally in workplace chats
2. **Task Automation**: Learn to manage Lists, Canvas, and project workflows
3. **Smart Notifications**: Optimize when to send alerts based on user behavior
4. **Content Recommendation**: Suggest relevant channels, documents, or people
5. **Moderation Agent**: Learn to detect and handle inappropriate content

### **Evaluation Metrics**

- **Engagement Rate**: % of agent messages that receive responses
- **Reaction Score**: Average reactions per agent message
- **Thread Creation**: Number of productive threads initiated
- **User Satisfaction**: Explicit feedback from users
- **Task Success Rate**: % of assigned tasks completed correctly
- **Response Appropriateness**: Human evaluation of context-awareness

---

## ✨ Features & Business Logic

### **1. Authentication & Authorization**

**Email/Password Authentication**:
- User registration with validation (min 6 char password)
- Secure password hashing using bcrypt (10 salt rounds)
- JWT token generation (expires in 10 days)
- httpOnly cookie storage for security
- Password comparison for login

**Google OAuth 2.0**:
- OAuth flow with Passport.js strategy
- Automatic user creation/linking by email
- Profile picture sync from Google account
- Fallback to email/password if OAuth unavailable

**Authorization Patterns**:
- `protectRoute` middleware validates JWT
- Role-based access (owner, admin, user)
- Creator-only actions (delete workspace, canvas, list)
- Collaborator access (view/edit shared resources)
- Workspace isolation (users only see their org's data)

**Business Rules**:
- Email must be unique across platform
- Usernames can be duplicated (email is primary identifier)
- Users can belong to multiple workspaces
- Workspace owners have full control
- Coworkers can create channels but not delete workspace

### **2. Workspaces (Organizations)**

**Creation Flow**:
1. User clicks "Create Workspace"
2. Enters workspace name
3. System generates unique join link
4. Creates default "Channels" section
5. User becomes workspace owner

**Joining Workspace**:
- Via email invitation with link
- Via shared join link (`/join/:joinLink`)
- Automatically added to default channels
- Self-conversation and pair conversations created

**Workspace Isolation**:
- Each workspace has separate channels, messages, users
- Socket events filtered by workspace ID
- Active conversation cleared when switching workspaces
- No cross-workspace data leakage

**Invitation System**:
```javascript
// Backend: organisation.controller.js
export const inviteCoworkers = async (req, res) => {
  // 1. Validate emails
  // 2. Find existing users by email
  // 3. Add existing users to workspace
  // 4. Send invitation emails to non-users
  // 5. Create pair conversations between all members
  // 6. Create self-conversations for new members
}
```

### **3. Channels & Sections**

**Sections** (like Slack's sidebar categories):
- Organize channels into collapsible groups
- Drag-and-drop reordering
- Default "Channels" section auto-created
- Custom sections per workspace

**Channels**:
- Public within workspace
- Collaborators can be added
- Thread support for messages
- Starred channels for quick access
- Channel description and title customization

**Business Logic**:
- Channels must belong to a section
- Section order stored as numeric field
- Channel order within section tracked
- Moving channels between sections updates both

**Drag-and-Drop Implementation**:
```typescript
// frontend: using @dnd-kit
const handleDragEnd = (event) => {
  const { active, over } = event;
  
  if (active.id !== over.id) {
    // Reorder sections or channels
    // Update order in database via API
    await updateSectionOrder(orderedIds);
  }
};
```

### **4. Messaging System**

**Message Types**:
- Channel messages (public to all channel members)
- Direct messages (1:1 conversations)
- Thread replies (nested under parent message)
- Self messages (private notes)

**Real-time Delivery**:
```javascript
// Backend: socket.io
io.emit('message', {
  newMessage: messageObject,
  organisation: workspaceId
});

// Frontend: WorkspaceContext
socket.on('message', ({ newMessage, organisation }) => {
  // Validate workspace match
  if (organisation !== currentWorkspaceId) return;
  
  // Add to state if not duplicate
  setMessages(prev => [...prev, newMessage]);
});
```

**Message Features**:
- Emoji reactions (multiple per message)
- File attachments (images, documents, videos)
- Thread replies with participant tracking
- Edit/delete capabilities
- Read receipts (`hasRead` flag)
- Bookmarking messages
- Pinning important messages

**Thread Management**:
- Parent message shows reply count
- Last reply timestamp tracked
- Thread participants list maintained
- Replies shown in side panel
- Notifications for thread updates

### **5. File Management**

**Storage**: MongoDB GridFS for files >16MB

**Supported File Types**:
- Images: jpg, jpeg, png, gif, webp, svg
- Documents: pdf, doc, docx, xls, xlsx, ppt, pptx
- Archives: zip, rar, 7z
- Audio: mp3, wav, ogg
- Video: mp4, webm, mov

**Upload Flow**:
1. Frontend: User selects files (max 10 at once)
2. Multer middleware processes multipart/form-data
3. Files stored in GridFS with metadata
4. File IDs linked to message/canvas
5. Shareable links generated

**Download Options**:
- `?download=1` - Force download
- `?inline=1` - View in browser
- `/files/:workspaceId/:id/:filename` - Shareable URL

**Access Control**:
- Files tied to workspace
- Only workspace members can access
- `protectRoute` middleware validates

### **6. Lists (Task Management)**

**Structure**:
- Lists contain multiple items (rows)
- Dynamic columns (text, enum, date, bool, int)
- Templates for quick setup (e.g., "Project Tracker", "Bug Reports")
- Collaborators can view/edit
- Only creator can delete list

**Column Types**:
```typescript
interface Column {
  id: string;
  name: string;
  type: 'text' | 'enum' | 'date' | 'bool' | 'int';
  options?: string[];  // For enum type
  required?: boolean;
}
```

**List Items**:
- Stored as flexible `Map` of column data
- Order field for sorting
- Assignee field (user reference)
- Status tracking
- Priority levels (0-3)
- Due dates

**Templates**:
The system includes 20+ pre-built templates:
- Project tracker
- Bug reports
- Product roadmap
- Content calendar
- Event planning
- Employee onboarding
- And more...

**Business Logic**:
- Collaborators can create items
- Collaborators can update items
- Only creator can delete list
- Items inherit list's workspace

### **7. Canvas (Documents)**

**Purpose**: Collaborative rich-text documents (like Notion pages)

**Editor**: Lexical framework with plugins:
- Rich text (bold, italic, underline)
- Links
- Lists (ordered/unordered)
- Code blocks
- HTML export

**Features**:
- Real-time collaborative editing
- Template system (meeting notes, project plans, etc.)
- Starring important canvases
- Last viewed tracking
- Search within content
- Share with specific collaborators

**Access Control**:
```javascript
// Only creator or collaborators can access
const isAuthorized = 
  canvas.createdBy.equals(userId) ||
  canvas.collaborators.includes(userId);
```

**Templates**:
Pre-built canvas templates:
- Meeting notes
- Project brief
- Technical documentation
- Team handbook
- Weekly updates

### **8. Preferences System**

**Architecture**: Modular subcategories for scalability

**Subcategories**:
1. **Notifications**: Type, keywords, huddles
2. **VIP**: Priority contacts list
3. **Navigation**: Sidebar appearance, tab visibility
4. **Home**: Channel organization, sorting
5. **Appearance**: Themes, fonts, emoji settings
6. **Messages & Media**: Image/link previews
7. **Language & Region**: Locale, timezone
8. **Accessibility**: Simplified layout, screen reader
9. **Mark As Read**: Reading behavior
10. **Audio & Video**: Device settings, huddles
11. **Privacy & Visibility**: Blocked users, hidden people
12. **Slack AI**: AI feature toggles
13. **Advanced**: Keyboard shortcuts, confirmations

**Update Pattern**:
```typescript
// Update multiple subcategories at once
PATCH /api/preferences
{
  notifications: { type: 'all', huddles: true },
  appearance: { theme: 'dark', font: 'Lato' }
}
```

**Special Features**:
- VIP list for priority notifications
- Blocked invitations (prevent spam)
- Hidden people (mute specific users)
- Custom emoji reactions
- Keyboard shortcut customization

### **9. Search**

**Search Across**:
- Messages (content, sender, date)
- Channels (name, description)
- Files (filename, type)
- Users (username, email)
- Canvas documents (title, content)
- Lists (title, description)

**Filters**:
- By channel
- By date range
- By sender
- By file type
- By workspace

**Implementation**:
```javascript
// Backend: Mongoose text search
const messages = await Message.find({
  $text: { $search: query },
  organisation: workspaceId
}).sort({ score: { $meta: 'textScore' } });
```

### **10. Notifications**

**Notification Types**:
- `mention` - @username mention
- `channel_mention` - @channel or @here
- `reply` - Someone replied to your message
- `direct_message` - New DM received
- `thread_reply` - Reply in thread you're following

**Notification Bell**:
- Real-time count badge
- Dropdown with recent notifications
- Mark as read individually or all
- Navigate to message on click

**Socket Integration**:
```javascript
socket.on('notification', (notification) => {
  // Update unread count
  // Show toast/banner
  // Play sound (if enabled in preferences)
});
```

---

## 🎨 Animations & Interactions

### **1. Smooth Transitions**

**Tailwind Transition Classes**:
```css
/* Hover effects */
hover:bg-gray-700 transition-colors duration-200

/* Modal animations */
transition-opacity duration-300 ease-in-out

/* Sidebar collapse */
transition-all duration-200 ease-in-out
```

**Framer Motion** (if integrated):
- Page transitions
- List item animations
- Modal slide-in effects

### **2. Drag-and-Drop**

**@dnd-kit Implementation**:

```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';

<DndContext onDragEnd={handleDragEnd}>
  <SortableContext items={sections}>
    {sections.map(section => (
      <SortableSection key={section.id} section={section} />
    ))}
  </SortableContext>
</DndContext>
```

**Features**:
- Reorder sections in sidebar
- Reorder channels within sections
- Move channels between sections
- Reorder list items
- Visual feedback during drag

### **3. Real-time Message Updates**

**Optimistic Updates**:
```typescript
// Add message immediately (before server confirms)
setMessages([...messages, optimisticMessage]);

// Send to server
await sendMessage(content);

// If error, rollback
// If success, replace with server response
```

**Typing Indicators**:
```typescript
socket.emit('typing', { conversationId, username });

// Other users see:
socket.on('typing', ({ username }) => {
  showTypingIndicator(username);
});
```

### **4. Loading States**

**Skeleton Screens**:
```tsx
{loading ? (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
    <div className="h-4 bg-gray-700 rounded w-1/2" />
  </div>
) : (
  <MessageContent />
)}
```

**Spinner Components**:
- Button loading states
- Page-level spinners
- Infinite scroll loaders

### **5. Modal Interactions**

**Backdrop Click to Close**:
```typescript
const handleBackdropClick = (e) => {
  if (e.target === e.currentTarget) {
    onClose();
  }
};
```

**Escape Key Handling**:
```typescript
useEffect(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape') onClose();
  };
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, []);
```

### **6. Emoji Picker**

**Implementation**:
- Grid layout with categories
- Search/filter functionality
- Recent emojis tracking
- Custom emoji support
- Hover preview

### **7. File Upload UI**

**Drag-and-Drop Zone**:
```tsx
<div
  onDrop={handleDrop}
  onDragOver={(e) => e.preventDefault()}
  className="border-2 border-dashed border-gray-600 rounded-lg p-8"
>
  Drop files here or click to browse
</div>
```

**Progress Bar**:
```tsx
<div className="w-full bg-gray-700 rounded-full h-2">
  <div 
    className="bg-blue-600 h-2 rounded-full transition-all"
    style={{ width: `${uploadProgress}%` }}
  />
</div>
```

### **8. Context Menus**

**Right-click Actions**:
- Message actions (edit, delete, pin, bookmark)
- Channel actions (mute, leave, settings)
- User actions (message, view profile, add to VIP)

**Implementation**:
```typescript
<div onContextMenu={handleContextMenu}>
  {showMenu && (
    <div className="absolute" style={{ top: menuPos.y, left: menuPos.x }}>
      <ContextMenuItems />
    </div>
  )}
</div>
```

---

## 📚 API Documentation

See `API_DOCUMENTATION.md` for complete endpoint reference.

**Quick Reference**:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/register` | POST | Create new user account |
| `/api/auth/signin` | POST | Login with email/password |
| `/api/auth/google` | GET | Initiate Google OAuth |
| `/api/organisation` | POST | Create new workspace |
| `/api/organisation/:id` | GET | Get workspace details |
| `/api/channel` | POST | Create channel |
| `/api/channel/:id` | PATCH | Add collaborators |
| `/api/message` | GET | Get messages (with filters) |
| `/api/message` | POST | Send message |
| `/api/message/:id/replies` | GET | Get thread replies |
| `/api/files` | POST | Upload files (max 10) |
| `/api/files/:id` | GET | Download/stream file |
| `/api/list` | POST | Create new list |
| `/api/list/:id` | GET | Get list with items |
| `/api/list/:listId/items` | POST | Create list item |
| `/api/canvas` | POST | Create canvas document |
| `/api/canvas/:id` | PATCH | Update canvas content |
| `/api/preferences` | GET | Get all preferences |
| `/api/preferences` | PATCH | Update preferences |
| `/api/search` | GET | Search across workspace |
| `/api/notifications` | GET | Get notifications |

**Response Format**:

**Success:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional message"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (dev only)"
}
```

---

## 🛡️ Edge Cases & Error Handling

### **Authentication Edge Cases**

| Edge Case | Handling |
|-----------|----------|
| Expired JWT token | Token includes expiry, frontend redirects to signin |
| Missing authentication cookie | Middleware returns 401, frontend clears user state |
| Concurrent logins | Each session has unique JWT, all remain valid |
| Password change | Generate new JWT, invalidate previous sessions |
| OAuth user tries email login | Check for `googleId`, suggest OAuth login |
| Email already exists | Check before creation, return descriptive error |

### **Messaging Edge Cases**

| Edge Case | Handling |
|-----------|----------|
| Message sent to wrong workspace | Frontend validates workspace before send |
| Duplicate messages from socket | Check message ID before adding to state |
| Sending to deleted conversation | Backend validates conversation exists |
| Reaction to non-existent message | Check message ID in database |
| Thread reply to deleted parent | Soft delete, replies remain accessible |
| Editing message after delete | Check message still exists |

### **File Upload Edge Cases**

| Edge Case | Handling |
|-----------|----------|
| File size exceeds limit | Backend validates, returns 400 error |
| Invalid file type | Check MIME type against whitelist |
| Malicious file upload | Sanitize filenames, scan for malware (future) |
| Network interruption during upload | Frontend retry mechanism with exponential backoff |
| GridFS storage full | MongoDB handles, return 507 Insufficient Storage |

### **Workspace Edge Cases**

| Edge Case | Handling |
|-----------|----------|
| User invited to multiple workspaces | Maintain separate memberships |
| Workspace deleted while user active | Socket event clears workspace, redirect to home |
| Joining with expired invite link | Check link validity, show error message |
| Owner leaves workspace | Transfer ownership or prevent leaving |
| Circular workspace references | Validate no self-references |

### **Real-time Edge Cases**

| Edge Case | Handling |
|-----------|----------|
| Socket disconnection | Auto-reconnect with exponential backoff |
| Messages received while offline | Poll API on reconnect for missed messages |
| Out-of-order message delivery | Sort by timestamp on client side |
| Socket room mismatch | Validate workspace ID on every event |
| Rapid message sending (spam) | Rate limiting on backend |

### **Database Edge Cases**

| Edge Case | Handling |
|-----------|----------|
| ObjectId cast error | Try-catch with descriptive error message |
| Duplicate key violation | Check uniqueness before insert |
| Reference to deleted document | Use soft delete or clean up references |
| Circular references | Prevent in schema design |
| Transaction timeout | Retry with exponential backoff |

### **Search Edge Cases**

| Edge Case | Handling |
|-----------|----------|
| No results found | Show "No results" message with suggestions |
| Too many results | Pagination with limit (default 50) |
| Special characters in query | Escape regex characters |
| Empty search query | Return all recent items |
| Search in deleted channel | Filter out deleted resources |

### **Error Logging**

**Backend**:
```javascript
try {
  // Operation
} catch (error) {
  console.error('Error in operation:', error);
  res.status(500).json({
    success: false,
    message: 'Operation failed',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
```

**Frontend**:
```typescript
try {
  const response = await api.post('/endpoint', data);
} catch (error) {
  console.error('API call failed:', error);
  setError(error.response?.data?.message || 'Something went wrong');
}
```

---

## 🚀 Future Enhancements

### **1. AI/ML Features**

- [ ] **Smart Reply Suggestions**: Use GPT-like model to suggest message responses
- [ ] **Sentiment Analysis**: Analyze message tone for team health monitoring
- [ ] **Auto-Summarization**: Summarize long threads or channels
- [ ] **Search Improvements**: Semantic search with embeddings (vector DB)
- [ ] **RL Agent Integration**: Deploy trained conversational agent as bot
- [ ] **Smart Notifications**: ML-based notification filtering
- [ ] **Content Moderation**: Automatic detection of inappropriate content

### **2. Real-time Collaboration**

- [ ] **Operational Transform**: True collaborative editing for Canvas
- [ ] **Presence Indicators**: Show who's viewing a document
- [ ] **Live Cursor Tracking**: See other users' cursors in real-time
- [ ] **Audio/Video Calls**: Integrate WebRTC for huddles
- [ ] **Screen Sharing**: Share screen in conversations
- [ ] **Live Reactions**: Emoji reactions during calls

### **3. Performance Optimizations**

- [ ] **Message Virtualization**: Render only visible messages (react-window)
- [ ] **Lazy Loading**: Load images/files on demand
- [ ] **Service Worker**: Offline support and caching
- [ ] **Database Indexing**: Optimize frequent queries
- [ ] **Redis Caching**: Cache frequently accessed data
- [ ] **CDN for Files**: Serve static files from CDN
- [ ] **Code Splitting**: Lazy load routes and components

### **4. Mobile Support**

- [ ] **React Native App**: iOS and Android native apps
- [ ] **Responsive Design**: Better mobile web experience
- [ ] **Touch Gestures**: Swipe actions for mobile
- [ ] **Push Notifications**: Mobile push notifications
- [ ] **Offline Mode**: Sync messages when back online

### **5. Advanced Features**

- [ ] **Workflows**: Automate actions (like Slack Workflow Builder)
- [ ] **Custom Bots**: SDK for building custom bots
- [ ] **App Integrations**: Connect third-party apps (GitHub, Jira, etc.)
- [ ] **Polls**: Create polls in channels
- [ ] **Scheduled Messages**: Send messages at specific time
- [ ] **Reminders**: Set reminders for messages or tasks
- [ ] **Status Updates**: Custom status with emoji
- [ ] **Do Not Disturb**: Schedule quiet hours

### **6. Analytics & Insights**

- [ ] **Workspace Analytics**: Message count, active users, engagement
- [ ] **User Activity Tracking**: Login frequency, message patterns
- [ ] **Channel Health**: Identify inactive or over-active channels
- [ ] **Response Time Metrics**: Average response times
- [ ] **Dashboard**: Admin dashboard with visualizations
- [ ] **Export Data**: Export workspace data for analysis

### **7. Security Enhancements**

- [ ] **Two-Factor Authentication (2FA)**: SMS or authenticator app
- [ ] **Audit Logs**: Track all admin actions
- [ ] **IP Whitelisting**: Restrict access by IP
- [ ] **Data Encryption**: Encrypt messages at rest
- [ ] **Compliance**: GDPR, HIPAA compliance features
- [ ] **Rate Limiting**: Prevent abuse with rate limits
- [ ] **Session Management**: View/revoke active sessions

### **8. Deployment & DevOps**

- [ ] **Docker Compose**: Multi-container setup
- [ ] **Kubernetes**: Orchestration for scaling
- [ ] **CI/CD Pipeline**: Automated testing and deployment
- [ ] **Monitoring**: Prometheus, Grafana for metrics
- [ ] **Error Tracking**: Sentry for error monitoring
- [ ] **Load Balancing**: Nginx or cloud load balancer
- [ ] **Auto-scaling**: Scale based on traffic

### **9. Accessibility**

- [ ] **WCAG 2.1 Compliance**: Follow accessibility guidelines
- [ ] **Keyboard Navigation**: Full keyboard support
- [ ] **Screen Reader**: Better ARIA labels
- [ ] **High Contrast Mode**: Theme for visual impairments
- [ ] **Font Size Adjustment**: User-controlled text size
- [ ] **Alternative Text**: AI-generated alt text for images

### **10. Internationalization (i18n)**

- [ ] **Multi-language Support**: English, Spanish, French, etc.
- [ ] **RTL Support**: Right-to-left languages (Arabic, Hebrew)
- [ ] **Date/Time Localization**: Format based on user locale
- [ ] **Currency Support**: Multi-currency for paid features
- [ ] **Translation Management**: CMS for managing translations

---

## 📖 Additional Documentation

### Docker Documentation
- **`DOCKER_SETUP.md`** - Complete Docker setup guide (recommended) 🐳
- **`DOCKER_QUICK_START.md`** - One-page Docker quick reference
- **`DOCKER_IMPLEMENTATION.md`** - Docker implementation details and architecture

### API & Integration Documentation
- **`API_DOCUMENTATION.md`** - Complete API endpoint reference
- **`AUTH_INTEGRATION.md`** - Authentication system details
- **`GOOGLE_OAUTH_SETUP.md`** - Google OAuth setup guide
- **`GOOGLE_OAUTH_IMPLEMENTATION.md`** - OAuth implementation summary

### Project Documentation
- **`WORKSPACE_ISOLATION_FIX.md`** - Workspace isolation bug fixes
- **`QUICK_START.md`** - Rapid setup instructions (manual)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Development Guidelines**:
- Follow existing code style (ESLint + Prettier)
- Write TypeScript types for new components
- Add JSDoc comments for functions
- Test authentication flows
- Update README for new features

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👥 Team

**Project Name**: Slack Clone (RL Environment)  
**Repository**: `HTTP-Slack/slack-RL-env`  
**Branch**: `main`

---

## 🙏 Acknowledgments

- **Slack** - Original inspiration
- **MongoDB** - Flexible database
- **Socket.io** - Real-time communication
- **React Team** - Excellent UI framework
- **OpenAI** - Conversational AI research
- **Open Source Community** - Countless libraries used

---

## 📞 Support

For issues or questions:
1. Check existing documentation files
2. Search GitHub issues
3. Open a new issue with detailed description
4. Include error logs and steps to reproduce

---

**Happy Coding! 🚀**

Built with ❤️ using React, Node.js, MongoDB, and a lot of ☕

# API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Organisation (Workspace)](#organisation-workspace)
3. [User](#user)
4. [Channel](#channel)
5. [Conversation](#conversation)
6. [Message](#message)
7. [Thread](#thread)
8. [Section](#section)
9. [File](#file)
10. [List](#list)
11. [Canvas](#canvas)
12. [Teammates](#teammates)
13. [Preferences](#preferences)

---

## Authentication

### POST `/api/auth/register`
**Access:** Public  
**Description:** Register a new user account

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:** Returns user data and sets httpOnly cookie with JWT token (expires in 10 days)

---

### POST `/api/auth/signin`
**Access:** Public  
**Description:** Sign in an existing user

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** Returns user data and sets httpOnly cookie with JWT token (expires in 10 days)

---

### GET `/api/auth/google`
**Access:** Public  
**Description:** Initiate Google OAuth authentication flow

**Response:** Redirects to Google OAuth consent screen

---

### GET `/api/auth/google/callback`
**Access:** Public  
**Description:** Google OAuth callback handler

**Response:** Redirects to frontend with authentication cookie set

---

## Organisation (Workspace)

### GET `/api/organisation/:id`
**Access:** Private  
**Description:** Get organisation details with channels, conversations, and user profile

**Response:** Returns organisation object with populated channels, conversations, and current user's profile

---

### POST `/api/organisation`
**Access:** Private  
**Description:** Create a new organisation/workspace

**Request Body:**
```json
{
  "name": "string"
}
```

**Response:** Returns created organisation with default "Channels" section

---

### GET `/api/organisation/workspaces`
**Access:** Private  
**Description:** Get all workspaces associated with the current user

**Response:** Returns array of workspaces with their channels

---

### PATCH `/api/organisation/:id`
**Access:** Private  
**Description:** Update organisation name

**Request Body:**
```json
{
  "name": "string"
}
```

---

### GET `/api/organisation/:id/users`
**Access:** Private  
**Description:** Get all users in an organisation (excluding current user)

**Response:** Returns array of user objects

---

### PATCH `/api/organisation/:id/coworkers`
**Access:** Private  
**Description:** Add coworkers to organisation by email

**Request Body:**
```json
{
  "emails": ["email1@example.com", "email2@example.com"]
}
```

**Response:** Returns updated organisation with new coworkers added

---

### POST `/api/organisation/:id/invite`
**Access:** Private  
**Description:** Send invitation emails to colleagues

**Request Body:**
```json
{
  "emails": ["email1@example.com", "email2@example.com"]
}
```

**Response:** Returns invitation sending status and automatically adds existing users to workspace

---

### POST `/api/organisation/:id/conversation`
**Access:** Private  
**Description:** Get or create a 1:1 conversation with another user

**Request Body:**
```json
{
  "otherUserId": "string"
}
```

**Response:** Returns existing or newly created conversation

---

### POST `/api/organisation/join/:joinLink`
**Access:** Private  
**Description:** Join workspace using invitation link

**Response:** Returns organisation data after adding user

---

## User

### GET `/api/users/me`
**Access:** Private  
**Description:** Get current user's profile

**Response:** Returns user object (password excluded)

---

### PATCH `/api/users/me`
**Access:** Private  
**Description:** Update user profile (username, phone, role)

**Request Body:**
```json
{
  "username": "string (optional)",
  "phone": "string (optional)",
  "role": "string (optional)"
}
```

---

### PATCH `/api/users/me/picture`
**Access:** Private  
**Description:** Update user profile picture

**Request Body:** multipart/form-data with field `profilePicture`  
**File Size Limit:** 4MB max  
**Content Type:** Image files

**Response:** Success message

---

### GET `/api/users/:id/picture`
**Access:** Public  
**Description:** Get a user's profile picture

**Response:** Image binary data with appropriate Content-Type header

---

## Channel

### POST `/api/channel`
**Access:** Private  
**Description:** Create a new channel

**Request Body:**
```json
{
  "name": "string",
  "organisationId": "string",
  "sectionId": "string"
}
```

**Response:** Returns created channel (automatically added to section)

---

### GET `/api/channel/org/:id`
**Access:** Private  
**Description:** Get all channels for an organisation

**Response:** Returns array of channels with populated organisation and collaborators

---

### GET `/api/channel/:id`
**Access:** Private  
**Description:** Get a specific channel by ID

**Response:** Returns channel with populated collaborators

---

### PATCH `/api/channel/:id`
**Access:** Private  
**Description:** Add users as collaborators to channel

**Request Body:**
```json
{
  "emails": ["email1@example.com", "email2@example.com"]
}
```

**Response:** Returns updated channel with new collaborators

---

## Conversation

### GET `/api/conversation/org/:id`
**Access:** Private  
**Description:** Get all conversations for an organisation

**Response:** Returns array of conversations sorted by creation date (newest first)

---

### GET `/api/conversation/:id`
**Access:** Private  
**Description:** Get a specific conversation with dynamic name resolution

**Response:** Returns conversation with populated collaborators and dynamic name (other user's username for 1:1 DMs)

---

## Message

### GET `/api/message`
**Access:** Private  
**Description:** Get messages with optional filters

**Query Parameters:**
- `channelId` (optional): Filter by channel
- `conversationId` (optional): Filter by conversation
- `isSelf` (optional): Filter self messages
- `organisation` (required): Organisation ID

**Response:** Returns array of messages with populated sender, reactions, and thread replies

---

### GET `/api/message/:id`
**Access:** Private  
**Description:** Get a specific message by ID

**Response:** Returns message with populated sender, reactions, and thread replies

---

### POST `/api/message`
**Access:** Private  
**Description:** Create a new message

**Request Body:**
```json
{
  "content": "string",
  "organisation": "string",
  "channelId": "string (optional)",
  "conversationId": "string (optional)",
  "isSelf": "boolean (optional, default: false)"
}
```

**Note:** Must provide either `channelId` OR `conversationId`, not both

**Response:** Returns created message with populated sender

---

### GET `/api/message/:id/replies`
**Access:** Private  
**Description:** Get all thread replies for a message

**Response:** Returns array of thread replies sorted by creation date (oldest first)

---

## Thread

### GET `/api/threads`
**Access:** Private  
**Description:** Get all threads for a specific message

**Query Parameters:**
- `message`: Message ID (required)

**Response:** Returns array of thread replies with populated sender and reactions

---

## Section

### POST `/api/sections`
**Access:** Private  
**Description:** Create a new section

**Request Body:**
```json
{
  "name": "string",
  "organisationId": "string"
}
```

**Response:** Returns created section (automatically added to organisation)

---

### GET `/api/sections`
**Access:** Private  
**Description:** Get all sections for an organisation

**Query Parameters:**
- `organisationId`: Organisation ID (required)

**Response:** Returns array of sections with populated channels, sorted by order. Creates default "Channels" section if none exist.

---

### PUT `/api/sections/order`
**Access:** Private  
**Description:** Update section order

**Request Body:**
```json
{
  "orderedSectionIds": ["id1", "id2", "id3"]
}
```

**Response:** Success message

---

### PUT `/api/sections/channels/order`
**Access:** Private  
**Description:** Update channel order within sections (supports moving between sections)

**Request Body:**
```json
{
  "sourceSectionId": "string",
  "destSectionId": "string",
  "sourceChannelIds": ["id1", "id2"],
  "destChannelIds": ["id3", "id4", "id1"]
}
```

**Response:** Success message

---

### DELETE `/api/sections/:id`
**Access:** Private  
**Description:** Delete a section

**Response:** Success message (removes section from organisation)

---

## File

### POST `/api/files`
**Access:** Private  
**Description:** Upload one or more files (max 10 files)

**Request Body:** multipart/form-data
- `files`: Array of files (field name: `files`, max 10)
- `organisation`: Organisation ID (required)
- `channelId`: Channel ID (optional)
- `conversationId`: Conversation ID (optional)

**File Types:** Images, documents, audio, video, archives  
**File Size Limit:** Configurable (default via GridFS)

**Response:** Returns array of uploaded file metadata with IDs

---

### GET `/api/files/:id`
**Access:** Private  
**Description:** Stream/download a file

**Query Parameters:**
- `download`: Set to "1" to force download
- `inline`: Set to "1" for inline viewing

**Response:** File stream with appropriate Content-Type and Content-Disposition headers

---

### GET `/api/files/:id/info`
**Access:** Private  
**Description:** Get file metadata without downloading

**Response:** Returns file metadata (filename, contentType, length, metadata)

---

### GET `/api/files/:workspaceId/:id/:filename`
**Access:** Private  
**Description:** Stream/download file using workspace-based shareable link

**Query Parameters:**
- `download`: Set to "1" to force download

**Response:** File stream with appropriate headers

---

## List

### POST `/api/list`
**Access:** Private  
**Description:** Create a new list

**Request Body:**
```json
{
  "title": "string",
  "description": "string (optional)",
  "organisationId": "string"
}
```

**Response:** Returns created list

---

### GET `/api/list/org/:id`
**Access:** Private  
**Description:** Get all lists for an organisation

**Response:** Returns array of lists with populated collaborators and createdBy, sorted by creation date (newest first)

---

### GET `/api/list/:id`
**Access:** Private  
**Description:** Get a specific list with its items

**Response:** Returns list with populated collaborators, createdBy, and all associated list items

---

### PATCH `/api/list/:id`
**Access:** Private  
**Description:** Update list (title, description)

**Request Body:**
```json
{
  "title": "string (optional)",
  "description": "string (optional)"
}
```

**Authorization:** Creator or collaborator can update

---

### DELETE `/api/list/:id`
**Access:** Private  
**Description:** Delete a list (cascades to delete all items)

**Authorization:** Only creator can delete

**Response:** Success message

---

### PATCH `/api/list/:id/collaborators`
**Access:** Private  
**Description:** Add users as collaborators to list

**Request Body:**
```json
{
  "emails": ["email1@example.com", "email2@example.com"]
}
```

**Response:** Returns updated list with new collaborators

---

### POST `/api/list/:listId/items`
**Access:** Private  
**Description:** Create a new list item

**Request Body:**
```json
{
  "name": "string",
  "status": "string (optional, enum: 'Not started', 'In progress', 'Blocked', 'Completed')",
  "priority": "number (optional, 0-3)",
  "description": "string (optional)",
  "assignee": "string (optional, user ID)",
  "dueDate": "date (optional)",
  "order": "number (optional)"
}
```

**Response:** Returns created list item with populated assignee

---

### GET `/api/list/:listId/items`
**Access:** Private  
**Description:** Get all items for a list with optional filters

**Query Parameters:**
- `status`: Filter by status (optional)
- `search`: Search in name and description (optional)

**Response:** Returns array of list items with populated assignee, sorted by order

---

### PATCH `/api/list/:listId/items/:itemId`
**Access:** Private  
**Description:** Update a list item

**Request Body:**
```json
{
  "name": "string (optional)",
  "status": "string (optional)",
  "priority": "number (optional)",
  "description": "string (optional)",
  "assignee": "string (optional)",
  "dueDate": "date (optional)",
  "order": "number (optional)"
}
```

**Response:** Returns updated list item

---

### DELETE `/api/list/:listId/items/:itemId`
**Access:** Private  
**Description:** Delete a list item

**Response:** Success message

---

## Canvas

### POST `/api/canvas`
**Access:** Private  
**Description:** Create a new canvas

**Request Body:**
```json
{
  "title": "string",
  "content": "mixed (optional, JSON/blob)",
  "organisationId": "string",
  "isTemplate": "boolean (optional, default: false)",
  "type": "string (optional)"
}
```

**Response:** Returns created canvas with populated collaborators and createdBy

---

### GET `/api/canvas/org/:id`
**Access:** Private  
**Description:** Get all canvases for an organisation with filters

**Query Parameters:**
- `filter`: "all" | "shared" | "created" (optional)
  - `all`: All canvases in organisation
  - `shared`: Canvases where user is collaborator but not creator
  - `created`: Canvases created by user
- `search`: Search keyword (optional, searches in title)

**Response:** Returns array of canvases sorted by lastViewed (most recent first), then creation date

---

### GET `/api/canvas/:id`
**Access:** Private  
**Description:** Get a specific canvas (automatically updates lastViewed)

**Authorization:** Creator or collaborator can view

**Response:** Returns canvas with populated collaborators, createdBy, and starredBy

---

### PATCH `/api/canvas/:id`
**Access:** Private  
**Description:** Update canvas (title, content)

**Request Body:**
```json
{
  "title": "string (optional)",
  "content": "mixed (optional, JSON/blob)"
}
```

**Authorization:** Creator or collaborator can update

**Response:** Returns updated canvas

---

### DELETE `/api/canvas/:id`
**Access:** Private  
**Description:** Delete a canvas

**Authorization:** Only creator can delete

**Response:** Success message

---

### PATCH `/api/canvas/:id/collaborators`
**Access:** Private  
**Description:** Add users as collaborators to canvas

**Request Body:**
```json
{
  "emails": ["email1@example.com", "email2@example.com"]
}
```

**Response:** Returns updated canvas with new collaborators

---

### PATCH `/api/canvas/:id/view`
**Access:** Private  
**Description:** Manually update last viewed timestamp

**Authorization:** Creator or collaborator can update

**Response:** Returns updated canvas

---

### PATCH `/api/canvas/:id/star`
**Access:** Private  
**Description:** Star or unstar a canvas (toggle)

**Authorization:** Creator or collaborator can star

**Response:** Returns updated canvas with isStarred boolean indicating current state

---

## Teammates

### POST `/api/teammates`
**Access:** Private  
**Description:** Add teammates to organisation or channel with multiple options

**Request Body Options:**

**Option 1: Add existing users to channel (by user IDs)**
```json
{
  "userIds": ["userId1", "userId2"],
  "channelId": "string"
}
```

**Option 2: Add new users to channel and organisation (by emails)**
```json
{
  "emails": ["email1@example.com", "email2@example.com"],
  "channelId": "string",
  "organisationId": "string"
}
```

**Option 3: Add new/existing users to organisation (by emails)**
```json
{
  "emails": ["email1@example.com", "email2@example.com"],
  "organisationId": "string"
}
```

**Features:**
- Sends invitation emails to all added users
- Creates pair conversations between all organisation members
- Creates self-conversations for each member
- Automatically adds users to organisation or channel

**Response:** Returns updated channel or organisation

---

### GET `/api/teammates/:id`
**Access:** Private  
**Description:** Get a teammate's information by user ID

**Response:** Returns user object

---

## Preferences

### GET `/api/preferences`
**Access:** Private  
**Description:** Get user's complete preferences including all subcategories

**Response:** Returns preferences object with all populated subcategory references

---

### POST `/api/preferences`
**Access:** Private  
**Description:** Create initial preferences for user (only if preferences don't exist)

**Response:** Returns created preferences object

---

### PATCH `/api/preferences`
**Access:** Private  
**Description:** Update user's preferences (can update multiple subcategories at once)

**Request Body:**
```json
{
  "notifications": { /* NotificationPreferences fields */ },
  "vip": { /* VIPPreferences fields */ },
  "navigation": { /* NavigationPreferences fields */ },
  "home": { /* HomePreferences fields */ },
  "appearance": { /* AppearancePreferences fields */ },
  "messagesMedia": { /* MessagesMediaPreferences fields */ },
  "languageRegion": { /* LanguageRegionPreferences fields */ },
  "accessibility": { /* AccessibilityPreferences fields */ },
  "markAsRead": { /* MarkAsReadPreferences fields */ },
  "audioVideo": { /* AudioVideoPreferences fields */ },
  "privacyVisibility": { /* PrivacyVisibilityPreferences fields */ },
  "slackAI": { /* SlackAIPreferences fields */ },
  "advanced": { /* AdvancedPreferences fields */ },
  "streamSummaryResults": "boolean (optional, direct field)"
}
```

**Note:** All subcategory fields are optional. Can update any combination of subcategories in a single request.

---

### GET `/api/preferences/:subcategory`
**Access:** Private  
**Description:** Get a specific preference subcategory

**Available Subcategories:**
- `/notifications` - Notification preferences
- `/vip` - VIP preferences
- `/navigation` - Navigation preferences
- `/home` - Home preferences
- `/appearance` - Appearance preferences
- `/messages-media` - Messages & Media preferences
- `/language-region` - Language & Region preferences
- `/accessibility` - Accessibility preferences
- `/mark-as-read` - Mark As Read preferences
- `/audio-video` - Audio & Video preferences
- `/privacy-visibility` - Privacy & Visibility preferences
- `/advanced` - Advanced preferences

**Response:** Returns the specific subcategory preferences (defaults created if don't exist)

---

### POST `/api/preferences/:subcategory`
**Access:** Private  
**Description:** Create preferences for a specific subcategory (only if subcategory doesn't exist)

**Request Body:** Varies by subcategory (see subcategory-specific documentation)

**Response:** Returns created subcategory preferences

---

### PATCH `/api/preferences/:subcategory`
**Access:** Private  
**Description:** Update preferences for a specific subcategory

**Request Body:** Varies by subcategory (all fields optional, only provided fields are updated)

**Response:** Returns updated subcategory preferences

---

### POST `/api/preferences/vip/vip-list`
**Access:** Private  
**Description:** Add a user to VIP list

**Request Body:**
```json
{
  "vip": "string (user ID, email, or identifier)"
}
```

**Response:** Returns updated VIP preferences

---

### DELETE `/api/preferences/vip/vip-list/:vip`
**Access:** Private  
**Description:** Remove a user from VIP list

**URL Parameters:**
- `vip`: User ID, email, or identifier to remove

**Response:** Returns updated VIP preferences

---

### POST `/api/preferences/privacy-visibility/blocked-invitations`
**Access:** Private  
**Description:** Block invitations from a user

**Request Body:**
```json
{
  "userIdentifier": "string (user ID or email)"
}
```

**Response:** Returns updated privacy & visibility preferences with populated user references

---

### DELETE `/api/preferences/privacy-visibility/blocked-invitations/:userIdentifier`
**Access:** Private  
**Description:** Unblock invitations from a user

**URL Parameters:**
- `userIdentifier`: User ID or email to unblock

**Response:** Returns updated privacy & visibility preferences

---

### POST `/api/preferences/privacy-visibility/hidden-people`
**Access:** Private  
**Description:** Hide a person (won't see notifications or messages from them)

**Request Body:**
```json
{
  "userIdentifier": "string (user ID or email)"
}
```

**Response:** Returns updated privacy & visibility preferences with populated user references

---

### DELETE `/api/preferences/privacy-visibility/hidden-people/:userIdentifier`
**Access:** Private  
**Description:** Unhide a person

**URL Parameters:**
- `userIdentifier`: User ID or email to unhide

**Response:** Returns updated privacy & visibility preferences

---

## Preferences Subcategory Details

### Notification Preferences
**Fields:**
- `type`: "all" | "direct_mentions_keywords" | "nothing"
- `differentMobileSettings`: boolean
- `huddles`: boolean
- `threadReplies`: boolean
- `keywords`: string

---

### VIP Preferences
**Fields:**
- `allowFromVIPs`: boolean
- `vipList`: string[] (array of user identifiers)

---

### Navigation Preferences
**Fields:**
- `showHome`: boolean
- `showDMs`: boolean
- `showActivity`: boolean
- `showFiles`: boolean
- `showTools`: boolean
- `tabAppearance`: "icons_text" | "icons_only"

---

### Home Preferences
**Fields:**
- `showChannelOrganization`: boolean
- `showActivityDot`: boolean
- `alwaysShowUnreads`: boolean
- `alwaysShowHuddles`: boolean
- `alwaysShowThreads`: boolean
- `alwaysShowDraftsSent`: boolean
- `alwaysShowDirectories`: boolean
- `show`: "all" | "unreads" | "mentions" | "custom"
- `sort`: "alphabetically" | "most_recent" | "priority"
- `showProfilePhotos`: boolean
- `separatePrivateChannels`: boolean
- `separateDirectMessages`: boolean
- `moveUnreadMentions`: boolean
- `organizeExternalConversations`: boolean
- `displayMutedItems`: boolean

---

### Appearance Preferences
**Fields:**
- `font`: string
- `colorMode`: "light" | "dark" | "system"
- `theme`: "aubergine" | "clementine" | "banana" | "jade" | "lagoon" | "barbra" | "gray" | "mood_indigo"
- `displayTypingIndicator`: boolean
- `displayColorSwatches`: boolean
- `emojiSkinTone`: "default" | "light" | "medium_light" | "medium" | "medium_dark" | "dark"
- `displayEmojiAsText`: boolean
- `showJumbomoji`: boolean
- `convertEmoticons`: boolean
- `showOneClickReactions`: boolean
- `customReactionEmojis`: string[]

---

### Messages & Media Preferences
**Fields:**
- `showImagesFiles`: boolean
- `showImagesLinked`: boolean
- `showImagesLarge`: boolean
- `showTextPreviews`: boolean

---

### Language & Region Preferences
**Fields:**
- `language`: string
- `timezone`: string
- `autoTimezone`: boolean
- `keyboardLayout`: string
- `spellcheck`: boolean

---

### Accessibility Preferences
**Fields:**
- `simplifiedLayoutMode`: boolean
- `underlineLinks`: boolean
- `tabPreviews`: boolean
- `autoPlayAnimations`: boolean
- `messageFormat`: "sender_message_date" | "sender_date_message"
- `announceIncomingMessages`: boolean
- `readEmojiReactions`: boolean
- `playEmojiSound`: boolean

---

### Mark As Read Preferences
**Fields:**
- `behavior`: "start_where_left" | "start_newest_mark" | "start_newest_leave"
- `promptOnMarkAll`: boolean

---

### Audio & Video Preferences
**Fields:**
- `microphoneDevice`: string
- `speakerDevice`: string
- `cameraDevice`: string
- `setStatusToInHuddle`: boolean
- `muteMicrophoneOnJoin`: boolean
- `autoTurnOnCaptions`: boolean
- `warnLargeChannel`: boolean
- `blurVideoBackground`: boolean
- `playMusic`: boolean
- `musicStartDelay`: string

---

### Privacy & Visibility Preferences
**Fields:**
- `slackConnectDiscoverable`: boolean
- `contactSharing`: "all" | "workspace_only" | "none"
- `blockedInvitations`: User[] (array of user ObjectIds, populated with email and username)
- `hiddenPeople`: User[] (array of user ObjectIds, populated with email and username)

**Note:** `blockedInvitations` and `hiddenPeople` are arrays of User references. When retrieved, they are automatically populated with user `email` and `username` fields.

---

### Slack AI Preferences
**Fields:**
- `streamSummaries`: boolean

---

### Advanced Preferences
**Fields:**
- `whenTypingCodeEnterShouldNotSend`: boolean
- `formatMessagesWithMarkup`: boolean
- `enterBehavior`: "send" | "newline"
- `ctrlFStartsSearch`: boolean
- `searchShortcut`: "cmd_f" | "cmd_k"
- `excludeChannelsFromSearch`: string[] (array of channel names)
- `searchSortDefault`: "most_relevant" | "last_used"
- `confirmUnsend`: boolean
- `confirmAwayToggle`: boolean
- `warnMaliciousLinks`: boolean
- `warnExternalFiles`: boolean
- `warnExternalCanvases`: boolean
- `channelSuggestions`: boolean
- `surveys`: boolean

---

### Streaming Preferences
**Fields:**
- `streamSummaryResults`: boolean (direct field on main preferences, not a subcategory)

---

## Authentication & Authorization

### Authentication Method
All private endpoints require authentication via JWT token stored in httpOnly cookie. The cookie is set during registration or sign-in.

### Authorization Patterns
- **Creator Only:** Only the user who created the resource can delete it (lists, canvases)
- **Creator or Collaborator:** Both creator and collaborators can view/update resources (lists, canvases)
- **Organisation Member:** User must be owner or coworker of organisation to access organisation resources

### Error Responses
All endpoints return consistent error format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (development only)"
}
```

### Success Responses
All endpoints return consistent success format:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional message"
}
```

---

## Base URL
All endpoints are prefixed with `/api/[resource]`  
Example: `/api/auth/register`, `/api/channel/:id`

---

## Notes
- All timestamps are in ISO 8601 format
- ObjectIds are MongoDB ObjectId strings
- File uploads use GridFS for storage
- Content can be stored as JSON (Mixed type) or blob (String) for canvases
- All routes are protected with `protectRoute` middleware except public auth endpoints and user profile picture GET endpoint


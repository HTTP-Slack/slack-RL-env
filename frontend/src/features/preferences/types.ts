export enum NotificationType {
  ALL_MESSAGES = 'all',
  DIRECT_MENTIONS_KEYWORDS = 'direct_mentions_keywords',
  NOTHING = 'nothing',
}

export enum NavigationTabAppearance {
  ICONS_AND_TEXT = 'icons_text',
  ICONS_ONLY = 'icons_only',
}

export enum HomeShowOption {
  ALL_CONVERSATIONS = 'all',
  UNREADS_ONLY = 'unreads',
  MENTIONS_ONLY = 'mentions',
  CUSTOM = 'custom',
}

export enum SortOption {
  ALPHABETICALLY = 'alphabetically',
  MOST_RECENT = 'most_recent',
  PRIORITY = 'priority',
}

export enum ColorMode {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum Theme {
  AUBERGINE = 'aubergine',
  CLEMENTINE = 'clementine',
  BANANA = 'banana',
  JADE = 'jade',
  LAGOON = 'lagoon',
  BARBRA = 'barbra',
  GRAY = 'gray',
  MOOD_INDIGO = 'mood_indigo',
}

export enum EmojiSkinTone {
  DEFAULT = 'default',
  LIGHT = 'light',
  MEDIUM_LIGHT = 'medium_light',
  MEDIUM = 'medium',
  MEDIUM_DARK = 'medium_dark',
  DARK = 'dark',
}

export enum MarkAsReadBehavior {
  START_WHERE_LEFT = 'start_where_left',
  START_NEWEST_MARK = 'start_newest_mark',
  START_NEWEST_LEAVE = 'start_newest_leave',
}

export enum SearchSortDefault {
  MOST_RELEVANT = 'most_relevant',
  LAST_USED = 'last_used',
}

export interface NotificationPreferences {
  type: NotificationType;
  differentMobileSettings: boolean;
  huddles: boolean;
  threadReplies: boolean;
  keywords: string;
}

export interface VIPPreferences {
  allowFromVIPs: boolean;
  vipList: string[];
}

export interface NavigationPreferences {
  showHome: boolean;
  showDMs: boolean;
  showActivity: boolean;
  showFiles: boolean;
  showTools: boolean;
  tabAppearance: NavigationTabAppearance;
}

export interface HomePreferences {
  showChannelOrganization: boolean;
  showActivityDot: boolean;
  alwaysShowUnreads: boolean;
  alwaysShowHuddles: boolean;
  alwaysShowThreads: boolean;
  alwaysShowDraftsSent: boolean;
  alwaysShowDirectories: boolean;
  show: HomeShowOption;
  sort: SortOption;
  showProfilePhotos: boolean;
  separatePrivateChannels: boolean;
  separateDirectMessages: boolean;
  moveUnreadMentions: boolean;
  organizeExternalConversations: boolean;
  displayMutedItems: boolean;
}

export interface AppearancePreferences {
  font: string;
  colorMode: ColorMode;
  theme: Theme;
  displayTypingIndicator: boolean;
  displayColorSwatches: boolean;
  emojiSkinTone: EmojiSkinTone;
  displayEmojiAsText: boolean;
  showJumbomoji: boolean;
  convertEmoticons: boolean;
  showOneClickReactions: boolean;
  customReactionEmojis: string[];
}

export interface MessagesMediaPreferences {
  showImagesFiles: boolean;
  showImagesLinked: boolean;
  showImagesLarge: boolean;
  showTextPreviews: boolean;
}

export interface LanguageRegionPreferences {
  language: string;
  timezone: string;
  autoTimezone: boolean;
  keyboardLayout: string;
  spellcheck: boolean;
}

export interface AccessibilityPreferences {
  simplifiedLayoutMode: boolean;
  underlineLinks: boolean;
  tabPreviews: boolean;
  autoPlayAnimations: boolean;
  messageFormat: 'sender_message_date' | 'sender_date_message';
  announceIncomingMessages: boolean;
  readEmojiReactions: boolean;
  playEmojiSound: boolean;
}

export interface MarkAsReadPreferences {
  behavior: MarkAsReadBehavior;
  promptOnMarkAll: boolean;
}

export interface AudioVideoPreferences {
  microphoneDevice: string;
  speakerDevice: string;
  cameraDevice: string;
}

export interface PrivacyVisibilityPreferences {
  slackConnectDiscoverable: boolean;
  contactSharing: 'all' | 'workspace_only' | 'none';
  blockedInvitations: string[];
  hiddenPeople: string[];
}

export interface SlackAIPreferences {
  streamSummaries: boolean;
}

export interface AdvancedPreferences {
  whenTypingCodeEnterShouldNotSend: boolean;
  formatMessagesWithMarkup: boolean;
  enterBehavior: 'send' | 'newline';
  searchShortcut: 'cmd_f' | 'cmd_k';
  excludeChannelsFromSearch: string[];
  searchSortDefault: SearchSortDefault;
  confirmUnsend: boolean;
  confirmAwayToggle: boolean;
  warnMaliciousLinks: boolean;
  warnExternalFiles: boolean;
  warnExternalCanvases: boolean;
  channelSuggestions: boolean;
  surveys: boolean;
}

export interface UserPreferences {
  notifications: NotificationPreferences;
  vip: VIPPreferences;
  navigation: NavigationPreferences;
  home: HomePreferences;
  appearance: AppearancePreferences;
  messagesMedia: MessagesMediaPreferences;
  languageRegion: LanguageRegionPreferences;
  accessibility: AccessibilityPreferences;
  markAsRead: MarkAsReadPreferences;
  audioVideo: AudioVideoPreferences;
  privacyVisibility: PrivacyVisibilityPreferences;
  slackAI: SlackAIPreferences;
  advanced: AdvancedPreferences;
  streamSummaryResults: boolean;
}


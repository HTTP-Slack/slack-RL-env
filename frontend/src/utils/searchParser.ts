// Parse search query with advanced syntax
// Supports: from:@username, in:#channel, has:file, has:link, is:thread, is:dm, etc.

export interface SearchFilters {
  query: string;
  from?: string; // Username or user ID
  in?: string; // Channel name or ID
  with?: string; // User in conversation
  before?: Date;
  after?: Date;
  on?: Date;
  hasFile?: boolean;
  hasLink?: boolean;
  hasAction?: boolean;
  isDM?: boolean;
  isThread?: boolean;
  isSaved?: boolean;
  isPinned?: boolean;
  fileType?: string;
  reaction?: string;
  onlyMyChannels?: boolean;
  excludeAutomations?: boolean;
}

export const parseSearchQuery = (queryString: string): SearchFilters => {
  const filters: SearchFilters = {
    query: '',
  };

  // Regular expressions for different filter types
  const patterns = {
    from: /from:@?([^\s]+)/g,
    in: /in:#?([^\s]+)/g,
    with: /with:@?([^\s]+)/g,
    before: /before:(\d{4}-\d{2}-\d{2})/g,
    after: /after:(\d{4}-\d{2}-\d{2})/g,
    on: /on:(\d{4}-\d{2}-\d{2})/g,
    has: /has:([^\s]+)/g,
    is: /is:([^\s]+)/g,
    fileType: /filetype:([^\s]+)/g,
    reaction: /reaction::?([^\s]+):/g,
  };

  let remainingQuery = queryString;

  // Extract 'from:' filter
  let match;
  while ((match = patterns.from.exec(queryString)) !== null) {
    filters.from = match[1];
    remainingQuery = remainingQuery.replace(match[0], '');
  }
  patterns.from.lastIndex = 0;

  // Extract 'in:' filter
  while ((match = patterns.in.exec(queryString)) !== null) {
    filters.in = match[1];
    remainingQuery = remainingQuery.replace(match[0], '');
  }
  patterns.in.lastIndex = 0;

  // Extract 'with:' filter
  while ((match = patterns.with.exec(queryString)) !== null) {
    filters.with = match[1];
    remainingQuery = remainingQuery.replace(match[0], '');
  }
  patterns.with.lastIndex = 0;

  // Extract date filters
  while ((match = patterns.before.exec(queryString)) !== null) {
    filters.before = new Date(match[1]);
    remainingQuery = remainingQuery.replace(match[0], '');
  }
  patterns.before.lastIndex = 0;

  while ((match = patterns.after.exec(queryString)) !== null) {
    filters.after = new Date(match[1]);
    remainingQuery = remainingQuery.replace(match[0], '');
  }
  patterns.after.lastIndex = 0;

  while ((match = patterns.on.exec(queryString)) !== null) {
    filters.on = new Date(match[1]);
    remainingQuery = remainingQuery.replace(match[0], '');
  }
  patterns.on.lastIndex = 0;

  // Extract 'has:' filters
  while ((match = patterns.has.exec(queryString)) !== null) {
    const value = match[1].toLowerCase();
    if (value === 'file') filters.hasFile = true;
    if (value === 'link') filters.hasLink = true;
    if (value === 'action') filters.hasAction = true;
    remainingQuery = remainingQuery.replace(match[0], '');
  }
  patterns.has.lastIndex = 0;

  // Extract 'is:' filters
  while ((match = patterns.is.exec(queryString)) !== null) {
    const value = match[1].toLowerCase();
    if (value === 'dm' || value === 'direct') filters.isDM = true;
    if (value === 'thread') filters.isThread = true;
    if (value === 'saved') filters.isSaved = true;
    if (value === 'pinned') filters.isPinned = true;
    remainingQuery = remainingQuery.replace(match[0], '');
  }
  patterns.is.lastIndex = 0;

  // Extract 'filetype:' filter
  while ((match = patterns.fileType.exec(queryString)) !== null) {
    filters.fileType = match[1];
    remainingQuery = remainingQuery.replace(match[0], '');
  }
  patterns.fileType.lastIndex = 0;

  // Extract 'reaction:' filter
  while ((match = patterns.reaction.exec(queryString)) !== null) {
    filters.reaction = match[1];
    remainingQuery = remainingQuery.replace(match[0], '');
  }
  patterns.reaction.lastIndex = 0;

  // Clean up remaining query (remove extra spaces)
  filters.query = remainingQuery.trim().replace(/\s+/g, ' ');

  return filters;
};

export const buildSearchQuery = (filters: SearchFilters): string => {
  const parts: string[] = [];

  if (filters.query) {
    parts.push(filters.query);
  }

  if (filters.from) {
    parts.push(`from:@${filters.from}`);
  }

  if (filters.in) {
    parts.push(`in:#${filters.in}`);
  }

  if (filters.with) {
    parts.push(`with:@${filters.with}`);
  }

  if (filters.before) {
    parts.push(`before:${filters.before.toISOString().split('T')[0]}`);
  }

  if (filters.after) {
    parts.push(`after:${filters.after.toISOString().split('T')[0]}`);
  }

  if (filters.on) {
    parts.push(`on:${filters.on.toISOString().split('T')[0]}`);
  }

  if (filters.hasFile) {
    parts.push('has:file');
  }

  if (filters.hasLink) {
    parts.push('has:link');
  }

  if (filters.hasAction) {
    parts.push('has:action');
  }

  if (filters.isDM) {
    parts.push('is:dm');
  }

  if (filters.isThread) {
    parts.push('is:thread');
  }

  if (filters.isSaved) {
    parts.push('is:saved');
  }

  if (filters.isPinned) {
    parts.push('is:pinned');
  }

  if (filters.fileType) {
    parts.push(`filetype:${filters.fileType}`);
  }

  if (filters.reaction) {
    parts.push(`reaction::${filters.reaction}:`);
  }

  return parts.join(' ');
};

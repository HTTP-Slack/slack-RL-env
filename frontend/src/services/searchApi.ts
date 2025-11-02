import axios from '../config/axios';
import type { SearchParams, SearchResults } from '../types/search';
import type { SearchFilters } from '../utils/searchParser';

export const searchWorkspace = async (params: SearchParams): Promise<SearchResults> => {
  const { query, organisationId, channelId, limit = 20 } = params;

  const queryParams = new URLSearchParams({
    organisation: organisationId,
    limit: limit.toString(),
  });

  if (query) {
    queryParams.append('query', query);
  }

  if (channelId) {
    queryParams.append('channelId', channelId);
  }

  const response = await axios.get(`/search?${queryParams.toString()}`);

  return response.data.data;
};

export const advancedSearch = async (
  filters: SearchFilters,
  organisationId: string,
  limit = 20
): Promise<SearchResults> => {
  const queryParams = new URLSearchParams({
    organisation: organisationId,
    limit: limit.toString(),
  });

  if (filters.query) {
    queryParams.append('query', filters.query);
  }

  if (filters.from) {
    queryParams.append('from', filters.from);
  }

  if (filters.in) {
    queryParams.append('channelId', filters.in);
  }

  if (filters.with) {
    queryParams.append('with', filters.with);
  }

  if (filters.before) {
    queryParams.append('before', filters.before.toISOString());
  }

  if (filters.after) {
    queryParams.append('after', filters.after.toISOString());
  }

  if (filters.on) {
    queryParams.append('on', filters.on.toISOString());
  }

  if (filters.hasFile) {
    queryParams.append('hasFile', 'true');
  }

  if (filters.hasLink) {
    queryParams.append('hasLink', 'true');
  }

  if (filters.isDM) {
    queryParams.append('isDM', 'true');
  }

  if (filters.isThread) {
    queryParams.append('isThread', 'true');
  }

  if (filters.isSaved) {
    queryParams.append('isSaved', 'true');
  }

  if (filters.isPinned) {
    queryParams.append('isPinned', 'true');
  }

  if (filters.fileType) {
    queryParams.append('fileType', filters.fileType);
  }

  const response = await axios.get(`/search?${queryParams.toString()}`);

  return response.data.data;
};

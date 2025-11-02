import axios from '../config/axios';
import type { SearchParams, SearchResults } from '../types/search';

export const searchWorkspace = async (params: SearchParams): Promise<SearchResults> => {
  const { query, organisationId, channelId, limit = 20 } = params;

  const queryParams = new URLSearchParams({
    query,
    organisation: organisationId,
    limit: limit.toString(),
  });

  if (channelId) {
    queryParams.append('channelId', channelId);
  }

  const response = await axios.get(`/api/search?${queryParams.toString()}`);

  return response.data.data;
};

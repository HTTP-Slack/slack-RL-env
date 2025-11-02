import axiosInstance from "../config/axios";

export const createChannel = async (data: {
  name: string;
  organisationId: string;
  sectionId: string;
}) => {
  const response = await axiosInstance.post("/channel", data);
  return response.data;
};

export const getChannelsByOrg = async (organisationId: string) => {
  const response = await axiosInstance.get(`/channel/org/${organisationId}`);
  return response.data;
};

export const getChannel = async (channelId: string) => {
  const response = await axiosInstance.get(`/channel/${channelId}`);
  return response.data;
};

export const addUsersToChannel = async (channelId: string, emails: string[]) => {
  const response = await axiosInstance.patch(`/channel/${channelId}`, { emails });
  return response.data;
};

export const updateChannelDescription = async (channelId: string, description: string) => {
  const response = await axiosInstance.patch(`/channel/${channelId}`, { description });
  return response.data;
};

export const updateChannelName = async (channelId: string, name: string) => {
  const response = await axiosInstance.patch(`/channel/${channelId}`, { name });
  return response.data;
};

export const updateChannelTopic = async (channelId: string, topic: string) => {
  const response = await axiosInstance.patch(`/channel/${channelId}`, { topic });
  return response.data;
};

export const starChannel = async (channelId: string) => {
  const response = await axiosInstance.post(`/channel/${channelId}/star`);
  return response.data;
};

export const unstarChannel = async (channelId: string) => {
  const response = await axiosInstance.post(`/channel/${channelId}/unstar`);
  return response.data;
};

export const leaveChannel = async (channelId: string) => {
  const response = await axiosInstance.post(`/channel/${channelId}/leave`);
  return response.data;
};

export const archiveChannel = async (channelId: string) => {
  const response = await axiosInstance.post(`/channel/${channelId}/archive`);
  return response.data;
};

export const deleteChannel = async (channelId: string) => {
  const response = await axiosInstance.delete(`/channel/${channelId}`);
  return response.data;
};

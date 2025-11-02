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

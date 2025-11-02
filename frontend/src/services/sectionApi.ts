import axiosInstance from "../config/axios";

export const createSection = async (name: string, organisationId: string) => {
  const response = await axiosInstance.post("/sections", {
    name,
    organisationId,
  });
  return response.data;
};

export const getSections = async (organisationId: string) => {
  const response = await axiosInstance.get(
    `/sections?organisationId=${organisationId}`
  );
  return response.data;
};

export const updateSectionOrder = async (orderedSectionIds: string[]) => {
  await axiosInstance.put("/sections/order", { orderedSectionIds });
};

export const updateChannelOrder = async (
  sourceSectionId: string,
  destSectionId: string,
  sourceChannelIds: string[],
  destChannelIds: string[]
) => {
  await axiosInstance.put("/sections/channels/order", {
    sourceSectionId,
    destSectionId,
    sourceChannelIds,
    destChannelIds,
  });
};

export const deleteSection = async (id: string) => {
  await axiosInstance.delete(`/sections/${id}`);
};

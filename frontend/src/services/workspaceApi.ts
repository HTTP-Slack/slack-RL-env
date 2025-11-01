// Dummy API functions for workspace selection page
// These simulate backend calls and will be replaced with real API calls later

import type { Workspace } from '../types/workspace';

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getWorkspaces = async (): Promise<Workspace[]> => {
  await delay(500); // Simulate network delay

  // Dummy data matching the reference
  return [
    {
      id: '1',
      name: 'New Workspace',
      iconUrl: 'https://a.slack-edge.com/80588/img/avatars-teams/ava_0001-88.png',
      members: 0,
      memberAvatars: [
        'https://avatars.slack-edge.com/2025-11-01/9817387660501_e53140d76018c1d94830_48.png',
      ],
      launchUrl: 'https://newworkspace-7mv9928.slack.com/ssb/redirect',
    },
  ];
};

export const getUserEmail = async (): Promise<string> => {
  await delay(300); // Simulate network delay
  return 'user@example.com';
};

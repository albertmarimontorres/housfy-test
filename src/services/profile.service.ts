import { profileApi } from '@/api/modules/profile.api';
import type { ProfileResponse } from '@/types/Profile';

export const getProfile = async (): Promise<ProfileResponse> => {
  return await profileApi.getProfile();
};

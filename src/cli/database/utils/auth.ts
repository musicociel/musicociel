import type express from "express";

export const getUserConditions = (userTokenContent: any) => {
  const res = ["public"];
  if (userTokenContent) {
    userTokenContent.sub && res.push(`user-uuid:${userTokenContent.sub}`);
    userTokenContent.preferred_username && res.push(`user-name:${userTokenContent.preferred_username}`);
    userTokenContent.email && res.push(`user-email:${userTokenContent.email}`);
    const groups = userTokenContent.groups;
    if (Array.isArray(groups)) {
      groups.forEach((group) => res.push(`group:${group}`));
    }
  }
  return res;
};

export const getUserToken = (req: express.Request): any => (req as any).auth;
